import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type EmotionType = "stressed" | "worried" | "neutral" | "content" | "happy";

export type HealthMetricType = "heartRate" | "sleepQuality" | "recovery" | "strain" | "readiness" | "steps" | "calories" | "workout";

export type HealthSource = "appleWatch" | "manual" | "whoop" | "fitbit" | "other";

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
  currency: text("currency").default("USD").notNull(), // USD, MAD, etc.
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

export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // heartRate, sleepQuality, recovery, etc.
  value: real("value").notNull(),
  unit: text("unit").notNull(), // bpm, hours, percent, steps, calories, etc.
  source: text("source").notNull(), // appleWatch, manual, whoop, etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: text("metadata"), // JSON string for additional data
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // monthly, yearly, or category-specific
  amount: real("amount").notNull(),
  category: text("category"), // If null, applies to all categories
  currency: text("currency").default("USD").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const emotionReferenceImages = pgTable("emotion_reference_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  emotion: text("emotion", { enum: ["stressed", "worried", "neutral", "content", "happy"] }).notNull(), // Matches EmotionType values
  imageData: text("image_data").notNull(), // Base64 encoded image data
  description: text("description"), // Optional description of the image/context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  initials: true,
});

// Create a base emotion schema without date
const baseEmotionSchema = createInsertSchema(emotions).pick({
  userId: true,
  type: true,
  notes: true,
});

// Export the final emotion schema with modified date handling
export const insertEmotionSchema = baseEmotionSchema.extend({
  // Handle date as either a string or Date object
  date: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]).optional().default(() => new Date()),
});

// Create a base transaction schema without the date field
const baseTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  emotionId: true,
  currency: true,
});

// Export the final transaction schema with modified date handling
export const insertTransactionSchema = baseTransactionSchema.extend({
  // Handle date as either a string or Date object
  date: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]).optional().default(() => new Date()),
});

// Create a base insight schema without date fields
const baseInsightSchema = createInsertSchema(insights).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
});

// Export the final insight schema with modified date handling
export const insertInsightSchema = baseInsightSchema.extend({
  // Handle date as either a string or Date object
  date: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]).optional().default(() => new Date()),
  // Handle updatedDate as either a string or Date object
  updatedDate: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]).optional().default(() => new Date()),
});

// Create a base health data schema without timestamp
const baseHealthDataSchema = createInsertSchema(healthData).pick({
  userId: true,
  type: true,
  value: true,
  unit: true,
  source: true,
  metadata: true,
});

// Export the final health data schema with modified timestamp handling
export const insertHealthDataSchema = baseHealthDataSchema.extend({
  // Handle timestamp as either a string or Date object
  timestamp: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]).optional().default(() => new Date()),
});

// Create a base budget schema
const baseBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  type: true,
  amount: true,
  category: true,
  currency: true,
  isActive: true,
});

// Export the final schema with modified date handling
export const insertBudgetSchema = baseBudgetSchema.extend({
  // Handle startDate as either a string (from form) or Date object
  startDate: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]),
  // Handle endDate as optional string or Date object
  endDate: z.union([
    z.string().transform(str => new Date(str)),
    z.date(),
    z.null()
  ]).nullable(),
});

export const insertEmotionReferenceImageSchema = createInsertSchema(emotionReferenceImages).pick({
  userId: true,
  emotion: true,
  imageData: true,
  description: true,
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

export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type HealthData = typeof healthData.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export type InsertEmotionReferenceImage = z.infer<typeof insertEmotionReferenceImageSchema>;
export type EmotionReferenceImage = typeof emotionReferenceImages.$inferSelect;
