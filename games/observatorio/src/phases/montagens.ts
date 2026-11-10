import * as THREE from 'three';
import { COR, rotulo } from '@shared/draw/helpers';
import { difAngulo, limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { altAz, anguloHorarioNaAltura } from '@shared/physics/ceu';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { tela, topoLivre } from '../core/palco';
import { descarta, renderer3d, type Cena3D } from '../core/tres';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { SEM_3D } from '../content/jogo';
import { saturno } from '../scene/desenho';
import {
  apontaAltaz,
  apontaEquatorial,
  baseEquatorial,
  COR_EIXO,
  direcaoAltaz,
  direcaoEquatorial,
  direcaoNoMundo,
  giraCeu,
  montaCena,
  POS_ALTAZ,
  POS_EQUATORIAL,
  poePolo,
  poeSaturno,
  type CenaMontagens,
} from '../scene/montagens3d';
import { Firmeza, terminaFase } from './util';
import * as T from '../content/montagens';

const RAD = Math.PI / 180;
/** Ângulo horário em que o céu recomeça quando Saturno nunca nasce nem se põe (no Polo Norte). */
const H_SEM_NASCER = -60;
/** Altura (graus) em que Saturno "nasce" e "se põe" na cena, um pouco acima do horizonte. */
const ALTURA_HORIZONTE = 5;
/** Graus de céu por segundo: na demonstração, o bastante para a imagem girar à vista; seguindo à mão, mais lento. */
const CEU_DEMONSTRACAO = 2;
const CEU_MANUAL = 1;
/** Graus por segundo que cada eixo gira com o botão apertado: mais rápido que o céu, para dar para alcançar. */
const VELOCIDADE_EIXO = 2.2;
/** Metade do campo da ocular, em graus (bem maior que o real, para dar para seguir à mão). */
const CAMPO = 3;
const TEMPO_SEGUINDO = 20;
const TEMPO_DEMONSTRACAO = 8;
/** Diferença aceita entre a inclinação do eixo polar e a latitude, em graus. */
const ALINHADO = 1.5;
const INCLINACAO_INICIAL = 40;
/** No Polo Norte, com o eixo quase deitado, o tubo bateria no pilar: a barra para aqui. */
const INCLINACAO_MIN_POLO_NORTE = 40;
/** O tubo da equatorial não aponta abaixo desta altura (graus): como o limite de horizonte das montagens reais. */
const LIMITE_HORIZONTE = -3;
/**
 * Rumo da câmera na etapa do alinhamento: do lado norte, olhando para o polo sul. Fica um pouco de lado porque, bem
 * de frente, o arco da inclinação (que está no plano norte–sul) apareceria de perfil e sumiria.
 */
const CAMERA_PARA_O_SUL = Math.PI + 0.45;
/** Altura da câmera quando ela olha para o céu, rente ao chão. */
const ALTURA_OLHO = 1;
/** Quanto a vista começa olhando para o céu, com os telescópios embaixo e Saturno no alto. */
const EL_INICIAL = -0.28;
/** Em telas baixas, olha menos para cima: senão, os telescópios ficam atrás da caixa de controles. */
const EL_INICIAL_TELA_BAIXA = -0.14;

type Comando = 'esq' | 'dir' | 'cima' | 'baixo';
type Missao = keyof typeof T.MISSOES;

interface Vista {
  /** Posição de Saturno na ocular, em frações do raio. */
  x: number;
  y: number;
  /** Para onde aponta o norte do céu na imagem (radianos, a partir de "para cima"). */
  giro: number;
  dentro: boolean;
}

export class FaseMontagens implements Fase {
  readonly id = 2;
  readonly nome = T.NOME_FASE;
  private cena: CenaMontagens | null = null;
  private camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 400);
  /** el > 0: a câmera sobe e olha para baixo. el < 0: ela fica rente ao chão e olha para o céu. */
  private orbita = { az: -0.15, el: EL_INICIAL, dist: 11 };
  /** Rumo para onde a câmera está virando sozinha; null quando o aluno está no comando. */
  private azAlvo: number | null = null;
  private arrasto: Ponto | null = null;
  private hLivre = innerHeight;
  private lat = T.CIDADES[0].lat;
  private inclinacao = Math.abs(T.CIDADES[0].lat);
  /** Ângulo horário de Saturno agora. */
  private H = 0;
  private motores = false;
  /** Na demonstração, Saturno chegou ao horizonte e o céu parou até o aluno reiniciar. */
  private posto = false;
  /** A etapa já foi cumprida e espera o aluno pedir a próxima. */
  private cumprida = false;
  private az = { alt: 0, az: 0, motor: true };
  private eq = { H: 0, dec: 0, motor: true };
  private comandos = new Set<Comando>();
  private seguindo = 0;
  private firmeza = new Firmeza(2);
  private vistas = { altaz: null as Vista | null, equatorial: null as Vista | null };
  private botaoProxima: HTMLButtonElement | null = null;
  private teclas = (e: KeyboardEvent): void => this.tecla(e);

  init(): void {
    this.lat = T.CIDADES[0].lat;
    this.inclinacao = Math.abs(this.lat);
    this.motores = false;
    const baixa = innerHeight < 500;
    this.orbita = { az: -0.15, el: baixa ? EL_INICIAL_TELA_BAIXA : EL_INICIAL, dist: baixa ? 9 : 11 };
    this.azAlvo = null;
    this.comandos.clear();
    missoes.define(this.nome, [
      { id: 'motores', texto: T.MISSOES.motores },
      { id: 'altaz', texto: T.MISSOES.altaz },
      { id: 'equatorial', texto: T.MISSOES.equatorial },
      { id: 'polar', texto: T.MISSOES.polar },
    ]);
    if (renderer3d()) this.cena = montaCena();
    else toast.mostra(SEM_3D, 8);
    addEventListener('keydown', this.teclas);
    addEventListener('keyup', this.teclas);
    this.comecaMissao();
    cards.enfileira(T.historia);
    cards.enfileira(T.intro);
  }

  sai(): void {
    removeEventListener('keydown', this.teclas);
    removeEventListener('keyup', this.teclas);
    if (this.cena) descarta(this.cena.scene);
    this.cena = null;
  }

  private missao(): Missao | undefined {
    return missoes.atual()?.id as Missao | undefined;
  }

  /** Onde o céu recomeça: Saturno nascendo no leste, na latitude atual. */
  private hInicio(): number {
    const h = anguloHorarioNaAltura(ALTURA_HORIZONTE, T.PLANETA.dec, this.lat);
    return h === null ? H_SEM_NASCER : -h;
  }

  /** Cada etapa recomeça o céu e acerta os motores e os controles dela. */
  private comecaMissao(): void {
    const m = this.missao();
    this.H = this.hInicio();
    this.seguindo = 0;
    this.posto = false;
    this.cumprida = false;
    this.firmeza.zera();
    this.comandos.clear();
    this.az.motor = m !== 'altaz';
    this.eq.motor = m !== 'equatorial';
    if (m === 'polar') {
      this.lat = T.CIDADES[0].lat;
      this.inclinacao = INCLINACAO_INICIAL;
      // O polo fica às costas da vista de Saturno: a câmera vira sozinha para ele.
      this.azAlvo = this.orbita.az + difAngulo(CAMERA_PARA_O_SUL, this.orbita.az);
    }
    this.miraTudo();
    this.montaControles();
  }

  private latEixo(): number {
    return (this.lat < 0 ? -1 : 1) * this.inclinacao;
  }

  private miraAltaz(): void {
    const s = altAz(this.H, T.PLANETA.dec, this.lat);
    this.az.alt = s.alt;
    this.az.az = s.az;
  }

  /** Aponta a equatorial para Saturno pelos eixos dela, mesmo desalinhada. */
  private miraEquatorial(): void {
    const dir = direcaoNoMundo(this.H, T.PLANETA.dec, this.lat);
    // Coordenadas de Saturno na base da montagem: ela pode estar inclinada para outra latitude.
    const local = dir.clone().applyMatrix4(baseEquatorial(this.latEixo()).invert());
    this.eq.dec = Math.asin(limita(local.y, -1, 1)) / RAD;
    this.eq.H = Math.atan2(local.z, local.x) / RAD;
  }

  private miraTudo(): void {
    this.miraAltaz();
    this.miraEquatorial();
  }

  /** Gira o eixo de ascensão reta, sem deixar o tubo apontar para baixo do horizonte. */
  private giraEquatorial(graus: number): void {
    const H = this.eq.H + graus;
    if (direcaoEquatorial(this.latEixo(), H, this.eq.dec).y >= Math.sin(LIMITE_HORIZONTE * RAD))
      this.eq.H = H;
  }

  private montaControles(): void {
    const m = this.missao();
    const segurar = (cmd: Comando, rotulo: string, nome: string): string =>
      `<button class="btn btn-segurar" data-cmd="${cmd}" aria-label="${nome}">${rotulo}</button>`;
    const proxima = `<button class="btn prim" data-proxima${this.cumprida ? '' : ' hidden'}>${T.ROTULOS.proxima}</button>`;
    const trazer = `<button class="btn" data-trazer>${T.ROTULOS.trazer}</button>`;
    let html = '';
    if (m === 'motores')
      html =
        `<div class="opcoes"><button class="btn${this.motores ? ' sel' : ''}" data-motores aria-pressed="${this.motores}">${this.motores ? T.ROTULOS.motoresLigados : T.ROTULOS.motores}</button>` +
        `<button class="btn" data-reiniciar>${T.ROTULOS.reiniciar}</button>${proxima}</div>`;
    else if (m === 'altaz')
      html =
        `<div class="opcoes">${segurar('esq', T.ROTULOS.esquerda, T.ROTULOS.eixoAz)}${segurar('dir', T.ROTULOS.direita, T.ROTULOS.eixoAz)}` +
        `${segurar('cima', T.ROTULOS.cima, T.ROTULOS.eixoAlt)}${segurar('baixo', T.ROTULOS.baixo, T.ROTULOS.eixoAlt)}${trazer}${proxima}</div>`;
    else if (m === 'equatorial')
      html =
        `<div class="opcoes">${segurar('esq', T.ROTULOS.esquerda, T.ROTULOS.eixoPolar)}${segurar('dir', T.ROTULOS.direita, T.ROTULOS.eixoPolar)}` +
        `${trazer}${proxima}<span class="nota">${T.ROTULOS.eixoPolar}</span></div>`;
    else {
      const min = this.lat > 0 ? INCLINACAO_MIN_POLO_NORTE : 0;
      html =
        `<div class="opcoes">` +
        T.CIDADES.map(
          (c) =>
            `<button class="btn${c.lat === this.lat ? ' sel' : ''}" data-cidade="${c.id}" aria-pressed="${c.lat === this.lat}">${c.nome}</button>`,
        ).join('') +
        `</div><label class="faixa"><span class="longo">${T.ROTULOS.inclinacao}</span>` +
        `<input type="range" min="${min}" max="90" step="0.5" value="${this.inclinacao}" data-inclinacao aria-label="${T.ROTULOS.inclinacao}">` +
        `<output>${T.ROTULOS.graus(this.inclinacao)}</output></label>`;
    }

    controles(html, (caixa) => {
      const q = <E extends HTMLElement>(s: string): E | null => caixa.querySelector<E>(s);
      const motores = q<HTMLButtonElement>('[data-motores]');
      if (motores)
        motores.onclick = () => {
          this.motores = !this.motores;
          this.miraTudo();
          this.montaControles();
        };
      const reiniciar = q<HTMLButtonElement>('[data-reiniciar]');
      if (reiniciar)
        reiniciar.onclick = () => {
          this.H = this.hInicio();
          this.posto = false;
          this.miraTudo();
        };
      const trazerDeVolta = q<HTMLButtonElement>('[data-trazer]');
      if (trazerDeVolta)
        trazerDeVolta.onclick = () => (m === 'altaz' ? this.miraAltaz() : this.miraEquatorial());
      this.botaoProxima = q<HTMLButtonElement>('[data-proxima]');
      if (this.botaoProxima)
        this.botaoProxima.onclick = () => {
          if (m && missoes.conclui(m)) this.comecaMissao();
        };
      caixa.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((b) => {
        const cmd = b.dataset.cmd as Comando;
        const solta = (): void => void this.comandos.delete(cmd);
        b.onpointerdown = (e) => {
          e.preventDefault();
          b.setPointerCapture(e.pointerId);
          this.comandos.add(cmd);
        };
        b.onpointerup = solta;
        b.onpointercancel = solta;
        b.oncontextmenu = (e) => e.preventDefault();
      });
      caixa.querySelectorAll<HTMLButtonElement>('[data-cidade]').forEach((b) => {
        b.onclick = () => {
          const c = T.CIDADES.find((x) => x.id === b.dataset.cidade);
          if (!c) return;
          this.lat = c.lat;
          if (c.lat > 0) this.inclinacao = Math.max(this.inclinacao, INCLINACAO_MIN_POLO_NORTE);
          this.H = this.hInicio();
          this.miraTudo();
          this.montaControles();
        };
      });
      const inc = q<HTMLInputElement>('[data-inclinacao]');
      if (inc)
        inc.oninput = () => {
          this.inclinacao = Number(inc.value);
          const saida = inc.parentElement?.querySelector('output');
          if (saida) saida.textContent = T.ROTULOS.graus(this.inclinacao);
          // Ao mexer no eixo, o aluno reaponta o telescópio para Saturno e vê se ele fica ou escapa.
          this.miraTudo();
        };
    });
  }

  /** Setas do teclado fazem o mesmo que os botões de segurar. */
  private tecla(e: KeyboardEvent): void {
    if (estado.fase !== this || cards.aberto || estado.pausado) return;
    const mapa: Record<string, Comando> = {
      arrowleft: 'esq',
      arrowright: 'dir',
      arrowup: 'cima',
      arrowdown: 'baixo',
    };
    const cmd = mapa[e.key.toLowerCase()];
    if (!cmd) return;
    e.preventDefault();
    if (e.type === 'keydown') this.comandos.add(cmd);
    else this.comandos.delete(cmd);
  }

  /** Anda o céu. Na demonstração, ele para quando Saturno se põe; nas outras etapas, recomeça. */
  private andaCeu(dt: number, m: Missao | undefined): number {
    if (this.posto) return 0;
    const ceu = (m === 'motores' ? CEU_DEMONSTRACAO : CEU_MANUAL) * dt;
    this.H += ceu;
    if (this.H < 0 || altAz(this.H, T.PLANETA.dec, this.lat).alt >= ALTURA_HORIZONTE) return ceu;
    if (m === 'motores') {
      this.posto = true;
      toast.mostra(T.AVISOS.sePos, 6);
    } else {
      this.H = this.hInicio();
      this.miraTudo();
    }
    return 0;
  }

  update(dt: number): void {
    if (this.azAlvo !== null) {
      this.orbita.az += (this.azAlvo - this.orbita.az) * Math.min(1, dt * 2);
      if (Math.abs(this.azAlvo - this.orbita.az) < 0.01) this.azAlvo = null;
    }
    const m = this.missao();
    const ceu = this.andaCeu(dt, m);
    // Na demonstração, os motores começam desligados: Saturno foge das duas oculares até o aluno ligar.
    const motoresLigados = m !== 'motores' || this.motores;
    // Motores: a altazimutal corrige os dois eixos; a equatorial só gira o eixo polar no ritmo do céu.
    if (this.az.motor && motoresLigados && !this.posto) this.miraAltaz();
    if (this.eq.motor && motoresLigados) this.giraEquatorial(ceu);
    const passo = VELOCIDADE_EIXO * dt;
    if (m === 'altaz') {
      if (this.comandos.has('esq')) this.az.az -= passo;
      if (this.comandos.has('dir')) this.az.az += passo;
      if (this.comandos.has('cima')) this.az.alt = limita(this.az.alt + passo, 0, 90);
      if (this.comandos.has('baixo')) this.az.alt = limita(this.az.alt - passo, 0, 90);
    }
    if (m === 'equatorial') {
      if (this.comandos.has('esq')) this.giraEquatorial(-passo);
      if (this.comandos.has('dir')) this.giraEquatorial(passo);
    }
    this.vistas.altaz = this.vista('altaz');
    this.vistas.equatorial = this.vista('equatorial');
    this.confereMissao(dt, m);
  }

  private confereMissao(dt: number, m: Missao | undefined): void {
    if (!m) return;
    if (m === 'polar') {
      const alinhado =
        this.lat === T.CIDADES[0].lat && Math.abs(this.inclinacao - Math.abs(this.lat)) < ALINHADO;
      if (!this.firmeza.conta(dt, alinhado) || !missoes.conclui(m)) return;
      toast.mostra(T.AVISOS.polar, 5);
      terminaFase(this.id, T.fim, T.DESAFIO);
      return;
    }
    if (this.cumprida) return;
    const contando = m === 'motores' ? this.motores : !!this.vistas[m]?.dentro;
    if (contando) this.seguindo += dt;
    if (this.seguindo < (m === 'motores' ? TEMPO_DEMONSTRACAO : TEMPO_SEGUINDO)) return;
    // A etapa não muda sozinha: o céu continua e o botão fica à espera, para dar tempo de explicar.
    this.cumprida = true;
    toast.mostra(T.AVISOS[m], 5);
    if (this.botaoProxima) this.botaoProxima.hidden = false;
  }

  /** Saturno visto pela ocular de cada montagem: posição e giro da imagem. */
  private vista(qual: 'altaz' | 'equatorial'): Vista {
    const s = direcaoNoMundo(this.H, T.PLANETA.dec, this.lat);
    const p =
      qual === 'altaz'
        ? direcaoAltaz(this.az.alt, this.az.az)
        : direcaoEquatorial(this.latEixo(), this.eq.H, this.eq.dec);
    // "Para cima" na ocular: o zênite na altazimutal, o polo da montagem na equatorial.
    const ref = qual === 'altaz' ? new THREE.Vector3(0, 1, 0) : direcaoNoMundo(0, 90, this.latEixo());
    const v = ref
      .clone()
      .sub(p.clone().multiplyScalar(ref.dot(p)))
      .normalize();
    const u = p.clone().cross(v);
    const x = s.dot(u) / (CAMPO * RAD);
    const y = s.dot(v) / (CAMPO * RAD);
    const norte = direcaoNoMundo(0, 90, this.lat);
    const n = norte.sub(s.clone().multiplyScalar(norte.dot(s)));
    return { x, y, giro: Math.atan2(n.dot(u), n.dot(v)), dentro: Math.hypot(x, y) < 1 && s.dot(p) > 0 };
  }

  cena3d(): Cena3D | null {
    const c = this.cena;
    if (!c) return null;
    giraCeu(c, this.lat, this.H);
    poeSaturno(c, this.H, T.PLANETA.dec, this.lat);
    poePolo(c, this.lat);
    apontaAltaz(c.altaz, this.az.alt, this.az.az);
    apontaEquatorial(c.equatorial, this.latEixo(), this.lat < 0, this.eq.H, this.eq.dec);
    const { az, el, dist } = this.orbita;
    const sobe = Math.max(el, 0);
    this.camera.position.set(
      dist * Math.sin(az) * Math.cos(sobe),
      ALTURA_OLHO + dist * Math.sin(sobe),
      dist * Math.cos(az) * Math.cos(sobe),
    );
    this.camera.lookAt(0, 1.6 + (el < 0 ? dist * Math.tan(-el) : 0), 0);
    const H = innerHeight;
    this.camera.setViewOffset(innerWidth, H, 0, (H - this.hLivre) / 2, innerWidth, H);
    return { scene: c.scene, camera: this.camera };
  }

  aperta(p: Ponto): boolean {
    this.arrasto = { ...p };
    return true;
  }

  arrasta(p: Ponto): void {
    if (!this.arrasto) return;
    this.azAlvo = null;
    this.orbita.az -= (p.x - this.arrasto.x) * 0.006;
    this.orbita.el = limita(this.orbita.el + (p.y - this.arrasto.y) * 0.004, -0.9, 1.2);
    this.arrasto = { ...p };
  }

  solta(): void {
    this.arrasto = null;
  }

  rola(dy: number): void {
    this.orbita.dist = limita(this.orbita.dist * Math.exp(dy * 0.001), 5, 22);
  }

  cursor(): string {
    return this.arrasto ? 'grabbing' : 'grab';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    this.hLivre = h;
    const livre = topoLivre();
    const r = Math.max(42, Math.min(78, w * 0.06, h * 0.16));
    if (this.cena) {
      this.desenhaRotulos(c, this.cena);
      this.desenhaCardeais(c, w, h, r);
    }
    this.desenhaOcular(c, 14 + r, livre.esquerda + r + 16, r, 'altaz');
    this.desenhaOcular(c, w - 14 - r, livre.direita + r + 16, r, 'equatorial');
    rotulo(c, T.ROTULOS.girar, w / 2, h - 10, COR.muted, 'center', 12);
  }

  private naTela(v: THREE.Vector3): Ponto | null {
    const p = v.clone().project(this.camera);
    if (p.z > 1 || p.z < -1) return null;
    return { x: ((p.x + 1) / 2) * tela.W, y: ((1 - p.y) / 2) * tela.H };
  }

  private desenhaRotulos(c: CanvasRenderingContext2D, cena: CenaMontagens): void {
    const noMundo = (o: THREE.Object3D): THREE.Vector3 => o.getWorldPosition(new THREE.Vector3());
    const { altaz, equatorial: eq } = cena;
    const nomes: [THREE.Vector3, string, string, number][] = [
      [new THREE.Vector3(POS_ALTAZ, 0, 0.5), T.MONTAGENS.altaz, COR.ink, 14],
      [new THREE.Vector3(POS_EQUATORIAL, 0, 0.5), T.MONTAGENS.equatorial, COR.ink, 14],
      [direcaoNoMundo(this.H, T.PLANETA.dec, this.lat).multiplyScalar(130), T.PLANETA.nome, COR.sol, 13],
      [noMundo(altaz.rotuloAz), T.EIXOS.az, COR_EIXO.az, 12],
      [noMundo(altaz.rotuloAlt), T.EIXOS.alt, COR_EIXO.alt, 12],
      [noMundo(eq.rotuloAr), T.EIXOS.ar, COR_EIXO.ar, 12],
      [noMundo(eq.rotuloDec), T.EIXOS.dec, COR_EIXO.dec, 12],
      [noMundo(eq.rotuloAngulo), T.ROTULOS.graus(this.inclinacao), COR_EIXO.ar, 13],
    ];
    const polo = direcaoNoMundo(0, this.lat < 0 ? -90 : 90, this.lat);
    if (polo.y > -0.05) {
      // O nome fica acima da marca, para ela continuar visível.
      const naEsfera = this.naTela(polo.clone().multiplyScalar(120));
      if (naEsfera)
        rotulo(c, T.ROTULOS.polo(this.lat < 0), naEsfera.x, naEsfera.y - 46, COR_EIXO.ar, 'center', 14);
    }
    for (const [v, nome, cor, tamanho] of nomes) {
      const p = this.naTela(v);
      if (p) rotulo(c, nome, p.x, p.y + 4, cor, 'center', tamanho);
    }
  }

  /**
   * Os pontos cardeais, em etiquetas sobre o horizonte. Os que estão fora da vista ficam na borda, com uma seta
   * para o lado em que estão; o que está às costas da câmera não aparece.
   */
  private desenhaCardeais(c: CanvasRenderingContext2D, w: number, h: number, rOcular: number): void {
    const frente = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const rumo = Math.atan2(frente.x, -frente.z) / RAD;
    const noHorizonte = this.naTela(this.camera.position.clone().addScaledVector(frente, 100).setY(0.3));
    const livre = topoLivre();
    const yHorizonte = limita(noHorizonte?.y ?? h - 40, livre.esquerda + 30, h - 34);
    // Em telas baixas, a ocular desce até o horizonte: a etiqueta da borda fica ao lado dela, e não embaixo.
    const margemDe = (topoOcular: number): number =>
      yHorizonte - 14 < topoOcular + 2 * rOcular + 54 ? 14 + 2 * rOcular + 60 : 60;
    for (const [nome, az] of T.CARDEAIS) {
      const dif = ((az - rumo + 540) % 360) - 180;
      if (Math.abs(dif) > 130) continue;
      const a = az * RAD;
      const p = this.naTela(new THREE.Vector3(Math.sin(a) * 40, 0.3, -Math.cos(a) * 40));
      const naVista = !!p && p.x > 60 && p.x < w - 60;
      const texto = naVista ? nome : dif < 0 ? `◀ ${nome}` : `${nome} ▶`;
      const x = naVista ? p.x : dif < 0 ? margemDe(livre.esquerda) : w - margemDe(livre.direita);
      const largura = texto.length * 10 + 16;
      c.fillStyle = 'rgba(14,11,22,.8)';
      c.strokeStyle = nome === T.CARDEAIS[0][0] ? COR.sol : COR.muted;
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(x - largura / 2, yHorizonte - 14, largura, 26, 7);
      c.fill();
      c.stroke();
      rotulo(c, texto, x, yHorizonte + 4, COR.ink, 'center', 15);
    }
  }

  /** A ocular de cada montagem: Saturno com os anéis, na posição e no giro que o telescópio mostra. */
  private desenhaOcular(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    qual: 'altaz' | 'equatorial',
  ): void {
    const v = this.vistas[qual];
    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#05060f';
    c.fill();
    c.clip();
    if (v?.dentro) {
      // Os anéis ficam no sentido leste–oeste do céu: na imagem, perpendiculares ao norte.
      saturno(c, x + v.x * r, y - v.y * r, r * 0.16, v.giro);
    } else rotulo(c, T.ROTULOS.fora, x, y + 4, COR.muted, 'center', 11);
    c.restore();
    // Fora da ocular: uma seta na borda mostra para que lado Saturno foi, como numa buscadora.
    if (v && !v.dentro) {
      const a = Math.atan2(-v.y, v.x);
      c.save();
      c.translate(x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10));
      c.rotate(a);
      c.fillStyle = COR.sol;
      c.beginPath();
      c.moveTo(8, 0);
      c.lineTo(-6, -7);
      c.lineTo(-6, 7);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.naOcular(T.MONTAGENS[qual]), x, y + r + 16, COR.ink, 'center', 12);
    const m = this.missao();
    if ((m === 'altaz' || m === 'equatorial') && m === qual)
      rotulo(
        c,
        T.ROTULOS.tempo(Math.min(TEMPO_SEGUINDO, this.seguindo)),
        x,
        y + r + 32,
        COR.sol,
        'center',
        12,
      );
  }

  hud(): void {
    const cidade = T.CIDADES.find((x) => x.lat === this.lat);
    let html = linhaHud(T.HUD.cidade, cidade?.nome ?? '');
    if (estado.avancado) {
      const s = altAz(this.H, T.PLANETA.dec, this.lat);
      const giro = this.vistas.altaz ? (this.vistas.altaz.giro * 180) / Math.PI : 0;
      html +=
        linhaHud(T.HUD.latitude, T.HUD.graus(this.lat)) +
        linhaHud(T.HUD.inclinacao, T.HUD.graus(this.inclinacao)) +
        linhaHud(T.HUD.altura, T.HUD.graus(s.alt)) +
        linhaHud(T.HUD.giro, T.HUD.graus(giro));
    }
    painel(html);
  }
}
