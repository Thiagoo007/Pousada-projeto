# Estado Atual do Projeto: Pousada da Nita

## O que já foi feito (Concluído)
- **Arquitetura Base**: Configuração da estrutura de 3 camadas (`directives/` e `execution/`).
- **Agentes e Automação**:
  - Configuração do manifesto do sistema (`AGENTS.md`, `README.md`).
- **Integração ClickUp**:
  - Scripts criados para ler, avançar status e atualizar tarefas no ClickUp.
  - Criação da diretriz `protocolo_clickup.md` para controle de fluxo e Sprints.
- **Banco de Dados (Supabase)**:
  - Criação da tabela `hospedes` com políticas de segurança RLS (`schema.sql`).
  - Container Docker do Supabase inicializado localmente e credenciais capturadas.
  - Scripts CLI em Python (`adicionar_hospede.py`, `listar_hospedes.py`, `buscar_hospedes_por_quarto.py`) com validação de CPF e log de auditoria.
- **Frontend Web**:
  - Criado o diretório `frontend/` com `index.html`, `styles.css` e `app.js`.
  - Interface Premium usando Glassmorphism e Vanilla CSS.
  - Conexão direta com Supabase-js usando as credenciais do ambiente local.
  - Dashboard funcional para listar, adicionar e pesquisar hóspedes.

## Estado Atual do Repositório (Onde estamos)
- A infraestrutura de back-end (Supabase) e a interface de front-end (HTML/JS) estão integradas e operacionais para a Sprint 1.

## O que está sendo feito / Próximos Passos
- **Sprint 2**: Implementação de sistema de pagamentos. *(Concluído)*
  - Criada tabela `pagamentos` com migração no Supabase.
  - Criado modal de "Lançar Pagamento" no frontend.
  - Atualização automática do status do hóspede para "Pago".

- **Sprint 3**: Relatórios Financeiros (Dashboard) *(Concluído)*
  - Incluídos 3 cards no topo da página: Faturamento Total, Hóspedes Ativos, Pagamentos Pendentes.
  - Integração via `app.js` para recálculo automático em tempo real sempre que um pagamento é feito.
