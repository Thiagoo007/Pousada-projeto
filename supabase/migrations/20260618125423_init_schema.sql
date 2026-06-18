-- Schema inicial para a Pousada Nita

CREATE TABLE public.hospedes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    numero_quarto VARCHAR(10) NOT NULL,
    status_pagamento VARCHAR(50) DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.hospedes ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
-- Permitimos leitura e gravação assumindo que o acesso backend utilizará a chave Service Role para bypass
-- Ou autenticação específica caso o frontend seja conectado.
CREATE POLICY "Permitir leitura de hóspedes" ON public.hospedes
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de hóspedes" ON public.hospedes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de hóspedes" ON public.hospedes
    FOR UPDATE USING (true);
GRANT ALL ON public.hospedes TO anon, authenticated, service_role;
