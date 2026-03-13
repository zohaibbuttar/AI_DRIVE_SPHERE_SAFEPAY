# 🚗 AI Drive Sphere — Quick Start Guide

## Step 1: Install Dependencies
```bash
npm install
# or: pnpm install
```

## Step 2: Set Up Environment Variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SAFEPAY_SECRET_KEY` | Safepay Dashboard → API Keys |
| `SAFEPAY_PUBLIC_KEY` | Safepay Dashboard → API Keys |
| `SAFEPAY_WEBHOOK_SECRET` | Safepay Dashboard → Webhooks |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local |

## Step 3: Run SQL Scripts in Supabase SQL Editor (in order)
1. `scripts/001_create_tables.sql`
2. `scripts/002_admin_profile_trigger.sql`
3. `scripts/003_create_first_admin.sql`
4. `scripts/004_performance_indexes.sql`
5. `scripts/005_reviews_cnic_payments.sql` ← NEW
6. `scripts/006_demo_data.sql` ← optional demo data

## Step 4: Run the Project
```bash
npm run dev
```
Open: http://localhost:3000

---

## 💳 Safepay Setup (Pakistan Payment Gateway)
Safepay supports: Debit/Credit Cards, JazzCash, Easypaisa, Bank Transfers — all in PKR.

1. Go to https://getsafepay.pk and create an account
2. Complete business verification
3. Go to Dashboard → API Keys → copy Sandbox keys into `.env.local`
4. Go to Dashboard → Webhooks → add:
   `https://yourdomain.com/api/payments/webhook`
5. For local testing, use ngrok:
   ```bash
   npx ngrok http 3000
   # Copy the https URL and set as NEXT_PUBLIC_APP_URL
   ```
6. When going live, replace Sandbox keys with Live keys and change
   `https://sandbox.api.getsafepay.com` → `https://api.getsafepay.com` in
   `app/api/payments/checkout/route.ts`

## 🗺️ GPS Integration (Real Device)
POST to `/api/tracking` from your GPS tracker:
```json
{ "vehicle_id": "uuid", "latitude": 31.52, "longitude": 74.35 }
```

## ✅ New Features in This Version
- ⭐ Vehicle star ratings + filter by rating/recommendation
- 📄 CNIC front/back upload in agreements (required before signing)
- 🗺️ GPS vehicle tracking for customers + live admin fleet map
- 💳 Safepay payment gateway (PKR, JazzCash, Easypaisa, Cards)
