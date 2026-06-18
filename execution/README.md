# ⚙️ Execução (Camada 3)

Este diretório contém os **scripts determinísticos** que realizam o trabalho pesado do sistema.

## O que são Scripts de Execução?

São programas em Python (ou outras linguagens) responsáveis por:

- 🔌 Chamadas de API
- 📊 Processamento de dados
- 📁 Operações de arquivos
- 🗄️ Interações com banco de dados
- 🌐 Web scraping
- 🤖 Automações diversas

## Princípios dos Scripts

1. **Determinísticos** — Mesma entrada = mesma saída, sempre
2. **Confiáveis** — Tratamento robusto de erros
3. **Testáveis** — Funções modulares e isoladas
4. **Rápidos** — Otimizados para performance
5. **Bem comentados** — Código auto-documentado

## Estrutura Recomendada de um Script

```python
#!/usr/bin/env python3
"""
Nome do Script: nome_do_script.py
Diretriz Relacionada: directives/nome_da_diretriz.md
Descrição: Breve descrição do que este script faz.

Entradas:
    - Parâmetro 1: descrição
    - Parâmetro 2: descrição

Saídas:
    - Descrição do output

Dependências:
    - biblioteca_x >= 1.0
"""

import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()


def main():
    """Função principal do script."""
    try:
        # Lógica principal aqui
        pass
    except Exception as e:
        print(f"[ERRO] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

## Regras Importantes

1. **Nunca armazene credenciais no código** — Use o arquivo `.env`
2. **Sempre trate erros** — Mensagens claras e códigos de saída apropriados
3. **Prefira scripts a soluções manuais** — A automação é sempre mais confiável
4. **Verifique se já existe** um script antes de criar um novo
