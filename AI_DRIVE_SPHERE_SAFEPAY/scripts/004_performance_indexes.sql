-- Performance Optimization: Add indexes for auth and RLS queries
-- These significantly speed up queries in middleware and layouts

-- ============================================================================
-- AUTHENTICATION INDEXES
-- ============================================================================

-- Index for profile lookups by user_id (most common query)
-- Used in: middleware, requireAdmin(), getCurrentUser()
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id) 
WHERE deleted_at IS NULL;

-- Composite index for role-based filtering
-- Used in: admin role verification, RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_id_role 
ON profiles(id, role) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- BOOKING INDEXES (for RLS and queries)
-- ============================================================================

-- Index for bookings by user_id (customer's bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id 
ON bookings(user_id) 
WHERE deleted_at IS NULL;

-- Index for bookings by vehicle_id (vehicle's bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id 
ON bookings(vehicle_id) 
WHERE deleted_at IS NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_status 
ON bookings(user_id, status) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- VEHICLE INDEXES
-- ============================================================================

-- Index for vehicles by owner_id
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id 
ON vehicles(owner_id) 
WHERE deleted_at IS NULL;

-- Index for vehicle availability queries
CREATE INDEX IF NOT EXISTS idx_vehicles_status 
ON vehicles(status) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- AGREEMENT INDEXES
-- ============================================================================

-- Index for agreements by user_id
CREATE INDEX IF NOT EXISTS idx_agreements_user_id 
ON agreements(user_id) 
WHERE deleted_at IS NULL;

-- Index for agreements by booking_id
CREATE INDEX IF NOT EXISTS idx_agreements_booking_id 
ON agreements(booking_id) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- TRACKING INDEXES
-- ============================================================================

-- Index for tracking by booking_id (most common query)
CREATE INDEX IF NOT EXISTS idx_tracking_booking_id 
ON tracking(booking_id) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- PERFORMANCE TIPS
-- ============================================================================
-- 
-- After adding indexes, run VACUUM ANALYZE to optimize query planner:
-- VACUUM ANALYZE;
--
-- To check index usage:
-- SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
--
-- Monitor slow queries:
-- Enable log_min_duration_statement in Supabase dashboard
--
-- ============================================================================
