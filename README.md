# ERA Pilates: app de aulas

App web interno da Jessica (ERA Pilates, Porto Alegre) para **planejar, dar e registrar aulas** sem precisar improvisar.
Não tem build: são arquivos estáticos prontos para o Netlify, e no celular ele pode ser instalado como app ("Adicionar à tela inicial").

## O que já faz (v0.1)

- **Agenda**: abre no dia de hoje, navega pela semana e mostra as aulas (1 ou 2 alunos). O botão **Planejar semana** sugere todas as aulas de uma vez.
- **Aula**:
  - Plano por aluno, organizado nos blocos da aula clássica.
  - Cada exercício tem pictograma, nível, o motivo da sugestão e a dica de execução.
  - Dá para trocar, tirar ou adicionar exercícios, copiar o plano para a dupla (respeitando as restrições dela) e aprovar o plano.
  - Durante a aula, a Jessica toca para marcar o que foi feito e avalia com *fácil / ok / difícil / dor*.
  - As anotações podem ser **ditadas** (pt-BR). Quando o texto fala em dor, o app sugere registrar uma restrição.
- **Clientes**: ficha com nível, restrições (fixas ou temporárias), objetivos, observações, evolução (aulas, exercícios diferentes, progressões, frequência semanal) e histórico.
  Ativo/inativo por cliente (inativos saem da lista e da marcação de aulas, mas guardam o histórico). Importação colada direto de planilha (nome, telefone, situação).
- **Duplas**: cada aula tem até 2 alunos, editáveis a qualquer momento; dá para cadastrar a segunda pessoa na hora, mesmo que ela não tenha cadastro no sistema de agendamento.
- **Exercícios**: 140 na base inicial, com filtro por aparelho e status, **curadoria** (manter / arquivar / depois), nota pessoal, link de vídeo e foto própria.
- **Mais**:
  - Liga e desliga os aparelhos do estúdio.
  - Importa a agenda colando texto ou JSON.
  - Importa clientes em lote.
  - Faz backup e restauração.
  - Remove os dados de exemplo.

A metodologia e as fontes estão em [`docs/metodologia.md`](docs/metodologia.md).

## Publicar no Netlify

1. Em app.netlify.com: **Add new site → Import from Git**, escolha este repositório. O diretório de publicação é `.` (já configurado no `netlify.toml`).
   Outra opção: arrastar a pasta do projeto para o **Netlify Drop**.
2. No celular da Jessica, abra o link e use **Compartilhar → Adicionar à Tela de Início** no iPhone, ou **Instalar app** no Android.

## Rodar localmente

```bash
python3 -m http.server 8000   # depois abra http://localhost:8000
```

## Onde ficam os dados

Hoje tudo fica **no próprio aparelho** (localStorage), por isso o backup é importante. A sincronização entre celular e computador e a leitura automática da agenda precisam de um backend (veja o roadmap).

## Formato da agenda (para a rotina automática)

```json
{ "aulas": [ { "data": "2026-10-20", "hora": "08:00", "clientes": ["Ana Souza", "Bruno Lima"] } ] }
```

Também aceita uma aula por linha: `2026-10-20 08:00 Ana Souza, Bruno Lima`. Clientes que ainda não existem são criados.

## Identidade visual

Aplicada a partir do Brand Book v1 do ERA Pilates (outubro/2026): paleta creme, terracota e cacau, fontes Fraunces, Manrope e JetBrains Mono, logo e ícone oficiais. Os valores ficam nos tokens no topo de `styles.css`.

## Roadmap

2. Importar os clientes ativos do sistema de agendamento.
3. Backend leve (ex.: Supabase) para sincronizar os aparelhos e deixar uma rotina semanal ler a agenda e gravar as aulas.
4. Rotina com IA que lê as anotações e o histórico e reescreve as sugestões da semana.
5. Ilustrações, fotos ou vídeos próprios dos exercícios.
6. Relatório de evolução para o cliente e gamificação (marcos, sequências), além de dados para stories e vídeos.
