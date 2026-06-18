# Protocolo de Atualização do ClickUp

## Objetivo
Garantir que o usuário acompanhe o desenvolvimento do projeto em tempo real, mantendo os cards do ClickUp sempre sincronizados com o progresso das tarefas desenvolvidas pelos agentes.

## Entradas
- ID da Tarefa no ClickUp (obtido ao listar as tarefas da Sprint atual ou por contexto).
- Status desejado (`in progress`, `done`, `to do`, etc.).

## Ferramentas Utilizadas
- `execution/list_clickup_tasks.py` — Para buscar a lista atual de tarefas e encontrar o ID correto.
- `execution/advance_clickup_task.py` — Para atualizar o status da tarefa no ClickUp (ex: `python execution/advance_clickup_task.py <API_TOKEN> <TASK_ID> <STATUS>`).

## Fluxo de Execução Obrigatório
Sempre que um agente for iniciar o desenvolvimento de uma nova funcionalidade, correção ou tarefa:
1. **Identificar a Tarefa**: Encontre o ID do card correspondente ao que será desenvolvido.
2. **Iniciar o Trabalho**: Use o script `advance_clickup_task.py` para mover o status do card para `"in progress"`.
3. **Desenvolver**: Execute o plano de implementação e a escrita de código.
4. **Validação**: Assim que a tarefa for testada localmente pelo agente, use o script `advance_clickup_task.py` para mover o card para um status de validação (ex: `"in review"`, `"testing"`, ou `"validation"`). Adicione as evidências dos testes nos comentários ou descrição da tarefa.
5. **Aprovação Final**: O agente **NUNCA** deve mover a tarefa para `"done"` ou `"complete"`. Apenas o usuário tem permissão para testar e passar o card para concluído.

## Saídas Esperadas
- O quadro do ClickUp refletirá exatamente no que o agente está trabalhando no momento, sem necessidade do usuário perguntar.

## Casos Extremos
- **Tarefa não existe no ClickUp**: Se o agente vai desenvolver algo que não tem card, ele deve criar um usando `execution/update_clickup.py` antes de começar.
- **Erro de Autenticação/API**: Notificar o usuário imediatamente para renovar o API Token caso as requisições falhem.

## Histórico de Aprendizados
- [2026-06-18] — Protocolo criado por solicitação do usuário para dar transparência ao desenvolvimento.
