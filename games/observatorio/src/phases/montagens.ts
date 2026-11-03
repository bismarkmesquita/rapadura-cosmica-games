import * as THREE from 'three';
import { COR, rotulo } from '@shared/draw/helpers';
import { limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { altAz } from '@shared/physics/ceu';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { tela, topoLivre } from '../core/palco';
import { descarta, renderer3d, type Cena3D } from '../core/tres';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { SEM_3D } from '../content/jogo';
import {
  apontaAltaz,
  apontaEquatorial,
  direcaoAltaz,
  direcaoEquatorial,
  direcaoNoMundo,
  giraCeu,
  montaCena,
  poeSaturno,
  type CenaMontagens,
} from '../scene/montagens3d';
import { Firmeza, terminaFase } from './util';
import * as T from '../content/montagens';

const RAD = Math.PI / 180;
/** Ângulo horário de Saturno quando o céu "recomeça": subindo no leste. */
const H_INICIO = -60;
/** Abaixo desta altura (graus), o céu recomeça, para Saturno não se pôr no meio da missão. */
const ALTURA_MIN = 8;
/** Graus de céu por segundo: na demonstração, rápido para a imagem girar à vista; seguindo à mão, mais lento. */
const CEU_DEMONSTRACAO = 3;
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
  private camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);
  private orbita = { az: 0.35, el: 0.18, dist: 11 };
  private arrasto: Ponto | null = null;
  private hLivre = innerHeight;
  private lat = T.CIDADES[0].lat;
  private inclinacao = Math.abs(T.CIDADES[0].lat);
  /** Ângulo horário de Saturno agora. */
  private H = H_INICIO;
  private motores = false;
  private az = { alt: 0, az: 0, motor: true };
  private eq = { H: 0, dec: 0, motor: true };
  private comandos = new Set<Comando>();
  private seguindo = 0;
  private firmeza = new Firmeza(2);
  private vistas = { altaz: null as Vista | null, equatorial: null as Vista | null };
  private teclas = (e: KeyboardEvent): void => this.tecla(e);

  init(): void {
    this.lat = T.CIDADES[0].lat;
    this.inclinacao = Math.abs(this.lat);
    this.motores = false;
    this.orbita = { az: 0.35, el: 0.18, dist: innerHeight < 500 ? 9 : 11 };
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

  /** Cada missão recomeça o céu e acerta os motores e os controles dela. */
  private comecaMissao(): void {
    const m = this.missao();
    this.H = H_INICIO;
    this.seguindo = 0;
    this.firmeza.zera();
    this.comandos.clear();
    this.az.motor = m !== 'altaz';
    this.eq.motor = m !== 'equatorial';
    if (m === 'polar') {
      this.lat = T.CIDADES[0].lat;
      this.inclinacao = INCLINACAO_INICIAL;
    }
    this.miraTudo();
    this.montaControles();
  }

  private latEixo(): number {
    return Math.sign(this.lat || 1) * this.inclinacao;
  }

  /** Aponta os dois telescópios para Saturno (a equatorial, pelos eixos dela, mesmo desalinhada). */
  private miraTudo(): void {
    const s = altAz(this.H, T.PLANETA.dec, this.lat);
    this.az.alt = s.alt;
    this.az.az = s.az;
    const dir = direcaoNoMundo(this.H, T.PLANETA.dec, this.lat);
    // Coordenadas de Saturno na base da montagem: ela pode estar inclinada para outra latitude.
    const local = dir.clone().applyMatrix4(new THREE.Matrix4().copy(this.baseMontagem()).invert());
    this.eq.dec = Math.asin(limita(local.y, -1, 1)) / RAD;
    this.eq.H = Math.atan2(local.z, local.x) / RAD;
  }

  private baseMontagem(): THREE.Matrix4 {
    const lat = this.latEixo();
    return new THREE.Matrix4().makeBasis(
      direcaoNoMundo(0, 0, lat),
      direcaoNoMundo(0, 90, lat),
      direcaoNoMundo(90, 0, lat),
    );
  }

  private montaControles(): void {
    const m = this.missao();
    const segurar = (cmd: Comando, rotulo: string, nome: string): string =>
      `<button class="btn btn-segurar" data-cmd="${cmd}" aria-label="${nome}">${rotulo}</button>`;
    let html = '';
    if (m === 'motores')
      html = `<div class="opcoes"><button class="btn${this.motores ? ' sel' : ''}" data-motores aria-pressed="${this.motores}">${this.motores ? T.ROTULOS.motoresLigados : T.ROTULOS.motores}</button></div>`;
    else if (m === 'altaz')
      html =
        `<div class="opcoes">${segurar('esq', T.ROTULOS.esquerda, T.ROTULOS.eixoAz)}${segurar('dir', T.ROTULOS.direita, T.ROTULOS.eixoAz)}` +
        `${segurar('cima', T.ROTULOS.cima, T.ROTULOS.eixoAlt)}${segurar('baixo', T.ROTULOS.baixo, T.ROTULOS.eixoAlt)}</div>`;
    else if (m === 'equatorial')
      html = `<div class="opcoes">${segurar('esq', T.ROTULOS.esquerda, T.ROTULOS.eixoPolar)}${segurar('dir', T.ROTULOS.direita, T.ROTULOS.eixoPolar)}<span class="nota">${T.ROTULOS.eixoPolar}</span></div>`;
    else
      html =
        `<div class="opcoes">` +
        T.CIDADES.map(
          (c) =>
            `<button class="btn${c.lat === this.lat ? ' sel' : ''}" data-cidade="${c.id}" aria-pressed="${c.lat === this.lat}">${c.nome}</button>`,
        ).join('') +
        `</div><label class="faixa"><span class="longo">${T.ROTULOS.inclinacao}</span>` +
        `<input type="range" min="0" max="90" step="0.5" value="${this.inclinacao}" data-inclinacao aria-label="${T.ROTULOS.inclinacao}">` +
        `<output>${T.ROTULOS.graus(this.inclinacao)}</output></label>`;

    controles(html, (caixa) => {
      const motores = caixa.querySelector<HTMLButtonElement>('[data-motores]');
      if (motores)
        motores.onclick = () => {
          this.motores = !this.motores;
          this.miraTudo();
          this.montaControles();
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
          this.H = H_INICIO;
          this.miraTudo();
          this.montaControles();
        };
      });
      const inc = caixa.querySelector<HTMLInputElement>('[data-inclinacao]');
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

  update(dt: number): void {
    const m = this.missao();
    // Na demonstração, os motores começam desligados: Saturno foge das duas oculares até o aluno ligar.
    const motoresLigados = m !== 'motores' || this.motores;
    const ceu = m === 'motores' ? CEU_DEMONSTRACAO : CEU_MANUAL;
    this.H += ceu * dt;
    if (altAz(this.H, T.PLANETA.dec, this.lat).alt < ALTURA_MIN) {
      this.H = H_INICIO;
      this.miraTudo();
    }
    // Motores: a altazimutal corrige os dois eixos; a equatorial só gira o eixo polar no ritmo do céu.
    if (this.az.motor && motoresLigados) {
      const s = altAz(this.H, T.PLANETA.dec, this.lat);
      this.az.alt = s.alt;
      this.az.az = s.az;
    }
    if (this.eq.motor && motoresLigados) this.eq.H += ceu * dt;
    const passo = VELOCIDADE_EIXO * dt;
    if (m === 'altaz') {
      if (this.comandos.has('esq')) this.az.az -= passo;
      if (this.comandos.has('dir')) this.az.az += passo;
      if (this.comandos.has('cima')) this.az.alt = limita(this.az.alt + passo, 0, 90);
      if (this.comandos.has('baixo')) this.az.alt = limita(this.az.alt - passo, 0, 90);
    }
    if (m === 'equatorial') {
      if (this.comandos.has('esq')) this.eq.H -= passo;
      if (this.comandos.has('dir')) this.eq.H += passo;
    }
    this.vistas.altaz = this.vista('altaz');
    this.vistas.equatorial = this.vista('equatorial');
    this.confereMissao(dt, m);
  }

  private confereMissao(dt: number, m: Missao | undefined): void {
    if (!m) return;
    let pronta = false;
    if (m === 'motores') {
      if (this.motores) this.seguindo += dt;
      pronta = this.seguindo >= TEMPO_DEMONSTRACAO;
    } else if (m === 'altaz' || m === 'equatorial') {
      if (this.vistas[m]?.dentro) this.seguindo += dt;
      pronta = this.seguindo >= TEMPO_SEGUINDO;
    } else {
      const alinhado =
        this.lat === T.CIDADES[0].lat && Math.abs(this.inclinacao - Math.abs(this.lat)) < ALINHADO;
      pronta = this.firmeza.conta(dt, alinhado);
    }
    if (!pronta || !missoes.conclui(m)) return;
    toast.mostra(T.AVISOS[m], 5);
    if (missoes.atual()) this.comecaMissao();
    else terminaFase(this.id, T.fim, T.DESAFIO);
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
    giraCeu(c, this.lat, this.H - H_INICIO);
    poeSaturno(c, this.H, T.PLANETA.dec, this.lat);
    apontaAltaz(c.altaz, this.az.alt, this.az.az);
    apontaEquatorial(c.equatorial, this.latEixo(), this.eq.H, this.eq.dec);
    // A linha do eixo polar aponta para o polo visível (o sul, no hemisfério sul).
    c.linhaPolar.scale.y = this.lat < 0 ? -1 : 1;
    const { az, el, dist } = this.orbita;
    const alvo = new THREE.Vector3(0, 1.6, 0);
    this.camera.position.set(
      dist * Math.sin(az) * Math.cos(el),
      1.6 + dist * Math.sin(el),
      dist * Math.cos(az) * Math.cos(el),
    );
    this.camera.lookAt(alvo);
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
    this.orbita.az -= (p.x - this.arrasto.x) * 0.006;
    this.orbita.el = limita(this.orbita.el + (p.y - this.arrasto.y) * 0.004, 0.02, 1.2);
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
    if (this.cena) this.desenhaRotulos(c);
    const livre = topoLivre();
    const r = Math.max(42, Math.min(78, w * 0.06, h * 0.16));
    this.desenhaOcular(c, 14 + r, livre.esquerda + r + 16, r, 'altaz');
    this.desenhaOcular(c, w - 14 - r, livre.direita + r + 16, r, 'equatorial');
    rotulo(c, T.ROTULOS.girar, w / 2, h - 10, COR.muted, 'center', 12);
  }

  private naTela(v: THREE.Vector3): Ponto | null {
    const p = v.clone().project(this.camera);
    if (p.z > 1 || p.z < -1) return null;
    return { x: ((p.x + 1) / 2) * tela.W, y: ((1 - p.y) / 2) * tela.H };
  }

  private desenhaRotulos(c: CanvasRenderingContext2D): void {
    const nomes: [THREE.Vector3, string, string][] = [
      [new THREE.Vector3(-2.4, -0.1, 0.6), T.MONTAGENS.altaz, COR.ink],
      [new THREE.Vector3(2.4, -0.1, 0.6), T.MONTAGENS.equatorial, COR.ink],
      [direcaoNoMundo(this.H, T.PLANETA.dec, this.lat).multiplyScalar(130), T.PLANETA.nome, COR.sol],
      [new THREE.Vector3(0, 0.3, -60), 'N', COR.muted],
      [new THREE.Vector3(0, 0.3, 60), 'S', COR.muted],
      [new THREE.Vector3(60, 0.3, 0), 'L', COR.muted],
      [new THREE.Vector3(-60, 0.3, 0), 'O', COR.muted],
    ];
    const polo = direcaoNoMundo(0, this.lat < 0 ? -90 : 90, this.lat);
    if (polo.y > -0.05) nomes.push([polo.multiplyScalar(120), T.ROTULOS.polo(this.lat < 0), COR.sol]);
    for (const [v, nome, cor] of nomes) {
      const p = this.naTela(v);
      if (p) rotulo(c, nome, p.x, p.y + 4, cor, 'center', 13);
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
      const px = x + v.x * r;
      const py = y - v.y * r;
      const tam = r * 0.16;
      c.translate(px, py);
      // Os anéis ficam no sentido leste–oeste do céu: na imagem, perpendiculares ao norte.
      c.rotate(v.giro);
      c.strokeStyle = '#f2d39a';
      c.lineWidth = Math.max(2, tam * 0.28);
      c.beginPath();
      c.ellipse(0, 0, tam * 2.3, tam * 0.75, 0, 0, TAU);
      c.stroke();
      c.fillStyle = '#e3b35c';
      c.beginPath();
      c.arc(0, 0, tam, 0, TAU);
      c.fill();
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
