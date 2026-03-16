# Quick Start: Owner Authentication

Get your owner authentication system running in 5 minutes.

## ⚡ Super Quick Setup

### Step 1: Run SQL Migrations (2 minutes)

Go to your Supabase SQL Editor and run these in order:

**First**, run the trigger (copy from `scripts/002_admin_profile_trigger.sql`):
```sql
-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**Second**, assign yourself as admin (replace `owner@email.com`):
```sql
-- Make yourself admin
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'owner@email.com'
);
```

### Step 2: Test It (3 minutes)

1. **Test Customer Signup**
   - Go to `http://localhost:3000/auth/sign-up`
   - Create an account
   - Click "Back to Home" → works ✅
   - Password toggle works ✅
   - Redirects to dashboard ✅

2. **Test Customer Login**
   - Go to `http://localhost:3000/auth/login`
   - Sign in with customer account
   - Redirected to `/dashboard` ✅

3. **Test Owner Login**
   - Go to `http://localhost:3000/auth/owner-login`
   - Sign in with owner email
   - Redirected to `/admin` ✅

4. **Test Security**
   - Try to access `/admin` as customer → redirects to `/dashboard` ✅
   - Try to access `/admin` without login → redirects to `/auth/login` ✅
   - Try owner login as customer → shows error ✅

## 📁 Files You'll Find

```
New files created:
├── lib/auth/types.ts                           # Type definitions
├── lib/auth/requireAdmin.ts                    # Admin guard helper
├── components/auth/password-toggle-input.tsx   # Password toggle
├── app/auth/owner-login/page.tsx              # Owner login page
├── scripts/002_admin_profile_trigger.sql      # Auto-profile trigger
└── scripts/003_create_first_admin.sql         # Admin assignment script

Updated files:
├── app/auth/sign-up/page.tsx                  # No more role selector
├── app/auth/login/page.tsx                    # Simplified
├── app/admin/layout.tsx                       # Uses requireAdmin helper
└── middleware.ts                              # Already has checks
```

## 🔐 How It Works

```
Customer Signs Up
  ↓
Profile auto-created with role='customer'
  ↓
Logs in at /auth/login
  ↓
Redirected to /dashboard
  ↓
Cannot access /admin ✓

Owner Logs in at /auth/owner-login
  ↓
System checks role == 'admin'
  ↓
Redirected to /admin
  ↓
Access granted ✓
```

## 🚀 Key Features Ready to Use

✅ Password show/hide toggle on all forms
✅ "Back to Home" links on auth pages
✅ Dedicated owner login at `/auth/owner-login`
✅ Auto role enforcement via middleware
✅ Double-verification in admin layout
✅ Helper function `requireAdmin()` for custom pages
✅ TypeScript types for all auth objects
✅ Security on 3 layers: middleware, layout, database

## 🛠️ Using in Your Code

### Protect a page with admin check:
```typescript
// app/admin/my-page/page.tsx
import { requireAdmin } from "@/lib/auth/requireAdmin"

export default async function MyPage() {
  const profile = await requireAdmin() // Redirects if not admin
  return <div>Only admins see this</div>
}
```

### Protect an API route:
```typescript
// app/api/admin/route.ts
import { requireAdmin } from "@/lib/auth/requireAdmin"

export async function POST(request: Request) {
  const profile = await requireAdmin() // Redirects if not admin
  // Admin-only logic
}
```

### Get current user (no role check):
```typescript
import { getCurrentUser } from "@/lib/auth/requireAdmin"

const result = await getCurrentUser()
if (result) {
  const { user, profile } = result
}
```

## 📋 Checklist Before Production

- [ ] Ran trigger script in Supabase
- [ ] Made yourself admin with SQL update
- [ ] Tested signup as customer
- [ ] Tested login as customer
- [ ] Tested owner login
- [ ] Verified unauthorized access redirects
- [ ] Password toggle works
- [ ] Back to Home links work
- [ ] Read `OWNER_AUTH_SETUP.md` for advanced setup

## ⚠️ Common Issues

**Q: I get "Access denied" when logging in as owner?**
A: Make sure you ran the SQL update to set your role to admin. Check: `select email, role from profiles where email = 'your@email.com'`

**Q: Password toggle doesn't show?**
A: Make sure `components/auth/password-toggle-input.tsx` exists. Check imports in login/signup pages.

**Q: Can't access /admin even though I'm admin?**
A: Log out and log in again. Sometimes the session needs to be refreshed.

**Q: Profile wasn't auto-created?**
A: Check if the trigger exists: `select * from pg_trigger where tgname = 'on_auth_user_created'`

## 🎯 Next Steps

1. ✅ Complete the Quick Setup above
2. 📖 Read `OWNER_AUTH_SETUP.md` for detailed guide
3. 🔍 Review `AUTHENTICATION_CHANGES.md` for all changes
4. 🧪 Test the complete flow
5. 🚀 Deploy to production
6. 🛠️ Add features from `requireAdmin()` helper to other pages

## 💡 Pro Tips

- Use `requireAdmin()` helper in all admin pages for consistency
- Never trust role in frontend - always check server-side
- Add 2FA for owner accounts later
- Log admin actions in an audit table
- Set up email notifications for admin logins

---

**Ready?** Go to step 1 and start! 🚀
