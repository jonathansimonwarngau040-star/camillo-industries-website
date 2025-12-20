-- Schritt 3: Indizes erstellen (NUR AUSFÜHREN wenn Schritt 1 erfolgreich war)

CREATE INDEX IF NOT EXISTS idx_bestellungen_email ON public.bestellungen(email);
CREATE INDEX IF NOT EXISTS idx_bestellungen_created_at ON public.bestellungen(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bestellungen_versendet ON public.bestellungen(versendet) WHERE versendet = FALSE;

