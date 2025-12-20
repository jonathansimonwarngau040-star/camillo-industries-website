-- Schritt 2: Farbvalidierung hinzufügen (NUR AUSFÜHREN wenn Schritt 1 erfolgreich war)

ALTER TABLE public.bestellungen 
ADD CONSTRAINT bestellungen_color_check 
CHECK (color IN ('weiß', 'schwarz', 'orange', 'blau', 'gelb', 'grau', 'grün', 'pink', 'rot'));

