-- Admin inbox sound: preset name and enabled flag
ALTER TABLE "admin_settings" ADD COLUMN IF NOT EXISTS "inbox_sound" text DEFAULT 'soft_click';
ALTER TABLE "admin_settings" ADD COLUMN IF NOT EXISTS "inbox_sound_enabled" boolean DEFAULT true NOT NULL;
