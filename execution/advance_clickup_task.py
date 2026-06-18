#!/usr/bin/env python3
"""
Nome do Script: advance_clickup_task.py
Diretriz Relacionada: Atualização de status no ClickUp
Descrição: Atualiza o status de uma tarefa no ClickUp.

Entradas:
    - args[1]: API Token
    - args[2]: Task ID
    - args[3]: Novo Status

Saídas:
    - Status da operação.
"""

import sys
import json
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 4:
        print("[ERRO] Faltam argumentos. Uso: python advance_clickup_task.py <API_TOKEN> <TASK_ID> <NOVO_STATUS>", file=sys.stderr)
        sys.exit(1)

    api_token = sys.argv[1]
    task_id = sys.argv[2]
    new_status = sys.argv[3]
    
    url = f"https://api.clickup.com/api/v2/task/{task_id}"
    
    payload = {
        "status": new_status
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method="PUT")
    req.add_header('Authorization', api_token)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"Tarefa {task_id} movida com sucesso para o status: {new_status}")
            else:
                print(f"[ERRO] Falha ao atualizar. HTTP Status: {response.status}", file=sys.stderr)
                sys.exit(1)
    except urllib.error.URLError as e:
        print(f"[ERRO] Erro na requisição: {e.reason}", file=sys.stderr)
        if hasattr(e, 'read'):
            print(f"[ERRO] Resposta: {e.read().decode('utf-8')}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
