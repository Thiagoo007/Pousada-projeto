import sys
import json
from supabase_client import supabase

def listar_hospedes():
    """
    Consulta a tabela de hóspedes no Supabase e retorna a lista em JSON.
    """
    try:
        response = supabase.table('hospedes').select('*').execute()
        hospedes = response.data
        
        # Output estruturado e determinístico para o LLM ou integração
        print(json.dumps({
            "status": "success",
            "count": len(hospedes),
            "data": hospedes
        }, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Erro ao listar hóspedes: {str(e)}"
        }, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    listar_hospedes()
