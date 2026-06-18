# 📋 Diretrizes (Camada 1)

Este diretório contém os **Procedimentos Operacionais Padrão (POPs)** do sistema.

## O que são Diretrizes?

Diretrizes são documentos em Markdown que definem **o que fazer**. Cada diretriz é como uma receita completa para uma tarefa específica, contendo:

- **Objetivo**: O que a tarefa deve alcançar
- **Entradas (Inputs)**: Dados ou parâmetros necessários
- **Ferramentas/Scripts**: Quais scripts de `execution/` devem ser utilizados
- **Saídas (Outputs)**: O resultado esperado
- **Casos Extremos (Edge Cases)**: Situações excepcionais e como tratá-las

## Como criar uma nova Diretriz

Use o template abaixo como base para novas diretrizes:

```markdown
# Nome da Diretriz

## Objetivo
Descreva claramente o que esta tarefa deve alcançar.

## Entradas
- `entrada_1`: Descrição
- `entrada_2`: Descrição

## Ferramentas Utilizadas
- `execution/nome_do_script.py` — O que ele faz

## Fluxo de Execução
1. Passo 1
2. Passo 2
3. Passo 3

## Saídas Esperadas
- Descrição do resultado esperado

## Casos Extremos
- **Cenário X**: Como tratar
- **Cenário Y**: Como tratar

## Histórico de Aprendizados
- [Data] — Descrição do aprendizado
```

## Regras Importantes

1. **Diretrizes são documentos vivos** — Atualize-as sempre que aprender algo novo
2. **Nunca crie ou sobrescreva** uma diretriz sem permissão do usuário
3. **Escreva como se fosse para um dev pleno** — Linguagem clara e estruturada
4. **Sempre inclua a seção de Aprendizados** — É o que torna o sistema cada vez mais forte
