#!/usr/bin/env python3
"""
Nome do Script: list_clickup_tasks.py
Diretriz Relacionada: Controle de status
Descrição: Lista as tarefas de uma lista no ClickUp para análise.

Entradas:
    - args[1]: API Token
    - args[2]: List ID

Saídas:
    - JSON com id, name e status das tarefas.
"""

import sys
import json
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 3:
        print("[ERRO] Faltam argumentos. Uso: python list_clickup_tasks.py <API_TOKEN> <LIST_ID>", file=sys.stderr)
        sys.exit(1)

    api_token = sys.argv[1]
    list_id = sys.argv[2]
    
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task?include_closed=true"
    
    req = urllib.request.Request(url)
    req.add_header('Authorization', api_token)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                tasks = []
                for task in data.get('tasks', []):
                    tasks.append({
                        "id": task.get("id"),
                        "name": task.get("name"),
                        "status": task.get("status", {}).get("status")
                    })
                print(json.dumps(tasks, indent=2, ensure_ascii=False))
            else:
                print(f"[ERRO] Falha ao listar. HTTP Status: {response.status}", file=sys.stderr)
                sys.exit(1)
    except urllib.error.URLError as e:
        print(f"[ERRO] Erro na requisição: {e.reason}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
