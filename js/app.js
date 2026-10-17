import { BLOCOS, APARELHOS, RESTRICOES, OBJETIVOS } from './exercicios.js';
import { picto } from './pictos.js';
import { sugerirPlano, alternativas, detectarRestricoes, historico } from './sugestao.js';
import {
  state, save, replaceState, exercicios, exercicio, setExercicio, cliente,
  iso, parseIso, addDias, inicioSemana, hoje, uid,
} from './store.js';

const $app = document.getElementById('app');
const ui = { dia: hoje(), aluno: {}, exFiltro: { q: '', ap: '', st: '' }, cliQ: '', cliInativos: false };

// ——— Ícones ———
const I = {
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/></svg>',
  lib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L4 7l3 3M4 7h12M17 20l3-3-3-3M20 17H8"/></svg>',
};

// ——— Utilidades ———
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataLonga = s => { const d = parseIso(s); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };
const dataCurta = s => { const d = parseIso(s); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; };
const primeiro = n => (n || '').split(' ')[0];
const iniciais = n => (n || '?').replace(/\(.*\)/, '').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const nivelDots = n => `<span class="level" title="Nível ${n}">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
const thumb = e => e.foto ? `<img src="${e.foto}" alt="">` : picto(e);
const exMap = () => Object.fromEntries(exercicios().map(e => [e.id, e]));
const blocoNome = id => BLOCOS.find(b => b.id === id)?.nome || id;

function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function statusAula(a) {
  if (a.status === 'realizada') return { cls: 'realizada', txt: 'Realizada' };
  const planos = a.clientes.map(c => a.planos[c]);
  if (planos.length && planos.every(p => p?.aprovado)) return { cls: 'aprovada', txt: 'Plano aprovado' };
  if (planos.some(p => p?.itens?.length)) return { cls: 'planejada', txt: 'Sugestão pronta' };
  return { cls: '', txt: 'Sem plano' };
}

function aulasDoDia(d) {
  return state.aulas.filter(a => a.data === d).sort((a, b) => a.hora.localeCompare(b.hora));
}

// ——— Roteamento ———
function rota() {
  const [, nome = 'agenda', id] = location.hash.split('/');
  return { nome: nome || 'agenda', id: id ? decodeURIComponent(id) : null };
}
const go = h => { location.hash = h; };
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

function render() {
  const r = rota();
  const views = { agenda: vAgenda, aula: vAula, clientes: vClientes, cliente: vCliente, exercicios: vExercicios, exercicio: vExercicio, curadoria: vCuradoria, mais: vMais };
  $app.innerHTML = (views[r.nome] || vAgenda)(r.id);
  const tab = { aula: 'agenda', cliente: 'clientes', exercicio: 'exercicios', curadoria: 'exercicios' }[r.nome] || r.nome;
  document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
}

// ——— AGENDA ———
function vAgenda() {
  const d = ui.dia, ini = inicioSemana(d), t = hoje();
  const semana = [...Array(7)].map((_, i) => addDias(ini, i));
  const aulas = aulasDoDia(d);
  const pendentes = semana.filter(x => x >= t).flatMap(aulasDoDia).filter(a => a.status !== 'realizada' && a.clientes.some(c => !a.planos[c]?.itens?.length)).length;

  return `
  <header class="top">
    <div class="grow">
      <div class="brand"><b>ERA</b><span>Pilates</span></div>
    </div>
    ${d !== t ? `<button class="btn small ghost" data-act="dia" data-d="${t}">Hoje</button>` : ''}
  </header>
  <p class="eyebrow">${d === t ? 'Hoje' : d < t ? 'Dia passado' : 'Próximo'}</p>
  <h1>${dataLonga(d)}</h1>

  <div class="week">
    <button class="nav" data-act="dia" data-d="${addDias(ini, -7)}" aria-label="Semana anterior">${I.back}</button>
    ${semana.map(x => {
      const n = aulasDoDia(x).length, dd = parseIso(x);
      return `<button class="day ${x === d ? 'sel' : ''} ${x === t ? 'today' : ''}" data-act="dia" data-d="${x}">
        <small>${DIAS[dd.getDay()].slice(0, 3)}</small><strong>${dd.getDate()}</strong>
        <span class="dots">${'<i></i>'.repeat(Math.min(n, 4))}</span></button>`;
    }).join('')}
    <button class="nav" data-act="dia" data-d="${addDias(ini, 7)}" aria-label="Próxima semana">${I.next}</button>
  </div>

  ${pendentes ? `<div class="card flat row between" style="margin-bottom:14px">
      <div><b>${pendentes} aula${pendentes > 1 ? 's' : ''}</b> <span class="muted">sem plano nesta semana</span></div>
      <button class="btn small accent" data-act="planejar-semana" data-d="${ini}">${I.spark} Planejar semana</button>
    </div>` : ''}

  ${aulas.length ? aulas.map(cardAula).join('') : `
    <div class="empty"><h2>Dia livre</h2><p>Nenhuma aula neste dia. Toque em + para adicionar.</p></div>`}

  <button class="fab" data-act="nova-aula" aria-label="Nova aula">${I.plus}</button>`;
}

function cardAula(a) {
  const st = statusAula(a);
  const nomes = a.clientes.map(c => primeiro(cliente(c)?.nome) || '—').join(' & ');
  const n = a.clientes.map(c => a.planos[c]?.itens?.length || 0).filter(Boolean).join(' + ');
  const restr = a.clientes.flatMap(c => cliente(c)?.restricoes || []).map(r => RESTRICOES[r.tag]);
  return `<a class="card aula" href="#/aula/${a.id}">
    <div class="hora">${a.hora}</div>
    <div>
      <div class="nomes">${esc(nomes)}</div>
      <div class="meta">${st.txt}${n ? ` · ${n} exerc.` : ''}${restr.length ? ` · <span style="color:var(--warn)">${esc([...new Set(restr)].join(', '))}</span>` : ''}</div>
    </div>
    <span class="status ${st.cls}"></span>
  </a>`;
}

// ——— AULA ———
function vAula(id) {
  const a = state.aulas.find(x => x.id === id);
  if (!a) return `<div class="empty"><h2>Aula não encontrada</h2><a class="btn" href="#/agenda">Voltar</a></div>`;
  if (!a.clientes.some(cliente)) return `<div class="empty"><h2>Aula sem cliente</h2><p>Essa aula veio sem nome de cliente.</p><a class="btn" href="#/agenda">Voltar</a> <button class="btn ghost" data-act="apagar-aula" data-a="${a.id}">Remover</button></div>`;
  const alunoId = a.clientes.includes(ui.aluno[a.id]) ? ui.aluno[a.id] : a.clientes.find(cliente);
  ui.aluno[a.id] = alunoId;
  const c = cliente(alunoId);
  const plano = a.planos[alunoId];
  const exs = exMap();
  const feita = a.status === 'realizada';
  const outro = a.clientes.find(x => x !== alunoId);
  const ult = historico(state, alunoId, a.data)[0];
  const ultNota = ult?.notas?.[alunoId];

  const grupos = BLOCOS.map(b => ({ b, itens: (plano?.itens || []).map((it, i) => ({ it, i })).filter(({ it }) => exs[it.exId]?.bloco === b.id) })).filter(g => g.itens.length);
  const feitos = (plano?.itens || []).filter(i => i.feito).length;

  return `
  <header class="top">
    <a class="iconbtn" href="#/agenda" aria-label="Voltar">${I.back}</a>
    <div class="grow">
      <p class="eyebrow">${dataLonga(a.data)}</p>
      <h2>${a.hora} · ${esc(a.clientes.map(x => primeiro(cliente(x)?.nome)).join(' & '))}</h2>
    </div>
    <button class="btn small ghost" data-act="editar-aula" data-a="${a.id}">Editar</button>
  </header>

  ${a.clientes.length > 1 ? `<div class="seg">${a.clientes.map(x => `<button class="${x === alunoId ? 'on' : ''}" data-act="aluno" data-a="${a.id}" data-c="${x}">${esc(cliente(x)?.nome)}</button>`).join('')}</div>` : ''}

  <div class="section stack">
    <div class="row">
      <a class="chip" href="#/cliente/${c.id}">Nível ${c.nivel} · ver ficha</a>
      ${(c.restricoes || []).map(r => `<span class="chip warn">${RESTRICOES[r.tag]}${r.temporaria ? ' (temp.)' : ''}</span>`).join('')}
      ${(c.objetivos || []).map(o => `<span class="chip sage">${OBJETIVOS[o] || o}</span>`).join('')}
    </div>
    ${c.obs ? `<div class="note">${esc(c.obs)}</div>` : ''}
    ${ultNota ? `<div class="note"><span class="eyebrow">Última aula · ${dataCurta(ult.data)}</span><br>${esc(ultNota)}</div>` : ''}
  </div>

  <div class="section">
    ${plano?.itens?.length ? `
      <div class="row between">
        <span class="eyebrow">${feita ? `Realizado · ${feitos} de ${plano.itens.length}` : plano.aprovado ? 'Plano aprovado' : 'Sugestão — revise e aprove'}</span>
        ${!feita ? `<button class="linkbtn" data-act="ressugerir" data-a="${a.id}">Refazer sugestão</button>` : ''}
      </div>
      ${grupos.map(g => `
        <div class="bloco">
          <div class="eyebrow">${g.b.nome}</div>
          ${g.itens.map(({ it, i }) => itemPlano(a, alunoId, it, i, exs[it.exId], feita)).join('')}
        </div>`).join('')}
      <div class="row" style="margin-top:14px">
        <button class="btn small ghost" data-act="add-ex" data-a="${a.id}">${I.plus} Exercício</button>
        ${outro && !feita ? `<button class="btn small ghost" data-act="copiar" data-a="${a.id}">Copiar para ${esc(primeiro(cliente(outro)?.nome))}</button>` : ''}
        ${!plano.aprovado && !feita ? `<button class="btn small primary" data-act="aprovar" data-a="${a.id}">${I.check} Aprovar plano</button>` : ''}
      </div>`
    : `
      <div class="card flat empty" style="padding:28px 16px">
        <h2>Sem plano ainda</h2>
        <p>Gero uma sugestão a partir do histórico, nível e restrições de ${esc(primeiro(c.nome))}.</p>
        <button class="btn accent" data-act="sugerir" data-a="${a.id}">${I.spark} Sugerir aula</button>
        <div style="margin-top:10px"><button class="linkbtn" data-act="add-ex" data-a="${a.id}">ou montar do zero</button></div>
      </div>`}
  </div>

  <div class="section">
    <span class="eyebrow">Anotações de ${esc(primeiro(c.nome))} nesta aula</span>
    <div class="notes">
      <textarea id="nota" data-a="${a.id}" data-c="${alunoId}" placeholder="Como foi? Dores, facilidades, o que mudar na próxima… (pode ditar)">${esc(a.notas?.[alunoId] || '')}</textarea>
      <button class="mic" data-act="ditar" aria-label="Ditar">${I.mic}</button>
    </div>
  </div>

  <div class="section">
    ${feita
      ? `<button class="btn ghost block" data-act="reabrir" data-a="${a.id}">Reabrir aula</button>`
      : `<button class="btn primary block" data-act="finalizar" data-a="${a.id}">${I.check} Finalizar aula</button>`}
    <div style="text-align:center;margin-top:12px"><button class="linkbtn" data-act="apagar-aula" data-a="${a.id}">Remover esta aula da agenda</button></div>
  </div>`;
}

function itemPlano(a, cId, it, i, e, feita) {
  if (!e) return '';
  const fbs = [['facil', 'Fácil'], ['ok', 'Ok'], ['dificil', 'Difícil'], ['dor', 'Dor']];
  return `<div class="item ${it.feito ? 'feito' : ''}">
    <a class="thumb" href="#/exercicio/${e.id}">${thumb(e)}</a>
    <div>
      <div class="nome">${esc(e.nome)}</div>
      <div class="sub">${APARELHOS[e.ap]} · ${nivelDots(e.nivel)}</div>
      ${it.motivo && !it.feito ? `<div class="motivo">${esc(it.motivo)}</div>` : ''}
    </div>
    <button class="check" data-act="feito" data-a="${a.id}" data-i="${i}" aria-label="Marcar como feito">${I.check}</button>
    ${it.feito ? `<div class="extra">
        ${fbs.map(([k, t]) => `<button class="fb ${k} ${it.fb === k ? 'on' : ''}" data-act="fb" data-a="${a.id}" data-i="${i}" data-v="${k}">${t}</button>`).join('')}
      </div>` : !feita ? `<div class="extra">
        <span class="tiny dica">${esc(e.dica)}</span>
        <span class="sp"></span>
        <button class="linkbtn" data-act="trocar" data-a="${a.id}" data-i="${i}">${I.swap.replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px"')} Trocar</button>
        <button class="linkbtn" data-act="remover" data-a="${a.id}" data-i="${i}">Tirar</button>
      </div>` : ''}
  </div>`;
}

function aulaAtual(el) {
  const a = state.aulas.find(x => x.id === el.dataset.a);
  return { a, cId: ui.aluno[a.id] || a.clientes[0] };
}

// ——— CLIENTES ———
function vClientes() {
  const q = ui.cliQ.toLowerCase();
  const lista = state.clientes.filter(c => !!c.inativo === ui.cliInativos && c.nome.toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));
  const nInativos = state.clientes.filter(c => c.inativo).length;
  const t = hoje();
  return `
  <header class="top"><div class="grow"><p class="eyebrow">Carteira</p><h1>Clientes</h1></div>
    <button class="btn small" data-act="novo-cliente">${I.plus} Cliente</button></header>
  <div class="search">${I.search}<input type="search" id="cliQ" placeholder="Buscar cliente" value="${esc(ui.cliQ)}"></div>
  <div class="seg" style="margin-top:10px">
    <button class="${ui.cliInativos ? '' : 'on'}" data-act="cli-inativos" data-v="">Ativos · ${state.clientes.length - nInativos}</button>
    <button class="${ui.cliInativos ? 'on' : ''}" data-act="cli-inativos" data-v="1">Inativos · ${nInativos}</button>
  </div>
  <div class="section">
    ${lista.map(c => {
      const prox = state.aulas.filter(a => a.clientes.includes(c.id) && a.data >= t && a.status !== 'realizada').sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];
      return `<a class="person" href="#/cliente/${c.id}">
        <span class="avatar">${iniciais(c.nome)}</span>
        <div><div style="font-weight:500">${esc(c.nome)}</div>
          <div class="tiny">${prox ? `Próxima: ${DIAS[parseIso(prox.data).getDay()].slice(0, 3)} ${dataCurta(prox.data)} · ${prox.hora}` : 'Sem aula marcada'}</div></div>
        <span>${(c.restricoes || []).length ? `<span class="chip warn">${c.restricoes.length}</span>` : ''} ${nivelDots(c.nivel)}</span>
      </a>`;
    }).join('') || `<div class="empty">${state.clientes.length ? 'Nenhum cliente encontrado.' : 'Nenhum cliente ainda. Toque em “+ Cliente” ou importe a lista em Mais.'}</div>`}
  </div>`;
}

function vCliente(id) {
  const c = cliente(id);
  if (!c) return `<div class="empty"><h2>Cliente não encontrado</h2><a class="btn" href="#/clientes">Voltar</a></div>`;
  const hist = historico(state, c.id);
  const exs = exMap();
  const feitos = hist.flatMap(a => (a.planos[c.id]?.itens || []).filter(i => i.feito));
  const distintos = new Set(feitos.map(i => i.exId));
  const progs = hist.flatMap(a => (a.planos[c.id]?.itens || []).filter(i => (i.motivo || '').startsWith('progressão'))).length;
  const sem0 = inicioSemana(hoje());
  const semanas = [...Array(8)].map((_, k) => { const ini = addDias(sem0, -7 * (7 - k)); const fim = addDias(ini, 7); return hist.filter(a => a.data >= ini && a.data < fim).length; });
  const max = Math.max(1, ...semanas);
  const contagem = {}; feitos.forEach(i => { contagem[i.exId] = (contagem[i.exId] || 0) + 1; });
  const top = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return `
  <header class="top">
    <a class="iconbtn" href="#/clientes" aria-label="Voltar">${I.back}</a>
    <div class="grow"><p class="eyebrow">Ficha</p><h2>${esc(c.nome)}</h2></div>
    <button class="btn small ghost" data-act="renomear" data-c="${c.id}">Editar</button>
  </header>

  <div class="toggle"><span>Cliente ativo<br><span class="tiny">${c.inativo ? 'Inativo — não aparece ao marcar aulas; o histórico fica guardado' : 'Aparece na lista e ao marcar aulas'}</span></span>
    <button class="switch ${c.inativo ? '' : 'on'}" data-act="ativo" data-c="${c.id}" aria-label="Cliente ativo"></button></div>
  ${c.telefone ? `<p class="tiny" style="margin-top:8px">Telefone: <a href="tel:${esc(c.telefone)}">${esc(c.telefone)}</a></p>` : ''}

  <div class="section"><span class="eyebrow">Nível</span>
    <div class="seg">${[[1, 'Básico'], [2, 'Intermediário'], [3, 'Avançado']].map(([n, t]) => `<button class="${c.nivel === n ? 'on' : ''}" data-act="nivel" data-c="${c.id}" data-n="${n}">${t}</button>`).join('')}</div>
  </div>

  <div class="section"><span class="eyebrow">Restrições e cuidados</span>
    <div class="row">
      ${(c.restricoes || []).map(r => `<span class="chip warn">${RESTRICOES[r.tag]}${r.temporaria ? ` · desde ${dataCurta(r.desde)}` : ''}<button data-act="tira-restr" data-c="${c.id}" data-t="${r.tag}" aria-label="Remover">×</button></span>`).join('')}
      <button class="chip" data-act="add-restr" data-c="${c.id}">${I.plus.replace('<svg', '<svg width="14" height="14"')} Adicionar</button>
    </div>
  </div>

  <div class="section"><span class="eyebrow">Objetivos</span>
    <div class="row">${Object.entries(OBJETIVOS).map(([k, t]) => `<button class="chip ${(c.objetivos || []).includes(k) ? 'on' : ''}" data-act="obj" data-c="${c.id}" data-o="${k}">${t}</button>`).join('')}</div>
  </div>

  <div class="section"><span class="eyebrow">Observações fixas</span>
    <div class="notes"><textarea id="obsCli" data-c="${c.id}" placeholder="Histórico de saúde, preferências, rotina…">${esc(c.obs || '')}</textarea>
    <button class="mic" data-act="ditar" aria-label="Ditar">${I.mic}</button></div>
  </div>

  <div class="section"><span class="eyebrow">Evolução</span>
    <div class="stats">
      <div class="stat"><b>${hist.length}</b><span>aulas registradas</span></div>
      <div class="stat"><b>${distintos.size}</b><span>exercícios diferentes</span></div>
      <div class="stat"><b>${progs}</b><span>progressões</span></div>
    </div>
    <div class="card" style="margin-top:10px">
      <div class="row between"><span class="tiny">Aulas por semana · últimas 8</span><span class="tiny">hoje →</span></div>
      <div class="bars" style="margin-top:10px">${semanas.map((n, k) => `<div class="${k === 7 ? 'on' : ''}" style="height:${(n / max) * 100}%" title="${n} aula(s)"></div>`).join('')}</div>
    </div>
    ${top.length ? `<div class="card" style="margin-top:10px"><span class="tiny">Mais praticados</span>
      ${top.map(([exId, n]) => `<div class="row between" style="padding:6px 0"><span>${esc(exs[exId]?.nome || exId)}</span><span class="chip">${n}×</span></div>`).join('')}</div>` : ''}
  </div>

  <div class="section"><span class="eyebrow">Histórico</span>
    ${hist.slice(0, 20).map(a => {
      const itens = a.planos[c.id]?.itens || [];
      return `<details class="hist"><summary><span><b>${dataCurta(a.data)}</b> <span class="muted">· ${a.hora} · ${itens.filter(i => i.feito).length} exercícios</span></span><span class="tiny">ver</span></summary>
        <div style="margin-top:8px">${a.notas?.[c.id] ? `<div class="note" style="margin-bottom:8px">${esc(a.notas[c.id])}</div>` : ''}
        ${itens.map(i => `<div class="row between" style="padding:3px 0"><span class="${i.feito ? '' : 'muted'}">${esc(exs[i.exId]?.nome || i.exId)}</span>${i.fb ? `<span class="chip ${i.fb === 'dor' ? 'warn' : ''}">${{ facil: 'fácil', ok: 'ok', dificil: 'difícil', dor: 'dor' }[i.fb]}</span>` : ''}</div>`).join('')}</div>
      </details>`;
    }).join('') || '<p class="muted">Ainda sem aulas registradas.</p>'}
  </div>`;
}

// ——— EXERCÍCIOS ———
function vExercicios() {
  const f = ui.exFiltro, q = f.q.toLowerCase();
  const todos = exercicios();
  // Mantém a ordem da base: aparelho a aparelho, na sequência clássica.
  const lista = todos.filter(e => (!f.ap || e.ap === f.ap) && (!f.st || e.status === f.st) && (!q || e.nome.toLowerCase().includes(q)));
  const revisar = todos.filter(e => e.status === 'revisar').length;
  const sts = [['', 'Todos'], ['base', 'Na base'], ['revisar', 'A revisar'], ['arquivado', 'Arquivo']];
  return `
  <header class="top"><div class="grow"><p class="eyebrow">Repertório</p><h1>Exercícios</h1></div>
    <button class="btn small" data-act="novo-ex">${I.plus} Novo</button></header>
  ${revisar ? `<a class="card row between" href="#/curadoria" style="text-decoration:none;margin-bottom:12px">
      <div><b>Curadoria</b><div class="tiny">${revisar} exercício${revisar > 1 ? 's' : ''} esperando sua aprovação</div></div>
      <span class="btn small accent">Revisar</span></a>` : ''}
  <div class="search">${I.search}<input type="search" id="exQ" placeholder="Buscar exercício" value="${esc(f.q)}"></div>
  <div class="scroll-x" style="margin-top:10px">
    <button class="chip ${!f.ap ? 'on' : ''}" data-act="f-ap" data-v="">Todos</button>
    ${Object.entries(APARELHOS).map(([k, t]) => `<button class="chip ${f.ap === k ? 'on' : ''}" data-act="f-ap" data-v="${k}">${t}</button>`).join('')}
  </div>
  <div class="seg" style="margin-top:8px">${sts.map(([k, t]) => `<button class="${f.st === k ? 'on' : ''}" data-act="f-st" data-v="${k}">${t}</button>`).join('')}</div>
  <p class="tiny" style="margin:12px 0 8px">${lista.length} exercícios</p>
  <div class="grid">${lista.map(e => `<a class="excard" href="#/exercicio/${e.id}">
      <span class="dot ${e.status}"></span>
      <div class="thumb">${thumb(e)}</div>
      <div class="nome">${esc(e.nome)}</div>
      <div class="sub">${APARELHOS[e.ap]} · ${nivelDots(e.nivel)}</div>
    </a>`).join('')}</div>`;
}

function vExercicio(id) {
  const e = exercicio(id);
  if (!e) return `<div class="empty"><h2>Exercício não encontrado</h2><a class="btn" href="#/exercicios">Voltar</a></div>`;
  const prox = e.prox && exercicio(e.prox);
  const anteriores = exercicios().filter(x => x.prox === e.id);
  const sts = [['base', 'Na base'], ['revisar', 'A revisar'], ['arquivado', 'Arquivar']];
  return `
  <header class="top">
    <button class="iconbtn" data-act="voltar" aria-label="Voltar">${I.back}</button>
    <div class="grow"><p class="eyebrow">${APARELHOS[e.ap]} · ${e.origem === 'classico' ? 'Clássico' : 'Contemporâneo'}</p><h2>${esc(e.nome)}</h2></div>
  </header>
  <div class="hero">${thumb(e)}</div>
  <div class="section stack">
    <div class="row"><span class="chip">${blocoNome(e.bloco)}</span><span class="chip">Nível ${e.nivel} ${nivelDots(e.nivel)}</span></div>
    <p>${esc(e.dica)}</p>
    ${e.foco.length ? `<div><span class="eyebrow">Foco</span><div class="row" style="margin-top:6px">${e.foco.map(f => `<span class="chip sage">${f.replace('-', ' ')}</span>`).join('')}</div></div>` : ''}
    ${e.evitar.length ? `<div><span class="eyebrow">Não sugerir com</span><div class="row" style="margin-top:6px">${e.evitar.map(f => `<span class="chip warn">${RESTRICOES[f] || f}</span>`).join('')}</div></div>` : ''}
    ${e.ajuda.length ? `<div><span class="eyebrow">Bem-vindo para</span><div class="row" style="margin-top:6px">${e.ajuda.map(f => `<span class="chip accent">${RESTRICOES[f] || OBJETIVOS[f] || f}</span>`).join('')}</div></div>` : ''}
    ${prox ? `<div><span class="eyebrow">Próximo passo</span><br><a href="#/exercicio/${prox.id}">${esc(prox.nome)}</a></div>` : ''}
    ${anteriores.length ? `<div><span class="eyebrow">Vem antes</span><br>${anteriores.map(a => `<a href="#/exercicio/${a.id}">${esc(a.nome)}</a>`).join(' · ')}</div>` : ''}
  </div>

  <div class="section"><span class="eyebrow">Curadoria</span>
    <div class="seg">${sts.map(([k, t]) => `<button class="${e.status === k ? 'on' : ''}" data-act="ex-st" data-id="${e.id}" data-v="${k}">${t}</button>`).join('')}</div>
  </div>

  <div class="section"><span class="eyebrow">Minha nota / variação</span>
    <div class="notes"><textarea id="exNota" data-id="${e.id}" placeholder="Como eu ensino, molas, adaptações…">${esc(e.nota || '')}</textarea>
    <button class="mic" data-act="ditar" aria-label="Ditar">${I.mic}</button></div>
  </div>

  <div class="section"><span class="eyebrow">Mídia</span>
    <label class="field"><span>Link de vídeo (Instagram, YouTube, Drive)</span>
      <input type="url" id="exVideo" data-id="${e.id}" placeholder="https://…" value="${esc(e.video || '')}"></label>
    ${e.video ? `<p><a href="${esc(e.video)}" target="_blank" rel="noopener">Abrir vídeo ↗</a></p>` : ''}
    <div class="row" style="margin-top:10px">
      <label class="btn small ghost">Foto do exercício<input type="file" accept="image/*" id="exFoto" data-id="${e.id}" hidden></label>
      ${e.foto ? `<button class="btn small ghost warn" data-act="tira-foto" data-id="${e.id}">Tirar foto</button>` : ''}
    </div>
  </div>
  ${e.custom ? `<div class="section" style="text-align:center"><button class="linkbtn" data-act="apaga-ex" data-id="${e.id}">Apagar exercício criado</button></div>` : ''}`;
}

// ——— CURADORIA ———
function vCuradoria() {
  const fila = exercicios().filter(e => e.status === 'revisar')
    // Ordem da base (Mat clássico primeiro); os adiados ("Depois") vão para o fim da fila.
    .sort((a, b) => (a.adiado || 0) - (b.adiado || 0));
  const total = exercicios().length;
  const feitos = total - fila.length;
  const e = fila[0];
  return `
  <header class="top">
    <a class="iconbtn" href="#/exercicios" aria-label="Voltar">${I.back}</a>
    <div class="grow"><p class="eyebrow">Curadoria</p><h2>Monte o seu repertório</h2></div>
  </header>
  <div class="progress"><i style="width:${(feitos / total) * 100}%"></i></div>
  <p class="tiny" style="margin-top:6px">${feitos} de ${total} revisados · arquivados não aparecem nas sugestões</p>
  ${e ? `<div class="cura section">
      <div class="hero">${thumb(e)}</div>
      <p class="eyebrow">${APARELHOS[e.ap]} · ${blocoNome(e.bloco)} · ${e.origem === 'classico' ? 'Clássico' : 'Contemporâneo'}</p>
      <h1 style="margin:6px 0">${esc(e.nome)}</h1>
      <div>${nivelDots(e.nivel)}</div>
      <p class="muted">${esc(e.dica)}</p>
      ${e.evitar.length ? `<p class="tiny">Não sugerir com: ${e.evitar.map(f => RESTRICOES[f]).join(', ')}</p>` : ''}
      <div class="acts">
        <button class="btn ghost" data-act="cura" data-id="${e.id}" data-v="arquivado">Arquivar</button>
        <button class="btn ghost" data-act="cura-pular" data-id="${e.id}">Depois</button>
        <button class="btn primary" data-act="cura" data-id="${e.id}" data-v="base">${I.check} Manter</button>
      </div>
      <p style="margin-top:14px"><a class="linkbtn" href="#/exercicio/${e.id}">Abrir detalhes / anexar foto</a></p>
    </div>` : `<div class="empty"><h2>Tudo revisado</h2><p>Seu repertório está pronto. Você pode mudar o status de qualquer exercício na lista.</p><a class="btn" href="#/exercicios">Ver exercícios</a></div>`}`;
}

// ——— MAIS ———
function vMais() {
  const ap = state.settings.aparelhos;
  return `
  <header class="top"><div class="grow"><p class="eyebrow">Ajustes</p><h1>Mais</h1></div></header>

  <div class="section"><span class="eyebrow">Aparelhos do estúdio</span>
    ${Object.entries(APARELHOS).map(([k, t]) => `<div class="toggle"><span>${t}</span><button class="switch ${ap[k] !== false ? 'on' : ''}" data-act="ap" data-k="${k}" aria-label="${t}"></button></div>`).join('')}
    <div class="toggle"><span>Sugerir só exercícios aprovados<br><span class="tiny">Desligado: usa também os que ainda estão “a revisar”</span></span>
      <button class="switch ${state.settings.soBase ? 'on' : ''}" data-act="soBase" aria-label="Só aprovados"></button></div>
  </div>

  <div class="section"><span class="eyebrow">Agenda</span>
    <p class="muted">Cole aqui a agenda (vinda do sistema de agendamento ou da rotina automática). Uma aula por linha:<br>
    <code>2026-10-20 08:00 Ana Souza, Bruno Lima</code><br>ou o JSON <code>{"aulas":[{"data","hora","clientes":[…]}]}</code>.</p>
    <textarea id="agendaTxt" placeholder="2026-10-20 08:00 Ana Souza, Bruno Lima" style="padding-right:14px"></textarea>
    <button class="btn block" style="margin-top:8px" data-act="importar-agenda">Importar agenda</button>
  </div>

  <div class="section"><span class="eyebrow">Clientes em lote</span>
    <p class="muted">Um cliente por linha — pode colar direto de uma planilha (Excel / Google Sheets / relatório do sistema).
    A primeira coluna é o nome; se alguma coluna disser “inativo”, ele entra como inativo; telefone é reconhecido sozinho.
    Quem já existe é atualizado, não duplicado.${state.exemplo ? ' <b>Os dados de exemplo são removidos na primeira importação.</b>' : ''}</p>
    <textarea id="clientesTxt" placeholder="Ana Souza&#9;(51) 99999-0000&#9;Ativo&#10;Bruno Lima&#9;&#9;Inativo" style="padding-right:14px"></textarea>
    <button class="btn block" style="margin-top:8px" data-act="importar-clientes">Adicionar clientes</button>
  </div>

  <div class="section"><span class="eyebrow">Backup</span>
    <p class="muted">Os dados ficam salvos neste aparelho. Faça backup de tempos em tempos.</p>
    <div class="row">
      <button class="btn" data-act="exportar">Baixar backup</button>
      <label class="btn ghost">Restaurar<input type="file" accept="application/json" id="restaurar" hidden></label>
    </div>
  </div>

  ${state.exemplo ? `<div class="section"><span class="eyebrow">Dados de exemplo</span>
    <p class="muted">O app veio com clientes e aulas fictícios para você testar. Remova quando for usar de verdade.</p>
    <button class="btn warn ghost" data-act="limpar-exemplo">Remover dados de exemplo</button></div>` : ''}

  <div class="section"><span class="eyebrow">Sobre as sugestões</span>
    <p class="muted">A aula segue a ordem clássica (centro → footwork → powerhouse → coluna → pernas → lateral → extensão → braços → final).
    O app repete o que o cliente precisa consolidar, avança para a progressão quando você marca “fácil”, tira o que gerou “dor”
    e respeita as restrições da ficha. As anotações com menção a dor sugerem uma restrição nova.</p>
  </div>
  <p class="tiny" style="text-align:center;margin-top:28px">ERA Pilates · app interno · v0.1</p>`;
}

// ——— Folhas (bottom sheets) ———
function sheet(html, onMount) {
  closeSheet();
  const bg = document.createElement('div');
  bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  bg.addEventListener('click', ev => { if (ev.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  onMount?.(bg.querySelector('.sheet'));
}
function closeSheet() { document.querySelector('.sheet-bg')?.remove(); }

function sheetAula(aula = null) {
  const sel = new Set(aula?.clientes || []);
  const lista = () => state.clientes.filter(c => !c.inativo || sel.has(c.id)).sort((a, b) => a.nome.localeCompare(b.nome));
  const linha = c => `<button class="checkrow ${sel.has(c.id) ? 'on' : ''}" data-id="${c.id}"><span class="box">${I.check}</span>${esc(c.nome)}</button>`;
  sheet(`<h2>${aula ? 'Editar aula' : 'Nova aula'}</h2>
    <div class="row" style="flex-wrap:nowrap">
      <label class="field" style="flex:1;margin:0"><span>Dia</span><input type="date" id="naData" value="${aula?.data || ui.dia}"></label>
      <label class="field" style="flex:1;margin:0"><span>Hora</span><input type="time" id="naHora" value="${aula?.hora || '08:00'}"></label>
    </div>
    <label class="field"><span>Clientes (até 2) — digite para buscar ou cadastrar</span><input type="search" id="naQ" placeholder="Buscar ou nome novo"></label>
    <button class="checkrow" id="naNovo" hidden><span class="box">${I.plus}</span><span></span></button>
    <div id="naLista">${lista().map(linha).join('')}</div>
    <button class="btn primary block" id="naOk" style="margin-top:14px" ${sel.size ? '' : 'disabled'}>${aula ? 'Salvar' : 'Criar aula'}</button>`, el => {
    const ok = el.querySelector('#naOk'), q = el.querySelector('#naQ'), novo = el.querySelector('#naNovo');
    const marcar = b => {
      const id = b.dataset.id;
      if (sel.has(id)) sel.delete(id); else if (sel.size < 2) sel.add(id); else return toast('No máximo 2 por aula');
      b.classList.toggle('on', sel.has(id));
      ok.disabled = !sel.size;
    };
    const ligar = b => b.addEventListener('click', () => marcar(b));
    el.querySelectorAll('#naLista .checkrow').forEach(ligar);
    q.addEventListener('input', () => {
      const t = q.value.trim().toLowerCase();
      el.querySelectorAll('#naLista .checkrow').forEach(b => { b.style.display = b.textContent.toLowerCase().includes(t) ? '' : 'none'; });
      const existe = state.clientes.some(c => c.nome.toLowerCase() === t);
      novo.hidden = !t || existe;
      novo.lastElementChild.textContent = `Cadastrar “${q.value.trim()}”`;
    });
    novo.addEventListener('click', () => {
      if (sel.size >= 2) return toast('No máximo 2 por aula');
      const c = acharOuCriarCliente(q.value);
      el.querySelector('#naLista').insertAdjacentHTML('afterbegin', linha(c));
      const b = el.querySelector(`#naLista [data-id="${c.id}"]`);
      ligar(b); marcar(b);
      q.value = ''; q.dispatchEvent(new Event('input'));
    });
    ok.addEventListener('click', () => {
      const data = el.querySelector('#naData').value, hora = el.querySelector('#naHora').value;
      if (aula) {
        Object.assign(aula, { data, hora, clientes: [...sel] });
        Object.keys(aula.planos).forEach(c => { if (!sel.has(c)) delete aula.planos[c]; });
        save(); closeSheet(); render(); return toast('Aula atualizada');
      }
      const a = { id: uid('a'), data, hora, clientes: [...sel], status: 'agendada', planos: {}, notas: {}, origem: 'manual' };
      state.aulas.push(a); save(); closeSheet(); ui.dia = a.data; go('#/aula/' + a.id);
    });
  });
}

function sheetEscolherEx(titulo, opcoes, onPick) {
  sheet(`<h2>${titulo}</h2>
    <div class="search">${I.search}<input type="search" id="pkQ" placeholder="Buscar"></div>
    <div id="pkLista" style="margin-top:8px">${opcoes.map(({ e, motivo }) => `<button class="opt" data-id="${e.id}">
      <span class="thumb">${thumb(e)}</span>
      <span><b style="font-weight:500">${esc(e.nome)}</b><br><span class="tiny">${APARELHOS[e.ap]} · ${blocoNome(e.bloco)}${motivo ? ' · ' + esc(motivo) : ''}</span></span>
    </button>`).join('') || '<p class="muted">Nenhuma opção compatível.</p>'}</div>`, el => {
    el.querySelector('#pkQ').addEventListener('input', ev => {
      const q = ev.target.value.toLowerCase();
      el.querySelectorAll('.opt').forEach(b => { b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    });
    el.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => { onPick(b.dataset.id); closeSheet(); }));
  });
}

function sheetRestricao(cId, sugeridas = null) {
  const c = cliente(cId);
  const tags = sugeridas || Object.keys(RESTRICOES).filter(t => !(c.restricoes || []).some(r => r.tag === t));
  sheet(`<h2>${sugeridas ? 'Notei nas anotações' : 'Adicionar restrição'}</h2>
    ${sugeridas ? `<p class="muted">Você mencionou algo sobre isso para ${esc(primeiro(c.nome))}. Quer que as próximas sugestões evitem exercícios de risco?</p>` : ''}
    <div class="row">${tags.map(t => `<button class="chip" data-t="${t}">${RESTRICOES[t]}</button>`).join('')}</div>
    <div class="toggle"><span>Temporária (lembrar de rever)</span><button class="switch on" id="rtTemp" aria-label="Temporária"></button></div>
    <button class="btn primary block" id="rtOk" style="margin-top:14px" disabled>Adicionar</button>
    ${sugeridas ? '<button class="btn ghost block" style="margin-top:8px" id="rtNao">Agora não</button>' : ''}`, el => {
    const sel = new Set(sugeridas || []);
    const ok = el.querySelector('#rtOk');
    const sync = () => { el.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', sel.has(b.dataset.t))); ok.disabled = !sel.size; };
    el.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { sel.has(b.dataset.t) ? sel.delete(b.dataset.t) : sel.add(b.dataset.t); sync(); }));
    const sw = el.querySelector('#rtTemp'); sw.addEventListener('click', () => sw.classList.toggle('on'));
    el.querySelector('#rtNao')?.addEventListener('click', closeSheet);
    ok.addEventListener('click', () => {
      c.restricoes = c.restricoes || [];
      sel.forEach(tag => { if (!c.restricoes.some(r => r.tag === tag)) c.restricoes.push({ tag, desde: hoje(), temporaria: sw.classList.contains('on') }); });
      save(); closeSheet(); render(); toast('Restrição registrada — as próximas sugestões já consideram');
    });
    sync();
  });
}

function sheetTexto(titulo, label, valor, onOk) {
  sheet(`<h2>${titulo}</h2><label class="field"><span>${label}</span><input type="text" id="stTxt" value="${esc(valor)}"></label>
    <button class="btn primary block" id="stOk" style="margin-top:14px">Salvar</button>`, el => {
    const inp = el.querySelector('#stTxt'); inp.focus();
    const ok = () => { const v = inp.value.trim(); if (v) { onOk(v); closeSheet(); } };
    el.querySelector('#stOk').addEventListener('click', ok);
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') ok(); });
  });
}

function sheetNovoEx() {
  const opt = (obj, f = x => x) => Object.entries(obj).map(([k, t]) => `<option value="${k}">${f(t)}</option>`).join('');
  const POS = { supino: 'Deitado de costas', prono: 'Deitado de bruços', lateral: 'De lado', sentado: 'Sentado', ajoelhado: 'Ajoelhado', empe: 'Em pé', quadrupede: 'Quatro apoios / prancha', invertido: 'Invertido' };
  sheet(`<h2>Novo exercício</h2>
    <label class="field"><span>Nome</span><input type="text" id="neNome" placeholder="Ex.: Ponte com pés na bola"></label>
    <label class="field"><span>Aparelho</span><select id="neAp">${opt(APARELHOS)}</select></label>
    <label class="field"><span>Momento da aula</span><select id="neBl">${BLOCOS.map(b => `<option value="${b.id}">${b.nome}</option>`).join('')}</select></label>
    <label class="field"><span>Posição</span><select id="nePos">${opt(POS)}</select></label>
    <label class="field"><span>Nível</span><select id="neNv"><option value="1">Básico</option><option value="2">Intermediário</option><option value="3">Avançado</option></select></label>
    <label class="field"><span>Dica / como eu ensino</span><input type="text" id="neDica"></label>
    <button class="btn primary block" id="neOk" style="margin-top:14px">Criar</button>`, el => {
    el.querySelector('#neOk').addEventListener('click', () => {
      const nome = el.querySelector('#neNome').value.trim();
      if (!nome) return toast('Dê um nome ao exercício');
      const e = { id: uid('ex'), nome, ap: el.querySelector('#neAp').value, nivel: +el.querySelector('#neNv').value, bloco: el.querySelector('#neBl').value, pos: el.querySelector('#nePos').value, foco: [], evitar: [], ajuda: [], origem: 'contemporaneo', prox: null, dica: el.querySelector('#neDica').value.trim(), custom: true };
      state.exCustom.push(e); setExercicio(e.id, { status: 'base' }); closeSheet(); go('#/exercicio/' + e.id);
    });
  });
}

// ——— Ditado (Web Speech API) ———
let rec = null;
function ditar(btn) {
  const ta = btn.parentElement.querySelector('textarea');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { ta.focus(); return toast('Use o microfone do teclado para ditar'); }
  if (rec) { rec.stop(); return; }
  rec = new SR(); rec.lang = 'pt-BR'; rec.continuous = true; rec.interimResults = false;
  const base = ta.value;
  let falado = '';
  rec.onresult = ev => {
    for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) falado += ev.results[i][0].transcript.trim() + ' ';
    ta.value = (base ? base.trimEnd() + ' ' : '') + falado.trim();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };
  rec.onend = () => { btn.classList.remove('rec'); rec = null; ta.dispatchEvent(new Event('change', { bubbles: true })); };
  rec.onerror = () => toast('Não consegui ouvir — verifique a permissão do microfone');
  btn.classList.add('rec'); rec.start(); toast('Ouvindo… toque de novo para parar');
}

// ——— Importação ———
function acharOuCriarCliente(nome) {
  const n = nome.trim();
  if (!n) return null;
  let c = state.clientes.find(x => x.nome.toLowerCase() === n.toLowerCase());
  if (!c) { c = { id: uid('c'), nome: n, nivel: 1, objetivos: [], restricoes: [], obs: '', favoritos: [] }; state.clientes.push(c); }
  return c;
}

function limparExemplo() {
  const ids = new Set(state.clientes.filter(c => c.exemplo).map(c => c.id));
  state.clientes = state.clientes.filter(c => !c.exemplo);
  state.aulas = state.aulas.filter(a => a.origem !== 'exemplo' && !a.clientes.some(c => ids.has(c)));
  state.exemplo = false; save();
}

// Aceita texto colado de planilha: colunas separadas por tab, ";" ou "|".
const CABECALHO = /^(nome|paciente|cliente|aluno)s?$/i;
const FONE = /^\+?[\d\s().-]{8,}$/;
function importarClientes(txt) {
  let novos = 0, atualizados = 0, inativos = 0;
  for (const linha of txt.split('\n')) {
    const cols = linha.split(/\t|;|\|/).map(x => x.trim()).filter(Boolean);
    if (!cols.length || CABECALHO.test(cols[0])) continue;
    const nome = cols[0].replace(/\s+/g, ' ');
    const existia = state.clientes.some(x => x.nome.toLowerCase() === nome.toLowerCase());
    const c = acharOuCriarCliente(nome);
    existia ? atualizados++ : novos++;
    const resto = cols.slice(1);
    if (resto.some(x => /^inativ/i.test(x))) { c.inativo = true; inativos++; }
    else if (resto.some(x => /^ativ/i.test(x))) c.inativo = false;
    const fone = resto.find(x => FONE.test(x) && x.replace(/\D/g, '').length >= 8);
    if (fone) c.telefone = fone;
  }
  save();
  return { novos, atualizados, inativos };
}

function importarAgenda(txt) {
  let entradas = [];
  const t = txt.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    const j = JSON.parse(t);
    entradas = (Array.isArray(j) ? j : j.aulas || []).map(a => ({ data: a.data, hora: a.hora, nomes: a.clientes || [] }));
  } else {
    entradas = t.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.match(/^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}(?:\/\d{4})?)\s+(\d{1,2}[:h]\d{2})\s+(.+)$/);
      if (!m) return null;
      let data = m[1];
      if (data.includes('/')) { const [d, mo, y] = data.split('/'); data = `${y || new Date().getFullYear()}-${mo}-${d}`; }
      return { data, hora: m[2].replace('h', ':').padStart(5, '0'), nomes: m[3].split(/,| e |&|\//).map(s => s.trim()).filter(Boolean) };
    }).filter(Boolean);
  }
  let novas = 0;
  for (const en of entradas) {
    const ids = en.nomes.map(acharOuCriarCliente).filter(Boolean).map(c => c.id);
    const existe = state.aulas.find(a => a.data === en.data && a.hora === en.hora);
    if (existe) { existe.clientes = [...new Set([...existe.clientes, ...ids])].slice(0, 2); continue; }
    state.aulas.push({ id: uid('a'), data: en.data, hora: en.hora, clientes: ids.slice(0, 2), status: 'agendada', planos: {}, notas: {}, origem: 'importada' });
    novas++;
  }
  save();
  return { novas, total: entradas.length };
}

// ——— Ações ———
function planejar(a, forcar = false) {
  const exs = exercicios();
  a.clientes.forEach(cId => {
    if (!forcar && a.planos[cId]?.itens?.length) return;
    a.planos[cId] = { itens: sugerirPlano(state, exs, cId, a.data), aprovado: false };
  });
  if (a.status === 'agendada') a.status = 'planejada';
}

const acoes = {
  dia: el => { ui.dia = el.dataset.d; render(); },
  'nova-aula': () => sheetAula(),
  'editar-aula': el => sheetAula(state.aulas.find(x => x.id === el.dataset.a)),
  'planejar-semana': el => {
    const ini = el.dataset.d, t = hoje();
    let n = 0;
    for (let i = 0; i < 7; i++) aulasDoDia(addDias(ini, i)).forEach(a => {
      if (a.data >= t && a.status !== 'realizada' && a.clientes.some(c => !a.planos[c]?.itens?.length)) { planejar(a); n++; }
    });
    save(); render(); toast(`${n} aula${n > 1 ? 's' : ''} com sugestão pronta`);
  },
  aluno: el => { ui.aluno[el.dataset.a] = el.dataset.c; render(); },
  sugerir: el => { const { a } = aulaAtual(el); planejar(a); save(); render(); },
  ressugerir: el => {
    const { a, cId } = aulaAtual(el);
    a.planos[cId] = { itens: sugerirPlano(state, exercicios(), cId, a.data, String(Date.now())), aprovado: false };
    save(); render(); toast('Nova sugestão gerada');
  },
  aprovar: el => { const { a, cId } = aulaAtual(el); a.planos[cId].aprovado = true; save(); render(); toast('Plano aprovado'); },
  copiar: el => {
    const { a, cId } = aulaAtual(el);
    const outro = a.clientes.find(x => x !== cId);
    const oc = cliente(outro);
    const exs = exMap();
    const bloqueados = a.planos[cId].itens.filter(it => exs[it.exId]?.evitar.some(t => (oc.restricoes || []).some(r => r.tag === t)));
    a.planos[outro] = { itens: a.planos[cId].itens.filter(it => !bloqueados.includes(it)).map(it => ({ exId: it.exId, motivo: 'igual à dupla', feito: false, fb: null })), aprovado: false };
    save(); render();
    toast(bloqueados.length ? `Copiado — ${bloqueados.length} ficaram de fora pelas restrições de ${primeiro(oc.nome)}` : `Plano copiado para ${primeiro(oc.nome)}`);
  },
  feito: el => {
    const { a, cId } = aulaAtual(el);
    const it = a.planos[cId].itens[+el.dataset.i];
    it.feito = !it.feito; if (!it.feito) it.fb = null; else it.fb = it.fb || 'ok';
    save(); render();
  },
  fb: el => { const { a, cId } = aulaAtual(el); const it = a.planos[cId].itens[+el.dataset.i]; it.fb = el.dataset.v; save(); render(); },
  remover: el => { const { a, cId } = aulaAtual(el); a.planos[cId].itens.splice(+el.dataset.i, 1); save(); render(); },
  trocar: el => {
    const { a, cId } = aulaAtual(el);
    const i = +el.dataset.i, plano = a.planos[cId];
    const ops = alternativas(state, exercicios(), cId, a.data, plano.itens[i].exId, plano.itens.map(x => x.exId));
    sheetEscolherEx('Trocar por…', ops, id => { plano.itens[i] = { exId: id, motivo: 'escolhido por você', feito: false, fb: null }; save(); render(); });
  },
  'add-ex': el => {
    const { a, cId } = aulaAtual(el);
    const c = cliente(cId);
    const ativos = (c.restricoes || []).map(r => r.tag);
    const ops = exercicios().filter(e => e.status !== 'arquivado' && state.settings.aparelhos[e.ap] !== false)
      .map(e => ({ e, motivo: e.evitar.some(t => ativos.includes(t)) ? '⚠ restrição' : '' }))
      .sort((x, y) => BLOCOS.findIndex(b => b.id === x.e.bloco) - BLOCOS.findIndex(b => b.id === y.e.bloco));
    sheetEscolherEx('Adicionar exercício', ops, id => {
      a.planos[cId] = a.planos[cId] || { itens: [], aprovado: false };
      a.planos[cId].itens.push({ exId: id, motivo: 'escolhido por você', feito: false, fb: null });
      if (a.status === 'agendada') a.status = 'planejada';
      save(); render();
    });
  },
  finalizar: el => {
    const { a } = aulaAtual(el);
    a.status = 'realizada';
    a.clientes.forEach(c => { if (a.planos[c]) a.planos[c].aprovado = true; });
    save();
    // Procura sinais de dor nas anotações de cada aluno
    for (const cId of a.clientes) {
      const c = cliente(cId);
      const tags = detectarRestricoes(a.notas?.[cId]).filter(t => !(c.restricoes || []).some(r => r.tag === t));
      const dor = (a.planos[cId]?.itens || []).some(i => i.fb === 'dor');
      if (tags.length) { render(); sheetRestricao(cId, tags); return; }
      if (dor) toast(`Anotado: exercício com dor sai das próximas sugestões de ${primeiro(c.nome)}`);
    }
    toast('Aula registrada');
    go('#/agenda');
  },
  reabrir: el => { const { a } = aulaAtual(el); a.status = 'planejada'; save(); render(); },
  'apagar-aula': el => {
    if (!confirm('Remover esta aula da agenda?')) return;
    state.aulas = state.aulas.filter(x => x.id !== el.dataset.a); save(); go('#/agenda');
  },
  ditar: el => ditar(el),

  'novo-cliente': () => sheetTexto('Novo cliente', 'Nome completo', '', nome => { const c = acharOuCriarCliente(nome); save(); go('#/cliente/' + c.id); }),
  renomear: el => { const c = cliente(el.dataset.c); sheetTexto('Editar nome', 'Nome', c.nome, v => { c.nome = v; save(); render(); }); },
  nivel: el => { cliente(el.dataset.c).nivel = +el.dataset.n; save(); render(); },
  obj: el => { const c = cliente(el.dataset.c); const o = el.dataset.o; c.objetivos = (c.objetivos || []).includes(o) ? c.objetivos.filter(x => x !== o) : [...(c.objetivos || []), o]; save(); render(); },
  'add-restr': el => sheetRestricao(el.dataset.c),
  'tira-restr': el => { const c = cliente(el.dataset.c); c.restricoes = c.restricoes.filter(r => r.tag !== el.dataset.t); save(); render(); },
  ativo: el => { const c = cliente(el.dataset.c); c.inativo = !c.inativo; save(); render(); toast(c.inativo ? 'Marcado como inativo' : 'Cliente ativo de novo'); },
  'cli-inativos': el => { ui.cliInativos = !!el.dataset.v; render(); },

  'f-ap': el => { ui.exFiltro.ap = el.dataset.v; render(); },
  'f-st': el => { ui.exFiltro.st = el.dataset.v; render(); },
  'novo-ex': () => sheetNovoEx(),
  'ex-st': el => { setExercicio(el.dataset.id, { status: el.dataset.v }); render(); },
  'tira-foto': el => { setExercicio(el.dataset.id, { foto: null }); render(); },
  'apaga-ex': el => { if (!confirm('Apagar este exercício?')) return; state.exCustom = state.exCustom.filter(e => e.id !== el.dataset.id); save(); go('#/exercicios'); },
  voltar: () => history.length > 1 ? history.back() : go('#/exercicios'),
  cura: el => { setExercicio(el.dataset.id, { status: el.dataset.v }); render(); },
  'cura-pular': el => { setExercicio(el.dataset.id, { adiado: Date.now() }); render(); },

  ap: el => { const k = el.dataset.k; state.settings.aparelhos[k] = state.settings.aparelhos[k] === false; save(); render(); },
  soBase: () => { state.settings.soBase = !state.settings.soBase; save(); render(); },
  'importar-agenda': () => {
    const txt = document.getElementById('agendaTxt').value;
    if (!txt.trim()) return toast('Cole a agenda primeiro');
    if (state.exemplo) limparExemplo();
    try { const r = importarAgenda(txt); toast(`${r.novas} aula(s) nova(s) de ${r.total} linha(s)`); render(); }
    catch { toast('Não entendi o formato — confira o exemplo'); }
  },
  'importar-clientes': () => {
    const txt = document.getElementById('clientesTxt').value;
    if (!txt.trim()) return toast('Cole a lista primeiro');
    if (state.exemplo) limparExemplo();
    const r = importarClientes(txt);
    toast(`${r.novos} novo(s), ${r.atualizados} atualizado(s)${r.inativos ? ` · ${r.inativos} inativo(s)` : ''}`); render();
  },
  exportar: () => {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `era-pilates-backup-${hoje()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  'limpar-exemplo': () => {
    if (!confirm('Remover todos os clientes e aulas de exemplo?')) return;
    limparExemplo(); render(); toast('Pronto — app limpo para os clientes reais');
  },
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = acoes[el.dataset.act];
  if (fn) { ev.preventDefault(); fn(el); }
});

document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.id === 'cliQ') { ui.cliQ = t.value; const pos = t.selectionStart; render(); const n = document.getElementById('cliQ'); n.focus(); n.setSelectionRange(pos, pos); }
  if (t.id === 'exQ') { ui.exFiltro.q = t.value; const pos = t.selectionStart; render(); const n = document.getElementById('exQ'); n.focus(); n.setSelectionRange(pos, pos); }
  if (t.id === 'nota') { const a = state.aulas.find(x => x.id === t.dataset.a); a.notas = a.notas || {}; a.notas[t.dataset.c] = t.value; saveSoon(); }
  if (t.id === 'obsCli') { cliente(t.dataset.c).obs = t.value; saveSoon(); }
  if (t.id === 'exNota') { state.exOverrides[t.dataset.id] = { ...(state.exOverrides[t.dataset.id] || {}), nota: t.value }; saveSoon(); }
});

document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'exVideo') { setExercicio(t.dataset.id, { video: t.value.trim() }); render(); }
  if (t.id === 'exFoto' && t.files[0]) reduzirFoto(t.files[0]).then(url => { setExercicio(t.dataset.id, { foto: url }); render(); toast('Foto salva'); });
  if (t.id === 'restaurar' && t.files[0]) t.files[0].text().then(txt => {
    try { const s = JSON.parse(txt); if (s.version !== 1) throw 0; if (!confirm('Substituir os dados deste aparelho pelo backup?')) return; replaceState(s); render(); toast('Backup restaurado'); }
    catch { toast('Arquivo de backup inválido'); }
  });
});

let saveTimer;
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }

function reduzirFoto(file) {
  return new Promise((ok, err) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(640, img.width), h = Math.round(img.height * (w / img.width));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      ok(cv.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = err;
    img.src = URL.createObjectURL(file);
  });
}

render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
