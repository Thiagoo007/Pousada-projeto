CREATE TABLE public.pagamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospede_id UUID REFERENCES public.hospedes(id) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'concluido',
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de pagamentos" ON public.pagamentos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de pagamentos" ON public.pagamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de pagamentos" ON public.pagamentos FOR UPDATE USING (true);

GRANT ALL ON public.pagamentos TO anon, authenticated, service_role;
