// Sincronização com o Supabase sem biblioteca: login por e-mail e senha (Auth) e
// leitura/gravação da linha de estado (REST). Os dados continuam no aparelho
// (funciona sem internet) e sobem alguns segundos depois de cada mudança.

import { SUPABASE_URL, SUPABASE_KEY, ESTADO_ID } from './config.js';

const K_SESSAO = 'era-pilates.sessao', K_META = 'era-pilates.nuvem';
const ler = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const gravar = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const nuvemLigada = () => !!(SUPABASE_URL && SUPABASE_KEY);
export const sessao = () => ler(K_SESSAO);
export const meta = () => ler(K_META) || { versao: null, pendente: false, ultima: null };
const setMeta = patch => gravar(K_META, { ...meta(), ...patch });

class ErroNuvem extends Error { constructor(msg, tipo) { super(msg); this.tipo = tipo; } }

async function pedir(caminho, opcoes = {}, comToken = true) {
  const headers = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if (comToken) headers.Authorization = 'Bearer ' + await token();
  let r;
  try { r = await fetch(SUPABASE_URL + caminho, { ...opcoes, headers }); }
  catch { throw new ErroNuvem('Sem conexão com o servidor', 'rede'); }
  const corpo = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) {
    const msg = corpo?.error_description || corpo?.msg || corpo?.message || `Erro ${r.status}`;
    throw new ErroNuvem(msg, r.status === 401 || r.status === 403 ? 'acesso' : 'servidor');
  }
  return corpo;
}

function guardarSessao(s) {
  gravar(K_SESSAO, { access_token: s.access_token, refresh_token: s.refresh_token, expira: Date.now() + (s.expires_in || 3600) * 1000, email: s.user?.email || sessao()?.email });
}

export async function entrar(email, senha) {
  const s = await pedir('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password: senha }) }, false)
    .catch(e => { throw e.tipo === 'rede' ? e : new ErroNuvem('E-mail ou senha incorretos', 'acesso'); });
  guardarSessao(s);
  return s.user?.email;
}

export function sair() { gravar(K_SESSAO, null); gravar(K_META, null); }

async function token() {
  const s = sessao();
  if (!s) throw new ErroNuvem('Entre com o e-mail do estúdio', 'acesso');
  if (Date.now() < s.expira - 60000) return s.access_token;
  const novo = await pedir('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: s.refresh_token }) }, false)
    .catch(e => { if (e.tipo !== 'rede') gravar(K_SESSAO, null); throw e; });
  guardarSessao(novo);
  return novo.access_token;
}

export async function versaoRemota() {
  const r = await pedir(`/rest/v1/estados?id=eq.${ESTADO_ID}&select=versao`);
  return r?.[0]?.versao ?? null;
}

export async function baixar() {
  const r = await pedir(`/rest/v1/estados?id=eq.${ESTADO_ID}&select=dados,versao`);
  return r?.[0] || null;
}

// Grava só se ninguém salvou antes (mesma versão). Se outro aparelho salvou, a versão dele
// fica no histórico do banco e esta grava por cima, avisando quem chamou.
export async function enviar(dados) {
  const m = meta(), quem = sessao()?.email || '';
  if (m.versao == null) {
    const atual = await versaoRemota();
    if (atual == null) {
      await pedir('/rest/v1/estados', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ id: ESTADO_ID, dados, versao: 1, atualizado_por: quem }) });
      setMeta({ versao: 1, pendente: false, ultima: new Date().toISOString() });
      return { versao: 1, sobrescreveu: false };
    }
    m.versao = atual;
  }
  const corpo = JSON.stringify({ dados, versao: m.versao + 1, atualizado_em: new Date().toISOString(), atualizado_por: quem });
  let r = await pedir(`/rest/v1/estados?id=eq.${ESTADO_ID}&versao=eq.${m.versao}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: corpo });
  let sobrescreveu = false;
  if (!r?.length) {
    const atual = await versaoRemota();
    sobrescreveu = true;
    r = await pedir(`/rest/v1/estados?id=eq.${ESTADO_ID}&versao=eq.${atual}`, { method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ dados, versao: atual + 1, atualizado_em: new Date().toISOString(), atualizado_por: quem }) });
    if (!r?.length) throw new ErroNuvem('Outro aparelho está salvando agora; tento de novo em instantes', 'servidor');
  }
  setMeta({ versao: r[0].versao, pendente: false, ultima: new Date().toISOString() });
  return { versao: r[0].versao, sobrescreveu };
}

export const marcarPendente = () => setMeta({ pendente: true });
export const marcarBaixado = versao => setMeta({ versao, pendente: false, ultima: new Date().toISOString() });
