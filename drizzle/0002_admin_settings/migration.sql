-- Admin settings: single row (id=1), DND, notify_mode, profile
CREATE TYPE "notify_mode" AS ENUM('first_message', 'every_message', 'silent');

CREATE TABLE IF NOT EXISTS "admin_settings" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "dnd_enabled" boolean DEFAULT false NOT NULL,
  "notify_mode" "notify_mode" DEFAULT 'every_message' NOT NULL,
  "first_name" text,
  "last_name" text,
  "avatar_url" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure single row
INSERT INTO "admin_settings" ("id", "dnd_enabled", "notify_mode", "updated_at")
VALUES (1, false, 'every_message', now())
ON CONFLICT ("id") DO NOTHING;
