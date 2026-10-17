// Motor de sugestão de aulas (local, sem IA externa).
// Lógica: segue a ordem clássica da aula (blocos), respeita nível e restrições
// do cliente, repete o que precisa consolidar (o clássico valoriza repetição),
// avança para a progressão quando o cliente marcou "fácil" e tira de cena
// o que gerou dor recentemente.

import { BLOCOS } from './exercicios.js';

const COTAS = { centro: 0, aquec: 1, abd: 2, coluna: 1, mmii: 1, lateral: 1, ext: 1, mmss: 1, integra: 1 };

export function historico(state, clienteId, antesDe) {
  return state.aulas
    .filter(a => a.status === 'realizada' && a.clientes.includes(clienteId) && (!antesDe || a.data < antesDe))
    .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
}

export function restricoesAtivas(cliente) {
  return (cliente.restricoes || []).map(r => r.tag);
}

function pool(state, cliente, exercicios) {
  const ativos = restricoesAtivas(cliente);
  const ap = state.settings.aparelhos;
  return exercicios.filter(e =>
    e.status !== 'arquivado' &&
    (!state.settings.soBase || e.status === 'base') &&
    ap[e.ap] !== false &&
    !e.evitar.some(t => ativos.includes(t))
  );
}

// Pseudo-aleatório estável por cliente+data: a sugestão não muda a cada abertura.
function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function contexto(state, cliente, data) {
  const hist = historico(state, cliente.id, data).slice(0, 6);
  const vezes = {}, ultimo = {}, dor = new Set(), facil = new Set();
  hist.forEach((aula, i) => {
    (aula.planos[cliente.id]?.itens || []).forEach(it => {
      if (!it.feito) return;
      vezes[it.exId] = (vezes[it.exId] || 0) + 1;
      if (i === 0) ultimo[it.exId] = it.fb || 'ok';
      if (it.fb === 'dor' && i < 3) dor.add(it.exId);
      if (it.fb === 'facil' && i < 2) facil.add(it.exId);
    });
  });
  return { hist, vezes, ultimo, dor, facil };
}

function pontuar(e, cliente, ctx, rand) {
  const objetivos = cliente.objetivos || [];
  const alvo = [...objetivos, ...restricoesAtivas(cliente)];
  let s = 1, motivo = '';
  const fo = e.foco.filter(f => objetivos.includes(f)).length;
  const aj = e.ajuda.filter(f => alvo.includes(f)).length;
  s += fo * 0.8 + aj * 1.2;
  if (aj) motivo = 'indicado para ' + e.ajuda.filter(f => alvo.includes(f))[0];
  if ((cliente.favoritos || []).includes(e.id)) { s += 2; motivo = 'favorito'; }
  const v = ctx.vezes[e.id] || 0;
  if (v) { s += Math.min(v, 3) * 0.6; motivo = motivo || 'consolidar'; }
  if (ctx.ultimo[e.id] === 'dificil') { s += 0.5; motivo = 'repetir (estava difícil)'; }
  else if (ctx.ultimo[e.id]) s -= 0.5;
  if (e.nivel === cliente.nivel) s += 0.5;
  if (e.origem === 'classico') s += 0.3;
  if (e.status === 'base') s += 0.4;
  if (!v && !motivo) motivo = 'novo';
  s += rand() * 0.9;
  return { s, motivo };
}

// `semente` muda a variação quando a Jessica pede "Refazer sugestão".
export function sugerirPlano(state, exercicios, clienteId, data, semente = '') {
  const cliente = state.clientes.find(c => c.id === clienteId);
  if (!cliente) return [];
  const ctx = contexto(state, cliente, data);
  const rand = rng(clienteId + data + semente);
  const base = pool(state, cliente, exercicios).filter(e => !ctx.dor.has(e.id));
  const porId = Object.fromEntries(exercicios.map(e => [e.id, e]));
  const escolhidos = [], usados = new Set(), porAp = {};

  // 1) Progressões: o que ficou fácil puxa o próximo passo.
  const progressoes = [];
  ctx.facil.forEach(id => {
    const prox = porId[porId[id]?.prox];
    if (prox && base.includes(prox) && prox.nivel <= cliente.nivel + 1) {
      progressoes.push({ ex: prox, motivo: 'progressão de ' + porId[id].nome });
    }
  });

  const cotas = { ...COTAS };
  const ativos = restricoesAtivas(cliente);
  if (cliente.nivel === 1 || ativos.length) cotas.centro = 1;

  for (const bloco of BLOCOS) {
    let n = cotas[bloco.id];
    progressoes.filter(p => p.ex.bloco === bloco.id && n > 0).forEach(p => {
      if (usados.has(p.ex.id)) return;
      escolhidos.push({ exId: p.ex.id, motivo: p.motivo });
      usados.add(p.ex.id); porAp[p.ex.ap] = (porAp[p.ex.ap] || 0) + 1; n--;
    });
    if (n <= 0) continue;
    const candidatos = base
      .filter(e => e.bloco === bloco.id && !usados.has(e.id) && e.nivel <= cliente.nivel)
      .map(e => {
        const p = pontuar(e, cliente, ctx, rand);
        p.s -= (porAp[e.ap] || 0) * 0.35;
        return { e, ...p };
      })
      .sort((a, b) => b.s - a.s);
    for (const c of candidatos.slice(0, n)) {
      escolhidos.push({ exId: c.e.id, motivo: c.motivo });
      usados.add(c.e.id); porAp[c.e.ap] = (porAp[c.e.ap] || 0) + 1;
    }
  }
  return escolhidos.map(x => ({ ...x, feito: false, fb: null }));
}

export function alternativas(state, exercicios, clienteId, data, exId, jaNoPlano = []) {
  const cliente = state.clientes.find(c => c.id === clienteId);
  const atual = exercicios.find(e => e.id === exId);
  if (!cliente || !atual) return [];
  const ctx = contexto(state, cliente, data);
  const rand = rng(clienteId + data + exId);
  return pool(state, cliente, exercicios)
    .filter(e => e.bloco === atual.bloco && e.id !== exId && !jaNoPlano.includes(e.id) && e.nivel <= cliente.nivel + 1)
    .map(e => ({ e, ...pontuar(e, cliente, ctx, rand) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8);
}

// Lê as anotações (texto ou ditado) e aponta possíveis restrições novas.
const GATILHOS = [
  ['lombar',      /lombar|lombalgia|ci[áa]tic|costas|sacro/],
  ['hernia',      /h[ée]rnia|protrus/],
  ['osteoporose', /osteopor|osteopen/],
  ['cervical',    /cervical|pesco[çc]o|nuca/],
  ['ombro',       /ombro|manguito|bursite/],
  ['joelho',      /joelho|menisco|patel|ligamento cruzado/],
  ['quadril',     /quadril|coxofemoral|virilha/],
  ['punho',       /punho|pulso|t[úu]nel do carpo/],
  ['gestante',    /gr[áa]vida|gestante|gesta[çc][ãa]o/],
];
const SINAL = /dor|d[óo]i|doendo|inc[ôo]mod|desconfort|travou|travad|les[ãa]o|inflam|tor[çc]|cirurgia|operou|gr[áa]vida|gestante|gesta[çc][ãa]o|osteopor|h[ée]rnia/;

export function detectarRestricoes(texto) {
  const t = (texto || '').toLowerCase();
  if (!SINAL.test(t)) return [];
  return GATILHOS.filter(([, re]) => re.test(t)).map(([tag]) => tag);
}
