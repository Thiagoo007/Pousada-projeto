import sys
import json
import argparse
import os
import logging
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

def buscar_hospedes_por_quarto(numero_quarto):
    """
    Lista registros de hóspedes filtrados por número do quarto.
    """
    try:
        response = supabase.table('hospedes').select("*").eq('numero_quarto', str(numero_quarto)).execute()
        logger.info(f"CONSULTA: Busca realizada para o quarto {numero_quarto}. Retornados: {len(response.data)} registros.")
        print(json.dumps({
            "status": "success",
            "count": len(response.data),
            "data": response.data
        }, ensure_ascii=False, indent=2))
    except Exception as e:
        logger.error(f"ERRO DE CONSULTA: Erro ao buscar hóspedes do quarto {numero_quarto}: {str(e)}")
        print(json.dumps({
            "status": "error",
            "message": f"Erro ao buscar hóspedes por quarto: {str(e)}"
        }, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lista hóspedes de um quarto específico.")
    parser.add_argument("--quarto", required=True, help="Número do quarto a pesquisar")
    
    args = parser.parse_args()
    buscar_hospedes_por_quarto(args.quarto)
