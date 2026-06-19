-- Tabela de Produtos (Catálogo do Frigobar/Restaurante)
CREATE TABLE public.produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco_venda NUMERIC(10, 2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Consumos (Registro Operacional por Reserva)
CREATE TABLE public.consumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reserva_id UUID REFERENCES public.reservas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(10, 2) NOT NULL,
    valor_total_item NUMERIC(10, 2) NOT NULL,
    data_lancamento TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura de produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de consumos" ON public.consumos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de consumos" ON public.consumos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de consumos" ON public.consumos FOR UPDATE USING (true);
CREATE POLICY "Permitir delete de consumos" ON public.consumos FOR DELETE USING (true);

-- Garantir acesso aos papéis
GRANT ALL ON public.produtos TO anon, authenticated, service_role;
GRANT ALL ON public.consumos TO anon, authenticated, service_role;

-- Inserir dados iniciais de teste
INSERT INTO public.produtos (nome, preco_venda) VALUES
    ('Água Mineral S/ Gás 500ml', 5.00),
    ('Água Mineral C/ Gás 500ml', 6.00),
    ('Refrigerante Lata 350ml', 8.00),
    ('Cerveja Long Neck', 12.00),
    ('Amendoim / Snack', 10.00),
    ('Chocolate Barra', 15.00);
