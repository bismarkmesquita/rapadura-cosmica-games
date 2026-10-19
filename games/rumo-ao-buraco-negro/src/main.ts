/**
 * Ponto de entrada do jogo: liga a interface, o laço principal, o menu e a pausa.
 * A lógica de cada fase fica em phases/; os textos, em content/.
 */
import '@shared/styles/tokens.css';
import '@shared/styles/ui.css';
import './style.css';
import * as THREE from 'three';
import { $ } from '@shared/ui/dom';
import { linksCanal, seloCanal } from '@shared/brand/selo';
import { canvas, iniciaRenderer, limpaOverlay, renderiza } from './core/engine';
import { estado, nave } from './core/estado';
import { iniciaEntrada, mouse, soltaTudo, teclado } from './core/input';
import { arrastaCamera, atualizaCamera, entraMapa, rig, rolaCamera, saiMapa, Y0 } from './core/camera';
import { criaModeloNave, syncNave } from './core/ship';
import { acao, atualizaVisibilidadeHud, cards, info, toast } from './core/ui';
import { desenhaMira } from './core/overlay';
import { fluxo } from './core/flow';
import { criaCeu, syncCeu } from './scene/stars';
import { descartaGrupo } from './scene/common';
import { FASES, kepler } from './phases';
import { AVISOS_CAMERA } from './content/jogo';

const ORIGEM = new THREE.Vector3();
const alvoCamera = new THREE.Vector3();
let faseEscolhida = 1;

function trocaCena(): void {
  for (const f of Object.values(FASES)) {
    descartaGrupo(f.grupo);
    f.grupo = null;
  }
  acao.esconde();
  info(null);
  $('canhao').hidden = true;
}

function iniciaFase(n: number): void {
  cards.limpa();
  trocaCena();
  estado.pausado = false;
  estado.fase = FASES[n];
  estado.fase.init();
  atualizaVisibilidadeHud();
}

/** Fundo do menu: o Sistema Solar girando devagar, visto de longe. */
function montaFundoMenu(): void {
  trocaCena();
  kepler.preparaCena();
  rig.modo = 'mapa';
  rig.alvo.set(0, 0, 0);
  rig.el = 0.55;
  rig.dist = rig.distAlvo = 900;
}

function vaiMenu(): void {
  cards.limpa();
  $('menu').hidden = false;
  $('pausa').hidden = true;
  estado.fase = null;
  estado.pausado = false;
  soltaTudo();
  atualizaVisibilidadeHud();
  montaFundoMenu();
}

function alternaPausa(): void {
  if (!$('menu').hidden || !estado.fase || cards.aberto) return;
  estado.pausado = !estado.pausado;
  $('pausa').hidden = !estado.pausado;
  soltaTudo();
}

function telaCheia(): void {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  else document.documentElement.requestFullscreen?.().catch(() => toast.mostra(AVISOS_CAMERA.telaCheia));
}

function aoTeclar(k: string, e: KeyboardEvent): void {
  if (cards.aberto) {
    if (k === 'enter' || k === ' ') {
      e.preventDefault();
      cards.confirma();
    }
    return;
  }
  if (k === 'escape') return alternaPausa();
  if (!$('menu').hidden || estado.pausado) return;
  teclado.add(k);
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (['a', 'd', 'arrowleft', 'arrowright'].includes(k)) mouse.mirar = false;
  const f = estado.fase;
  if (k === 'h') {
    estado.hudOculto = !estado.hudOculto;
    atualizaVisibilidadeHud();
    if (estado.hudOculto) info(null);
  }
  if (k === 'c') cards.revisa();
  if ((k === 'v' || k === 'm') && f?.camFixa) toast.mostra(AVISOS_CAMERA.fixa);
  else if (k === 'v' && f) {
    if (rig.modo === 'terceira') {
      rig.modo = 'primeira';
      toast.mostra(AVISOS_CAMERA.primeira);
    } else {
      saiMapa();
      toast.mostra(AVISOS_CAMERA.terceira);
    }
  } else if (k === 'm' && f) {
    if (rig.modo === 'mapa') {
      saiMapa();
      toast.mostra(AVISOS_CAMERA.volta);
    } else {
      entraMapa();
      toast.mostra(AVISOS_CAMERA.mapa);
    }
  }
  f?.tecla?.(k);
}

function ligaMenus(): void {
  $('seloMenu').append(seloCanal());
  $('seloJogo').append(seloCanal({ compacto: true }));
  $('linksPausa').append(linksCanal());
  document.querySelectorAll<HTMLButtonElement>('#fases .fase[data-fase]').forEach((b) => {
    b.onclick = () => {
      faseEscolhida = Number(b.dataset.fase);
      document.querySelectorAll('#fases .fase').forEach((x) => x.classList.toggle('sel', x === b));
    };
  });
  $('comecar').onclick = () => {
    $('menu').hidden = true;
    iniciaFase(faseEscolhida);
  };
  $('pContinuar').onclick = alternaPausa;
  $('pReiniciar').onclick = () => estado.fase && iniciaFase(estado.fase.id);
  $('pMenu').onclick = vaiMenu;
  $('pCard').onclick = () => {
    alternaPausa();
    cards.revisa();
  };
  $('btnPausa').onclick = alternaPausa;
  $('btnTela').onclick = telaCheia;
  $('btnTela2').onclick = telaCheia;
}

let tAnterior = performance.now();
let tHud = 0;

function quadro(agora: number): void {
  const dt = Math.min(0.05, (agora - tAnterior) / 1000);
  tAnterior = agora;
  const f = estado.fase;
  if (!f) {
    kepler.movePlanetas(dt, 1.2);
    rig.az += dt * 0.04;
    atualizaCamera(dt, ORIGEM);
    kepler.sync(dt);
  } else {
    if (!estado.pausado && !cards.aberto) f.update(dt);
    const atual = estado.fase;
    if (atual) {
      atualizaCamera(dt, atual.alvoCamera?.() ?? alvoCamera.set(nave.x, Y0(), nave.y));
      atual.sync(dt);
      tHud -= dt;
      if (tHud <= 0) {
        atual.hud();
        tHud = 0.12;
      }
    }
  }
  syncNave();
  syncCeu();
  renderiza();
  limpaOverlay();
  if (estado.fase) {
    estado.fase.overlay();
    desenhaMira();
  } else kepler.overlay();
  toast.tick(dt);
  requestAnimationFrame(quadro);
}

function inicia(): void {
  fluxo.iniciaFase = iniciaFase;
  fluxo.vaiMenu = vaiMenu;
  criaCeu();
  criaModeloNave();
  ligaMenus();
  iniciaEntrada(canvas, { aoTeclar, aoArrastar: arrastaCamera, aoRolar: rolaCamera });
  montaFundoMenu();
  requestAnimationFrame(quadro);
}

if (iniciaRenderer()) inicia();
else {
  $('erro3d').hidden = false;
  $('menu').hidden = true;
}
