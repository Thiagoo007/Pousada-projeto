#!/usr/bin/env python3
"""
Nome do Script: organize_tasks.py
Diretriz Relacionada: Controle de Sprints no ClickUp
Descrição: Lê os títulos das tarefas e as move para dentro das suas respectivas Sprints.

Entradas:
    - args[1]: API Token
    - args[2]: JSON com as tarefas a organizar (ou busca direto da API)

Saídas:
    - Status de cada tarefa movida
"""

import sys
import json
import urllib.request
import time

def main():
    if len(sys.argv) < 3:
        print("Uso: python organize_tasks.py <API_TOKEN> <LIST_ID>")
        sys.exit(1)

    api_token = sys.argv[1]
    list_id = sys.argv[2]
    
    # 1. Obter todas as tarefas
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task?include_closed=true"
    req = urllib.request.Request(url)
    req.add_header('Authorization', api_token)
    req.add_header('Content-Type', 'application/json')
    
    tasks = []
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            tasks = data.get('tasks', [])
    except Exception as e:
        print(f"Erro ao buscar tarefas: {e}")
        sys.exit(1)

    # 2. Identificar os IDs das Sprints
    sprints = {}
    for t in tasks:
        name = t.get("name", "").lower()
        if "sprint 3" in name: sprints["Sprint 3"] = t["id"]
        elif "sprint 4" in name: sprints["Sprint 4"] = t["id"]
        elif "sprint 5" in name: sprints["Sprint 5"] = t["id"]
        elif "sprint 6" in name: sprints["Sprint 6"] = t["id"]
        elif "sprint 7" in name: sprints["Sprint 7"] = t["id"]
        elif "sprint 8" in name: sprints["Sprint 8"] = t["id"]
        elif "sprint 9" in name: sprints["Sprint 9"] = t["id"]
        elif "fase 5" in name or "sprint 10" in name: sprints["Fase 5"] = t["id"]

    # 3. Classificar tarefas
    for t in tasks:
        name = t.get("name", "")
        name_lower = name.lower()
        
        # Ignorar as próprias sprints
        if "sprint" in name_lower or "fase" in name_lower:
            continue

        parent_id = None
        
        # Regras de Classificação
        if any(k in name_lower for k in ["check-in", "check-out", "reserva", "hóspede", "hspede", "overbooking", "disponibilidade", "frigobar", "fnrh", "checkout", "checkin"]):
            parent_id = sprints.get("Sprint 3")
        elif any(k in name_lower for k in ["financeiro", "dre", "fluxo de caixa", "despesa", "contas a", "transações financeiras", "plano de contas", "relatórios csv"]):
            parent_id = sprints.get("Sprint 4")
        elif any(k in name_lower for k in ["pagamento", "pix", "cartão", "carto", "faturas", "baixa automática", "baixa automtica", "recibo", "gateway mock"]):
            parent_id = sprints.get("Sprint 5")
        elif any(k in name_lower for k in ["governança", "governana", "limpeza", "sujeira", "quarto", "checklist", "camareira"]):
            parent_id = sprints.get("Sprint 6")
        elif any(k in name_lower for k in ["manutenção", "manuteno", "chamado"]):
            parent_id = sprints.get("Sprint 7")
        elif any(k in name_lower for k in ["wpp", "whatsapp", "mensagens", "disparo"]):
            parent_id = sprints.get("Sprint 8")
        elif any(k in name_lower for k in ["dashboard", "gráfico", "grfico", "revpar", "ocupação", "ocupao", "kpi"]):
            parent_id = sprints.get("Sprint 9")
        elif any(k in name_lower for k in ["agente", "ia", "llm"]):
            parent_id = sprints.get("Fase 5")

        if parent_id and not t.get("parent"):
            # Mover a tarefa
            update_url = f"https://api.clickup.com/api/v2/task/{t['id']}"
            payload = {"parent": parent_id}
            update_req = urllib.request.Request(update_url, data=json.dumps(payload).encode('utf-8'), method="PUT")
            update_req.add_header('Authorization', api_token)
            update_req.add_header('Content-Type', 'application/json')
            
            try:
                urllib.request.urlopen(update_req)
                print(f"[{name}] -> Movido para {parent_id}")
                time.sleep(0.5) # Evitar rate limit
            except Exception as e:
                print(f"Erro ao mover [{name}]: {e}")

if __name__ == "__main__":
    main()
