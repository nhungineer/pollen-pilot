import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  scenario: text("scenario").notNull(),
  flow: text("flow").notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const responseRatings = pgTable("response_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  messageIndex: integer("message_index").notNull(),
  rating: text("rating").notNull(), // 'positive' or 'negative'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  scenario: true,
  flow: true,
  messages: true,
});

export const insertResponseRatingSchema = createInsertSchema(responseRatings).pick({
  sessionId: true,
  messageIndex: true,
  rating: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ResponseRating = typeof responseRatings.$inferSelect;
export type InsertResponseRating = z.infer<typeof insertResponseRatingSchema>;
