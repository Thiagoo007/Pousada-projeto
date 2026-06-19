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
