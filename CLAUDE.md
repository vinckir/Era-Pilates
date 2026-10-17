# ERA Pilates: app de aulas (contexto para o Claude)

App web interno da **Jessica**, dona do **ERA Pilates** (Porto Alegre, bairro Auxiliadora). O projeto é tocado pelo Vinícius.
O objetivo é tirar da Jessica o peso de improvisar as aulas. O app sugere a aula de cada cliente com base no histórico, ela registra a aula com poucos toques e as anotações (texto ou ditado) alimentam as próximas sugestões.

Fale em **português (BR)**, de forma direta. O Vinícius não é programador: explique as decisões em linguagem simples.

## Estado atual (v0.2)
- HTML/CSS/JS puro com ES modules, **sem build** e sem dependências. Os arquivos estáticos já estão prontos para o Netlify (`netlify.toml`).
- Também está publicado como Artifact privado no claude.ai: https://claude.ai/artifact/9NGMuE1EdeUdtVGvHo5GNh (atualizar republicando `index.html` com os arquivos de `js/` e `styles.css`).
- Os dados ficam no **localStorage** do aparelho (`era-pilates.v1`), com backup e restauração em JSON na tela *Mais*. **Ainda não há backend.**
- Os dados reais (216 clientes e a agenda) foram exportados do Seu Fisio e importados **no aparelho**, pela tela *Mais → Importar do Seu Fisio*.
  **Nunca commitar dados de clientes** (nomes, telefones, agenda) no repositório.

## Arquivos
- `index.html`: casca, barra de abas e fontes (Cormorant Garamond + Jost).
- `styles.css`: tokens de marca no topo (**provisórios**: a identidade oficial do erapilates.com.br ainda não foi aplicada) e modo escuro.
- `js/exercicios.js`: base de 140 exercícios (`[id, nome, aparelho, nível, bloco, posição, foco, evitar, ajuda, origem, progressão, dica]`), mais BLOCOS, APARELHOS, RESTRICOES e OBJETIVOS.
- `js/sugestao.js`: motor de sugestão local.
  - Segue a ordem clássica dos blocos.
  - Repete exercícios para consolidar.
  - "Fácil" puxa a progressão (`prox`).
  - "Dor" exclui o exercício por 3 aulas.
  - O que estiver em `evitar` nunca é sugerido para quem tem aquela restrição.
  - `detectarRestricoes(texto)` lê as anotações.
- `js/store.js`: estado, persistência, utilidades de data (fuso local) e dados de exemplo (seed).
- `js/pictos.js`: pictogramas SVG (aparelho + posição do corpo).
- `js/app.js`: telas (agenda, aula, clientes, ficha, exercícios, curadoria, mais), folhas, ditado (Web Speech pt-BR) e importações.
- `docs/metodologia.md`: pesquisa sobre Jacson Bonafé, Lolita San Miguel e Pilates clássico.
- `docs/seufisio-importacao.md`: como extrair clientes e agenda do Seu Fisio.

## Modelo de dados (localStorage)
`{ version:1, settings:{aparelhos, soBase}, exOverrides:{[exId]:{status,nota,video,foto,adiado}}, exCustom:[], clientes:[{id,nome,nivel,objetivos[],restricoes[{tag,desde,temporaria}],obs,favoritos[],inativo,soMassagem,telefone,plano,ultimoAtendimento}], aulas:[{id,data,hora,clientes[≤2],status:'agendada'|'planejada'|'realizada',planos:{[clienteId]:{itens:[{exId,motivo,feito,fb}],aprovado}},notas:{[clienteId]:texto},origem}] }`

## Regras de negócio já decididas
- Cada aula tem **1 ou 2 alunos** (dupla). No Seu Fisio, a dupla é feita de dois atendimentos separados no mesmo horário. Na importação, o app junta quem tem o mesmo data+hora.
- Cliente ativo ou inativo vem da *Situação* do Seu Fisio. Quem é **só massagem/drenagem** entra como inativo no app (`soMassagem: true`).
- Todo exercício começa como "a revisar". A Jessica faz a curadoria. O status "arquivado" nunca é sugerido.
- A metodologia é clássica, na linha de Joseph Pilates → Lolita San Miguel → Jacson Bonafé, com apoio contemporâneo e clínico. Os detalhes estão em `docs/metodologia.md`.

## Como testar
`python3 -m http.server 8000` e abrir `http://localhost:8000`. Para testes automatizados, usar o Playwright: abrir as telas, rodar o fluxo agenda → planejar semana → aula → marcar feito → finalizar e conferir que não há `pageerror`.

## Próximos passos (roadmap)
1. Identidade visual oficial: cores, fontes e logo do site e do projeto no Claude Design.
2. Backend gratuito (sugestão: **Supabase**, plano free) para sincronizar celular e computador e não depender do localStorage.
3. Rotina semanal (domingo) que lê o Seu Fisio (veja `docs/seufisio-importacao.md`) e atualiza a agenda no app.
4. Rotina com IA que lê as anotações e o histórico e prepara as sugestões da semana.
5. Ilustrações, fotos ou vídeos dos exercícios.
6. Relatório de evolução para o cliente e gamificação. Dados para stories e vídeos.
7. Mais adiante: **agenda própria** no app, para a Jessica deixar de pagar o Seu Fisio. Precisa do backend, de confirmação e lembrete para os clientes e de controle de planos e pacotes.
