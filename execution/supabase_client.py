import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as variáveis de ambiente
load_dotenv()

def get_supabase_client() -> Client:
    """
    Retorna uma instância do cliente Supabase usando as credenciais do .env.
    """
    url: str = os.getenv("SUPABASE_URL")
    key: str = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não configuradas no .env.")
        
    supabase: Client = create_client(url, key)
    return supabase

# Cliente instanciado para ser importado por outros scripts de execução
supabase = get_supabase_client()
