import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const conversationStatusEnum = pgEnum('conversation_status', [
  'open',
  'closed',
]);

export const senderEnum = pgEnum('sender', ['guest', 'admin']);

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: text('visitor_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: conversationStatusEnum('status').notNull().default('open'),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  sender: senderEnum('sender').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifyModeEnum = pgEnum('notify_mode', [
  'first_message',
  'every_message',
  'silent',
]);

export const adminSettings = pgTable('admin_settings', {
  id: integer('id').primaryKey().default(1),
  dndEnabled: boolean('dnd_enabled').notNull().default(false),
  notifyMode: notifyModeEnum('notify_mode').notNull().default('every_message'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminDevices = pgTable('admin_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(),
  fcmToken: text('fcm_token').notNull().unique(),
  platform: text('platform').notNull().default('android'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});
