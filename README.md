# 🚀 Workflows — Arquitetura de 3 Camadas

Sistema de automação construído sobre uma arquitetura que separa **intenção**, **decisão** e **execução** para maximizar confiabilidade.

## 🏗️ A Arquitetura

```
Workflows/
├── 📋 directives/          ← Camada 1: O QUE fazer (POPs em Markdown)
│   ├── README.md            ← Documentação da camada
│   ├── _template.md         ← Template para novas diretrizes
│   └── [suas_diretrizes].md ← Suas diretrizes vão aqui
│
├── ⚙️ execution/            ← Camada 3: O TRABALHO PESADO (Scripts Python)
│   ├── README.md            ← Documentação da camada
│   └── [seus_scripts].py   ← Seus scripts vão aqui
│
├── .env.example             ← Modelo de variáveis de ambiente
├── .env                     ← Suas credenciais (NÃO commitado)
├── .gitignore               ← Proteção de arquivos sensíveis
├── AGENTS.md                ← Instruções do agente (espelhado)
└── README.md                ← Este arquivo
```

> **Camada 2 (Orquestração)** é o próprio agente de IA — ele lê as diretrizes, executa os scripts e toma decisões.

## 🔄 Como o Sistema Funciona

```
┌─────────────────────┐
│    Usuário pede     │
│    uma tarefa       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  🧠 Camada 2        │
│  (Orquestração)     │
│                     │
│  1. Lê a diretriz   │
│  2. Prepara inputs  │
│  3. Executa script  │
│  4. Trata erros     │
│  5. Retorna output  │
│  6. Atualiza POP    │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐ ┌────────┐
│📋 Dir. │ │⚙️ Exec.│
│Camada 1│ │Camada 3│
└────────┘ └────────┘
```

## 📊 Por Que Essa Arquitetura?

| Abordagem          | 5 etapas com 90%/etapa | Resultado |
|--------------------|------------------------|-----------|
| ❌ Tudo na IA      | 0.90⁵                 | **59%**   |
| ✅ Scripts + IA    | Decisão IA + Execução determinística | **~95%+** |

## 🚦 Começando

1. **Copie** o `.env.example` para `.env` e preencha suas credenciais
2. **Crie sua primeira diretriz** copiando `directives/_template.md`
3. **Crie o script** correspondente em `execution/`
4. **Peça ao agente** para executar a tarefa — ele seguirá o fluxo automaticamente

## 📖 Loop de Auto-recuperação

Quando algo falha, o sistema fica **mais forte**:

1. 🔍 **Identifica** o erro
2. 🔧 **Corrige** o script
3. ✅ **Testa** novamente
4. 📝 **Atualiza** a diretriz com o aprendizado

---

*Construído com a filosofia: "Delegue a complexidade para código determinístico."*
