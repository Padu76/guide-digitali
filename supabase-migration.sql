-- =============================================
-- GuideDigitali — Migrazione Supabase (schema public)
-- Eseguire nel SQL Editor di Supabase
-- Istanza: utilitylab-founderos
-- =============================================

-- Tabella prodotti guide
CREATE TABLE IF NOT EXISTS public.guide_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'business', 'mindset', 'branding')),
  price NUMERIC(6,2) NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  pdf_path TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  preview_pages INTEGER DEFAULT 3,
  download_count INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  page_count INTEGER,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella ordini
CREATE TABLE IF NOT EXISTS public.guide_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  paypal_order_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  download_expires_at TIMESTAMPTZ,
  amount NUMERIC(8,2) NOT NULL,
  discount_amount NUMERIC(8,2) DEFAULT 0,
  coupon_code TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella coupon
CREATE TABLE IF NOT EXISTS public.guide_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  active BOOLEAN DEFAULT true,
  uses_remaining INTEGER,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_guide_products_category ON public.guide_products(category) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_guide_products_slug ON public.guide_products(slug);
CREATE INDEX IF NOT EXISTS idx_guide_orders_email ON public.guide_orders(email);
CREATE INDEX IF NOT EXISTS idx_guide_orders_token ON public.guide_orders(download_token);
CREATE INDEX IF NOT EXISTS idx_guide_orders_status ON public.guide_orders(status);
CREATE INDEX IF NOT EXISTS idx_guide_coupons_code ON public.guide_coupons(code) WHERE active = true;

-- RLS
ALTER TABLE public.guide_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_coupons ENABLE ROW LEVEL SECURITY;

-- Policy: prodotti visibili a tutti (select)
CREATE POLICY "guide_products_public_read" ON public.guide_products
  FOR SELECT USING (active = true);

-- Policy: service role puo tutto (per le API routes)
CREATE POLICY "guide_products_service_all" ON public.guide_products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "guide_orders_service_all" ON public.guide_orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "guide_coupons_service_all" ON public.guide_coupons
  FOR ALL USING (true) WITH CHECK (true);

-- Funzione per incrementare download count
CREATE OR REPLACE FUNCTION public.increment_guide_download_count(p_product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.guide_products
  SET download_count = download_count + 1
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA — 4 guide, tutte a 9 EUR
-- =============================================

INSERT INTO public.guide_products (slug, title, category, price, description, short_description, pdf_path, cover_image, features, page_count, download_count, sort_order)
VALUES
(
  'allenamento-completo-casa',
  'Allenamento Completo a Casa: 30 Giorni di Trasformazione',
  'fitness',
  9.00,
  'Una guida completa per allenarsi a casa senza attrezzi. 30 giorni di programmi progressivi, dalla base all''avanzato. Include schede di allenamento dettagliate, consigli nutrizionali e un piano settimanale strutturato per ottenere risultati visibili in un mese.

Pensata per chi vuole iniziare o riprendere l''attivita fisica senza dover andare in palestra. Ogni esercizio e spiegato con indicazioni precise su esecuzione, serie, ripetizioni e tempi di recupero.',
  'Programma completo 30 giorni per allenarsi a casa. Nessun attrezzo richiesto.',
  'fitness/allenamento-completo-casa.pdf',
  '/guide/covers/allenamento-completo-casa.webp',
  '["30 giorni di programma progressivo", "Nessun attrezzo necessario", "Piano nutrizionale incluso", "Schede stampabili per ogni settimana", "Video guida esercizi (QR code)"]',
  35,
  127,
  1
),
(
  'automazione-business-ai',
  'Automazione Business con AI: Guida Pratica per PMI',
  'business',
  9.00,
  'Scopri come automatizzare i processi aziendali con l''intelligenza artificiale. Dalla gestione email alla creazione contenuti, dal customer service all''analisi dati. Strategie concrete per risparmiare 10+ ore a settimana usando tool AI gia disponibili.

Include setup guidato passo-passo di 15 tool AI essenziali, template pronti all''uso e casi studio reali di PMI italiane che hanno implementato queste automazioni con successo.',
  'Automatizza il tuo business con AI. 15 tool, template pronti e casi studio reali.',
  'business/automazione-business-ai.pdf',
  '/guide/covers/automazione-business-ai.webp',
  '["15 tool AI con setup guidato", "Template e prompt pronti all''uso", "Casi studio PMI italiane", "Risparmia 10+ ore a settimana", "Aggiornamenti gratuiti per 1 anno"]',
  42,
  89,
  2
),
(
  'mindset-produttivita-deep-work',
  'Deep Work: Produttivita Estrema nel Mondo delle Distrazioni',
  'mindset',
  9.00,
  'Una guida pratica per sviluppare la capacita di concentrazione profonda in un mondo pieno di distrazioni. Basata su ricerche scientifiche e applicata al contesto lavorativo moderno. Include tecniche di time-blocking, rituali di focus e strategie per eliminare le interruzioni.

Impara a produrre lavoro di qualita superiore in meno tempo, aumentando il tuo valore professionale e riducendo lo stress da multitasking.',
  'Tecniche di concentrazione profonda per produrre lavoro di qualita superiore.',
  'mindset/deep-work-produttivita.pdf',
  '/guide/covers/deep-work-produttivita.webp',
  '["Tecniche di time-blocking avanzate", "Rituali di focus mattutino", "Strategie anti-distrazione", "Template planner settimanale", "30 giorni di sfide progressive"]',
  28,
  64,
  3
),
(
  'personal-branding-linkedin',
  'Personal Branding su LinkedIn: Da Zero a Thought Leader',
  'branding',
  9.00,
  'La guida definitiva per costruire un personal brand forte su LinkedIn. Dal profilo ottimizzato alla strategia di contenuti, dalla crescita della rete alla monetizzazione. Include template per post, script per video e un calendario editoriale di 90 giorni.

Ideale per professionisti, consulenti e imprenditori che vogliono posizionarsi come esperti nel loro settore e generare opportunita di business attraverso LinkedIn.',
  'Costruisci il tuo personal brand su LinkedIn. Template, script e calendario 90 giorni.',
  'branding/personal-branding-linkedin.pdf',
  '/guide/covers/personal-branding-linkedin.webp',
  '["Ottimizzazione profilo step-by-step", "20 template post ad alto engagement", "Calendario editoriale 90 giorni", "Script per video e caroselli", "Strategie di networking avanzate"]',
  38,
  52,
  4
);

-- Coupon demo
INSERT INTO public.guide_coupons (code, discount_percent, active, uses_remaining, valid_until)
VALUES
('LANCIO30', 30, true, 50, '2026-06-30T23:59:59Z'),
('WELCOME10', 10, true, null, null);
