import sys
import json
import argparse
import re
import os
import logging
from datetime import datetime
from supabase_client import supabase

# Configurar logger de auditoria
os.makedirs("logs", exist_ok=True)
logger = logging.getLogger("auditoria")
logger.setLevel(logging.INFO)
if not logger.handlers:
    fh = logging.FileHandler("logs/database.log", encoding="utf-8")
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)

def validar_cpf(cpf):
    return bool(re.match(r'^\d{3}\.\d{3}\.\d{3}-\d{2}$', cpf))

def adicionar_hospede(nome, cpf, telefone, checkin, checkout, quarto, status):
    """
    Insere um novo registro de hóspede no banco Supabase com validações e log.
    """
    if not validar_cpf(cpf):
        erro_msg = "CPF com formato inválido. Use XXX.XXX.XXX-XX."
        logger.warning(f"Tentativa de inserção rejeitada: {erro_msg} - CPF fornecido: {cpf}")
        print(json.dumps({"status": "error", "message": erro_msg}, ensure_ascii=False, indent=2))
        sys.exit(1)
        
    try:
        data_in = datetime.strptime(checkin, "%Y-%m-%d")
        data_out = datetime.strptime(checkout, "%Y-%m-%d")
        if data_out <= data_in:
            erro_msg = "Data de check-out deve ser posterior à data de check-in."
            logger.warning(f"Tentativa de inserção rejeitada: {erro_msg} - CPF: {cpf}")
            print(json.dumps({"status": "error", "message": erro_msg}, ensure_ascii=False, indent=2))
            sys.exit(1)
    except ValueError:
        erro_msg = "Formato de data inválido. Use YYYY-MM-DD."
        logger.warning(f"Tentativa de inserção rejeitada: {erro_msg} - CPF: {cpf}")
        print(json.dumps({"status": "error", "message": erro_msg}, ensure_ascii=False, indent=2))
        sys.exit(1)

    novo_hospede = {
        "nome_completo": nome,
        "cpf": cpf,
        "telefone": telefone,
        "data_checkin": checkin,
        "data_checkout": checkout,
        "numero_quarto": str(quarto),
        "status_pagamento": status
    }
    
    try:
        response = supabase.table('hospedes').insert(novo_hospede).execute()
        logger.info(f"SUCESSO: Hóspede '{nome}' (CPF: {cpf}) adicionado ao quarto {quarto}.")
        print(json.dumps({
            "status": "success",
            "message": "Hóspede cadastrado com sucesso.",
            "data": response.data
        }, ensure_ascii=False, indent=2))
    except Exception as e:
        logger.error(f"FALHA: Erro ao adicionar hóspede {cpf} ao banco. Motivo: {str(e)}")
        print(json.dumps({
            "status": "error",
            "message": f"Erro ao adicionar hóspede (possível CPF duplicado ou erro de API): {str(e)}"
        }, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Adiciona um novo hóspede ao banco de dados Supabase.")
    parser.add_argument("--nome", required=True, help="Nome completo do hóspede")
    parser.add_argument("--cpf", required=True, help="CPF do hóspede (ex: 123.456.789-00)")
    parser.add_argument("--telefone", required=False, default="", help="Telefone do hóspede")
    parser.add_argument("--checkin", required=True, help="Data de check-in (YYYY-MM-DD)")
    parser.add_argument("--checkout", required=True, help="Data de check-out (YYYY-MM-DD)")
    parser.add_argument("--quarto", required=True, help="Número do quarto")
    parser.add_argument("--status", required=False, default="pendente", help="Status do pagamento (ex: pendente, pago, cancelado)")
    
    args = parser.parse_args()
    
    adicionar_hospede(
        nome=args.nome,
        cpf=args.cpf,
        telefone=args.telefone,
        checkin=args.checkin,
        checkout=args.checkout,
        quarto=args.quarto,
        status=args.status
    )
