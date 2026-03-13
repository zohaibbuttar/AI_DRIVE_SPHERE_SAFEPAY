-- =============================================
-- STEP 1: Add new columns to existing tables
-- =============================================

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','refunded')),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- =============================================
-- STEP 2: reviews table
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Auto-update vehicle rating trigger
CREATE OR REPLACE FUNCTION update_vehicle_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vehicles SET
    rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE vehicle_id = NEW.vehicle_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE vehicle_id = NEW.vehicle_id),
    updated_at = NOW()
  WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_vehicle_rating();

-- =============================================
-- STEP 3: cnic_documents table
-- =============================================
CREATE TABLE IF NOT EXISTS public.cnic_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  front_url TEXT,
  back_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cnic_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cnic_select_own" ON public.cnic_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cnic_upsert_own" ON public.cnic_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cnic_admin_all" ON public.cnic_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- STEP 4: payments table
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_admin_all" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- STEP 5: Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON public.reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_rating ON public.vehicles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_cnic_user_id ON public.cnic_documents(user_id);

-- =============================================
-- STEP 6: Storage bucket for CNIC
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('cnic-documents', 'cnic-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "cnic_upload_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cnic-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "cnic_read_own" ON storage.objects FOR SELECT
  USING (bucket_id = 'cnic-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "cnic_admin_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'cnic-documents' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
