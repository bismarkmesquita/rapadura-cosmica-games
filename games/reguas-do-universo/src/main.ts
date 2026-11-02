/**
 * Ponto de entrada do jogo: liga a interface, o laço principal, o menu, a pausa e o modo Avançado.
 * A lógica de cada fase fica em phases/; os textos, em content/.
 */
import '@shared/styles/tokens.css';
import '@shared/styles/ui.css';
import './style.css';
import { $ } from '@shared/ui/dom';
import { linksCanal, seloCanal } from '@shared/brand/selo';
import { telaDeToque } from '@shared/ui/toque';
import { ajustaTela, alturaLivre, canvas, comecaQuadro, iniciaPonteiro, tela } from './core/palco';
import { estado } from './core/estado';
import { fluxo } from './core/flow';
import {
  acao,
  atualizaBotaoAvancado,
  atualizaVisibilidadeHud,
  cards,
  controles,
  desenhaReguas,
  painel,
  toast,
} from './core/ui';
import { FASES } from './phases';
import { AVANCADO, BOTOES, EM_BREVE, FASES_MENU, TELA_CHEIA } from './content/jogo';

let faseEscolhida = 1;

function limpaFase(): void {
  cards.limpa();
  acao.esconde();
  controles('');
  painel('');
}

function iniciaFase(n: number): void {
  limpaFase();
  $('menu').hidden = true;
  $('pausa').hidden = true;
  estado.pausado = false;
  estado.fase = FASES[n];
  estado.fase.init();
  atualizaVisibilidadeHud();
}

function montaMenuFases(): void {
  $('fases').replaceChildren(
    ...FASES_MENU.map((f) => {
      const b = document.createElement('button');
      const pronta = !!FASES[f.id];
      b.className =
        'fase' + (f.id === faseEscolhida ? ' sel' : '') + (estado.reguas.has(f.id) ? ' feita' : '');
      b.disabled = !pronta;
      b.innerHTML =
        `<span class="eyebrow">Fase ${f.id}</span><b>${f.titulo}</b>` +
        `<small>${pronta ? f.resumo : EM_BREVE}</small>`;
      b.onclick = () => {
        faseEscolhida = f.id;
        montaMenuFases();
      };
      return b;
    }),
  );
}

function vaiMenu(): void {
  limpaFase();
  estado.fase = null;
  estado.pausado = false;
  $('pausa').hidden = true;
  $('menu').hidden = false;
  montaMenuFases();
  atualizaVisibilidadeHud();
}

function alternaPausa(): void {
  if (!$('menu').hidden || !estado.fase || cards.aberto) return;
  estado.pausado = !estado.pausado;
  $('pausa').hidden = !estado.pausado;
}

function alternaAvancado(): void {
  estado.avancado = !estado.avancado;
  atualizaBotaoAvancado();
  if (!estado.fase) return;
  toast.mostra(estado.avancado ? AVANCADO.ligado : AVANCADO.desligado);
  estado.fase.aoMudarAvancado?.();
  estado.fase.hud();
}

function telaCheia(): void {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  else document.documentElement.requestFullscreen?.().catch(() => toast.mostra(TELA_CHEIA.indisponivel));
}

function aoTeclar(e: KeyboardEvent): void {
  if ((e.target as HTMLElement).tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (cards.aberto) {
    if (k === 'enter' || k === ' ') {
      e.preventDefault();
      cards.confirma();
    }
    return;
  }
  if (k === 'escape') return alternaPausa();
  if (!$('menu').hidden || estado.pausado) return;
  if (k === 'c') cards.revisa();
}

const jogavel = (): boolean => !!estado.fase && $('menu').hidden && !estado.pausado && !cards.aberto;

function ligaMenus(): void {
  $('seloMenu').append(seloCanal());
  $('seloJogo').append(seloCanal({ compacto: true }));
  $('linksPausa').append(linksCanal());
  $('btnPausa').textContent = BOTOES.pausa;
  for (const id of ['btnAvancado', 'btnAvancadoMenu']) $(id).onclick = alternaAvancado;
  $('comecar').onclick = () => iniciaFase(faseEscolhida);
  $('pContinuar').onclick = alternaPausa;
  $('pReiniciar').onclick = () => estado.fase && iniciaFase(estado.fase.id);
  $('pMenu').onclick = vaiMenu;
  $('pCard').onclick = () => {
    alternaPausa();
    cards.revisa();
  };
  $('btnPausa').onclick = alternaPausa;
  const botoesTelaCheia = ['btnTela', 'btnTela2', 'pTela'].map((id) => $(id));
  for (const b of botoesTelaCheia) {
    b.onclick = telaCheia;
    // O Safari do iPhone não deixa a página entrar em tela cheia.
    if (!document.fullscreenEnabled) b.hidden = true;
  }
  document.addEventListener('fullscreenchange', () => {
    const rotulo = document.fullscreenElement ? TELA_CHEIA.sair : TELA_CHEIA.entrar;
    for (const b of botoesTelaCheia) b.textContent = rotulo;
  });
  addEventListener('keydown', aoTeclar);
  iniciaPonteiro({
    aperta: (p) => jogavel() && !!estado.fase?.aperta?.(p),
    arrasta: (p) => estado.fase?.arrasta?.(p),
    solta: () => estado.fase?.solta?.(),
    passa: (p) => {
      canvas.style.cursor = (jogavel() && estado.fase?.cursor?.(p)) || 'default';
    },
  });
}

/** `lock` não está nos tipos do TypeScript: só existe em alguns navegadores (Chrome do Android, em tela cheia). */
const orientacao = screen.orientation as ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> };

/** Celular: aviso "Gire o celular", com o botão "Girar a tela" onde o navegador deixa, e pausa ao ficar em pé. */
function ligaCelular(): void {
  document.body.classList.add('toque');
  matchMedia('(orientation: portrait)').addEventListener('change', (e) => {
    if (e.matches && jogavel()) alternaPausa();
  });
  if (!document.fullscreenEnabled || typeof orientacao?.lock !== 'function') return;
  $('girarAcoes').hidden = false;
  $('btnGirar').onclick = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      await orientacao.lock?.('landscape');
    } catch {
      $('girarAcoes').hidden = true;
    }
  };
}

let tAnterior = performance.now();
let tHud = 0;

function quadro(agora: number): void {
  const dt = Math.min(0.05, (agora - tAnterior) / 1000);
  tAnterior = agora;
  if (estado.fase && !estado.pausado && !cards.aberto) estado.fase.update(dt);
  const c = comecaQuadro(agora / 1000);
  const f = estado.fase;
  if (f) {
    c.save();
    f.desenha(c, tela.W, alturaLivre());
    c.restore();
    tHud -= dt;
    if (tHud <= 0) {
      f.hud();
      tHud = 0.12;
    }
  }
  toast.tick(dt);
  requestAnimationFrame(quadro);
}

function inicia(): void {
  fluxo.iniciaFase = iniciaFase;
  fluxo.vaiMenu = vaiMenu;
  fluxo.existeFase = (n) => !!FASES[n];
  ajustaTela();
  addEventListener('resize', ajustaTela);
  ligaMenus();
  if (telaDeToque()) ligaCelular();
  desenhaReguas();
  atualizaBotaoAvancado();
  vaiMenu();
  requestAnimationFrame(quadro);
}

inicia();
