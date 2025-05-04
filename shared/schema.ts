import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type EmotionType = "stressed" | "worried" | "neutral" | "content" | "happy";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
});

export const emotions = pgTable("emotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // stressed, worried, neutral, content, happy
  notes: text("notes"),
  date: timestamp("date").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // grocery, entertainment, income, etc.
  date: timestamp("date").defaultNow().notNull(),
  emotionId: integer("emotion_id"),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // stress-triggered, positive-pattern, mood-boosting
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  updatedDate: timestamp("updated_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  initials: true,
});

export const insertEmotionSchema = createInsertSchema(emotions).pick({
  userId: true,
  type: true,
  notes: true,
  date: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  date: true,
  emotionId: true,
});

export const insertInsightSchema = createInsertSchema(insights).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  date: true,
  updatedDate: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmotion = z.infer<typeof insertEmotionSchema>;
export type Emotion = typeof emotions.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;
