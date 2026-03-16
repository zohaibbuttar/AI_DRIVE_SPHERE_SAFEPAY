# Owner Authentication System Setup Guide

This document outlines the complete secure owner authentication system for Drive Sphere.

## Overview

The system implements a role-based access control (RBAC) system with two roles:
- **customer**: Regular renters (default role)
- **admin**: Vehicle owners/managers

## Architecture

### 1. Database Schema

- **profiles table**: Extends `auth.users` with role, full_name, phone
- **Row Level Security (RLS)**: Enforced on all tables
- **Auto-create profile trigger**: Creates profile when user signs up

### 2. Authentication Flow

#### Customer Signup & Login
1. User signs up at `/auth/sign-up`
2. Role is automatically set to "customer"
3. Profile created via trigger
4. On login, redirected to `/dashboard`

#### Owner Login
1. Owner signs in at `/auth/owner-login`
2. System verifies role is "admin"
3. If not admin → show error: "Access denied. Owner account required."
4. If admin → redirect to `/admin`

### 3. Security Features

#### Middleware Protection (`middleware.ts`)
- Protects `/admin` and `/dashboard` routes
- Checks user authentication
- Verifies admin role before allowing access to `/admin`
- Redirects non-admins to `/dashboard`

#### Admin Layout Protection (`app/admin/layout.tsx`)
- Uses `requireAdmin()` helper function
- Server-side validation on every admin page
- Automatically redirects unauthorized users

#### Helper Function (`lib/auth/requireAdmin.ts`)
- Reusable `requireAdmin()` for any page needing admin access
- Returns user profile or redirects
- Can be used in Server Components or API routes

### 4. UI/UX Features

#### Password Toggle Component (`components/auth/password-toggle-input.tsx`)
- Eye icon to show/hide passwords
- Accessible button with proper ARIA labels
- Used in all login/signup forms

#### Login Page UX
- "Back to Home" link on top left
- Unified login page (no role selector visible)
- Auto-detects role on submission

#### Owner Login Page (`/auth/owner-login`)
- Dedicated owner login endpoint
- Clear error message for unauthorized attempts
- Link to customer login for renters

## Implementation Steps

### Step 1: Run Database Migrations

Execute these SQL scripts in order in Supabase:

```bash
# 1. Initial schema (if not already done)
scripts/001_create_tables.sql

# 2. Setup auto-profile trigger
scripts/002_admin_profile_trigger.sql

# 3. Create first admin (after running 002)
scripts/003_create_first_admin.sql
```

**Important**: Edit `scripts/003_create_first_admin.sql` and replace `owner@email.com` with your actual owner email before running.

### Step 2: Verify Files

Check that all the following files are in place:

#### Authentication Files
- ✅ `lib/auth/types.ts` - Type definitions
- ✅ `lib/auth/requireAdmin.ts` - Admin guard helper
- ✅ `components/auth/password-toggle-input.tsx` - Password toggle component
- ✅ `app/auth/login/page.tsx` - Updated customer login
- ✅ `app/auth/sign-up/page.tsx` - Updated signup (no role selector)
- ✅ `app/auth/owner-login/page.tsx` - Owner login page
- ✅ `app/admin/layout.tsx` - Updated with requireAdmin
- ✅ `lib/supabase/middleware.ts` - Already has admin checks

#### Database Files
- ✅ `scripts/001_create_tables.sql` - Main schema
- ✅ `scripts/002_admin_profile_trigger.sql` - Trigger for auto-profile
- ✅ `scripts/003_create_first_admin.sql` - Admin seeding script

### Step 3: Test the System

1. **Customer Signup**
   - Go to `/auth/sign-up`
   - Create account
   - Should redirect to `/auth/sign-up-success` then `/dashboard`

2. **Customer Login**
   - Go to `/auth/login`
   - Sign in with customer credentials
   - Should redirect to `/dashboard`

3. **Owner Login**
   - Go to `/auth/owner-login`
   - Sign in with owner credentials (role must be "admin")
   - Should redirect to `/admin`

4. **Unauthorized Access**
   - Try to access `/admin` as a customer
   - Should redirect to `/dashboard`
   - Try accessing `/admin` without login
   - Should redirect to `/auth/login`

## File Structure

```
project/
├── lib/
│   ├── auth/
│   │   ├── types.ts                 # Type definitions
│   │   └── requireAdmin.ts          # Admin guard helper
│   ├── supabase/
│   │   ├── middleware.ts            # Middleware (already updated)
│   │   ├── server.ts
│   │   └── client.ts
│   └── utils.ts
├── components/
│   ├── auth/
│   │   └── password-toggle-input.tsx # Password visibility toggle
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   └── ...
│   └── ...
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx             # Updated customer login
│   │   ├── sign-up/
│   │   │   └── page.tsx             # Updated (no role selector)
│   │   ├── owner-login/
│   │   │   └── page.tsx             # New owner login page
│   │   └── ...
│   ├── admin/
│   │   ├── layout.tsx               # Updated with requireAdmin
│   │   ├── page.tsx
│   │   └── ...
│   ├── dashboard/
│   │   └── ...
│   └── ...
├── scripts/
│   ├── 001_create_tables.sql
│   ├── 002_admin_profile_trigger.sql
│   └── 003_create_first_admin.sql
└── middleware.ts                    # Already has admin checks
```

## Usage Examples

### Using requireAdmin in a Page

```typescript
// app/admin/special-page/page.tsx
import { requireAdmin } from "@/lib/auth/requireAdmin"

export default async function SpecialAdminPage() {
  const profile = await requireAdmin() // Redirects if not admin
  
  return (
    <div>
      <h1>Welcome, {profile.full_name}</h1>
      {/* Admin-only content */}
    </div>
  )
}
```

### Using in an API Route

```typescript
// app/api/admin/special/route.ts
import { requireAdmin } from "@/lib/auth/requireAdmin"

export async function POST(request: Request) {
  const profile = await requireAdmin() // Redirects if not admin
  
  // Admin-only logic here
  return Response.json({ success: true })
}
```

### Getting Current User (without role check)

```typescript
import { getCurrentUser } from "@/lib/auth/requireAdmin"

const result = await getCurrentUser()
if (!result) {
  // Not logged in
} else {
  const { user, profile } = result
  // Access user and profile
}
```

## Security Best Practices

1. **Never trust client-side role checks** - Always verify on server
2. **Use middleware for route protection** - First line of defense
3. **Use requireAdmin() in Server Components** - Second line of defense
4. **Use RLS policies on database** - Third line of defense
5. **Never expose role in frontend code** - Role determined server-side
6. **Use HTTP-only cookies for sessions** - Handled by Supabase SSR
7. **Validate inputs on API routes** - Prevent unauthorized operations

## Troubleshooting

### User can't access /admin after signup
1. Check if profile was created with `role = 'admin'`
2. Verify middleware is running
3. Check browser cookies are being set

### Password toggle not working
1. Verify `components/auth/password-toggle-input.tsx` exists
2. Check that imports are correct in login/signup pages
3. Look for console errors

### Profile not auto-created on signup
1. Verify trigger `on_auth_user_created` exists in Supabase
2. Check if `handle_new_user()` function is created
3. Try manually creating a profile via SQL

### "Access denied" for authorized admin
1. Check profile role is "admin" in database
2. Verify middleware isn't blocking the route
3. Check if session is valid (log out and log in again)

## Environment Variables

These should already be set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Next Steps

1. Execute the SQL migrations in order
2. Test the authentication flow end-to-end
3. Add admin assignment feature in admin dashboard (optional)
4. Implement audit logging for admin actions (optional)
5. Add 2FA for owner accounts (optional)

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Supabase logs for database errors
3. Network tab for failed API calls
4. This guide's Troubleshooting section
