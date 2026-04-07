-- =============================================
-- Aggiunge categoria "alimentazione" a guide_products
-- Eseguire nel SQL Editor di Supabase
-- =============================================

-- Rimuovi il vecchio vincolo
ALTER TABLE public.guide_products DROP CONSTRAINT IF EXISTS guide_products_category_check;

-- Aggiungi il nuovo vincolo con alimentazione
ALTER TABLE public.guide_products ADD CONSTRAINT guide_products_category_check
  CHECK (category IN ('fitness', 'business', 'mindset', 'biohacking', 'branding', 'alimentazione'));
