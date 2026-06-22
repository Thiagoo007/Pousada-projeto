-- Schema inicial para a Pousada Nita

CREATE TABLE public.hospedes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
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

-- Tabela de Auditoria (Logs de Acesso)
CREATE TABLE public.logs_acesso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ip_user_agent TEXT,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.logs_acesso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura de logs_acesso" ON public.logs_acesso FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de logs_acesso" ON public.logs_acesso FOR INSERT WITH CHECK (true);
GRANT ALL ON public.logs_acesso TO anon, authenticated, service_role;

-- Tabela Despesas (DRE)
CREATE TABLE public.despesas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL, -- Água, Energia, Internet, Funcionários, Manutenção, Outros
    descricao TEXT,
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, pago
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura de despesas" ON public.despesas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de despesas" ON public.despesas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de despesas" ON public.despesas FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção de despesas" ON public.despesas FOR DELETE USING (true);
GRANT ALL ON public.despesas TO anon, authenticated, service_role;

CREATE POLICY "Permitir atualização de pagamentos" ON public.pagamentos FOR UPDATE USING (true);

GRANT ALL ON public.pagamentos TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.check_overbooking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.hospedes
    WHERE numero_quarto = NEW.numero_quarto
      AND (NEW.id IS NULL OR id != NEW.id)
      AND data_checkin < NEW.data_checkout 
      AND data_checkout > NEW.data_checkin
  ) THEN
    RAISE EXCEPTION 'Quarto % já está reservado neste período (Overbooking).', NEW.numero_quarto
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_overbooking_trigger ON public.hospedes;
CREATE TRIGGER prevent_overbooking_trigger
BEFORE INSERT OR UPDATE ON public.hospedes
FOR EACH ROW EXECUTE FUNCTION public.check_overbooking();
-- Remove dados de teste antigos que dependem da estrutura anterior
TRUNCATE TABLE public.pagamentos CASCADE;
TRUNCATE TABLE public.hospedes CASCADE;

-- Criar a tabela reservas
CREATE TABLE public.reservas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospede_id UUID REFERENCES public.hospedes(id) ON DELETE CASCADE,
    numero_quarto VARCHAR(10) NOT NULL,
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, check-in, check-out, cancelada
    valor_total NUMERIC(10, 2) DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de reservas" ON public.reservas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de reservas" ON public.reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de reservas" ON public.reservas FOR UPDATE USING (true);
CREATE POLICY "Permitir delete de reservas" ON public.reservas FOR DELETE USING (true);
GRANT ALL ON public.reservas TO anon, authenticated, service_role;

-- Remover colunas operacionais da tabela CRM (hospedes)
ALTER TABLE public.hospedes DROP COLUMN IF EXISTS data_checkin;
ALTER TABLE public.hospedes DROP COLUMN IF EXISTS data_checkout;
ALTER TABLE public.hospedes DROP COLUMN IF EXISTS numero_quarto;
ALTER TABLE public.hospedes DROP COLUMN IF EXISTS status_pagamento;

-- Adicionar constraints úteis se não tiver (o schema original tinha CPF unico)

-- Recriar a Trigger de overbooking para apontar para reservas
CREATE OR REPLACE FUNCTION public.check_overbooking()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estiver cancelando ou fazendo checkout, libera o overbooking check
  IF NEW.status IN ('cancelada', 'check-out') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.reservas
    WHERE numero_quarto = NEW.numero_quarto
      AND status NOT IN ('cancelada', 'check-out')
      AND (NEW.id IS NULL OR id != NEW.id)
      AND data_checkin < NEW.data_checkout 
      AND data_checkout > NEW.data_checkin
  ) THEN
    RAISE EXCEPTION 'Quarto % já está reservado neste período (Overbooking).', NEW.numero_quarto
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_overbooking_trigger ON public.hospedes;
DROP TRIGGER IF EXISTS prevent_overbooking_trigger ON public.reservas;

CREATE TRIGGER prevent_overbooking_trigger
BEFORE INSERT OR UPDATE ON public.reservas
FOR EACH ROW EXECUTE FUNCTION public.check_overbooking();
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

-- Inserir dados reais de produção
INSERT INTO public.produtos (nome, preco_venda) VALUES
    ('Água mineral 500ml', 3.00),
    ('Água com gás 500ml', 4.00),
    ('Água de 1,5L', 5.00),
    ('Refri de litro', 8.00),
    ('Refri de dois litros', 14.00),
    ('Cerveja lata', 5.00),
    ('Heineken shot', 8.00),
    ('Heineken normal', 10.00),
    ('Coronita', 8.00),
    ('Monster', 12.00),
    ('Guaraná Kuat', 5.00),
    ('Coca lata', 5.00),
    ('Cuscuz com ovo', 16.00),
    ('Lavanderia (por peça)', 4.00);
