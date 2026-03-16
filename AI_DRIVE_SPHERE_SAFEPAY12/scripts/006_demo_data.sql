-- =============================================
-- DEMO DATA — Paste in Supabase SQL Editor
-- Run AFTER all table scripts (001-005)
-- =============================================

-- ─── DEMO PROFILES (customers) ───────────────
-- NOTE: These use fake UUIDs. In real use,
-- profiles are auto-created on signup via trigger.
-- For demo, insert directly:

INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ahmed Khan',    '+92 300 1234567', 'customer', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Sara Ali',      '+92 301 9876543', 'customer', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Bilal Raza',    '+92 321 5551234', 'customer', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Admin User',    '+92 333 0000000', 'admin',    NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO VEHICLES ───────────────────────────
INSERT INTO public.vehicles (id, name, type, plate_number, status, price_per_day, description, features, rating, total_reviews, latitude, longitude, created_at)
VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'Toyota Corolla 2022',  'car',   'LHR-1001', 'available',  45.00, 'Comfortable sedan perfect for city driving. Fuel efficient and reliable.',     ARRAY['AC','Bluetooth','Backup Camera','Cruise Control'], 4.5, 12, 31.5204,  74.3587, NOW()),
  ('aaaa0002-0000-0000-0000-000000000002', 'Honda Civic 2023',     'car',   'LHR-2002', 'available',  55.00, 'Sporty sedan with modern tech and excellent fuel economy.',                   ARRAY['AC','Apple CarPlay','Sunroof','Lane Assist'],       4.8, 18, 31.5497,  74.3436, NOW()),
  ('aaaa0003-0000-0000-0000-000000000003', 'Toyota Fortuner 2022', 'suv',   'ISB-3003', 'available',  95.00, 'Powerful SUV ideal for both city and off-road adventures.',                  ARRAY['4WD','AC','7 Seats','Leather Seats','Sunroof'],     4.2,  8, 31.5890,  74.3269, NOW()),
  ('aaaa0004-0000-0000-0000-000000000004', 'Suzuki Alto 2023',     'car',   'KHI-4004', 'available',  25.00, 'Budget-friendly compact car, great for short trips around the city.',        ARRAY['AC','Bluetooth'],                                   3.8,  5, 31.4697,  74.2728, NOW()),
  ('aaaa0005-0000-0000-0000-000000000005', 'Hyundai Tucson 2022',  'suv',   'LHR-5005', 'available',  75.00, 'Stylish mid-size SUV with premium interior and advanced safety features.',   ARRAY['AC','Panoramic Sunroof','Blind Spot Monitor','AWD'],4.6, 10, 31.5600,  74.3300, NOW()),
  ('aaaa0006-0000-0000-0000-000000000006', 'Kia Sportage 2023',    'suv',   'RWP-6006', 'rented',     70.00, 'Modern SUV with great tech features and comfortable ride quality.',          ARRAY['AC','Android Auto','360 Camera','Heated Seats'],    4.9, 22, 31.5250,  74.3450, NOW()),
  ('aaaa0007-0000-0000-0000-000000000007', 'Toyota Hiace 2021',    'van',   'LHR-7007', 'available', 120.00, 'Spacious van perfect for group travel or cargo transport.',                  ARRAY['AC','12 Seats','Large Cargo Space'],                 4.0,  6, 31.5100,  74.3600, NOW()),
  ('aaaa0008-0000-0000-0000-000000000008', 'Isuzu D-Max 2022',     'truck', 'LHR-8008', 'available', 110.00, 'Heavy-duty pickup truck for commercial use and tough terrains.',             ARRAY['4WD','Tow Package','Heavy Duty Bed','AC'],           3.5,  3, 31.4900,  74.3800, NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO BOOKINGS ───────────────────────────
INSERT INTO public.bookings (id, user_id, vehicle_id, start_date, end_date, total_price, status, payment_status, notes, created_at)
VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa0006-0000-0000-0000-000000000006', CURRENT_DATE - 2, CURRENT_DATE + 3, 350.00, 'active',    'paid',   'Airport pickup requested',        NOW() - INTERVAL '3 days'),
  ('bbbb0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', CURRENT_DATE + 5, CURRENT_DATE + 8, 135.00, 'confirmed', 'paid',   NULL,                              NOW() - INTERVAL '1 day'),
  ('bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaa0002-0000-0000-0000-000000000002', CURRENT_DATE - 15, CURRENT_DATE - 10, 275.00,'completed', 'paid',   'Returned in excellent condition',  NOW() - INTERVAL '16 days'),
  ('bbbb0004-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'aaaa0003-0000-0000-0000-000000000003', CURRENT_DATE + 2, CURRENT_DATE + 5, 285.00, 'pending',   'unpaid', 'Need child seat',                  NOW()),
  ('bbbb0005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'aaaa0005-0000-0000-0000-000000000005', CURRENT_DATE - 20, CURRENT_DATE - 15, 375.00,'completed', 'paid',   NULL,                              NOW() - INTERVAL '21 days')
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO AGREEMENTS ─────────────────────────
INSERT INTO public.agreements (id, booking_id, user_id, vehicle_id, terms, status, signed_at, created_at)
VALUES
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa0006-0000-0000-0000-000000000006',
   'Standard rental agreement. Customer agrees to return vehicle in the same condition. Fuel policy: full-to-full. No smoking.', 'signed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('cccc0002-0000-0000-0000-000000000002', 'bbbb0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001',
   'Standard rental agreement. Customer agrees to return vehicle in the same condition. Fuel policy: full-to-full.', 'draft', NULL, NOW() - INTERVAL '1 day'),
  ('cccc0003-0000-0000-0000-000000000003', 'bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaa0002-0000-0000-0000-000000000002',
   'Standard rental agreement.', 'signed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '16 days')
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO REVIEWS ────────────────────────────
INSERT INTO public.reviews (id, user_id, vehicle_id, booking_id, rating, comment, created_at)
VALUES
  ('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa0002-0000-0000-0000-000000000002', 'bbbb0003-0000-0000-0000-000000000003', 5, 'Excellent car! Very clean, drives smoothly. Will definitely rent again.', NOW() - INTERVAL '9 days'),
  ('dddd0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaa0005-0000-0000-0000-000000000005', 'bbbb0005-0000-0000-0000-000000000005', 4, 'Great SUV, comfortable and spacious. AC worked perfectly. Minor scratch on bumper noted.', NOW() - INTERVAL '14 days')
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO CNIC DOCUMENTS ─────────────────────
INSERT INTO public.cnic_documents (user_id, front_url, back_url, status, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://placehold.co/400x250?text=CNIC+Front', 'https://placehold.co/400x250?text=CNIC+Back', 'verified', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'https://placehold.co/400x250?text=CNIC+Front', 'https://placehold.co/400x250?text=CNIC+Back', 'pending',  NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ─── DEMO PAYMENTS ───────────────────────────
INSERT INTO public.payments (booking_id, user_id, stripe_payment_intent_id, amount, currency, status, created_at)
VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'pi_demo_001', 350.00, 'usd', 'succeeded', NOW() - INTERVAL '3 days'),
  ('bbbb0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'pi_demo_002', 135.00, 'usd', 'succeeded', NOW() - INTERVAL '1 day'),
  ('bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'pi_demo_003', 275.00, 'usd', 'succeeded', NOW() - INTERVAL '16 days'),
  ('bbbb0005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'pi_demo_005', 375.00, 'usd', 'succeeded', NOW() - INTERVAL '21 days')
ON CONFLICT DO NOTHING;

-- ─── DEMO IoT TRACKING DATA ──────────────────
INSERT INTO public.tracking_history (vehicle_id, latitude, longitude, speed, recorded_at)
VALUES
  ('aaaa0006-0000-0000-0000-000000000006', 31.5204, 74.3587, 45.0, NOW() - INTERVAL '2 hours'),
  ('aaaa0006-0000-0000-0000-000000000006', 31.5250, 74.3600, 60.0, NOW() - INTERVAL '1 hour'),
  ('aaaa0006-0000-0000-0000-000000000006', 31.5300, 74.3650, 30.0, NOW() - INTERVAL '30 minutes'),
  ('aaaa0006-0000-0000-0000-000000000006', 31.5497, 74.3436, 0.0,  NOW())
ON CONFLICT DO NOTHING;

-- ─── Manually trigger rating recalculation ───
-- (the trigger handles new reviews, this updates existing ones)
UPDATE public.vehicles SET
  rating = COALESCE((SELECT ROUND(AVG(r.rating)::NUMERIC, 2) FROM public.reviews r WHERE r.vehicle_id = vehicles.id), 0),
  total_reviews = COALESCE((SELECT COUNT(*) FROM public.reviews r WHERE r.vehicle_id = vehicles.id), 0);

SELECT 'Demo data inserted successfully!' as result;
