-- Chat MVP: conversations, messages, admin_devices
CREATE TYPE "conversation_status" AS ENUM('open', 'closed');

CREATE TYPE "sender" AS ENUM('guest', 'admin');

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "visitor_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
  "status" "conversation_status" DEFAULT 'open' NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL,
  "sender" "sender" NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" 
  FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE TABLE IF NOT EXISTS "admin_devices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "label" text NOT NULL,
  "fcm_token" text NOT NULL UNIQUE,
  "platform" text DEFAULT 'android' NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
