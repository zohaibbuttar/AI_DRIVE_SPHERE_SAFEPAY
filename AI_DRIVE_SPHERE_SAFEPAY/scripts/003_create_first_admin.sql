-- =============================================
-- Admin Seeding Script
-- =============================================
-- This script is used to manually assign an admin role to a user
-- 
-- INSTRUCTIONS:
-- 1. Replace 'owner@email.com' with the actual owner email
-- 2. Run this script in your Supabase SQL editor
-- 3. The user must already exist in auth.users (they should have signed up first)
--
-- IMPORTANT: This should only be run for the initial owner setup.
-- Additional admins should be created through your admin dashboard if you build that feature.

-- Example: Assign admin role to a specific user by email
-- First, find the user ID by email, then update their profile role
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'owner@email.com'
);

-- Verify the update
-- select id, email, role from public.profiles where email = 'owner@email.com';
