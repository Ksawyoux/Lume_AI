import { emotions, transactions, insights, users, healthData, budgets, emotionReferenceImages } from "@shared/schema";
import type { 
  User, InsertUser, 
  Emotion, InsertEmotion, 
  Transaction, InsertTransaction, 
  Insight, InsertInsight, 
  EmotionType, 
  InsertHealthData, HealthData, HealthMetricType,
  Budget, InsertBudget,
  EmotionReferenceImage, InsertEmotionReferenceImage
} from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Emotions
  createEmotion(emotion: InsertEmotion): Promise<Emotion>;
  getEmotionsByUserId(userId: number): Promise<Emotion[]>;
  getEmotionById(id: number): Promise<Emotion | undefined>;
  getLatestEmotionByUserId(userId: number): Promise<Emotion | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  
  // Insights
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsightsByUserId(userId: number): Promise<Insight[]>;
  getInsightById(id: number): Promise<Insight | undefined>;
  
  // Health Data
  createHealthData(healthData: InsertHealthData): Promise<HealthData>;
  getHealthDataByUserId(userId: number, type?: HealthMetricType, limit?: number): Promise<HealthData[]>;
  getLatestHealthDataByType(userId: number, type: HealthMetricType): Promise<HealthData | undefined>;
  getHealthDataStats(userId: number, type: HealthMetricType, days?: number): Promise<{ min: number, max: number, avg: number, count: number }>;

  // Analytics
  getSpendingByEmotion(userId: number): Promise<Array<{ emotion: EmotionType, amount: number }>>;
  
  // Budgets
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  getActiveBudgetsByUserId(userId: number, type?: string): Promise<Budget[]>;
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: number): Promise<boolean>;
  getBudgetSpending(userId: number, budgetId: number): Promise<{ spent: number, remaining: number, percentage: number }>;
  
  // Emotion Reference Images
  createEmotionReferenceImage(image: InsertEmotionReferenceImage): Promise<EmotionReferenceImage>;
  getEmotionReferenceImagesByUserId(userId: number): Promise<EmotionReferenceImage[]>;
  getEmotionReferenceImagesByEmotion(userId: number, emotion: EmotionType): Promise<EmotionReferenceImage[]>;
  getEmotionReferenceImageById(id: number): Promise<EmotionReferenceImage | undefined>;
  deleteEmotionReferenceImage(id: number): Promise<boolean>;
  findMostSimilarEmotionFromImage(userId: number, imageData: string): Promise<{emotion: EmotionType, confidence: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emotions: Map<number, Emotion>;
  private transactions: Map<number, Transaction>;
  private insights: Map<number, Insight>;
  private healthData: Map<number, HealthData>;
  private budgets: Map<number, Budget>;
  private emotionReferenceImages: Map<number, EmotionReferenceImage>;
  private userIds: { current: number };
  private emotionIds: { current: number };
  private transactionIds: { current: number };
  private insightIds: { current: number };
  private healthDataIds: { current: number };
  private budgetIds: { current: number };
  private emotionReferenceImageIds: { current: number };

  constructor() {
    this.users = new Map();
    this.emotions = new Map();
    this.transactions = new Map();
    this.insights = new Map();
    this.healthData = new Map();
    this.budgets = new Map();
    this.emotionReferenceImages = new Map();
    
    this.userIds = { current: 1 };
    this.emotionIds = { current: 1 };
    this.transactionIds = { current: 1 };
    this.insightIds = { current: 1 };
    this.healthDataIds = { current: 1 };
    this.budgetIds = { current: 1 };
    this.emotionReferenceImageIds = { current: 1 };
    
    // Add seed data
    this.seedData();
  }

  private seedData() {
    // Create a test user
    const user: User = {
      id: this.userIds.current++,
      username: "demo",
      password: "password", // In a real app, this would be hashed
      name: "Youness",
      initials: "YS",
    };
    this.users.set(user.id, user);
    
    // Define the emotion categories
    const emotionTypes: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];
    
    // Create some emotions for the user
    const emotions: InsertEmotion[] = [
      {
        userId: user.id,
        type: "stressed",
        notes: "Feeling overwhelmed with work",
        date: new Date(2023, 4, 10) // May 10, 2023
      },
      {
        userId: user.id,
        type: "worried",
        notes: "Concerned about upcoming bills",
        date: new Date(2023, 4, 11) // May 11, 2023
      },
      {
        userId: user.id,
        type: "happy",
        notes: "Got a promotion!",
        date: new Date(2023, 4, 14) // May 14, 2023
      },
      {
        userId: user.id,
        type: "content",
        notes: "Feeling calm and balanced today",
        date: new Date(2023, 4, 15) // May 15, 2023
      }
    ];
    
    // Add emotions
    emotions.forEach(emotion => {
      const emotionId = this.emotionIds.current++;
      this.emotions.set(emotionId, { ...emotion, id: emotionId });
    });
    
    // Add transactions
    this.createTransaction({
      userId: user.id,
      amount: -64.32,
      description: "Whole Foods Market",
      category: "grocery",
      date: new Date(2023, 4, 15, 14, 34), // May 15, 2023, 2:34 PM
      emotionId: 4 // Content
    });
    
    this.createTransaction({
      userId: user.id,
      amount: -32.50,
      description: "Cinema City",
      category: "entertainment",
      date: new Date(2023, 4, 14, 19, 15), // May 14, 2023, 7:15 PM
      emotionId: 2 // Worried
    });
    
    this.createTransaction({
      userId: user.id,
      amount: 1450.00,
      description: "Paycheck Deposit",
      category: "income",
      date: new Date(2023, 4, 14, 9, 0), // May 14, 2023, 9:00 AM
      emotionId: 3 // Happy
    });
    
    this.createTransaction({
      userId: user.id,
      amount: -128.75,
      description: "Online Shopping",
      category: "shopping",
      date: new Date(2023, 4, 13, 11, 42), // May 13, 2023, 11:42 AM
      emotionId: 1 // Stressed
    });
    
    // Add insights
    this.createInsight({
      userId: user.id,
      type: "stress-triggered",
      title: "Stress-Triggered Spending",
      description: "You've spent $312 more than usual on online shopping when you were stressed. Try setting a 24-hour waiting period for purchases over $50 when feeling stressed.",
      date: new Date(2023, 4, 15),
      updatedDate: new Date(2023, 4, 15)
    });
    
    this.createInsight({
      userId: user.id,
      type: "positive-pattern",
      title: "Positive Spending Pattern",
      description: "When you're happy, you tend to spend on healthier food options and activities. This month, 65% of your happy-state purchases were for long-term wellbeing.",
      date: new Date(2023, 4, 15),
      updatedDate: new Date(2023, 4, 15)
    });
    
    this.createInsight({
      userId: user.id,
      type: "mood-boosting",
      title: "Mood-Boosting Activities",
      description: "Spending on outdoor activities correlates with a 27% improvement in your reported mood the following day. Consider budgeting $100/month for these activities.",
      date: new Date(2023, 4, 15),
      updatedDate: new Date(2023, 4, 15)
    });
    
    // Health data will be added separately
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIds.current++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Emotion methods
  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    const id = this.emotionIds.current++;
    const emotion: Emotion = { ...insertEmotion, id };
    this.emotions.set(id, emotion);
    return emotion;
  }
  
  async getEmotionsByUserId(userId: number): Promise<Emotion[]> {
    return Array.from(this.emotions.values())
      .filter(emotion => emotion.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getEmotionById(id: number): Promise<Emotion | undefined> {
    return this.emotions.get(id);
  }
  
  async getLatestEmotionByUserId(userId: number): Promise<Emotion | undefined> {
    const userEmotions = await this.getEmotionsByUserId(userId);
    return userEmotions.length > 0 ? userEmotions[0] : undefined;
  }
  
  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIds.current++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  // Insight methods
  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = this.insightIds.current++;
    const insight: Insight = { ...insertInsight, id };
    this.insights.set(id, insight);
    return insight;
  }
  
  async getInsightsByUserId(userId: number): Promise<Insight[]> {
    return Array.from(this.insights.values())
      .filter(insight => insight.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getInsightById(id: number): Promise<Insight | undefined> {
    return this.insights.get(id);
  }
  
  // Health Data methods
  async createHealthData(insertHealthData: InsertHealthData): Promise<HealthData> {
    const id = this.healthDataIds.current++;
    const healthData: HealthData = { ...insertHealthData, id };
    this.healthData.set(id, healthData);
    return healthData;
  }
  
  async getHealthDataByUserId(userId: number, type?: HealthMetricType, limit?: number): Promise<HealthData[]> {
    let userHealthData = Array.from(this.healthData.values())
      .filter(data => data.userId === userId);
      
    if (type) {
      userHealthData = userHealthData.filter(data => data.type === type);
    }
    
    userHealthData = userHealthData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? userHealthData.slice(0, limit) : userHealthData;
  }
  
  async getLatestHealthDataByType(userId: number, type: HealthMetricType): Promise<HealthData | undefined> {
    const userHealthData = await this.getHealthDataByUserId(userId, type);
    return userHealthData.length > 0 ? userHealthData[0] : undefined;
  }
  
  async getHealthDataStats(userId: number, type: HealthMetricType, days: number = 7): Promise<{ min: number, max: number, avg: number, count: number }> {
    const cutoffDate = subDays(new Date(), days);
    
    const relevantData = (await this.getHealthDataByUserId(userId, type))
      .filter(data => new Date(data.timestamp) >= cutoffDate);
    
    if (relevantData.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    
    const values = relevantData.map(data => data.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    
    return {
      min,
      max,
      avg,
      count: values.length
    };
  }

  // Analytics methods
  async getSpendingByEmotion(userId: number): Promise<Array<{ emotion: EmotionType, amount: number }>> {
    const transactions = await this.getTransactionsByUserId(userId);
    
    // Initialize results with all emotion types
    const emotionTypes: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];
    const result = emotionTypes.map(emotion => ({ emotion, amount: 0 }));
    
    // Calculate spending by emotion
    for (const transaction of transactions) {
      if (transaction.emotionId) {
        const emotion = await this.getEmotionById(transaction.emotionId);
        if (emotion && transaction.amount < 0) { // Only count expenses
          const index = result.findIndex(r => r.emotion === emotion.type);
          if (index !== -1) {
            result[index].amount += Math.abs(transaction.amount);
          }
        }
      }
    }
    
    return result;
  }

  // Budget methods
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetIds.current++;
    const budget: Budget = { ...insertBudget, id };
    this.budgets.set(id, budget);
    return budget;
  }
  
  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async getActiveBudgetsByUserId(userId: number, type?: string): Promise<Budget[]> {
    const currentDate = new Date();
    let userBudgets = Array.from(this.budgets.values())
      .filter(budget => 
        budget.userId === userId && 
        budget.isActive && 
        new Date(budget.startDate) <= currentDate && 
        (!budget.endDate || new Date(budget.endDate) >= currentDate)
      );
    
    if (type) {
      userBudgets = userBudgets.filter(budget => budget.type === type);
    }
    
    return userBudgets.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }
  
  async updateBudget(id: number, budgetUpdate: Partial<Budget>): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) {
      throw new Error(`Budget with id ${id} not found`);
    }
    
    const updatedBudget = { ...budget, ...budgetUpdate };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
  
  async getBudgetSpending(userId: number, budgetId: number): Promise<{ spent: number, remaining: number, percentage: number }> {
    const budget = await this.getBudgetById(budgetId);
    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }
    
    const transactions = await this.getTransactionsByUserId(userId);
    
    // Filter transactions based on budget type and date range
    const startDate = new Date(budget.startDate);
    const endDate = budget.endDate ? new Date(budget.endDate) : new Date();
    
    let relevantTransactions = transactions.filter(t => 
      t.amount < 0 && // Only count expenses
      new Date(t.date) >= startDate &&
      new Date(t.date) <= endDate
    );
    
    // If budget is for a specific category, filter by that category
    if (budget.category) {
      relevantTransactions = relevantTransactions.filter(t => t.category === budget.category);
    }
    
    // Calculate total spent
    const totalSpent = relevantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate remaining and percentage
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
    const id = this.emotionReferenceImageIds.current++;
    const now = new Date();
    const image: EmotionReferenceImage = { 
      ...insertImage, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.emotionReferenceImages.set(id, image);
    return image;
  }
  
  async getEmotionReferenceImagesByUserId(userId: number): Promise<EmotionReferenceImage[]> {
    return Array.from(this.emotionReferenceImages.values())
      .filter(image => image.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getEmotionReferenceImagesByEmotion(userId: number, emotion: EmotionType): Promise<EmotionReferenceImage[]> {
    return Array.from(this.emotionReferenceImages.values())
      .filter(image => image.userId === userId && image.emotion === emotion)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getEmotionReferenceImageById(id: number): Promise<EmotionReferenceImage | undefined> {
    return this.emotionReferenceImages.get(id);
  }
  
  async deleteEmotionReferenceImage(id: number): Promise<boolean> {
    return this.emotionReferenceImages.delete(id);
  }
  
  async findMostSimilarEmotionFromImage(userId: number, imageData: string): Promise<{emotion: EmotionType, confidence: number}> {
    // Get all reference images for this user
    const referenceImages = await this.getEmotionReferenceImagesByUserId(userId);
    
    if (referenceImages.length === 0) {
      // If no reference images exist, return a default value
      return { emotion: 'neutral', confidence: 0.5 };
    }
    
    // In a real implementation, we would use a similarity algorithm to find the most similar image
    // For now, just return a random emotion from the user's reference images
    const randomIndex = Math.floor(Math.random() * referenceImages.length);
    const randomConfidence = 0.5 + Math.random() * 0.5; // Random value between 0.5 and 1.0
    
    return {
      emotion: referenceImages[randomIndex].emotion,
      confidence: randomConfidence
    };
  }
}

import { PgStorage } from "./pgStorage";

// Use PostgreSQL storage instead of in-memory storage
export const storage = new PgStorage();
