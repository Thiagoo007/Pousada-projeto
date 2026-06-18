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
