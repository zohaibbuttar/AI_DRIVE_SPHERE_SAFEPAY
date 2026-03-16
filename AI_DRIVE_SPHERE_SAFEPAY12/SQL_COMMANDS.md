# SQL Commands for Owner Authentication

All SQL commands needed for the owner authentication system in one place.

## 1. Create Auto-Profile Trigger

Run this first to auto-create profiles when users sign up:

```sql
-- =============================================
-- Auto-create profile on user signup
-- =============================================

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

**What it does:**
- Creates a function that runs when a new user signs up
- Automatically inserts a profile with role='customer' (default)
- Prevents duplicate profiles

## 2. Make Your First Admin

Run this second, replacing `owner@email.com` with your email:

```sql
-- =============================================
-- Assign admin role to user
-- =============================================

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'owner@email.com'
);
```

**What it does:**
- Finds your user by email
- Sets their role to 'admin'
- They can now access `/admin`

**Verify it worked:**
```sql
select id, email, role from public.profiles where email = 'owner@email.com';
```

Should show `role = 'admin'`

## 3. Verify Trigger is Working

After a new customer signs up, verify their profile was created:

```sql
select id, email, full_name, phone, role, created_at 
from public.profiles 
order by created_at desc 
limit 1;
```

Should show the latest customer with `role = 'customer'`

## 4. Update Admin Role (Optional)

If you need to change someone's role:

```sql
-- Make someone an admin
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'user@example.com');

-- Revoke admin role
update public.profiles
set role = 'customer'
where id = (select id from auth.users where email = 'user@example.com');
```

## 5. View All Users and Their Roles

```sql
select 
  au.id,
  au.email,
  p.full_name,
  p.phone,
  p.role,
  au.created_at as signup_date
from auth.users au
left join public.profiles p on p.id = au.id
order by au.created_at desc;
```

## 6. Delete a User (Be Careful!)

```sql
-- This will cascade delete the user and their profile
delete from auth.users where email = 'user@example.com';
```

**Note:** This will delete all related data (bookings, agreements, etc.) due to ON DELETE CASCADE

## 7. Reset Role of All Users to Customer

```sql
update public.profiles
set role = 'customer'
where role = 'admin' and id != (
  select id from auth.users where email = 'your@email.com'
);
```

## 8. Verify Row Level Security (RLS) Policies

```sql
-- Check RLS is enabled on profiles table
select * from information_schema.tables 
where table_name = 'profiles' 
and table_schema = 'public';

-- List all RLS policies on profiles
select * from pg_policies 
where tablename = 'profiles';
```

## 9. Check Auth Users Count

```sql
select 
  count(*) as total_users,
  (select count(*) from public.profiles where role = 'admin') as admin_count,
  (select count(*) from public.profiles where role = 'customer') as customer_count
from auth.users;
```

## 10. View Audit Trail (if needed later)

If you add an audit log table:

```sql
-- Example audit log
select * from audit_log 
where action = 'admin_login' 
order by created_at desc 
limit 20;
```

## Common Queries

### Check if user is admin
```sql
select role 
from public.profiles 
where id = '<user_id>' 
and role = 'admin';
```

### List all admins
```sql
select id, email, full_name 
from public.profiles p
join auth.users au on p.id = au.id
where role = 'admin';
```

### Count admins vs customers
```sql
select role, count(*) 
from public.profiles 
group by role;
```

### Find user by email
```sql
select au.id, au.email, p.role 
from auth.users au 
join public.profiles p on p.id = au.id 
where au.email = 'user@example.com';
```

### Get user profile data
```sql
select * 
from public.profiles 
where id = '<user_id>';
```

## Troubleshooting Queries

### Check if trigger exists
```sql
select * from pg_trigger 
where tgname = 'on_auth_user_created';
```

### Check if trigger function exists
```sql
select * from pg_proc 
where proname = 'handle_new_user';
```

### Check RLS policies
```sql
select * from pg_policies 
where tablename = 'profiles';
```

### Check for RLS constraint violations
```sql
-- These queries will fail if RLS is working correctly
select * from public.profiles; -- As customer user
```

### View function definition
```sql
select pg_get_functiondef(oid) 
from pg_proc 
where proname = 'handle_new_user';
```

## Safe Testing Queries

Run these to test without making changes:

```sql
-- Check what role this email has (won't change anything)
select id, email, role 
from public.profiles p 
join auth.users au on p.id = au.id 
where au.email = 'test@example.com';

-- Check if profile exists for user
select * 
from public.profiles 
where id = '<user_id>';

-- Check trigger is active
select * 
from pg_trigger 
where tgname = 'on_auth_user_created';
```

## Installation Order

1. ✅ `002_admin_profile_trigger.sql` - First (creates trigger)
2. ✅ `003_create_first_admin.sql` - Second (makes you admin)
3. ✅ Deploy application code
4. ✅ Test signup and login flows

## Important Notes

⚠️ **Before running SQL:**
- Take a backup of your database
- Test in a staging environment first
- Replace email addresses with your own
- Run commands in order

⚠️ **Security:**
- Don't modify role from frontend
- Always verify role server-side
- Use RLS policies to enforce access
- Log admin actions

---

For more context, see:
- `QUICK_START_OWNER_AUTH.md` - Quick 5-minute setup
- `OWNER_AUTH_SETUP.md` - Complete detailed guide
- `AUTHENTICATION_CHANGES.md` - All files changed
