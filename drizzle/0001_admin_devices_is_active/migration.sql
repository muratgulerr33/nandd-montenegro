-- Add is_active to admin_devices for invalid token handling
ALTER TABLE "admin_devices" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
