// Estado do app, persistido no próprio aparelho (localStorage).
// Backup/restauração em JSON pela tela "Mais". Quando houver sincronização
// (rotina que lê a agenda), é aqui que entra a troca por um backend.

import { EXERCICIOS } from './exercicios.js';
import { sugerirPlano } from './sugestao.js';

const KEY = 'era-pilates.v1';

let ouvinte = null;
// O app avisa a nuvem a cada gravação (ver sincronização em app.js).
export const aoSalvar = f => { ouvinte = f; };

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Não salvou', e); }
  ouvinte?.();
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.version === 1 ? s : null;
  } catch { return null; }
}

export function replaceState(novo) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, novo);
  save();
}

// ——— Exercícios: base fixa + ajustes da Jessica (status, nota, mídia) + criados por ela ———
export function exercicios() {
  const ov = state.exOverrides;
  return [...EXERCICIOS, ...state.exCustom].map(e => ({
    ...e,
    status: 'revisar',
    ...(ov[e.id] || {}),
  }));
}

export function exercicio(id) {
  return exercicios().find(e => e.id === id);
}

export function setExercicio(id, patch) {
  state.exOverrides[id] = { ...(state.exOverrides[id] || {}), ...patch };
  save();
}

// ——— Utilidades de data (sempre no fuso local) ———
export function iso(d) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDias(s, n) {
  const d = parseIso(s); d.setDate(d.getDate() + n); return iso(d);
}
export function inicioSemana(s) {
  const d = parseIso(s); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return iso(d);
}
export const hoje = () => iso(new Date());

// Criado depois das utilidades de data, que o seed usa.
export const state = load() || seed();

export function uid(p = 'x') {
  return p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
}

export function cliente(id) { return state.clientes.find(c => c.id === id); }

// ——— Dados de exemplo para ver o app funcionando antes de importar os clientes reais ———
function seed() {
  const s = {
    version: 1,
    criadoEm: new Date().toISOString(),
    settings: {
      aparelhos: { mat: true, reformer: true, cadillac: true, chair: true, barrel: true, acessorio: true },
      soBase: false,
    },
    exOverrides: {},
    exCustom: [],
    clientes: [],
    aulas: [],
    exemplo: true,
  };
  const C = (nome, nivel, objetivos, restricoes = [], obs = '') => {
    const c = { id: uid('c'), nome, nivel, objetivos, restricoes: restricoes.map(tag => ({ tag, desde: hoje(), temporaria: false })), obs, favoritos: [], exemplo: true };
    s.clientes.push(c); return c;
  };
  const ana = C('Ana (exemplo)', 2, ['postura', 'mobilidade']);
  const bia = C('Beatriz (exemplo)', 1, ['core'], ['lombar'], 'Trabalha sentada o dia todo.');
  const car = C('Carla (exemplo)', 3, ['forca-mmii', 'alongamento']);
  const die = C('Diego (exemplo)', 2, ['forca-mmss'], ['ombro']);
  const eli = C('Elisa (exemplo)', 1, ['equilibrio', 'postura'], ['osteoporose']);
  const fer = C('Fernanda (exemplo)', 2, ['core', 'alongamento'], ['joelho']);
  const gus = C('Gustavo (exemplo)', 1, ['mobilidade']);
  const hel = C('Helena (exemplo)', 2, ['respiracao', 'postura'], ['cervical']);

  // Grade semanal: dia (0 = segunda), hora, alunos
  const grade = [
    [0, '08:00', [ana, bia]], [2, '08:00', [ana, bia]],
    [0, '18:00', [car, die]], [2, '18:00', [car, die]],
    [1, '09:00', [eli]],      [3, '09:00', [eli]],
    [1, '19:00', [fer, gus]], [3, '19:00', [fer, gus]],
    [4, '10:00', [hel]],      [4, '17:00', [car, ana]],
  ];
  const ex = () => [...EXERCICIOS].map(e => ({ ...e, status: 'revisar' }));
  const semana0 = inicioSemana(hoje());
  const fbs = ['ok', 'ok', 'ok', 'facil', 'dificil'];
  let k = 0;
  for (let w = -3; w <= 1; w++) {
    for (const [dia, hora, alunos] of grade) {
      const data = addDias(semana0, w * 7 + dia);
      const aula = { id: uid('a'), data, hora, clientes: alunos.map(a => a.id), status: 'agendada', planos: {}, notas: {}, origem: 'exemplo' };
      s.aulas.push(aula);
      if (data < hoje()) {
        for (const a of alunos) {
          const itens = sugerirPlano(s, ex(), a.id, data);
          itens.forEach(it => { it.feito = true; it.fb = fbs[(k++) % fbs.length]; });
          aula.planos[a.id] = { itens, aprovado: true };
        }
        aula.status = 'realizada';
      }
    }
  }
  const ult = s.aulas.filter(a => a.status === 'realizada' && a.clientes.includes(bia.id)).pop();
  if (ult) ult.notas[bia.id] = 'Chegou com a lombar um pouco travada, preferimos não fazer flexão com carga.';
  return s;
}
