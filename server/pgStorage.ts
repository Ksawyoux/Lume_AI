import { db } from "./db";
import { eq, desc, and, gte, lte, isNull, sql, or } from "drizzle-orm";
import { emotions, transactions, insights, users, healthData, budgets, emotionReferenceImages } from "@shared/schema";
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
  HealthMetricType,
  Budget,
  InsertBudget,
  EmotionReferenceImage,
  InsertEmotionReferenceImage 
} from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
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
    // Build the conditions
    const conditions: any[] = [eq(healthData.userId, userId)];
    
    // Add type condition if provided
    if (type) {
      conditions.push(eq(healthData.type, type));
    }
    
    // Execute the query with proper condition structure
    let result = await db
      .select()
      .from(healthData)
      .where(and(...conditions))
      .orderBy(desc(healthData.timestamp));
    
    // Apply limit if needed
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    
    return result;
  }
  
  async getLatestHealthDataByType(userId: number, type: HealthMetricType): Promise<HealthData | undefined> {
    const result = await db
      .select()
      .from(healthData)
      .where(and(
        eq(healthData.userId, userId),
        eq(healthData.type, type)
      ))
      .orderBy(desc(healthData.timestamp));
    
    // Get the first result
    return result.length > 0 ? result[0] : undefined;
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

  // Budget methods
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const result = await db.insert(budgets).values(insertBudget).returning();
    return result[0];
  }
  
  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.startDate));
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
    return result[0];
  }
  
  async getActiveBudgetsByUserId(userId: number, type?: string): Promise<Budget[]> {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString();
    
    // Build conditions array
    const conditions = [
      eq(budgets.userId, userId),
      eq(budgets.isActive, true),
      sql`${budgets.startDate}::timestamp <= ${currentDateStr}::timestamp`,
      or(
        isNull(budgets.endDate),
        sql`${budgets.endDate}::timestamp >= ${currentDateStr}::timestamp`
      )
    ];
    
    // Add type filter if provided
    if (type) {
      conditions.push(eq(budgets.type, type));
    }
    
    // Execute query with all conditions in a single where clause
    const result = await db
      .select()
      .from(budgets)
      .where(and(...conditions))
      .orderBy(desc(budgets.startDate));
    
    return result;
  }
  
  async updateBudget(id: number, budgetUpdate: Partial<Budget>): Promise<Budget> {
    const result = await db
      .update(budgets)
      .set(budgetUpdate)
      .where(eq(budgets.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Budget with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(eq(budgets.id, id))
      .returning({ id: budgets.id });
    
    return result.length > 0;
  }
  
  async getBudgetSpending(userId: number, budgetId: number): Promise<{ spent: number, remaining: number, percentage: number }> {
    // Get the budget
    const budget = await this.getBudgetById(budgetId);
    
    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }
    
    // Create date filters based on budget period
    const startDateStr = budget.startDate.toISOString();
    const endDateStr = budget.endDate ? budget.endDate.toISOString() : new Date().toISOString();
    
    // Build conditions array
    const conditions = [
      eq(transactions.userId, userId),
      sql`${transactions.amount} < 0`, // Only count expenses
      sql`${transactions.date}::timestamp >= ${startDateStr}::timestamp`,
      sql`${transactions.date}::timestamp <= ${endDateStr}::timestamp`
    ];
    
    // If the budget is for a specific category, add category filter
    if (budget.category) {
      conditions.push(eq(transactions.category, budget.category));
    }
    
    // Execute the query with all conditions in a single where clause
    const result = await db
      .select({
        total: sql<number>`SUM(ABS(${transactions.amount}))`
      })
      .from(transactions)
      .where(and(...conditions));
    
    // Calculate the spending metrics
    const totalSpent = result[0].total || 0;
    const remaining = Math.max(0, budget.amount - totalSpent);
    const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
    
    return {
      spent: totalSpent,
      remaining,
      percentage: Math.min(100, percentage) // Cap at 100%
    };
  }
  
  // Emotion Reference Image methods
  async createEmotionReferenceImage(insertImage: InsertEmotionReferenceImage): Promise<EmotionReferenceImage> {
    const result = await db.insert(emotionReferenceImages).values(insertImage).returning();
    return result[0];
  }
  
  async getEmotionReferenceImagesByUserId(userId: number): Promise<EmotionReferenceImage[]> {
    return await db
      .select()
      .from(emotionReferenceImages)
      .where(eq(emotionReferenceImages.userId, userId))
      .orderBy(desc(emotionReferenceImages.createdAt));
  }
  
  async getEmotionReferenceImagesByEmotion(userId: number, emotion: EmotionType): Promise<EmotionReferenceImage[]> {
    return await db
      .select()
      .from(emotionReferenceImages)
      .where(and(
        eq(emotionReferenceImages.userId, userId),
        eq(emotionReferenceImages.emotion, emotion)
      ))
      .orderBy(desc(emotionReferenceImages.createdAt));
  }
  
  async getEmotionReferenceImageById(id: number): Promise<EmotionReferenceImage | undefined> {
    const result = await db
      .select()
      .from(emotionReferenceImages)
      .where(eq(emotionReferenceImages.id, id))
      .limit(1);
    return result[0];
  }
  
  async deleteEmotionReferenceImage(id: number): Promise<boolean> {
    const result = await db
      .delete(emotionReferenceImages)
      .where(eq(emotionReferenceImages.id, id))
      .returning({ id: emotionReferenceImages.id });
    
    return result.length > 0;
  }
  
  async findMostSimilarEmotionFromImage(userId: number, imageData: string): Promise<{emotion: EmotionType, confidence: number}> {
    // Get all reference images for this user
    const referenceImages = await this.getEmotionReferenceImagesByUserId(userId);
    
    if (referenceImages.length === 0) {
      // If no reference images exist, return a default value
      return { emotion: 'neutral', confidence: 0.5 };
    }
    
    // As a placeholder implementation, we'll return a random emotion from the user's reference images
    // with a random confidence value. In a real implementation, this would use a visual similarity
    // algorithm to find the most similar image and return its emotion.
    const randomIndex = Math.floor(Math.random() * referenceImages.length);
    const randomConfidence = 0.5 + Math.random() * 0.5; // Random value between 0.5 and 1.0
    
    // Get emotion and ensure it's a valid EmotionType
    const randomEmotion = referenceImages[randomIndex].emotion;
    const validEmotions: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];
    
    // Verify that the emotion is valid
    const emotion: EmotionType = validEmotions.includes(randomEmotion as EmotionType) 
      ? (randomEmotion as EmotionType) 
      : 'neutral';
    
    return {
      emotion,
      confidence: randomConfidence
    };
    
    // TODO: Implement actual image similarity comparison using Gemini or a similar service
    // This would involve:
    // 1. Processing the input image
    // 2. Comparing it to each reference image
    // 3. Finding the most similar image(s) 
    // 4. Returning the emotion associated with the most similar image
  }
}