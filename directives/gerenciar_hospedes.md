# Diretriz: Gerenciar Hóspedes (Pousada Nita)

**Objetivo**: Orientar o Agente de IA na leitura e inserção de dados de hóspedes no Supabase, utilizando a arquitetura de 3 camadas através de scripts de execução determinísticos.

## Contexto
O banco de dados do Supabase armazena informações críticas dos hóspedes da Pousada. Para garantir a consistência e confiabilidade, todas as interações com o banco devem ser realizadas estritamente pelos scripts de execução em `execution/`, evitando improvisações ou conexões diretas via outras libs.

## Ferramentas Disponíveis
- **Listar Hóspedes**: `execution/listar_hospedes.py`
- **Adicionar Hóspedes**: `execution/adicionar_hospede.py`

---

## 1. Listar Hóspedes

### Quando utilizar
Sempre que o usuário solicitar para ver quem está hospedado, buscar a lista de check-ins/check-outs de hoje ou confirmar a disponibilidade de quartos com base nos clientes.

### Execução
Invoque o script Python (nenhum argumento extra é necessário).
```bash
python execution/listar_hospedes.py
```

### Processamento do Output
O script retornará um objeto JSON contendo um status de sucesso ou erro, a contagem de registros e o array de dados. Apresente os dados ao usuário de forma amigável e conversacional.

---

## 2. Adicionar Hóspede

### Quando utilizar
Quando o usuário informar que há um novo hóspede ou pedir para efetuar um cadastro.

### Entradas Obrigatórias (Coletar antes de executar)
Antes de chamar a ferramenta, certifique-se de que o usuário forneceu as seguintes informações:
1. Nome completo (`--nome`)
2. CPF (`--cpf`)
3. Data de Check-in (`--checkin` no formato YYYY-MM-DD)
4. Data de Check-out (`--checkout` no formato YYYY-MM-DD)
5. Número do Quarto (`--quarto`)

### Entradas Opcionais
- Telefone (`--telefone`)
- Status do Pagamento (`--status`, padrão é "pendente")

### Execução
Chame o script passando os argumentos nomeados (use aspas nas strings que contiverem espaços).
```bash
python execution/adicionar_hospede.py --nome "Maria da Silva" --cpf "111.222.333-44" --telefone "11988887777" --checkin "2026-07-10" --checkout "2026-07-15" --quarto "203" --status "pago"
```

### Tratamento de Casos Extremos (Edge Cases)
- Se a API retornar `"status": "error"` avisando que o CPF já existe, não insista na criação. Avise o usuário que o hóspede já está cadastrado no sistema.
- Se ocorrer erro de formatação de data, corrija a string da data para `YYYY-MM-DD` e inicie o loop de Self-anneal (conforme AGENTS.md) para tentar novamente.
