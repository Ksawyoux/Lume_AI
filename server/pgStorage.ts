import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { emotions, transactions, insights, users, healthData } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  Emotion, 
  InsertEmotion, 
  Transaction, 
  InsertTransaction, 
  Insight, 
  InsertInsight, 
  EmotionType, 
  InsertHealthData, 
  HealthData, 
  HealthMetricType 
} from "@shared/schema";
import { format, subDays } from "date-fns";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  constructor() {
    // Initialize database with migrations if needed
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Emotion methods
  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    const result = await db.insert(emotions).values(insertEmotion).returning();
    return result[0];
  }
  
  async getEmotionsByUserId(userId: number): Promise<Emotion[]> {
    return await db
      .select()
      .from(emotions)
      .where(eq(emotions.userId, userId))
      .orderBy(desc(emotions.date));
  }
  
  async getEmotionById(id: number): Promise<Emotion | undefined> {
    const result = await db.select().from(emotions).where(eq(emotions.id, id)).limit(1);
    return result[0];
  }
  
  async getLatestEmotionByUserId(userId: number): Promise<Emotion | undefined> {
    const result = await db
      .select()
      .from(emotions)
      .where(eq(emotions.userId, userId))
      .orderBy(desc(emotions.date))
      .limit(1);
    
    return result[0];
  }
  
  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }
  
  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    const query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }
  
  // Insight methods
  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const result = await db.insert(insights).values(insertInsight).returning();
    return result[0];
  }
  
  async getInsightsByUserId(userId: number): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.date));
  }
  
  async getInsightById(id: number): Promise<Insight | undefined> {
    const result = await db.select().from(insights).where(eq(insights.id, id)).limit(1);
    return result[0];
  }
  
  // Health Data methods
  async createHealthData(insertHealthData: InsertHealthData): Promise<HealthData> {
    const result = await db.insert(healthData).values(insertHealthData).returning();
    return result[0];
  }
  
  async getHealthDataByUserId(userId: number, type?: HealthMetricType, limit?: number): Promise<HealthData[]> {
    if (type) {
      // If type is provided, we need to filter by both userId and type
      let query = db
        .select()
        .from(healthData)
        .where(and(
          eq(healthData.userId, userId),
          eq(healthData.type, type)
        ))
        .orderBy(desc(healthData.timestamp));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    } else {
      // If no type is provided, just filter by userId
      let query = db
        .select()
        .from(healthData)
        .where(eq(healthData.userId, userId))
        .orderBy(desc(healthData.timestamp));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    }
  }
  
  async getLatestHealthDataByType(userId: number, type: HealthMetricType): Promise<HealthData | undefined> {
    const result = await db
      .select()
      .from(healthData)
      .where(and(
        eq(healthData.userId, userId),
        eq(healthData.type, type)
      ))
      .orderBy(desc(healthData.timestamp))
      .limit(1);
    
    return result[0];
  }
  
  async getHealthDataStats(userId: number, type: HealthMetricType, days: number = 7): Promise<{ min: number, max: number, avg: number, count: number }> {
    const cutoffDate = subDays(new Date(), days);
    const cutoffDateStr = cutoffDate.toISOString();
    
    const result = await db
      .select({
        min: sql<number>`MIN(${healthData.value})`,
        max: sql<number>`MAX(${healthData.value})`,
        avg: sql<number>`AVG(${healthData.value})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(healthData)
      .where(and(
        eq(healthData.userId, userId),
        eq(healthData.type, type),
        sql`${healthData.timestamp}::timestamp >= ${cutoffDateStr}::timestamp`
      ));
    
    if (result.length === 0 || result[0].count === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    
    return result[0];
  }

  // Analytics methods
  async getSpendingByEmotion(userId: number): Promise<Array<{ emotion: EmotionType, amount: number }>> {
    // Initialize results with all emotion types
    const emotionTypes: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];
    const result = emotionTypes.map(emotion => ({ emotion, amount: 0 }));
    
    // Get transactions with emotions joined
    const transactionsWithEmotions = await db
      .select({
        amount: transactions.amount,
        emotionType: emotions.type,
      })
      .from(transactions)
      .leftJoin(emotions, eq(transactions.emotionId, emotions.id))
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.amount} < 0` // Only count expenses
      ));
    
    // Calculate spending by emotion
    for (const transaction of transactionsWithEmotions) {
      if (transaction.emotionType) {
        const emotionType = transaction.emotionType as EmotionType;
        const index = result.findIndex(r => r.emotion === emotionType);
        if (index !== -1) {
          result[index].amount += Math.abs(transaction.amount);
        }
      }
    }
    
    return result;
  }
}