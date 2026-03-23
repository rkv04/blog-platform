import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';


export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});


export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});


export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  topicId: integer('topic_id').notNull().references(() => topics.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


export const likes = pgTable('likes', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
},
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.userId] }),
  }),
);


export const subscriptions = pgTable('subscriptions', {
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
},
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);


export type DbUserSelect = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;
export type UserRole = 'user' | 'admin';

export type DbTopicSelect = typeof topics.$inferSelect;
export type DbTopicInsert = typeof topics.$inferInsert;

export type DbPostSelect = typeof posts.$inferSelect;
export type DbPostInsert = typeof posts.$inferInsert;

export type DbCommentSelect = typeof comments.$inferSelect;
export type DbCommentInsert = typeof comments.$inferInsert;

export type DbLikeSelect = typeof likes.$inferSelect;
export type DbLikeInsert = typeof likes.$inferInsert;

export type DbSubscriptionSelect = typeof subscriptions.$inferSelect;
export type DbSubscriptionInsert = typeof subscriptions.$inferInsert;

export type DbRefreshTokenSelect = typeof refreshTokens.$inferSelect;
export type DbRefreshTokenInsert = typeof refreshTokens.$inferInsert;