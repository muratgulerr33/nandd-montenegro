-- Read state: last guest message and admin read timestamps for unread badge
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "last_guest_message_at" timestamp with time zone;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "last_admin_read_at" timestamp with time zone;
