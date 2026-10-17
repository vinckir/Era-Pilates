import { BLOCOS, APARELHOS, RESTRICOES, OBJETIVOS } from './exercicios.js';
import { picto } from './pictos.js';
import { xlsxParaTsv } from './xlsx.js';
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
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5l1.2-3.9A8 8 0 1 1 8.6 18.4z"/><path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.6.8-.6.3-1.4.4-2.4 0-2.2-.8-3.9-2.5-4.7-4.7-.4-1-.3-1.8 0-2.4z"/></svg>',
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
  if (a.clientes.length && a.clientes.every(c => a.presenca?.[c])) return { cls: 'falta', txt: a.clientes.length > 1 ? 'Faltaram' : 'Falta' };
  if (a.status === 'realizada') return { cls: 'realizada', txt: 'Realizada' };
  const planos = a.clientes.map(c => a.planos[c]);
  if (planos.length && planos.every(p => p?.aprovado)) return { cls: 'aprovada', txt: 'Plano aprovado' };
  if (planos.some(p => p?.itens?.length)) return { cls: 'planejada', txt: 'Sugestão pronta' };
  return { cls: '', txt: 'Sem plano' };
}

const ehMassagem = a => /massagem|drenagem|reiki/i.test(a.servico || '') || a.sala === 'Sala Zen';

function aulasDoDia(d) {
  return state.aulas.filter(a => a.data === d).sort((a, b) => a.hora.localeCompare(b.hora));
}

// ——— Horários fixos: o horário do plano vira aula toda semana ———
// cliente.horarios = [{ dow (0 = domingo), hora }]. Aula tirada ou mudada de um horário fixo vira exceção,
// para não voltar a aparecer. As aulas são criadas a partir de hoje (e depois da última agenda importada).
const DIA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const vezesPlano = c => +((c.plano || '').match(/(\d)\s*x/i)?.[1] || 0);
const temExcecao = (cId, data, hora) => state.excecoes.some(e => e.c === cId && e.data === data && e.hora === hora);
const fixoEm = (cId, data, hora) => !!cliente(cId)?.horarios?.some(h => h.dow === parseIso(data).getDay() && h.hora === hora);
function excecaoFixa(cId, data, hora) {
  if (fixoEm(cId, data, hora) && !temExcecao(cId, data, hora)) state.excecoes.push({ c: cId, data, hora });
}

function gerarFixas(ini, fim) {
  const desde = [hoje(), ini, state.settings.fixoDesde || ''].sort().pop();
  let mudou = false;
  for (let d = desde; d <= fim; d = addDias(d, 1)) {
    const dow = parseIso(d).getDay();
    for (const c of state.clientes) {
      if (c.inativo || !c.horarios?.length) continue;
      for (const h of c.horarios) {
        if (h.dow !== dow || temExcecao(c.id, d, h.hora)) continue;
        if (state.aulas.some(a => a.data === d && a.clientes.includes(c.id))) continue;
        const a = state.aulas.find(x => x.data === d && x.hora === h.hora && !ehMassagem(x));
        if (a) { if (a.clientes.length < 2 && a.status !== 'realizada') { a.clientes.push(c.id); mudou = true; } }
        else { state.aulas.push({ id: uid('a'), data: d, hora: h.hora, clientes: [c.id], status: 'agendada', planos: {}, notas: {}, origem: 'fixo' }); mudou = true; }
      }
    }
  }
  if (mudou) save();
}

// Na agenda importada do Seu Fisio, quem repete o mesmo dia e hora em semanas diferentes ganha esse horário fixo.
function detectarFixos() {
  state.settings.fixosDetectados = true;
  const imp = state.aulas.filter(a => a.origem === 'importada');
  if (!imp.length) return 0;
  const depois = addDias(imp.map(a => a.data).sort().pop(), 1);
  if ((state.settings.fixoDesde || '') < depois) state.settings.fixoDesde = depois;
  let n = 0;
  for (const c of state.clientes) {
    if (c.inativo || c.horarios?.length) continue;
    const semanas = {};
    imp.filter(a => a.clientes.includes(c.id)).forEach(a => { const k = parseIso(a.data).getDay() + ' ' + a.hora; (semanas[k] ||= new Set()).add(inicioSemana(a.data)); });
    const hs = Object.entries(semanas).filter(([, s]) => s.size >= 2).map(([k]) => { const [dow, hora] = k.split(' '); return { dow: +dow, hora }; });
    if (hs.length) { c.horarios = hs.sort((a, b) => a.dow - b.dow || a.hora.localeCompare(b.hora)); n++; }
  }
  save();
  return n;
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
  const views = { agenda: vAgenda, aula: vAula, clientes: vClientes, cliente: vCliente, financeiro: vFinanceiro, exercicios: vExercicios, exercicio: vExercicio, curadoria: vCuradoria, mais: vMais };
  $app.innerHTML = (views[r.nome] || vAgenda)(r.id);
  const tab = { aula: 'agenda', cliente: 'clientes', exercicio: 'exercicios', curadoria: 'exercicios' }[r.nome] || r.nome;
  document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
}

// ——— AGENDA ———
function vAgenda() {
  const d = ui.dia, ini = inicioSemana(d), t = hoje();
  const semana = [...Array(7)].map((_, i) => addDias(ini, i));
  gerarFixas(ini, addDias(ini, 6));
  const aulas = aulasDoDia(d);
  const pendentes = semana.filter(x => x >= t).flatMap(aulasDoDia).filter(a => !ehMassagem(a) && a.status !== 'realizada' && a.clientes.some(c => !a.presenca?.[c] && !a.planos[c]?.itens?.length)).length;

  return `
  <header class="top">
    <div class="grow">
      <div class="brand" role="img" aria-label="ERA Pilates"><i class="sym"></i><i class="word"></i></div>
    </div>
    ${d !== t ? `<button class="btn small ghost" data-act="dia" data-d="${t}">Hoje</button>` : ''}
  </header>
  <div class="seg vista">
    <button class="${ui.vista !== 'semana' ? 'on' : ''}" data-act="vista" data-v="dia">Dia</button>
    <button class="${ui.vista === 'semana' ? 'on' : ''}" data-act="vista" data-v="semana">Semana</button>
  </div>
  ${ui.vista === 'semana' ? `
  <div class="fin-mes">
    <button class="iconbtn" data-act="dia" data-d="${addDias(ini, -7)}" aria-label="Semana anterior">${I.back}</button>
    <h2 style="flex:1">${tituloSemana(ini)}</h2>
    <button class="iconbtn" data-act="dia" data-d="${addDias(ini, 7)}" aria-label="Próxima semana">${I.next}</button>
  </div>` : `
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
  </div>`}

  ${pendentes ? `<div class="card flat row between" style="margin-bottom:14px">
      <div><b>${pendentes} aula${pendentes > 1 ? 's' : ''}</b> <span class="muted">sem plano nesta semana</span></div>
      <button class="btn small accent" data-act="planejar-semana" data-d="${ini}">${I.spark} Planejar semana</button>
    </div>` : ''}

  ${ui.vista === 'semana' ? gradeSemana(ini) : aulas.length ? aulas.map(cardAula).join('') : `
    <div class="empty"><h2>Dia livre</h2><p>Nenhuma aula neste dia. Toque em + para adicionar.</p></div>`}

  <button class="fab" data-act="nova-aula" aria-label="Nova aula">${I.plus}</button>`;
}

function tituloSemana(ini) {
  const a = parseIso(ini), b = parseIso(addDias(ini, 6));
  return a.getMonth() === b.getMonth() ? `${a.getDate()} a ${b.getDate()} de ${MESES[b.getMonth()]}` : `${a.getDate()} de ${MESES[a.getMonth()]} a ${b.getDate()} de ${MESES[b.getMonth()]}`;
}

function corAula(a) {
  if (ehMassagem(a)) return 'zen';
  const st = statusAula(a).cls;
  if (st === 'falta') return 'falta';
  if (st === 'realizada') return 'feita';
  if (a.data < hoje()) return 'pendente';
  return st === 'aprovada' || st === 'planejada' ? 'planejada' : 'marcada';
}

// Semana em grade: dias nas colunas, horas nas linhas, cada aula colorida pela situação.
function gradeSemana(ini) {
  const dias = [...Array(7)].map((_, i) => addDias(ini, i)).filter((x, i) => i < 6 || aulasDoDia(x).length);
  const horas = dias.flatMap(aulasDoDia).map(a => +a.hora.slice(0, 2));
  const h0 = Math.min(7, ...horas), h1 = Math.max(19, ...horas);
  const bloco = a => `<a class="g-aula ${corAula(a)}" href="#/aula/${a.id}">${a.hora.slice(3) !== '00' ? `<small>${a.hora}</small>` : ''}${a.clientes.map(c => `<span>${esc(primeiro(cliente(c)?.nome) || '—')}</span>`).join('')}</a>`;
  let linhas = '';
  for (let h = h0; h <= h1; h++) {
    linhas += `<div class="g-hora">${h}h</div>` + dias.map(x => `<div class="g-cel">${aulasDoDia(x).filter(a => +a.hora.slice(0, 2) === h).map(bloco).join('')}</div>`).join('');
  }
  const leg = [['marcada', 'Marcada'], ['planejada', 'Plano pronto'], ['feita', 'Realizada'], ['falta', 'Falta'], ['pendente', 'Sem registro'], ['zen', 'Massagem']];
  return `<div class="grade" style="grid-template-columns:30px repeat(${dias.length}, minmax(0, 1fr))">
    <div></div>${dias.map(x => { const dd = parseIso(x); return `<button class="g-dia ${x === hoje() ? 'today' : ''}" data-act="dia-lista" data-d="${x}">${DIAS[dd.getDay()].slice(0, 3)}<b>${dd.getDate()}</b></button>`; }).join('')}
    ${linhas}
  </div>
  <div class="g-legenda">${leg.map(([k, t]) => `<span><i class="g-aula ${k}" style="padding:0"></i>${t}</span>`).join('')}</div>`;
}

function cardAula(a) {
  const st = statusAula(a);
  const nomes = a.clientes.map(c => primeiro(cliente(c)?.nome) || '—').join(' & ');
  const n = a.clientes.map(c => a.planos[c]?.itens?.length || 0).filter(Boolean).join(' + ');
  const restr = a.clientes.flatMap(c => cliente(c)?.restricoes || []).map(r => RESTRICOES[r.tag]);
  const faltas = a.clientes.length > 1 ? a.clientes.filter(c => a.presenca?.[c]).map(c => primeiro(cliente(c)?.nome)) : [];
  return `<a class="card aula" href="#/aula/${a.id}">
    <div class="hora">${a.hora}</div>
    <div>
      <div class="nomes">${esc(nomes)}</div>
      <div class="meta">${ehMassagem(a) ? esc(a.servico || 'Massagem') + ' · ' : ''}${st.txt}${faltas.length && faltas.length < a.clientes.length ? ` · ${esc(faltas.join(', '))} faltou` : ''}${n ? ` · ${n} exerc.` : ''}${restr.length ? ` · <span style="color:var(--warn)">${esc([...new Set(restr)].join(', '))}</span>` : ''}</div>
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
  const falta = a.presenca?.[alunoId];
  const massagem = ehMassagem(a);
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

  <div class="seg" style="margin-top:10px">${[['', 'Presente'], ['falta', 'Faltou'], ['justificada', 'Avisou']].map(([k, t]) => `<button class="${(falta || '') === k ? 'on' : ''}" data-act="presenca" data-a="${a.id}" data-c="${alunoId}" data-v="${k}">${t}</button>`).join('')}</div>

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
    ${massagem ? `<div class="card flat empty" style="padding:24px 16px"><h2>${esc(a.servico || 'Massagem')}</h2><p>Atendimento na ${esc(a.sala || 'Sala Zen')}.</p></div>`
    : falta ? `<div class="card flat empty" style="padding:24px 16px"><h2>${falta === 'justificada' ? 'Falta avisada' : 'Falta'}</h2>
      ${a.remarcacao?.[alunoId] ? `<p>Remarcada para ${esc(a.remarcacao[alunoId])}.</p>` : ''}
      <p>Não entra no histórico de exercícios de ${esc(primeiro(c.nome))}.</p></div>`
    : plano?.itens?.length ? `
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
  gerarFixas(hoje(), addDias(hoje(), 13));
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

function fichaFinanceiro(c) {
  gerarMensalidades();
  const ls = state.lancamentos.filter(l => l.clienteId === c.id && l.tipo === 'receber');
  if (!ls.length) return '';
  const abertos = ls.filter(l => !l.pagoEm).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const pagos = ls.filter(l => l.pagoEm).sort((a, b) => b.pagoEm.localeCompare(a.pagoEm));
  const ano = hoje().slice(0, 4);
  const noAno = somaLanc(pagos.filter(l => l.pagoEm.startsWith(ano)));
  return `<div class="section"><div class="row between"><span class="eyebrow">Financeiro</span><button class="linkbtn" data-act="nova-conta" data-c="${c.id}">+ Conta</button></div>
    ${abertos.map(l => linhaLanc(l, false)).join('')}
    ${pagos.slice(0, 4).map(l => linhaLanc(l, false)).join('')}
    <p class="tiny" style="margin-top:8px">Pago em ${ano}: ${brl(noAno)} · ${pagos.length} pagamento${pagos.length === 1 ? '' : 's'} no total</p>
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
  const faltas = state.aulas.filter(a => a.presenca?.[c.id] && a.data >= addDias(sem0, -49)).length;
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
  <div class="row" style="margin-top:10px">
    ${c.plano ? `<span class="chip accent">${esc(c.plano)}${c.valorMensal ? ` · ${reais(c.valorMensal)}` : ''}</span>` : ''}
    ${c.inicioPlano ? `<span class="chip">Plano desde ${dataCurta(c.inicioPlano)}/${c.inicioPlano.slice(2, 4)}</span>` : ''}
    ${c.reposicoes ? `<span class="chip warn">${c.reposicoes} a repor</span>` : ''}
    ${c.ultimoAtendimento ? `<span class="chip">Último atendimento ${dataCurta(c.ultimoAtendimento)}</span>` : ''}
  </div>

  <div class="section"><span class="eyebrow">Cadastro</span>
    <div class="card flat cadastro">
      ${linhasCadastro(c).map(([k, v]) => `<div class="row between"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
      ${faltandoCadastro(c).length ? `<p class="tiny">Falta: ${faltandoCadastro(c).join(', ')}.</p>` : ''}
      <button class="btn small ghost" data-act="renomear" data-c="${c.id}">Editar cadastro</button>
    </div>
  </div>

  <div class="section"><span class="eyebrow">Horários fixos</span>
    <div class="row">
      ${(c.horarios || []).map((h, i) => `<span class="chip accent">${DIA_CURTO[h.dow]} · ${h.hora}<button data-act="tira-hr" data-c="${c.id}" data-i="${i}" aria-label="Remover">×</button></span>`).join('')}
      <button class="chip" data-act="add-hr" data-c="${c.id}">${I.plus.replace('<svg', '<svg width="14" height="14"')} Horário</button>
    </div>
    ${vezesPlano(c) && vezesPlano(c) !== (c.horarios || []).length ? `<p class="tiny" style="margin-top:6px">Plano de ${vezesPlano(c)}x por semana, ${[`nenhum horário fixo`, `1 horário fixo`][(c.horarios || []).length] || `${c.horarios.length} horários fixos`}.</p>` : ''}
  </div>

  ${fichaFinanceiro(c)}

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
      ${faltas ? `<p class="tiny" style="margin-top:8px">${faltas} falta${faltas > 1 ? 's' : ''} nas últimas 8 semanas</p>` : ''}
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

// ——— FINANCEIRO ———
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const somaLanc = ls => ls.reduce((s, l) => s + (l.valor || 0), 0);
const mesAnterior = m => addDias(m + '-01', -1).slice(0, 7);
const mesSeguinte = m => addDias(m + '-01', 32).slice(0, 7);

// ——— Cobrança pelo WhatsApp: abre a conversa da cliente com a mensagem pronta ———
const foneWa = t => { const d = (t || '').replace(/\D/g, ''); return d.length >= 12 && d.startsWith('55') ? d : d.length >= 10 ? '55' + d : ''; };
const podeCobrar = l => l.tipo === 'receber' && !l.pagoEm && !!foneWa(cliente(l.clienteId)?.telefone);

function mensagemCobranca(l) {
  const c = cliente(l.clienteId);
  const [ano, mes] = l.vencimento.split('-');
  const ref = ehMensalidade(l.descricao) ? `a mensalidade do Pilates de ${MESES[+mes - 1]} (${l.descricao})` : `o atendimento de ${l.descricao || 'Pilates'}`;
  const quando = situacaoLanc(l) === 'atrasado' ? `venceu em ${dataCurta(l.vencimento)}` : `vence em ${dataCurta(l.vencimento)}`;
  const pix = state.settings.pix ? `\n\nChave PIX: ${state.settings.pix}` : '';
  return `Oi, ${primeiro(c?.nome)}! Tudo bem? Passando para lembrar ${ref}, no valor de ${brl(l.valor)}, que ${quando}.${pix}\n\n`
    + `${situacaoLanc(l) === 'atrasado' ? 'Se já pagou, pode desconsiderar. ' : ''}Obrigada!\n${state.settings.assinatura || 'Jessica · ERA Pilates'}`;
}
const linkWa = (l, texto = mensagemCobranca(l)) => `https://wa.me/${foneWa(cliente(l.clienteId)?.telefone)}?text=${encodeURIComponent(texto)}`;

function sheetCobrar(id) {
  const l = state.lancamentos.find(x => x.id === id);
  const c = cliente(l.clienteId);
  sheet(`<h2>Cobrar ${esc(primeiro(c.nome))}</h2>
    <p class="muted">${esc(l.descricao)} · ${brl(l.valor)} · ${situacaoLanc(l) === 'atrasado' ? 'venceu' : 'vence'} em ${dataCurta(l.vencimento)}</p>
    ${state.settings.pix ? '' : '<div class="alert" style="margin-bottom:10px">Sem chave PIX na mensagem. Cadastre em Mais → Cobrança.</div>'}
    <label class="field"><span>Mensagem (dá para ajustar antes de enviar)</span><textarea id="cbTxt" style="min-height:190px;padding-right:14px">${esc(mensagemCobranca(l))}</textarea></label>
    <a class="zap btn block" id="cbIr" href="${linkWa(l)}" target="_blank" rel="noopener" style="margin-top:14px;justify-content:center">${I.zap} Abrir no WhatsApp</a>
    ${l.cobradoEm ? `<p class="tiny" style="text-align:center;margin-top:10px">Última cobrança em ${dataCurta(l.cobradoEm)}</p>` : ''}`, el => {
    const ta = el.querySelector('#cbTxt'), ir = el.querySelector('#cbIr');
    ta.addEventListener('input', () => { ir.href = linkWa(l, ta.value); });
    ir.addEventListener('click', () => { l.cobradoEm = hoje(); save(); setTimeout(() => { closeSheet(); render(); toast('Cobrança aberta no WhatsApp'); }, 300); });
  });
}

function linhaLanc(l, comNome = true) {
  const st = situacaoLanc(l);
  const chip = st === 'pago' ? `<span class="chip sage">Paga ${dataCurta(l.pagoEm)}</span>` : st === 'atrasado' ? '<span class="chip warn">Atrasada</span>' : '<span class="chip">Aberta</span>';
  const cobrada = !l.pagoEm && l.cobradoEm ? ` · cobrada ${dataCurta(l.cobradoEm)}` : '';
  const linha = `<button class="lanc ${st}" data-act="lanc" data-id="${l.id}">
    <div><div class="nome">${esc(comNome ? l.nome : l.descricao)}</div>
      <div class="tiny">${esc(comNome ? l.descricao : '')}${comNome ? ' · ' : ''}vence ${dataCurta(l.vencimento)}${l.vencimento.slice(0, 4) !== hoje().slice(0, 4) ? '/' + l.vencimento.slice(2, 4) : ''}${cobrada}</div></div>
    <div class="valor"><span>${brl(l.valor)}</span><br>${chip}</div>
  </button>`;
  return podeCobrar(l) ? `<div class="lanc-linha">${linha}<button class="zap" data-act="cobrar" data-id="${l.id}" aria-label="Cobrar no WhatsApp">${I.zap}</button></div>` : linha;
}

// Grupos de despesa mais simples que as categorias do Seu Fisio (a categoria original continua guardada).
const GRUPOS = [['fixas', 'Contas fixas'], ['impostos', 'Impostos'], ['variaveis', 'Variáveis'], ['retiradas', 'Retiradas da Jessica']];
const grupoDe = l => /pr[óo]-?labore|distribui|retirada|sal[áa]rio/i.test(l.categoria + ' ' + l.descricao) ? 'retiradas'
  : /imposto/i.test(l.categoria) || /inss|simples|darf|das\b|iss\b/i.test(l.descricao) ? 'impostos'
  : /fixa/i.test(l.categoria) || /aluguel|ceee|energia|[áa]gua|internet|contador|honor[áa]rio|seufisio|software/i.test(l.descricao + ' ' + l.nome) ? 'fixas' : 'variaveis';
const ehRetirada = l => l.tipo === 'pagar' && grupoDe(l) === 'retiradas';

function vFinanceiro() {
  gerarMensalidades();
  gerarRecorrentes();
  const vista = ui.finVista || 'mes';
  const seg = `<div class="seg vista">
    <button class="${vista === 'mes' ? 'on' : ''}" data-act="fin-vista" data-v="mes">Mês</button>
    <button class="${vista === 'ano' ? 'on' : ''}" data-act="fin-vista" data-v="ano">Ano</button></div>`;
  const topo = `<header class="top"><div class="grow"><p class="eyebrow">Financeiro</p></div>
    <button class="btn small ghost" data-act="recorrentes">Contas fixas</button>
    <button class="btn small" data-act="nova-conta">${I.plus} Conta</button></header>${seg}`;
  return topo + (vista === 'ano' ? finAno() : finMes());
}

function finMes() {
  const m = ui.finMes || hoje().slice(0, 7);
  const tipo = ui.finTipo || 'receber';
  const L = state.lancamentos;
  const pagosNoMes = t => L.filter(l => l.tipo === t && l.pagoEm && l.pagoEm.slice(0, 7) === m);
  const abertosNoMes = t => L.filter(l => l.tipo === t && !l.pagoEm && l.vencimento.slice(0, 7) === m);
  const recebido = somaLanc(pagosNoMes('receber')), pago = somaLanc(pagosNoMes('pagar'));
  const aReceber = somaLanc(abertosNoMes('receber')), aPagar = somaLanc(abertosNoMes('pagar'));
  const retiradas = somaLanc(pagosNoMes('pagar').filter(ehRetirada));
  const atrasadas = L.filter(l => l.tipo === 'receber' && situacaoLanc(l) === 'atrasado');
  const porCentro = c => somaLanc(pagosNoMes('receber').filter(l => l.centro === c));
  const ordem = { atrasado: 0, aberto: 1, pago: 2 };
  const ordenar = ls => ls.sort((a, b) => ordem[situacaoLanc(a)] - ordem[situacaoLanc(b)]
    || (situacaoLanc(a) === 'pago' ? b.pagoEm.localeCompare(a.pagoEm) : a.vencimento.localeCompare(b.vencimento)));
  const lista = ordenar([...abertosNoMes(tipo), ...pagosNoMes(tipo)]);
  const [ano, mes] = m.split('-');
  const listaHtml = tipo === 'receber' ? lista.map(l => linhaLanc(l)).join('')
    : GRUPOS.map(([g, nome]) => {
      const ls = lista.filter(l => grupoDe(l) === g);
      return ls.length ? `<div class="bloco"><div class="eyebrow">${nome} · ${brl(somaLanc(ls))}</div>${ls.map(l => linhaLanc(l)).join('')}</div>` : '';
    }).join('');
  return `
  <div class="fin-mes">
    <button class="iconbtn" data-act="fin-mes" data-m="${mesAnterior(m)}" aria-label="Mês anterior">${I.back}</button>
    <h1>${MESES[+mes - 1][0].toUpperCase() + MESES[+mes - 1].slice(1)} <em>${ano}</em></h1>
    <button class="iconbtn" data-act="fin-mes" data-m="${mesSeguinte(m)}" aria-label="Próximo mês">${I.next}</button>
  </div>

  <div class="stats fin section">
    <div class="stat"><b>${brl(recebido)}</b><span>Recebido</span></div>
    <div class="stat"><b>${brl(aReceber)}</b><span>A receber</span></div>
    <div class="stat"><b>${brl(pago)}</b><span>Pago</span></div>
    <div class="stat"><b>${brl(aPagar)}</b><span>A pagar</span></div>
  </div>
  <p class="tiny fin-centros">Despesas do estúdio ${brl(pago - retiradas)} · Retiradas ${brl(retiradas)} · Saldo ${brl(recebido - pago)}</p>
  <p class="tiny">Pilates ${brl(porCentro('Pilates'))} · Massagem e drenagem ${brl(porCentro('Fisioterapia'))}</p>
  ${atrasadas.length ? `<div class="alert" style="margin-top:12px"><b>${atrasadas.length} conta${atrasadas.length > 1 ? 's' : ''} atrasada${atrasadas.length > 1 ? 's' : ''}</b> · ${brl(somaLanc(atrasadas))}${atrasadas.some(l => l.vencimento.slice(0, 7) !== m) ? ' (inclui meses anteriores)' : ''}</div>` : ''}

  <div class="seg section">
    <button class="${tipo === 'receber' ? 'on' : ''}" data-act="fin-tipo" data-v="receber">Entradas</button>
    <button class="${tipo === 'pagar' ? 'on' : ''}" data-act="fin-tipo" data-v="pagar">Saídas</button>
  </div>
  <div style="margin-top:6px">${listaHtml || `<div class="empty"><p>Nenhuma ${tipo === 'receber' ? 'entrada' : 'saída'} neste mês.</p></div>`}</div>`;
}

// Resumo do ano: entradas, despesas do estúdio e retiradas, mês a mês (pela data de pagamento).
function finAno() {
  const ano = ui.finAno || hoje().slice(0, 4);
  const pagos = state.lancamentos.filter(l => l.pagoEm && l.pagoEm.startsWith(ano));
  const meses = [...Array(12)].map((_, i) => {
    const m = `${ano}-${String(i + 1).padStart(2, '0')}`;
    const ls = pagos.filter(l => l.pagoEm.slice(0, 7) === m);
    const ent = somaLanc(ls.filter(l => l.tipo === 'receber')), ret = somaLanc(ls.filter(ehRetirada));
    const desp = somaLanc(ls.filter(l => l.tipo === 'pagar')) - ret;
    return { m, i, ent, desp, ret, res: ent - desp - ret };
  });
  const tot = k => meses.reduce((s, x) => s + x[k], 0);
  const usados = meses.filter(x => x.ent || x.desp || x.ret);
  const porGrupo = GRUPOS.map(([g, nome]) => [nome, somaLanc(pagos.filter(l => l.tipo === 'pagar' && grupoDe(l) === g))]);
  const porCentro = c => somaLanc(pagos.filter(l => l.tipo === 'receber' && l.centro === c));
  const anos = [...new Set(state.lancamentos.map(l => (l.pagoEm || l.vencimento).slice(0, 4)))].sort();
  const n = usados.length || 1;
  return `
  <div class="fin-mes">
    <button class="iconbtn" data-act="fin-ano" data-a="${+ano - 1}" aria-label="Ano anterior" ${anos[0] >= ano ? 'disabled' : ''}>${I.back}</button>
    <h1><em>${ano}</em></h1>
    <button class="iconbtn" data-act="fin-ano" data-a="${+ano + 1}" aria-label="Próximo ano" ${anos[anos.length - 1] <= ano ? 'disabled' : ''}>${I.next}</button>
  </div>
  <div class="stats fin section">
    <div class="stat"><b>${brl(tot('ent'))}</b><span>Entradas</span></div>
    <div class="stat"><b>${brl(tot('desp'))}</b><span>Despesas do estúdio</span></div>
    <div class="stat"><b>${brl(tot('ret'))}</b><span>Retiradas da Jessica</span></div>
    <div class="stat"><b>${brl(tot('res'))}</b><span>Ficou na empresa</span></div>
  </div>
  <p class="tiny fin-centros">Média por mês: entra ${brl(tot('ent') / n)}, sai ${brl(tot('desp') / n)} de despesas · Pilates ${brl(porCentro('Pilates'))} · Massagem e drenagem ${brl(porCentro('Fisioterapia'))}</p>

  <div class="section"><span class="eyebrow">Mês a mês</span>
    <table class="tabela">
      <thead><tr><th>Mês</th><th>Entradas</th><th>Despesas</th><th>Retiradas</th><th>Resultado</th></tr></thead>
      <tbody>${usados.map(x => `<tr data-act="fin-ir-mes" data-m="${x.m}"><td>${MESES_CURTOS[x.i]}</td><td>${brl(x.ent)}</td><td>${brl(x.desp)}</td><td>${brl(x.ret)}</td><td class="${x.res < 0 ? 'neg' : ''}">${brl(x.res)}</td></tr>`).join('')}</tbody>
    </table>
  </div>

  <div class="section"><span class="eyebrow">Saídas por grupo</span>
    ${porGrupo.filter(([, v]) => v).map(([nome, v]) => `<div class="row between" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${nome}</span><span>${brl(v)}</span></div>`).join('')}
  </div>`;
}

// ——— Contas fixas (recorrentes): lançadas sozinhas no mês atual e no próximo ———
// state.recorrentes = [{ id, nome, descricao, categoria, valor, dia, variavel, ativo }]
function detectarRecorrentes() {
  state.settings.recorrentesDetectados = true;
  const m0 = hoje().slice(0, 7);
  const ultimos = [1, 2, 3, 4].map(k => { let m = m0; for (let i = 0; i < k; i++) m = mesAnterior(m); return m; });
  const pagar = state.lancamentos.filter(l => l.tipo === 'pagar' && !ehRetirada(l));
  const porDesc = {};
  pagar.forEach(l => { (porDesc[chaveNome(l.descricao)] ||= []).push(l); });
  for (const ls of Object.values(porDesc)) {
    const meses = new Set(ls.map(l => l.vencimento.slice(0, 7)).filter(m => ultimos.includes(m)));
    if (meses.size < 3) continue;
    const ult = ls.sort((a, b) => b.vencimento.localeCompare(a.vencimento))[0];
    const vals = new Set(ls.slice(0, 4).map(l => l.valor));
    if (state.recorrentes.some(r => chaveNome(r.descricao) === chaveNome(ult.descricao))) continue;
    state.recorrentes.push({ id: uid('r'), nome: ult.nome, descricao: ult.descricao, categoria: ult.categoria, valor: ult.valor, dia: +ult.vencimento.slice(8), variavel: vals.size > 1, ativo: true });
  }
  save();
}

function gerarRecorrentes() {
  const m0 = hoje().slice(0, 7), m1 = mesSeguinte(m0);
  let mudou = false;
  for (const r of state.recorrentes) {
    if (!r.ativo) continue;
    for (const m of [m0, m1]) {
      if (state.excecoesFin.some(e => e.r === r.id && e.m === m)) continue;
      if (state.lancamentos.some(l => l.tipo === 'pagar' && chaveNome(l.descricao) === chaveNome(r.descricao) && l.vencimento.slice(0, 7) === m)) continue;
      const ultimo = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
      state.lancamentos.push({ id: uid('f'), tipo: 'pagar', clienteId: null, nome: r.nome || r.descricao, descricao: r.descricao, categoria: r.categoria, centro: '', forma: '',
        vencimento: `${m}-${String(Math.min(r.dia || 10, ultimo)).padStart(2, '0')}`, pagoEm: '', valor: r.valor, origem: 'recorrente', recorrenteId: r.id });
      mudou = true;
    }
  }
  if (mudou) save();
}

function sheetRecorrentes() {
  const linha = r => `<div class="toggle"><span><b style="font-weight:500">${esc(r.descricao)}</b><br><span class="tiny">${esc(r.nome || '')}${r.nome ? ' · ' : ''}dia ${r.dia} · ${r.variavel ? 'cerca de ' : ''}${brl(r.valor)}</span></span>
    <span class="row" style="flex-wrap:nowrap"><button class="linkbtn" data-rec-edit="${r.id}">Editar</button><button class="switch ${r.ativo ? 'on' : ''}" data-rec-on="${r.id}" aria-label="Ativa"></button></span></div>`;
  sheet(`<h2>Contas fixas</h2>
    <p class="muted">Entram sozinhas em Saídas todo mês, no dia de vencimento. Conta de valor variável entra com o último valor; ajuste ao pagar.</p>
    ${state.recorrentes.map(linha).join('') || '<p class="muted">Nenhuma conta fixa ainda.</p>'}
    <button class="btn block" data-rec-edit="" style="margin-top:14px">${I.plus} Nova conta fixa</button>`, el => {
    el.querySelectorAll('[data-rec-on]').forEach(b => b.addEventListener('click', () => {
      const r = state.recorrentes.find(x => x.id === b.dataset.recOn); r.ativo = !r.ativo;
      if (!r.ativo) state.lancamentos = state.lancamentos.filter(l => !(l.recorrenteId === r.id && !l.pagoEm && l.vencimento >= hoje().slice(0, 7)));
      save(); b.classList.toggle('on', r.ativo);
    }));
    el.querySelectorAll('[data-rec-edit]').forEach(b => b.addEventListener('click', () => sheetRecorrente(b.dataset.recEdit)));
  });
}

function sheetRecorrente(id) {
  const r = state.recorrentes.find(x => x.id === id) || { id: uid('r'), nome: '', descricao: '', categoria: 'Fixa', valor: '', dia: 10, variavel: false, ativo: true, nova: true };
  sheet(`<h2>${r.nova ? 'Nova conta fixa' : esc(r.descricao)}</h2>
    <label class="field"><span>Descrição</span><input type="text" id="rcDesc" value="${esc(r.descricao)}" placeholder="Ex.: Aluguel"></label>
    <label class="field"><span>Fornecedor</span><input type="text" id="rcNome" value="${esc(r.nome)}"></label>
    <label class="field"><span>Categoria</span><select id="rcCat">${CATEGORIAS.map(x => `<option ${x === r.categoria ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
    <div class="row" style="flex-wrap:nowrap">
      <label class="field" style="flex:1"><span>Valor (R$)</span><input type="number" id="rcValor" step="0.01" inputmode="decimal" value="${r.valor}"></label>
      <label class="field" style="flex:1"><span>Dia do vencimento</span><input type="number" id="rcDia" min="1" max="31" value="${r.dia}"></label>
    </div>
    <div class="toggle"><span>Valor muda todo mês</span><button class="switch ${r.variavel ? 'on' : ''}" id="rcVar" aria-label="Valor variável"></button></div>
    <button class="btn primary block" id="rcOk" style="margin-top:14px">Salvar</button>
    ${r.nova ? '' : '<div style="text-align:center;margin-top:12px"><button class="linkbtn" id="rcDel">Apagar conta fixa</button></div>'}`, el => {
    const sw = el.querySelector('#rcVar'); sw.addEventListener('click', () => sw.classList.toggle('on'));
    el.querySelector('#rcOk').addEventListener('click', () => {
      const v = x => el.querySelector('#' + x).value.trim();
      if (!v('rcDesc') || !+v('rcValor')) return toast('Preencha descrição e valor');
      Object.assign(r, { descricao: v('rcDesc'), nome: v('rcNome'), categoria: v('rcCat'), valor: +v('rcValor'), dia: Math.min(31, Math.max(1, +v('rcDia') || 10)), variavel: sw.classList.contains('on') });
      if (r.nova) { delete r.nova; state.recorrentes.push(r); }
      // As próximas ainda não pagas acompanham a mudança.
      state.lancamentos.filter(l => l.recorrenteId === r.id && !l.pagoEm).forEach(l => { Object.assign(l, { descricao: r.descricao, nome: r.nome || r.descricao, categoria: r.categoria, valor: r.valor, vencimento: l.vencimento.slice(0, 8) + String(r.dia).padStart(2, '0') }); });
      save(); render(); sheetRecorrentes();
    });
    el.querySelector('#rcDel')?.addEventListener('click', () => confirmar('Apagar esta conta fixa?', 'As contas já lançadas continuam; só deixa de lançar nos próximos meses.', 'Apagar', () => {
      state.recorrentes = state.recorrentes.filter(x => x.id !== r.id);
      state.lancamentos = state.lancamentos.filter(l => !(l.recorrenteId === r.id && !l.pagoEm));
      save(); render();
    }));
  });
}

const FORMAS = ['PIX', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência bancária', 'Boleto'];
const CATEGORIAS = ['Fixa', 'Variável', 'Imposto', 'Pró-labore', 'Distribuição de Lucros', 'Material de expediente', 'Não Categorizada'];

function sheetLanc(id) {
  const l = state.lancamentos.find(x => x.id === id);
  if (!l) return;
  const st = situacaoLanc(l);
  const linha = (k, v) => v ? `<div class="row between"><span class="muted">${k}</span><span>${v}</span></div>` : '';
  sheet(`<h2>${esc(l.nome)}</h2>
    <div class="card flat cadastro">
      ${linha('Descrição', esc(l.descricao))}${linha('Valor', brl(l.valor))}${linha('Vencimento', dataLonga(l.vencimento))}
      ${linha('Situação', { pago: 'Paga', atrasado: 'Atrasada', aberto: 'Aberta' }[st])}${linha('Pago em', l.pagoEm && dataLonga(l.pagoEm))}
      ${linha('Forma', esc(l.forma))}${linha('Categoria', esc(l.categoria))}${linha('Centro de custo', esc(l.centro))}
      ${l.clienteId ? `<a class="linkbtn" href="#/cliente/${l.clienteId}">Ver ficha</a>` : ''}
    </div>
    ${st === 'pago' ? `<button class="btn ghost block" id="lcDesfaz" style="margin-top:14px">Desfazer pagamento</button>` : `
    <h3 style="margin-top:18px">${l.tipo === 'receber' ? 'Receber' : 'Pagar'}</h3>
    <div class="row" style="flex-wrap:nowrap">
      <label class="field" style="flex:1;margin:0"><span>Data</span><input type="date" id="lcData" value="${hoje()}"></label>
      <label class="field" style="flex:1;margin:0"><span>Valor (R$)</span><input type="number" id="lcValor" step="0.01" inputmode="decimal" value="${l.valor}"></label>
    </div>
    <label class="field"><span>Forma</span><select id="lcForma">${FORMAS.map(f => `<option ${f === (l.forma || 'PIX') ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
    <button class="btn primary block" id="lcQuita" style="margin-top:14px">${I.check} Quitar</button>
    ${podeCobrar(l) ? `<button class="btn ghost block" data-act="cobrar" data-id="${l.id}" style="margin-top:8px">${I.zap} Cobrar no WhatsApp</button>` : ''}`}
    <div style="text-align:center;margin-top:12px"><button class="linkbtn" id="lcExclui">Excluir esta conta</button></div>`, el => {
    el.querySelector('#lcQuita')?.addEventListener('click', () => {
      Object.assign(l, { pagoEm: el.querySelector('#lcData').value || hoje(), valor: +el.querySelector('#lcValor').value || l.valor, forma: el.querySelector('#lcForma').value, editado: true });
      save(); closeSheet(); render(); toast(l.tipo === 'receber' ? 'Recebimento registrado' : 'Pagamento registrado');
    });
    el.querySelector('#lcDesfaz')?.addEventListener('click', () => { l.pagoEm = ''; l.editado = true; save(); closeSheet(); render(); toast('Pagamento desfeito'); });
    el.querySelector('#lcExclui').addEventListener('click', () => confirmar('Excluir esta conta?', esc(`${l.nome} · ${brl(l.valor)}`), 'Excluir', () => {
      if (l.origem === 'mensalidade' && l.clienteId) state.excecoesFin.push({ c: l.clienteId, m: l.vencimento.slice(0, 7) });
      if (l.origem === 'recorrente' && l.recorrenteId) state.excecoesFin.push({ r: l.recorrenteId, m: l.vencimento.slice(0, 7) });
      state.lancamentos = state.lancamentos.filter(x => x.id !== l.id);
      save(); render(); toast('Conta excluída');
    }));
  });
}

function sheetNovaConta(clienteId = null) {
  let tipo = 'receber';
  const c0 = clienteId ? cliente(clienteId) : null;
  const nomes = state.clientes.filter(c => !c.inativo).map(c => `<option value="${esc(c.nome)}">`).join('');
  const descs = [...new Set(['Pilates 1 x semana', 'Pilates 2 x semana', 'Pilates 3 x semana', 'Pilates avulso', 'Pilates Experimental', 'Massagem terapêutica', 'Drenagem avulsa', 'Aluguel', 'Ceee', 'INSS', 'Simples Nacional', 'Contador - honorário prom.', ...state.lancamentos.map(l => l.descricao)].filter(Boolean))].map(d => `<option value="${esc(d)}">`).join('');
  sheet(`<h2>Nova conta</h2>
    <div class="seg" id="ncTipo"><button class="on" data-v="receber">Entrada</button><button data-v="pagar">Saída</button></div>
    <label class="field"><span id="ncNomeRot">Cliente</span><input type="text" id="ncNome" list="ncNomes" value="${esc(c0?.nome || '')}"></label><datalist id="ncNomes">${nomes}</datalist>
    <label class="field"><span>Descrição</span><input type="text" id="ncDesc" list="ncDescs" value="${esc(c0?.plano || '')}"></label><datalist id="ncDescs">${descs}</datalist>
    <label class="field" id="ncCatBox" hidden><span>Categoria</span><select id="ncCat">${CATEGORIAS.map(x => `<option>${x}</option>`).join('')}</select></label>
    <div class="row" style="flex-wrap:nowrap">
      <label class="field" style="flex:1;margin-top:12px"><span>Valor (R$)</span><input type="number" id="ncValor" step="0.01" inputmode="decimal" value="${c0?.valorMensal || ''}"></label>
      <label class="field" style="flex:1;margin-top:12px"><span>Vencimento</span><input type="date" id="ncVenc" value="${hoje()}"></label>
    </div>
    <div class="toggle"><span>Já está paga</span><button class="switch" id="ncPago" aria-label="Já está paga"></button></div>
    <button class="btn primary block" id="ncOk" style="margin-top:14px">Salvar conta</button>`, el => {
    el.querySelectorAll('#ncTipo button').forEach(b => b.addEventListener('click', () => {
      tipo = b.dataset.v;
      el.querySelectorAll('#ncTipo button').forEach(x => x.classList.toggle('on', x === b));
      el.querySelector('#ncNomeRot').textContent = tipo === 'receber' ? 'Cliente' : 'Fornecedor';
      el.querySelector('#ncCatBox').hidden = tipo === 'receber';
      el.querySelector('#ncNome').setAttribute('list', tipo === 'receber' ? 'ncNomes' : '');
    }));
    const sw = el.querySelector('#ncPago'); sw.addEventListener('click', () => sw.classList.toggle('on'));
    el.querySelector('#ncOk').addEventListener('click', () => {
      const v = id => el.querySelector('#' + id).value.trim();
      const valor = +v('ncValor');
      if (!v('ncNome') && !v('ncDesc')) return toast('Diga de quem ou do que é a conta');
      if (!valor) return toast('Informe o valor');
      const c = tipo === 'receber' ? clientePorNome(v('ncNome')) : null;
      state.lancamentos.push({ id: uid('f'), tipo, clienteId: c?.id || null, nome: c?.nome || v('ncNome') || v('ncDesc'), descricao: v('ncDesc'),
        categoria: tipo === 'pagar' ? v('ncCat') : '', centro: tipo === 'receber' ? centroDe(v('ncDesc')) : '', forma: '',
        vencimento: v('ncVenc') || hoje(), pagoEm: sw.classList.contains('on') ? (v('ncVenc') || hoje()) : '', valor, origem: 'app' });
      ui.finMes = (v('ncVenc') || hoje()).slice(0, 7); ui.finTipo = tipo;
      save(); closeSheet(); render(); toast('Conta salva');
    });
  });
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

  <div class="section"><span class="eyebrow">Cobrança</span>
    <label class="field"><span>Chave PIX (vai na mensagem de cobrança)</span><input type="text" id="cfgPix" value="${esc(state.settings.pix || '')}" placeholder="CNPJ, e-mail, telefone ou chave aleatória"></label>
    <label class="field"><span>Assinatura</span><input type="text" id="cfgAss" value="${esc(state.settings.assinatura || 'Jessica · ERA Pilates')}"></label>
  </div>

  <div class="section"><span class="eyebrow">Importar do Seu Fisio</span>
    <p class="muted">Escolha os dois arquivos exportados do Seu Fisio: a lista de clientes e a agenda. Quem já está no app é atualizado.</p>
    <label class="btn primary block" style="justify-content:center">Escolher arquivos<input type="file" id="importArq" accept=".tsv,.csv,.txt,.json,text/plain,application/json,text/tab-separated-values" multiple hidden></label>
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
  <p class="tiny" style="text-align:center;margin-top:28px">ERA Pilates · app interno · v0.3</p>`;
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

function confirmar(titulo, texto, rotulo, onOk) {
  sheet(`<h2>${titulo}</h2>${texto ? `<p class="muted">${texto}</p>` : ''}
    <button class="btn primary block" id="cfOk" style="margin-top:14px">${rotulo}</button>
    <button class="btn ghost block" id="cfNao" style="margin-top:8px">Cancelar</button>`, el => {
    el.querySelector('#cfNao').addEventListener('click', closeSheet);
    el.querySelector('#cfOk').addEventListener('click', () => { closeSheet(); onOk(); });
  });
}

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
        aula.clientes.forEach(c => { if (!sel.has(c) || data !== aula.data || hora !== aula.hora) excecaoFixa(c, aula.data, aula.hora); });
        Object.assign(aula, { data, hora, clientes: [...sel] });
        Object.keys(aula.planos).forEach(c => { if (!sel.has(c)) delete aula.planos[c]; });
        save(); closeSheet(); render(); return toast('Aula atualizada');
      }
      const a = { id: uid('a'), data, hora, clientes: [...sel], status: 'agendada', planos: {}, notas: {}, origem: 'manual' };
      state.aulas.push(a); save(); closeSheet(); ui.dia = a.data; go('#/aula/' + a.id);
    });
  });
}

function sheetHorario(cId) {
  const c = cliente(cId);
  let dow = 1;
  sheet(`<h2>Horário fixo</h2>
    <p class="muted">A aula de ${esc(primeiro(c.nome))} entra na agenda toda semana neste dia e hora.</p>
    <div class="seg" id="hrDia">${[1, 2, 3, 4, 5, 6].map(d => `<button data-d="${d}" class="${d === dow ? 'on' : ''}">${DIA_CURTO[d]}</button>`).join('')}</div>
    <label class="field"><span>Hora</span><input type="time" id="hrHora" value="08:00" step="900"></label>
    <button class="btn primary block" id="hrOk" style="margin-top:14px">Salvar horário</button>`, el => {
    el.querySelectorAll('#hrDia button').forEach(b => b.addEventListener('click', () => {
      dow = +b.dataset.d; el.querySelectorAll('#hrDia button').forEach(x => x.classList.toggle('on', x === b));
    }));
    el.querySelector('#hrOk').addEventListener('click', () => {
      const hora = el.querySelector('#hrHora').value;
      if (!hora) return toast('Escolha a hora');
      c.horarios = c.horarios || [];
      if (!c.horarios.some(h => h.dow === dow && h.hora === hora)) c.horarios.push({ dow, hora });
      c.horarios.sort((a, b) => a.dow - b.dow || a.hora.localeCompare(b.hora));
      gerarFixas(hoje(), addDias(hoje(), 27));
      save(); closeSheet(); render(); toast('Horário fixo salvo');
    });
  });
}

const reais = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
function idade(nasc) {
  if (!nasc) return null;
  const n = parseIso(nasc), h = new Date();
  return h.getFullYear() - n.getFullYear() - (h < new Date(h.getFullYear(), n.getMonth(), n.getDate()) ? 1 : 0);
}
function linhasCadastro(c) {
  const fone = c.telefone ? `<a href="https://wa.me/55${c.telefone.replace(/\D/g, '')}" target="_blank" rel="noopener">${esc(c.telefone)}</a>` : '';
  return [
    ['Telefone', fone],
    ['Nascimento', c.nascimento ? `${dataCurta(c.nascimento)}/${c.nascimento.slice(0, 4)} · ${idade(c.nascimento)} anos` : ''],
    ['E-mail', esc(c.email)], ['CPF', esc(c.cpf)], ['Endereço', esc(c.endereco)], ['Profissão', esc(c.profissao)],
    ['Cliente desde', c.clienteDesde ? `${dataCurta(c.clienteDesde)}/${c.clienteDesde.slice(0, 4)}` : ''],
    ['Uso de imagem', c.autorizaImagem === undefined ? '' : c.autorizaImagem ? 'Autorizou' : 'Não autorizou'],
  ].filter(([, v]) => v);
}
function faltandoCadastro(c) {
  return [['telefone', c.telefone], ['nascimento', c.nascimento], ['e-mail', c.email], ['CPF', c.cpf], ['endereço', c.endereco]].filter(([, v]) => !v).map(([k]) => k);
}

const PLANOS = ['Pilates 1 x semana', 'Pilates 2 x semana', 'Pilates 3 x semana', 'Pilates avulso', 'Pilates Experimental'];
function sheetCadastro(cId) {
  const c = cliente(cId);
  const campo = (id, rotulo, valor = '', tipo = 'text', extra = '') => `<label class="field"><span>${rotulo}</span><input type="${tipo}" id="${id}" value="${esc(valor)}" ${extra}></label>`;
  const planos = [...new Set([...PLANOS, c.plano].filter(Boolean))];
  sheet(`<h2>Cadastro</h2>
    ${campo('cdNome', 'Nome completo', c.nome)}
    ${campo('cdFone', 'Telefone / WhatsApp', c.telefone, 'tel')}
    ${campo('cdEmail', 'E-mail', c.email, 'email')}
    <div class="row" style="flex-wrap:nowrap">
      <div style="flex:1">${campo('cdNasc', 'Nascimento', c.nascimento, 'date')}</div>
      <div style="flex:1">${campo('cdCpf', 'CPF', c.cpf, 'text', 'inputmode="numeric"')}</div>
    </div>
    ${campo('cdEnd', 'Endereço', c.endereco)}
    ${campo('cdProf', 'Profissão', c.profissao)}
    ${campo('cdDesde', 'Cliente desde', c.clienteDesde, 'date')}
    <div class="toggle"><span>Autorizou uso de imagem</span><button class="switch ${c.autorizaImagem ? 'on' : ''}" id="cdImg" aria-label="Autorizou uso de imagem"></button></div>
    <h3 style="margin-top:18px">Plano</h3>
    <label class="field"><span>Plano</span><select id="cdPlano"><option value="">Sem plano</option>${planos.map(p => `<option ${p === c.plano ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></label>
    <div class="row" style="flex-wrap:nowrap">
      <div style="flex:1">${campo('cdValor', 'Valor por mês (R$)', c.valorMensal ?? '', 'number', 'step="0.01" inputmode="decimal"')}</div>
      <div style="flex:1">${campo('cdIni', 'Início do plano', c.inicioPlano, 'date')}</div>
    </div>
    <button class="btn primary block" id="cdOk" style="margin-top:16px">Salvar cadastro</button>`, el => {
    const sw = el.querySelector('#cdImg');
    sw.addEventListener('click', () => sw.classList.toggle('on'));
    el.querySelector('#cdOk').addEventListener('click', () => {
      const v = id => el.querySelector('#' + id).value.trim();
      if (!v('cdNome')) return toast('O nome não pode ficar vazio');
      Object.assign(c, {
        nome: v('cdNome').replace(/\s+/g, ' '), telefone: v('cdFone'), email: v('cdEmail').toLowerCase(), nascimento: v('cdNasc'), cpf: v('cdCpf'),
        endereco: v('cdEnd'), profissao: v('cdProf'), clienteDesde: v('cdDesde'), autorizaImagem: sw.classList.contains('on'),
        plano: v('cdPlano'), valorMensal: v('cdValor') ? +v('cdValor') : undefined, inicioPlano: v('cdIni'),
      });
      save(); closeSheet(); render(); toast('Cadastro salvo');
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
const dataBr = s => { const m = (s || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
const SEM_ENDERECO = /^n[ºo°]?\s*-?\s*,?\s*-?\s*,?\s*$/i;

function importarClientes(txt) {
  let novos = 0, atualizados = 0, inativos = 0;
  const linhas = txt.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim());
  // Com cabeçalho (ex.: exportação do Seu Fisio), as colunas são lidas pelo nome.
  const sep = /\t|;|\|/;
  const cab = linhas[0]?.split(sep).map(x => x.trim().toLowerCase()) || [];
  const col = re => cab.findIndex(h => re.test(h));
  const temCab = cab.some(h => CABECALHO.test(h));
  const ix = temCab ? {
    nome: col(CABECALHO), fone: col(/telefone|celular|fone/), sit: col(/situa|status/), ult: col(/[úu]ltimo/), obs: col(/observa|plano/),
    mat: col(/matr[íi]cula/), gen: col(/^g[êe]nero/), cpf: col(/^cpf/), nasc: col(/nascimento/), prof: col(/profiss/), email: col(/e-?mail/),
    end: col(/endere/), desde: col(/cliente desde/), cad: col(/cadastro/), img: col(/imagem/), rep: col(/reposi/),
  } : null;
  const dados = (temCab ? linhas.slice(1) : linhas).map(l => l.split(sep).map(x => x.trim()));
  const pegaDe = (bruto, k) => (ix && ix[k] >= 0 ? bruto[ix[k]] || '' : '');
  // Cadastro repetido com o mesmo nome: vale a linha ativa.
  const temAtivo = new Set(dados.filter(b => /^ativ/i.test(pegaDe(b, 'sit'))).map(b => pegaDe(b, 'nome').toLowerCase()));
  for (const bruto of dados) {
    const cols = bruto.filter(Boolean);
    if (!cols.length) continue;
    const pega = k => pegaDe(bruto, k);
    const obs = pega('obs');
    if (/duplicad/i.test(obs)) continue;
    const nome = (ix ? pega('nome') : cols[0]).replace(/\s+/g, ' ').replace(/[\u202a-\u202e]/g, '').trim();
    if (!nome || CABECALHO.test(nome) || /^total:/i.test(nome)) continue;
    if (/^inativ/i.test(pega('sit')) && temAtivo.has(nome.toLowerCase())) continue;
    const existia = state.clientes.some(x => x.nome.toLowerCase() === nome.toLowerCase());
    const c = acharOuCriarCliente(nome);
    existia ? atualizados++ : novos++;
    const resto = ix ? [pega('sit'), pega('fone')] : cols.slice(1);
    // Ativo/inativo mudado à mão no app vale mais que a situação do Seu Fisio; quem só faz massagem fica fora do Pilates.
    if (!c.inativoManual && !c.soMassagem) {
      if (resto.some(x => /^inativ/i.test(x))) c.inativo = true;
      else if (resto.some(x => /^ativ/i.test(x))) c.inativo = false;
    }
    if (ix) {
      const campo = (k, v) => { if (v) c[k] = v; };
      campo('matricula', pega('mat')); campo('genero', pega('gen')); campo('cpf', pega('cpf'));
      campo('nascimento', dataBr(pega('nasc'))); campo('profissao', pega('prof')); campo('email', pega('email').toLowerCase());
      if (pega('end') && !SEM_ENDERECO.test(pega('end'))) c.endereco = pega('end');
      campo('clienteDesde', dataBr(pega('desde'))); campo('cadastroEm', dataBr(pega('cad')));
      if (pega('img')) c.autorizaImagem = !/n[ãa]o/i.test(pega('img'));
      if (ix.rep >= 0) c.reposicoes = +pega('rep') || 0;
    }
    // Quem só faz massagem/drenagem não entra na lista de Pilates (dá para reativar na ficha).
    if (/^s[óo] massagem/i.test(obs)) { c.inativo = true; c.soMassagem = true; }
    if (c.inativo) inativos++;
    const fone = resto.find(x => FONE.test(x) && x.replace(/\D/g, '').length >= 10);
    if (fone) c.telefone = fone;
    if (/plano:|pilates|massagem|drenagem/i.test(obs)) c.plano = obs.replace(/^(último )?plano:\s*/i, '');
    else if (obs) c.obsSeuFisio = obs;
    const ult = pega('ult');
    if (/^\d{4}-\d{2}-\d{2}$/.test(ult)) c.ultimoAtendimento = ult;
  }
  save();
  return { novos, atualizados, inativos };
}

const DOW = { domingo: 0, segunda: 1, 'terça': 2, terca: 2, quarta: 3, quinta: 4, sexta: 5, 'sábado': 6, sabado: 6 };
function lerHorarios(txt) {
  const hs = [];
  for (const m of (txt || '').toLowerCase().matchAll(/(domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado)(?:-feira)?\s*(?:[àa]s)?\s*(\d{1,2})[:h](\d{2})/g)) {
    const h = { dow: DOW[m[1]], hora: `${m[2].padStart(2, '0')}:${m[3]}` };
    if (!hs.some(x => x.dow === h.dow && x.hora === h.hora)) hs.push(h);
  }
  return hs.sort((a, b) => a.dow - b.dow || a.hora.localeCompare(b.hora));
}

function importarPlanos(txt) {
  const linhas = txt.split('\n').map(l => l.replace(/\r$/, '').split('\t').map(x => x.trim()));
  const cab = linhas[0].map(h => h.toLowerCase());
  const col = re => cab.findIndex(h => re.test(h));
  const ix = { mat: col(/^mat/), nome: col(/^nome|cliente/), plano: col(/^plano/), valor: col(/valor/), ini: col(/in[íi]cio/), fim: col(/^fim/), hr: col(/hor[áa]rio/) };
  let n = 0;
  for (const b of linhas.slice(1)) {
    const pega = k => (ix[k] >= 0 ? b[ix[k]] || '' : '');
    const nome = pega('nome');
    if (!nome) continue;
    const c = state.clientes.find(x => x.matricula && x.matricula === pega('mat')) || acharOuCriarCliente(nome);
    if (pega('mat')) c.matricula = pega('mat');
    if (pega('plano')) c.plano = pega('plano');
    const v = parseFloat(pega('valor').replace(/\./g, '').replace(',', '.'));
    if (!isNaN(v)) c.valorMensal = v;
    c.inicioPlano = dataBr(pega('ini')) || c.inicioPlano || '';
    c.fimPlano = dataBr(pega('fim'));
    const hs = lerHorarios(pega('hr'));
    if (hs.length) c.horarios = hs;
    if (!c.inativoManual) c.inativo = false;
    n++;
  }
  save();
  return n;
}

const tipoArquivo = t => {
  if (t.startsWith('{') || t.startsWith('[')) return 'agenda';
  const cab = t.split('\n')[0].toLowerCase();
  if (/fornecedor/.test(cab) || (/servi[çc]o\/produto/.test(cab) && /data venc/.test(cab))) return 'financeiro';
  if (/atendimentos gerais/.test(cab) || (/data\/hora/.test(cab) && /tipo atendimento/.test(cab))) return 'atendimentos';
  return /hor[áa]rio/.test(cab) ? 'planos' : 'clientes';
};

// ——— Financeiro: lançamentos de contas a receber e a pagar ———
// state.lancamentos = [{ id, tipo: 'receber'|'pagar', clienteId, nome, descricao, categoria, centro, forma, vencimento, pagoEm, valor, origem, ref, editado }]
const numBr = s => parseFloat(String(s ?? '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
const brl = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const chaveNome = n => (n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const clientePorNome = n => state.clientes.find(c => chaveNome(c.nome) === chaveNome(n));
const centroDe = servico => /pilates/i.test(servico || '') ? 'Pilates' : servico ? 'Fisioterapia' : '';
const ehMensalidade = d => /x\s*semana/i.test(d || '');
const situacaoLanc = l => l.pagoEm ? 'pago' : l.vencimento < hoje() ? 'atrasado' : 'aberto';

function importarFinanceiro(txt) {
  const linhas = txt.split('\n').map(l => l.replace(/\r$/, '').split('\t').map(x => x.trim()));
  const cab = linhas[0].map(h => h.toLowerCase());
  const col = re => cab.findIndex(h => re.test(h));
  const pagar = cab.some(h => /fornecedor/.test(h));
  const tipo = pagar ? 'pagar' : 'receber';
  const ix = { n: col(/^n[º°o]/), nome: col(pagar ? /fornecedor/ : /cliente/), desc: col(pagar ? /t[íi]tulo/ : /servi[çc]o/), cat: col(/categoria/),
    forma: col(/pagamento/), venc: col(/venc/), pag: col(/data pag/), sit: col(/situa/), valor: col(/valor/) };
  let n = 0;
  const meses = new Set();
  for (const b of linhas.slice(1)) {
    const pega = k => (ix[k] >= 0 ? b[ix[k]] || '' : '');
    if (!/^\d+$/.test(pega('n'))) continue;
    const ref = `sf-${tipo[0]}-${pega('n')}`;
    const atual = state.lancamentos.find(l => l.ref === ref);
    if (atual?.editado) continue;
    const pago = /^paga/i.test(pega('sit'));
    const c = pagar ? null : clientePorNome(pega('nome'));
    const dados = {
      tipo, clienteId: c?.id || null, nome: c?.nome || pega('nome') || pega('desc'), descricao: pega('desc'), categoria: pega('cat'),
      centro: pagar ? '' : centroDe(pega('desc')), forma: pega('forma'), vencimento: dataBr(pega('venc')),
      pagoEm: pago ? dataBr(pega('pag')) || dataBr(pega('venc')) : '', valor: numBr(pega('valor')), origem: 'seufisio', ref,
    };
    if (!dados.vencimento) continue;
    if (atual) Object.assign(atual, dados); else state.lancamentos.push({ id: uid('f'), ...dados });
    if (c && ehMensalidade(dados.descricao)) meses.add(c.id + ' ' + dados.vencimento.slice(0, 7));
    if (pagar) meses.add('p ' + chaveNome(dados.descricao) + ' ' + dados.vencimento.slice(0, 7));
    n++;
  }
  // A mensalidade que o Seu Fisio já lançou substitui a gerada pelo app no mesmo mês (se ainda não foi paga).
  state.lancamentos = state.lancamentos.filter(l => !(!l.pagoEm && ((l.origem === 'mensalidade' && meses.has(l.clienteId + ' ' + l.vencimento.slice(0, 7)))
    || (l.origem === 'recorrente' && meses.has('p ' + chaveNome(l.descricao) + ' ' + l.vencimento.slice(0, 7))))));
  save();
  return { n, tipo };
}

// Histórico do Seu Fisio (Relatórios → Atendimentos gerais): cada horário vira uma aula, juntando quem estava junto.
// Só entra o que já passou; daqui para a frente a agenda vem dos horários fixos e do que for marcado no app.
function importarAtendimentos(txt) {
  const linhas = txt.split('\n').map(l => l.replace(/\r$/, '').split('\t').map(x => x.trim()));
  const hi = linhas.findIndex(l => /^cliente$/i.test(l[0] || ''));
  if (hi < 0) return 0;
  const cab = linhas[hi].map(h => h.toLowerCase());
  const col = re => cab.findIndex(h => re.test(h));
  const ix = { nome: col(/^cliente/), dh: col(/data/), sala: col(/^sala/), tipo: col(/tipo/), st: col(/status/) };
  const grupos = new Map();
  for (const b of linhas.slice(hi + 1)) {
    const m = (b[ix.dh] || '').match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!m || !b[ix.nome]) continue;
    const data = `${m[3]}-${m[2]}-${m[1]}`, hora = `${m[4]}:${m[5]}`;
    if (data >= hoje()) continue;
    const sala = b[ix.sala] || '', tipo = b[ix.tipo] || '', st = b[ix.st] || '';
    const zen = /zen/i.test(sala) || /massagem|drenagem|reiki/i.test(tipo);
    const chave = `${data} ${hora} ${zen ? 'zen' : 'pilates'}`;
    if (!grupos.has(chave)) grupos.set(chave, { data, hora, sala, tipo, zen, gente: [] });
    grupos.get(chave).gente.push({ nome: b[ix.nome], st });
  }
  let n = 0;
  for (const [chave, g] of grupos) {
    const ref = 'h-' + chave.replace(/\s/g, '-');
    let a = state.aulas.find(x => x.ref === ref) || state.aulas.find(x => x.data === g.data && x.hora === g.hora && !!ehMassagem(x) === g.zen);
    if (!a) { a = { id: uid('a'), data: g.data, hora: g.hora, clientes: [], status: 'agendada', planos: {}, notas: {}, origem: 'historico' }; state.aulas.push(a); }
    Object.assign(a, { ref, sala: g.sala, servico: g.tipo });
    a.presenca = a.presenca || {};
    let feita = false;
    for (const p of g.gente) {
      let c = clientePorNome(p.nome);
      if (!c) { c = acharOuCriarCliente(p.nome); c.inativo = true; }
      if (!a.clientes.includes(c.id)) a.clientes.push(c.id);
      if (/aus[êe]ncia|falta/i.test(p.st)) {
        a.presenca[c.id] = /justificad/i.test(p.st) ? 'justificada' : 'falta';
        const rem = p.st.match(/rem\.\s*([\d/]+\s*[\d:]*)/i);
        if (rem) { a.remarcacao = a.remarcacao || {}; a.remarcacao[c.id] = rem[1].trim(); }
      } else if (/finalizad/i.test(p.st)) feita = true;
    }
    if (feita || a.clientes.every(c => a.presenca[c])) a.status = 'realizada';
    n++;
  }
  save();
  return n;
}

// Mensalidade do plano: o app lança a do mês atual e a do próximo, no dia do início do plano.
function gerarMensalidades() {
  const h = hoje(), m0 = h.slice(0, 7), m1 = addDias(m0 + '-01', 32).slice(0, 7);
  let mudou = false;
  for (const c of state.clientes) {
    if (c.inativo || !c.valorMensal || !ehMensalidade(c.plano)) continue;
    const dia = c.inicioPlano ? +c.inicioPlano.slice(8) : 1;
    for (const m of [m0, m1]) {
      if ((c.inicioPlano && m < c.inicioPlano.slice(0, 7)) || (c.fimPlano && m > c.fimPlano.slice(0, 7))) continue;
      if (state.excecoesFin.some(e => e.c === c.id && e.m === m)) continue;
      if (state.lancamentos.some(l => l.tipo === 'receber' && l.clienteId === c.id && ehMensalidade(l.descricao) && l.vencimento.slice(0, 7) === m)) continue;
      const ultimo = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
      state.lancamentos.push({ id: uid('f'), tipo: 'receber', clienteId: c.id, nome: c.nome, descricao: c.plano, categoria: '', centro: 'Pilates', forma: '',
        vencimento: `${m}-${String(Math.min(dia, ultimo)).padStart(2, '0')}`, pagoEm: '', valor: c.valorMensal, origem: 'mensalidade' });
      mudou = true;
    }
  }
  if (mudou) save();
}

async function lerArquivo(f) {
  return /\.xlsx$/i.test(f.name) ? xlsxParaTsv(await f.arrayBuffer()) : f.text();
}

async function importarArquivos(files) {
  importarLidos(await Promise.all([...files].map(async f => ({ nome: f.name, txt: await lerArquivo(f) }))));
}

function importarLidos(lidos) {
  if (state.exemplo) limparExemplo();
  // Clientes primeiro, depois os planos (horários fixos) e por fim a agenda, que acha os nomes já cadastrados.
  const ordem = { clientes: 0, planos: 1, financeiro: 2, atendimentos: 3, agenda: 4 };
  lidos.sort((a, b) => ordem[tipoArquivo(a.txt.trim())] - ordem[tipoArquivo(b.txt.trim())]);
  const msgs = [];
  for (const { txt } of lidos) {
    const t = txt.trim();
    if (tipoArquivo(t) === 'planos') { msgs.push(`${importarPlanos(t)} planos com horário`); continue; }
    if (tipoArquivo(t) === 'atendimentos') { msgs.push(`${importarAtendimentos(t)} aulas do histórico`); continue; }
    if (tipoArquivo(t) === 'financeiro') { const r = importarFinanceiro(t); msgs.push(`${r.n} contas a ${r.tipo}`); continue; }
    if (t.startsWith('{') || t.startsWith('[')) {
      const r = importarAgenda(t); msgs.push(`${r.novas} aulas`);
      const nf = detectarFixos(); if (nf) msgs.push(`${nf} com horário fixo`);
    }
    else { const r = importarClientes(t); msgs.push(`${r.novos + r.atualizados} clientes (${r.novos + r.atualizados - r.inativos} ativos)`); }
  }
  render(); toast('Importado: ' + msgs.join(' · '));
}

// No computador, o app lê sozinho a pasta "Importacao App Aulas" (ligada como .dados).
// Ela fica fora do GitHub e do link publicado; só existe neste PC. Reimporta quando os arquivos mudam.
const ARQ_LOCAIS = ['clientes-erapilates.tsv', 'clientes-seufisio-completo.xlsx', 'planos-fixos-erapilates.tsv',
  'contas-receber-seufisio.xlsx', 'contas-pagar-seufisio.xlsx', 'atendimentos-seufisio.xlsx', 'agenda-erapilates.json'];
async function sincronizarPastaLocal() {
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) return;
  const lidos = [];
  for (const nome of ARQ_LOCAIS) {
    try {
      const r = await fetch('.dados/' + nome, { cache: 'no-store' });
      if (r.ok) lidos.push({ nome, txt: /\.xlsx$/i.test(nome) ? await xlsxParaTsv(await r.arrayBuffer()) : await r.text() });
    } catch {}
  }
  if (!lidos.length) return;
  const resumo = lidos.map(l => { let h = 5381; for (let i = 0; i < l.txt.length; i++) h = (h * 33 + l.txt.charCodeAt(i)) | 0; return `${l.nome}:${l.txt.length}:${h}`; }).join('|');
  if (state.settings.pastaLocal === resumo) return;
  state.settings.pastaLocal = resumo;
  importarLidos(lidos);
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
  if (ehMassagem(a)) return;
  a.clientes.forEach(cId => {
    if (a.presenca?.[cId] || (!forcar && a.planos[cId]?.itens?.length)) return;
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
      if (a.data >= t && a.status !== 'realizada' && a.clientes.some(c => !a.presenca?.[c] && !a.planos[c]?.itens?.length)) { planejar(a); n++; }
    });
    save(); render(); toast(`${n} aula${n > 1 ? 's' : ''} com sugestão pronta`);
  },
  aluno: el => { ui.aluno[el.dataset.a] = el.dataset.c; render(); },
  vista: el => { ui.vista = el.dataset.v; render(); },
  'dia-lista': el => { ui.dia = el.dataset.d; ui.vista = 'dia'; render(); },
  presenca: el => {
    const a = state.aulas.find(x => x.id === el.dataset.a), c = el.dataset.c, v = el.dataset.v;
    a.presenca = a.presenca || {};
    if (v) a.presenca[c] = v; else delete a.presenca[c];
    save(); render();
  },
  'add-hr': el => sheetHorario(el.dataset.c),
  lanc: el => sheetLanc(el.dataset.id),
  cobrar: el => sheetCobrar(el.dataset.id),
  'nova-conta': el => sheetNovaConta(el.dataset.c || null),
  'fin-mes': el => { ui.finMes = el.dataset.m; render(); },
  'fin-tipo': el => { ui.finTipo = el.dataset.v; render(); },
  'fin-vista': el => { ui.finVista = el.dataset.v; render(); },
  'fin-ano': el => { ui.finAno = String(el.dataset.a); render(); },
  'fin-ir-mes': el => { ui.finMes = el.dataset.m; ui.finVista = 'mes'; render(); window.scrollTo(0, 0); },
  recorrentes: () => sheetRecorrentes(),
  'tira-hr': el => {
    const c = cliente(el.dataset.c), [h] = c.horarios.splice(+el.dataset.i, 1), t = hoje();
    // Sai das próximas aulas criadas por esse horário (as já realizadas ficam no histórico).
    state.aulas.forEach(a => {
      if (a.origem === 'fixo' && a.data >= t && a.status !== 'realizada' && a.hora === h.hora && parseIso(a.data).getDay() === h.dow && !a.planos[c.id]?.aprovado) a.clientes = a.clientes.filter(x => x !== c.id);
    });
    state.aulas = state.aulas.filter(a => a.clientes.length || a.origem !== 'fixo');
    save(); render(); toast('Horário fixo removido');
  },
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
  'apagar-aula': el => confirmar('Remover esta aula?', '', 'Remover', () => {
    const a = state.aulas.find(x => x.id === el.dataset.a);
    a?.clientes.forEach(c => excecaoFixa(c, a.data, a.hora));
    state.aulas = state.aulas.filter(x => x.id !== el.dataset.a); save(); go('#/agenda');
  }),
  ditar: el => ditar(el),

  'novo-cliente': () => sheetTexto('Novo cliente', 'Nome completo', '', nome => { const c = acharOuCriarCliente(nome); save(); go('#/cliente/' + c.id); }),
  renomear: el => sheetCadastro(el.dataset.c),
  nivel: el => { cliente(el.dataset.c).nivel = +el.dataset.n; save(); render(); },
  obj: el => { const c = cliente(el.dataset.c); const o = el.dataset.o; c.objetivos = (c.objetivos || []).includes(o) ? c.objetivos.filter(x => x !== o) : [...(c.objetivos || []), o]; save(); render(); },
  'add-restr': el => sheetRestricao(el.dataset.c),
  'tira-restr': el => { const c = cliente(el.dataset.c); c.restricoes = c.restricoes.filter(r => r.tag !== el.dataset.t); save(); render(); },
  ativo: el => { const c = cliente(el.dataset.c); c.inativo = !c.inativo; c.inativoManual = true; save(); render(); toast(c.inativo ? 'Marcado como inativo' : 'Cliente ativo de novo'); },
  'cli-inativos': el => { ui.cliInativos = !!el.dataset.v; render(); },

  'f-ap': el => { ui.exFiltro.ap = el.dataset.v; render(); },
  'f-st': el => { ui.exFiltro.st = el.dataset.v; render(); },
  'novo-ex': () => sheetNovoEx(),
  'ex-st': el => { setExercicio(el.dataset.id, { status: el.dataset.v }); render(); },
  'tira-foto': el => { setExercicio(el.dataset.id, { foto: null }); render(); },
  'apaga-ex': el => confirmar('Apagar este exercício?', '', 'Apagar', () => { state.exCustom = state.exCustom.filter(e => e.id !== el.dataset.id); save(); go('#/exercicios'); }),
  voltar: () => history.length > 1 ? history.back() : go('#/exercicios'),
  cura: el => { setExercicio(el.dataset.id, { status: el.dataset.v }); render(); },
  'cura-pular': el => { setExercicio(el.dataset.id, { adiado: Date.now() }); render(); },

  ap: el => { const k = el.dataset.k; state.settings.aparelhos[k] = state.settings.aparelhos[k] === false; save(); render(); },
  soBase: () => { state.settings.soBase = !state.settings.soBase; save(); render(); },
  exportar: () => {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `era-pilates-backup-${hoje()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  'limpar-exemplo': () => confirmar('Remover os dados de exemplo?', 'Saem os clientes e as aulas fictícios.', 'Remover', () => {
    limparExemplo(); render(); toast('Pronto, app limpo para os clientes reais');
  }),
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
  if (t.id === 'cfgPix') { state.settings.pix = t.value.trim(); saveSoon(); }
  if (t.id === 'cfgAss') { state.settings.assinatura = t.value.trim(); saveSoon(); }
  if (t.id === 'exNota') { state.exOverrides[t.dataset.id] = { ...(state.exOverrides[t.dataset.id] || {}), nota: t.value }; saveSoon(); }
});

document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'exVideo') { setExercicio(t.dataset.id, { video: t.value.trim() }); render(); }
  if (t.id === 'exFoto' && t.files[0]) reduzirFoto(t.files[0]).then(url => { setExercicio(t.dataset.id, { foto: url }); render(); toast('Foto salva'); });
  if (t.id === 'importArq' && t.files.length) importarArquivos(t.files).catch(() => toast('Não consegui ler o arquivo'));
  if (t.id === 'restaurar' && t.files[0]) t.files[0].text().then(txt => {
    let s;
    try { s = JSON.parse(txt); if (s.version !== 1) throw 0; } catch { return toast('Arquivo de backup inválido'); }
    confirmar('Restaurar o backup?', 'Os dados deste aparelho são substituídos pelos do arquivo.', 'Restaurar', () => { replaceState(s); render(); toast('Backup restaurado'); });
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

state.excecoes = state.excecoes || [];
state.lancamentos = state.lancamentos || [];
state.excecoesFin = state.excecoesFin || [];
state.recorrentes = state.recorrentes || [];
if (!state.settings.recorrentesDetectados && state.lancamentos.some(l => l.tipo === 'pagar')) detectarRecorrentes();
if (!state.settings.fixosDetectados) detectarFixos();
render();
sincronizarPastaLocal();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
