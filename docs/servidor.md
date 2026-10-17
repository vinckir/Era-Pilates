# Servidor: Supabase + Netlify

Objetivo: a Jessica usa o app no celular com os mesmos dados do computador.

## Como vai funcionar
- **Supabase** (plano grátis) guarda os dados e cuida do login. Região: São Paulo.
- **Netlify** (plano grátis) publica o app num endereço próprio (ex.: `erapilates.netlify.app`), que vira app instalado no celular. Ele atualiza sozinho a cada versão nova enviada ao GitHub.
- O link do claude.ai continua existindo, mas o app de verdade passa a ser o do Netlify. O claude.ai pode bloquear a conexão com o Supabase.
- Os dados ficam numa linha do banco, no mesmo formato de hoje. Cada aparelho guarda uma cópia para funcionar sem internet no estúdio e sincroniza quando volta.
- Login com e-mail e senha. Só os e-mails da lista de membros entram. O cadastro aberto fica desligado: os usuários são criados no painel do Supabase.
- Toda alteração guarda a versão anterior (30 últimas), para desfazer um erro.

## O que o Vinícius cria (uma vez)

### 1. Supabase
1. Criar conta em supabase.com (pode entrar com o GitHub).
2. **New project**: nome `era-pilates`, região **South America (São Paulo)**, plano Free. Criar uma senha do banco e guardar no gerenciador de senhas (não precisa mandar para o Claude).
3. **SQL Editor → New query**: colar o conteúdo de `supabase/schema.sql`, trocar os dois e-mails no fim e clicar em **Run**.
4. **Authentication → Sign In / Providers → Email**: deixar e-mail ligado e **desligar "Allow new users to sign up"**.
5. **Authentication → Users → Add user → Create new user**: criar o usuário da Jessica e o seu, com senha, marcando "Auto Confirm User".
6. **Project Settings → API** (ou "Data API"): copiar a **Project URL** e a chave **anon / publishable** e mandar para o Claude.
   **Nunca mandar a chave `service_role` / secret.**

### 2. Netlify
1. Criar conta em netlify.com (entrar com o GitHub).
2. **Add new site → Import an existing project → GitHub** → escolher `vinckir/Era-Pilates`, branch `main`.
3. Publish directory: `.` (já está no `netlify.toml`). Deploy.
4. Mandar para o Claude o endereço do site. Se quiser, trocar o nome em Site configuration → Change site name (ex.: `erapilates`).
5. No Supabase, em **Authentication → URL Configuration**, colocar esse endereço em Site URL.

## O que o Claude faz depois
- `js/config.js` com a URL e a chave pública. Por desenho do Supabase, essa chave pode ficar no app; quem protege os dados são as regras de membros.
- Tela de login e sincronização (carregar ao abrir, salvar alguns segundos depois de cada mudança, aviso se outro aparelho salvou antes).
- Primeira subida: os dados completos do computador (clientes, histórico, financeiro) vão para o banco.
- Instalação no celular da Jessica: abrir o endereço do Netlify, entrar com o e-mail dela e "Adicionar à tela de início".
