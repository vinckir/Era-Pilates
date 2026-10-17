-- ERA Pilates: banco do app no Supabase.
-- Como usar: Supabase → SQL Editor → New query → colar tudo → trocar os dois e-mails no fim → Run.
--
-- Como funciona:
-- * Os dados do app ficam numa linha só (tabela "estados", coluna "dados"), no mesmo formato
--   que o app já usa no aparelho. Celular e computador leem e salvam essa linha.
-- * "versao" evita que um aparelho apague sem querer o que o outro salvou.
-- * Só os e-mails da tabela "membros" conseguem ler ou salvar (RLS). Ninguém mais, nem com a chave pública.
-- * Cada vez que os dados mudam, a versão anterior vai para "estados_historico" (guarda as 30 últimas).

create table if not exists public.estados (
  id text primary key,
  dados jsonb not null,
  versao bigint not null default 1,
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);

create table if not exists public.membros (
  email text primary key
);

create table if not exists public.estados_historico (
  id bigserial primary key,
  estado_id text not null,
  dados jsonb not null,
  versao bigint,
  salvo_em timestamptz not null default now(),
  salvo_por text
);

alter table public.estados enable row level security;
alter table public.membros enable row level security;          -- sem regra: ninguém lê pela internet
alter table public.estados_historico enable row level security;

create or replace function public.eh_membro() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where email = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "membros leem" on public.estados;
drop policy if exists "membros criam" on public.estados;
drop policy if exists "membros salvam" on public.estados;
drop policy if exists "membros leem historico" on public.estados_historico;

create policy "membros leem" on public.estados for select to authenticated using (public.eh_membro());
create policy "membros criam" on public.estados for insert to authenticated with check (public.eh_membro());
create policy "membros salvam" on public.estados for update to authenticated using (public.eh_membro()) with check (public.eh_membro());
create policy "membros leem historico" on public.estados_historico for select to authenticated using (public.eh_membro());

create or replace function public.guardar_historico() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.estados_historico (estado_id, dados, versao, salvo_por)
  values (old.id, old.dados, old.versao, old.atualizado_por);
  delete from public.estados_historico
  where estado_id = old.id
    and id not in (select id from public.estados_historico where estado_id = old.id order by id desc limit 30);
  return new;
end $$;

drop trigger if exists estados_historico on public.estados;
create trigger estados_historico before update on public.estados
for each row execute function public.guardar_historico();

-- Troque pelos e-mails de login (em minúsculas) e rode.
insert into public.membros (email) values
  ('EMAIL-DO-VINICIUS'),
  ('EMAIL-DA-JESSICA')
on conflict do nothing;
