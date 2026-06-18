#!/usr/bin/env python3
"""
Nome do Script: update_clickup.py
Diretriz Relacionada: Atualização de status no ClickUp
Descrição: Cria uma nova tarefa na lista do ClickUp informando sobre as atualizações.

Entradas:
    - args[1]: API Token
    - args[2]: List ID

Saídas:
    - Status de sucesso ou falha da criação da tarefa.
"""

import sys
import json
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 3:
        print("[ERRO] Faltam argumentos. Uso: python update_clickup.py <API_TOKEN> <LIST_ID>", file=sys.stderr)
        sys.exit(1)

    api_token = sys.argv[1]
    list_id = sys.argv[2]
    task_name = sys.argv[3] if len(sys.argv) > 3 else "Atualização do Projeto"
    task_desc = sys.argv[4] if len(sys.argv) > 4 else "Tarefa criada por automação"
    
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task"
    
    payload = {
        "name": task_name,
        "description": task_desc,
        "status": "TO DO"
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(url, data=data)
    req.add_header('Authorization', api_token)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                resp_data = json.loads(response.read().decode('utf-8'))
                print(f"Tarefa criada com sucesso! ID da Tarefa: {resp_data.get('id')}")
            else:
                print(f"[ERRO] Falha ao criar a tarefa. HTTP Status: {response.status}", file=sys.stderr)
                sys.exit(1)
    except urllib.error.URLError as e:
        print(f"[ERRO] Erro na requisição: {e.reason}", file=sys.stderr)
        if hasattr(e, 'read'):
            print(f"[ERRO] Resposta: {e.read().decode('utf-8')}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
