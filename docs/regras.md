# Premissas e Boas Práticas — Sistema Pousada da Nita

> **Documento-base para desenvolvimento com Google Antigravity (Agentes + Skills).**
> Este arquivo é a "constituição" do projeto. Todo agente do Antigravity deve lê-lo **antes** de planejar ou executar qualquer tarefa. Mantenha-o na raiz do repositório (ou como `AGENTS.md` de referência) e versionado no Git.

- **Projeto:** Sistema de gestão da Pousada da Nita
- **Local:** Mansidão – BA
- **Tipo:** Sistema local (operação em estabelecimento pequeno, foco em simplicidade e baixa manutenção)
- **Última atualização:** 19/06/2026
- **Status:** v1 — premissas iniciais (revisar a cada sprint)

---

## 1. Propósito deste documento

Este documento define **o que** o sistema deve ser e **como** ele deve ser construído por agentes de IA. Ele existe para que o Antigravity produza código consistente, alinhado ao negócio e ao padrão visual, sem depender de instruções repetidas a cada prompt.

Quando houver conflito, a ordem de prioridade é:

1. Segurança e integridade dos dados (pagamentos e dados de hóspedes)
2. Regras de negócio da pousada (Seção 4)
3. Padrões de arquitetura e código (Seções 5 e 7)
4. Preferências de estilo e UI (Seção 8)

---

## ⭐ REGRA DE OURO — Nunca entregar quebrado

> **Esta é a regra mais importante do projeto.** O dono do sistema **não pode** abrir o sistema e dar de cara com erro.

**Nenhuma tarefa é considerada "pronta" sem que o agente tenha, de fato, executado e validado.**

Antes de dizer que terminou, o agente **obrigatoriamente**:

1. **Roda/builda o sistema** e confirma que ele **abre e inicia sem erros** (console, terminal e tela).
2. **Testa o que mudou:** executa o fluxo exato que foi alterado e confirma o comportamento esperado.
3. **Faz um smoke test dos fluxos principais** para garantir que nada quebrou junto:
   - abrir o Dashboard (cards e lista carregam),
   - cadastrar um hóspede,
   - lançar um pagamento,
   - navegar entre as telas da barra lateral.
4. **Dá um veredito claro e explícito** ao final, sempre em uma destas formas:
   - ✅ **Testado e funcionando** — *(o que foi testado e como)*
   - ⚠️ **Não está funcionando** — *(o erro exato, onde aparece e o próximo passo)*
   - 🟡 **Não consegui testar** — *(o motivo; o que precisa ser feito para validar)*

**Proibições:**

- ❌ Nunca dizer "pronto", "feito" ou "implementado" sem ter rodado e testado.
- ❌ Nunca **supor** que funciona — tem que **comprovar**.
- ❌ Nunca esconder ou minimizar um erro. Se quebrou, avise na hora, com clareza.
- ❌ Se não der para testar, **diga isso explicitamente** — não finja que está ok.

> Se algo está quebrado e não dá para resolver agora, é melhor **avisar e deixar o sistema no último estado funcional** do que entregar algo que não abre.

---

## 2. Premissas do produto

- **Usuário principal:** a recepção/administração da pousada (poucas pessoas, perfil não técnico). A interface precisa ser **óbvia** e à prova de erro.
- **Sistema local:** roda no ambiente da pousada. Assuma **conectividade instável** — o sistema deve funcionar bem offline e não depender de serviços externos para tarefas do dia a dia.
- **Escala pequena, dados sensíveis:** o volume é baixo (dezenas de hóspedes/mês), mas os dados são sensíveis (CPF/telefone, valores, pagamentos). Simplicidade nunca pode comprometer a segurança.
- **Continuidade:** o sistema será mantido por poucos desenvolvedores. Prefira soluções simples, bem documentadas e fáceis de retomar a cada sprint, em vez de abstrações sofisticadas.

### 2.1 Escopo do MVP (baseado no painel atual)

| Módulo | Função | Prioridade |
|---|---|---|
| **Dashboard** | Faturamento total, hóspedes ativos, pagamentos pendentes, lista de hóspedes, pendências, atividade recente | Alta |
| **Hóspedes** | Cadastro (nome, telefone, quarto, check-in, check-out), listagem, busca, detalhes | Alta |
| **Pagamentos** | Lançamento de pagamento (hóspede, valor, método), status Pago/Pendente, histórico | Alta |
| **Relatórios** | Faturamento por período, pendências, ocupação | Média |
| **Configurações** | Quartos, métodos de pagamento, dados da pousada | Média |

### 2.2 Fora de escopo (por enquanto)

Integrações com OTAs (Booking/Airbnb), emissão fiscal, multiusuário com permissões complexas, app mobile separado. Registrar pedidos novos como _backlog_, não implementar por conta própria.

---

## 3. Glossário do domínio (linguagem ubíqua)

Agentes e skills devem usar **sempre** estes termos no código, nos commits e na UI:

- **Hóspede:** pessoa cadastrada com estadia.
- **Quarto:** unidade de hospedagem (ex.: 101, 102…).
- **Estadia / Reserva:** período entre `check-in` e `check-out` de um hóspede em um quarto.
- **Pagamento:** registro de valor recebido, com método e data.
- **Status:** `Pendente` (devendo) ou `Pago` (quitado).
- **Pendência:** estadia com saldo em aberto.
- **Faturamento:** soma dos pagamentos efetivados no período.

> Evite sinônimos misturados (ex.: "cliente" vs "hóspede"). Padronize em **hóspede**.

---

## 4. Regras de negócio (fonte da verdade)

Estas regras devem ser respeitadas pelo código e, idealmente, encapsuladas em uma **skill de domínio** (ver Seção 6.4):

1. Um hóspede sempre tem: nome completo, telefone, quarto, check-in e check-out.
2. `check-out` deve ser **posterior** a `check-in`.
3. Um quarto **não pode** ter duas estadias com datas sobrepostas (validar conflito de reserva).
4. O **Total** de uma estadia é calculado de forma única e centralizada (diária × nº de noites, ou valor fechado). Nunca duplique esse cálculo em telas diferentes.
5. **Status** é derivado dos pagamentos: `Pago` quando `soma dos pagamentos ≥ total`; caso contrário, `Pendente`. Não armazene status "solto" que possa divergir do valor real.
6. **Pagamentos pendentes** = soma dos saldos em aberto de todas as estadias ativas.
7. Todo pagamento registrado deve gerar entrada na **Atividade Recente**.
8. Valores monetários: armazenar em **inteiro (centavos)** ou tipo decimal exato — **nunca** `float`. Exibir como `R$ 1.234,56` (pt-BR).
9. Datas: armazenar em formato ISO (`AAAA-MM-DD`); exibir como `DD/MM/AAAA`.

> ⚠️ Qualquer mudança nessas regras é **decisão de negócio** e deve ser confirmada com a pessoa responsável antes de codar.

---

## 5. Princípios de arquitetura

- **Camadas claras:** separe `UI` → `lógica/serviços` → `acesso a dados`. Regras de negócio (Seção 4) ficam na camada de serviços, **nunca** dentro de componentes de tela.
- **Cálculo único:** total, status e faturamento têm uma única implementação reutilizada em todo o sistema.
- **Persistência local e confiável:** banco local (ex.: SQLite ou equivalente). Migrações versionadas e numeradas, aplicadas de forma idempotente.
- **Sem dependências desnecessárias:** cada nova biblioteca precisa de justificativa. Prefira o que já existe no stack.
- **Offline-first:** nenhuma operação essencial (cadastrar hóspede, lançar pagamento) deve falhar por falta de internet.

> Se o stack ainda não estiver definido, o agente deve **propor** uma opção simples e local, registrar a decisão (Seção 10) e aguardar aprovação — não escolher silenciosamente.

---

## 6. Como os agentes devem trabalhar no Antigravity

### 6.1 Fluxo padrão de qualquer tarefa

1. **Ler o contexto:** este documento + skills relevantes antes de qualquer código.
2. **Planejar:** apresentar um plano curto (arquivos a alterar, abordagem, riscos) **antes** de executar tarefas não triviais.
3. **Executar em passos pequenos e verificáveis:** uma unidade de valor por vez.
4. **Verificar (obrigatório — ver Regra de Ouro):** rodar o sistema, confirmar que abre sem erros, testar o fluxo alterado e fazer smoke test dos fluxos principais. Quando for UI, validar o comportamento de verdade (ex.: via walkthrough/Playwright).
5. **Entregar com veredito explícito:** resumir o que foi feito, decisões tomadas, **como testou** e o status final (✅ funcionando / ⚠️ não funcionando / 🟡 não testado).

### 6.2 Princípios de colaboração agente ↔ pessoa

- **Tarefas pequenas e revisáveis** valem mais que grandes blocos automáticos.
- Diante de ambiguidade em **regra de negócio**, perguntar — não adivinhar.
- Nunca apagar dados, sobrescrever migrações aplicadas ou reescrever histórico do Git sem confirmação explícita.
- Toda decisão relevante de arquitetura vira registro (Seção 10).

### 6.3 Conceito de Skills no Antigravity (divulgação progressiva)

Skills evitam o "inchaço de contexto": o agente vê só um **menu leve** (nome + descrição) e carrega as instruções completas (`SKILL.md`) **apenas quando a tarefa corresponde**. Por isso:

- **Cada skill faz uma coisa bem feita.** Em vez de uma skill "faz-tudo", crie skills separadas e específicas.
- **Descrição é tudo:** escreva descrições claras com as palavras que a pessoa realmente usaria. É assim que o agente decide acionar a skill.
- **Scripts como caixa-preta:** se a skill tiver scripts, instrua o agente a rodá-los com `--help` em vez de ler o código inteiro — isso economiza contexto.
- **Árvores de decisão:** em skills complexas, inclua uma seção que oriente o agente a escolher o caminho certo conforme a situação.
- **Escopo correto:**
  - **Workspace Skills** (`.agent/skills/` na raiz do projeto): específicas da pousada, versionadas no Git — toda a equipe usa o mesmo padrão.
  - **Global Skills** (`~/.gemini/antigravity/skills/`): utilitários pessoais que acompanham você entre projetos.

### 6.4 Skills recomendadas para este projeto (workspace)

Criar como skills versionadas em `.agent/skills/`:

| Skill | O que faz | Quando aciona |
|---|---|---|
| `regras-pousada` | Codifica as regras da Seção 4 (cálculo de total, status, conflito de quarto) | Qualquer tarefa que toque hóspedes, estadias ou pagamentos |
| `padrao-ui-pousada` | Design system: cores, tipografia, componentes (Seção 8) | Criar/alterar telas e componentes |
| `migracao-banco` | Protocolo seguro de migração (numeração, idempotência, backup antes) | "rodar/criar migração" |
| `commit-formatter` | Padroniza mensagens de commit (Seção 9) | Ao preparar commits |
| `revisao-codigo` | Revisa bugs, estilo e aderência a estas premissas | Antes de fechar uma feature |
| `gerar-testes` | Gera testes para regras de negócio e fluxos críticos | Após implementar lógica |

Modelo mínimo de `SKILL.md`:

```markdown
---
name: regras-pousada
description: Regras de negócio da Pousada da Nita — cálculo de total da estadia,
  status Pago/Pendente, faturamento e validação de conflito de quarto. Use sempre
  que a tarefa envolver hóspedes, estadias, pagamentos ou faturamento.
---

# Regras da Pousada da Nita
(instruções passo a passo + exemplos + casos de borda)
```

---

## 7. Padrões de código e qualidade

- **Nomes em português do domínio** para conceitos de negócio (`Hospede`, `calcularTotalEstadia`); termos técnicos consagrados podem ficar em inglês.
- **Funções pequenas e com responsabilidade única.** Regra de negócio não fica em componente de tela.
- **Tratamento de erros explícito:** nada de falha silenciosa em cadastro ou pagamento. Mensagens claras para o usuário não técnico.
- **Sem números mágicos:** diárias, métodos de pagamento e textos ficam em configuração/constantes.
- **Comentário só onde agrega** (explicar o "porquê", não o "o quê").
- **Lint/format automáticos** padronizados no projeto.

---

## 8. UI/UX — padrão visual (baseado no painel atual)

- **Tema:** escuro, fundo azul-petróleo profundo, com acentos em **azul/ciano**; verde para sucesso/ação positiva ("Pago", "Registrar Pagamento"), laranja/âmbar para alerta (pendências).
- **Identidade:** logotipo "Pousada da Nita – Mansidão-Ba" no topo da barra lateral.
- **Layout:** barra lateral fixa (Dashboard, Hóspedes, Pagamentos, Relatórios, Configurações) + área principal com cards de métricas no topo.
- **Componentes recorrentes:** cards de métrica, tabela de hóspedes, badges de status (`Pendente`/`Pago`), botões de ação ("Detalhes", "Pagar"), modais ("Novo Hóspede", "Lançamento de Pagamento"), toast de sucesso.
- **Princípios:**
  - Ações destrutivas pedem confirmação.
  - Feedback imediato após cada ação (toast/atividade recente).
  - Estados vazios e de carregamento sempre tratados.
  - Formatação pt-BR para datas e moeda.
  - Acessibilidade básica: contraste suficiente, áreas de toque grandes, foco visível.
- **Consistência:** reutilizar componentes existentes antes de criar novos. Toda nova tela segue a `padrao-ui-pousada`.

---

## 9. Git, versionamento e commits

- **Commits pequenos e descritivos**, no formato:
  `tipo(escopo): descrição` — ex.: `feat(pagamentos): registrar pagamento com método`
  Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- **Migrações nunca são editadas depois de aplicadas** — crie uma nova.
- **Branch + backup antes de mudanças grandes.** Não reescrever histórico remoto sem confirmação.
- Agente **propõe** commits/PR; a decisão de publicar é da pessoa.

---

## 10. Registro de decisões (ADR leve)

Toda decisão de arquitetura/negócio relevante vira uma entrada curta em `/docs/decisoes.md`:

```
## [Data] Título da decisão
Contexto: ...
Decisão: ...
Consequências: ...
```

Exemplos a registrar: escolha do banco, formato de armazenamento de valores, definição da diária, regra de cancelamento.

---

## 11. Segurança e proteção de dados (LGPD)

- Dados pessoais (nome, telefone, CPF) e financeiros são **sensíveis**. Coletar apenas o necessário.
- **Sem segredos no código** (senhas, tokens). Usar configuração/variáveis de ambiente.
- **Backup regular** do banco local; testar a restauração.
- **Skills de terceiros:** instalar só de fontes confiáveis e **ler os scripts** antes de usar. Desconfiar de skills que acessam endpoints externos, exportam dados ou alteram o ambiente; rodar em ambiente de menor privilégio.
- Logs não devem registrar dados sensíveis em texto claro.

---

## 12. Testes e Definition of Done

Uma tarefa só está **pronta** quando:

- [ ] **O sistema foi executado e abre sem erros** (Regra de Ouro — pré-requisito de tudo).
- [ ] **Os fluxos principais foram testados** (dashboard, cadastro de hóspede, lançamento de pagamento, navegação) e continuam funcionando.
- [ ] Atende às regras de negócio (Seção 4) e foi validada nos casos de borda.
- [ ] Tem testes para a lógica crítica (cálculo de total, status, conflito de quarto).
- [ ] Passou no lint/format e não quebrou testes existentes.
- [ ] UI segue o `padrao-ui-pousada` e trata estados vazio/erro/carregando.
- [ ] Não introduz dados sensíveis em logs nem segredos no código.
- [ ] Tem commit no padrão e, se aplicável, ADR registrado.
- [ ] Resumo de entrega traz o **veredito explícito** (✅ / ⚠️ / 🟡) e **como foi testado**.

---

## 13. Checklist rápido para o agente (antes de começar)

1. Li este documento e as skills relevantes?
2. Entendi a regra de negócio envolvida — ou preciso perguntar?
3. Apresentei um plano curto antes de executar?
4. A solução é simples, local e offline-resiliente?
5. Reutilizei componentes/skills existentes?
6. Como vou verificar o resultado?

---

### Como monitorar a qualidade das skills ao longo do tempo

- **Taxa de sucesso na 1ª tentativa:** meta 90%+ para skills maduras.
- **Taxa de intervenção humana:** deve cair com o tempo.
- **Testes de regressão:** mantenha um conjunto pequeno de tarefas-padrão por skill e rode após cada alteração.
- **Iteração com o próprio agente:** após uma execução boa, peça "resuma o que funcionou e os erros a evitar"; após falha, "o que deu errado ao usar esta skill?".
- **Quando o `SKILL.md` virar um romance, divida-o** em skills menores e específicas.

> Este documento evolui. Revise-o ao fim de cada sprint e mantenha-o como a referência única para os agentes.