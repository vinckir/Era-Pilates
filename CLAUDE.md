# ERA Pilates: app de aulas (contexto para o Claude)

App web interno da **Jessica**, dona do **ERA Pilates** (Porto Alegre, bairro Auxiliadora). O projeto é tocado pelo Vinícius.
O objetivo é tirar da Jessica o peso de improvisar as aulas. O app sugere a aula de cada cliente com base no histórico, ela registra a aula com poucos toques e as anotações (texto ou ditado) alimentam as próximas sugestões.

Fale em **português (BR)**, de forma direta. O Vinícius não é programador: explique as decisões em linguagem simples.

## Estado atual (v0.3)
- HTML/CSS/JS puro com ES modules, **sem build** e sem dependências. Os arquivos estáticos já estão prontos para o Netlify (`netlify.toml`).
- Também está publicado como Artifact privado no claude.ai: https://claude.ai/artifact/9NGMuE1EdeUdtVGvHo5GNh (atualizar republicando `index.html` com os arquivos de `js/` e `styles.css`).
- Os dados ficam no **localStorage** do aparelho (`era-pilates.v1`), com backup e restauração em JSON na tela *Mais*. **Ainda não há backend.**
- Os dados reais (216 clientes e a agenda) foram exportados do Seu Fisio para `../Importacao App Aulas/`.
  - **No computador** (localhost), a pasta está ligada ao app como `.dados` (junção do Windows, no `.gitignore`) e o app importa sozinho ao abrir, e de novo quando os arquivos mudam (`sincronizarPastaLocal`).
    Se a junção sumir: `New-Item -ItemType Junction -Path App\.dados -Target "..\Importacao App Aulas"`.
  - **No link publicado / celular**, a importação é manual: *Mais → Importar do Seu Fisio*. O `.dados` nunca é publicado.
  **Nunca commitar dados de clientes** (nomes, telefones, agenda) no repositório.

## Arquivos
- `index.html`: casca, barra de abas e fontes da marca (Fraunces, Manrope e JetBrains Mono, do Google Fonts).
- `styles.css`: tokens de marca no topo, tirados do **Brand Book v1** (`../Era Pilates BrandBook/brand/`), e modo escuro (fundo café, texto creme, rosé como acento).
- `brand/`: logo **original** (símbolo e palavra, os mesmos recortes do site `Documentos/Era Pilates/Era Pilates Website/deploy/assets/`), usado como máscara CSS para a cor seguir o tema, e favicon do site. Ícones do app (`icon-*.png`): símbolo original creme sobre cacau.
  **Não usar os logos redesenhados do Brand Book** (pontas arredondadas, traço mais grosso): o Vinícius rejeitou. Do Brand Book vêm só cores, fontes e regras.
  **Logo horizontal = medidas aprovadas pelo Vinícius** no `Ajuste Logo Horizontal.html` do Brand Book: símbolo com 89% da altura da palavra, distância de 14% e símbolo 10% acima do centro (`.brand` em `styles.css`, com `--h` = altura da palavra). Não inventar outra composição.
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

## Regras da marca no app (Brand Book)
- Usar só as cores dos tokens. Texto principal café, nunca preto. Botão principal cacau com texto creme (`--primary`).
- Títulos em Fraunces (300/400, uma palavra em itálico quando fizer sentido). Texto em Manrope. Rótulos (`.eyebrow`) em JetBrains Mono, caixa alta, terracota.
- Peso máximo de fonte 500. Pedra (`--ink-3`) só para legendas de 14px ou mais. Cards 14px de raio, botões em pílula, sem sombras fortes nem gradientes.
- Ícones de traço fino (1,5px), sem preenchimento. Área de toque mínima de 44px.
- Tom de voz: frases curtas e serenas, falando com "você".

## Regras de interface
- Nada de `confirm()`/`alert()`/`prompt()`: dentro do claude.ai (moldura) e do painel do app eles não aparecem. Usar `confirmar()` (folha na própria tela).
- Tela *Mais* sem código, JSON ou formato técnico à vista: a Jessica só escolhe os arquivos do Seu Fisio.

## Regras de negócio já decididas
- Cada aula tem **1 ou 2 alunos** (dupla). No Seu Fisio, a dupla é feita de dois atendimentos separados no mesmo horário. Na importação, o app junta quem tem o mesmo data+hora.
- Cliente ativo ou inativo vem da *Situação* do Seu Fisio. Quem é **só massagem/drenagem** entra como inativo no app (`soMassagem: true`).
- Todo exercício começa como "a revisar". A Jessica faz a curadoria. O status "arquivado" nunca é sugerido.
- A metodologia é clássica, na linha de Joseph Pilates → Lolita San Miguel → Jacson Bonafé, com apoio contemporâneo e clínico. Os detalhes estão em `docs/metodologia.md`.

## Como testar
`python3 -m http.server 8000` e abrir `http://localhost:8000`. Para testes automatizados, usar o Playwright: abrir as telas, rodar o fluxo agenda → planejar semana → aula → marcar feito → finalizar e conferir que não há `pageerror`.

## Próximos passos (roadmap)
1. ~~Identidade visual oficial~~ (aplicada em 17/10/2026, a partir do Brand Book).
2. Backend gratuito (sugestão: **Supabase**, plano free) para sincronizar celular e computador e não depender do localStorage.
3. Rotina semanal (domingo) que lê o Seu Fisio (veja `docs/seufisio-importacao.md`) e atualiza a agenda no app.
4. Rotina com IA que lê as anotações e o histórico e prepara as sugestões da semana.
5. Ilustrações, fotos ou vídeos dos exercícios.
6. Relatório de evolução para o cliente e gamificação. Dados para stories e vídeos.
7. **Agenda própria** (decidido em 17/10/2026, virou a prioridade): plano por fases e mapa do Seu Fisio em `../Seu Fisio - Mapeamento/` (pasta local, fora do Git). Resumo: app, para a Jessica deixar de pagar o Seu Fisio. Precisa do backend, de confirmação e lembrete para os clientes e de controle de planos e pacotes.
