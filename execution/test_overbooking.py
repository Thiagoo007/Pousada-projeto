import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load env variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # This is anon key inside the python script normally, wait, Python might use anon or service role. The .env has PUBLISHABLE_KEY.
# The PUBLISHABLE_KEY is actually the ANON_KEY in standard Supabase config! Wait.
# I need to use the actual ANON_KEY we got from status. Let's hardcode it for the test just in case.
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

supabase: Client = create_client(SUPABASE_URL, ANON_KEY)

def test_overbooking():
    print("Iniciando Teste de Overbooking (QA Skills)...")
    
    # Payload 1: Valido
    payload_1 = {
        "nome_completo": "Hóspede Teste QA 1",
        "cpf": "111.111.111-11",
        "telefone": "11999999999",
        "data_checkin": "2026-10-01",
        "data_checkout": "2026-10-05",
        "numero_quarto": 999,
        "status_pagamento": "pendente"
    }

    try:
        print(f"-> Inserindo Hospede 1 (Quarto 999, 01/10 a 05/10)...")
        res1 = supabase.table("hospedes").insert(payload_1).execute()
        print("   [SUCESSO] Hóspede 1 inserido.")
    except Exception as e:
        print(f"   [FALHA INESPERADA] Não foi possível inserir Hóspede 1: {e}")
        sys.exit(1)

    # Payload 2: Conflito
    payload_2 = {
        "nome_completo": "Hóspede Teste QA 2",
        "cpf": "222.222.222-22",
        "telefone": "11888888888",
        "data_checkin": "2026-10-03",
        "data_checkout": "2026-10-07",
        "numero_quarto": 999,
        "status_pagamento": "pendente"
    }

    try:
        print(f"-> Inserindo Hospede 2 (Quarto 999, 03/10 a 07/10)... O esperado é DAR ERRO!")
        res2 = supabase.table("hospedes").insert(payload_2).execute()
        print("   [ERRO GRAVE QA] O Hóspede 2 foi inserido! Overbooking NÃO FOI evitado!")
        sys.exit(1)
    except Exception as e:
        if "Overbooking" in str(e):
            print("   [SUCESSO QA] Inserção bloqueada corretamente pela Trigger do Supabase!")
            print(f"   Detalhe do Erro: {e}")
        else:
            print(f"   [ERRO INESPERADO] Uma exceção foi lançada, mas não foi de Overbooking: {e}")
            sys.exit(1)
            
    print("\n✅ TESTE CONCLUÍDO: O sistema de prevenção de Overbooking está robusto e ativo!")

if __name__ == "__main__":
    test_overbooking()
