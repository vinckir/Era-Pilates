# Importar clientes e agenda do Seu Fisio

O caminho foi levantado em 17/10/2026, numa leitura feita pelo Cowork com a conta da Jessica logada no Chrome. Tudo foi feito **só em modo leitura**: nada é alterado no Seu Fisio.

## Clientes
**Relatórios → Clientes** (`app.seufisio.com.br/relatorio/cliente`), aba Geral.
1. Em **Situação**, escolha “Ativos/Inativos”. Cuidado: as opções mudam de lugar, e é fácil pegar “Todas as Prospecções” por engano.
2. Na lista de colunas, marque **Situação**.
3. Clique em **Filtrar**. Aparecem Matrícula, Nome, Situação, Gênero, Idade, Telefone e Atendimentos, com 100 por página. Também existe o botão **Exportar XLS**.

O menu Clientes (`/clientes`) mostra os totais de ativos e o card de inativos. Serve para conferir o resultado.

## Atendimentos (último atendimento e agenda)
**Relatórios → Atendimentos gerais** (`/relatorio/atendimento`).
1. Preencha a data inicial e a final. Os campos já vêm com o mês atual, então **apague antes de digitar**.
2. Clique em **Filtrar**. Aparecem Nº, Cliente, Profissional, Data/Hora, Tipo de Atendimento, Status e OBS, com 100 por página.
3. Para montar a agenda:
   - Use status **“Aguardando Chegar”** e tipos que começam com **“Pilates”**.
   - Ignore “Ausência Justificada”, massagem e drenagem.
4. Para o último atendimento, use a data mais recente com status **“Finalizado”**.

## Cuidados
- A tabela corta nomes longos com “...”. Para achar o nome completo, compare com o começo do nome na base de clientes.
- **Duplas** não existem como tipo no Seu Fisio. São dois atendimentos separados no mesmo horário, então basta juntar por data e hora.
- No histórico há horários com 3 atendimentos (família) e a mesma pessoa duas vezes no mesmo horário (Pilates + massagem). O app aceita no máximo 2 alunos por aula e ignora nomes repetidos.
- Existe uma API interna (`api.seufisio.com.br/api/...`), mas ela recusa chamadas de fora do app (erro 426). Para a rotina semanal, use os relatórios ou o Exportar XLS.
- Existem cadastros duplicados, com o mesmo nome e o mesmo telefone. A exportação marca o antigo com “duplicado” na Observação, e o app ignora essas linhas.

## Formato que o app importa
**Clientes**: arquivo `.tsv` com cabeçalho `Nome	Telefone	Situação	Último atendimento	Observação`.
- Na Observação vai o plano (por exemplo “Plano: Pilates 2 x semana”) ou “Só massagem/drenagem”.

**Agenda**: arquivo `.json` neste formato:
```json
{ "aulas": [ { "data": "2026-10-20", "hora": "08:00", "clientes": ["Nome 1", "Nome 2"] } ] }
```

No app, os dois arquivos entram juntos por **Mais → Importar do Seu Fisio → Escolher arquivos**.
