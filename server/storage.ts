import { emotions, transactions, insights, users, healthData } from "@shared/schema";
import type { User, InsertUser, Emotion, InsertEmotion, Transaction, InsertTransaction, Insight, InsertInsight, EmotionType, InsertHealthData, HealthData, HealthMetricType } from "@shared/schema";
import { format, subDays } from "date-fns";
import session from "express-session";
import createMemoryStore from "memorystore";

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
  
  // Session store
  sessionStore: session.Store;
}

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emotions: Map<number, Emotion>;
  private transactions: Map<number, Transaction>;
  private insights: Map<number, Insight>;
  private healthData: Map<number, HealthData>;
  private userIds: { current: number };
  private emotionIds: { current: number };
  private transactionIds: { current: number };
  private insightIds: { current: number };
  private healthDataIds: { current: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.emotions = new Map();
    this.transactions = new Map();
    this.insights = new Map();
    this.healthData = new Map();
    
    this.userIds = { current: 1 };
    this.emotionIds = { current: 1 };
    this.transactionIds = { current: 1 };
    this.insightIds = { current: 1 };
    this.healthDataIds = { current: 1 };
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
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
}

export const storage = new MemStorage();

// Add health data after storage is initialized
const addHealthData = async () => {
  const user = await storage.getUser(1);
  if (!user) return;
  
  const today = new Date();
  
  // Heart rate data (bpm)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await storage.createHealthData({
      userId: user.id,
      type: "heartRate",
      value: 60 + Math.floor(Math.random() * 20), // Random between 60-80 bpm
      unit: "bpm",
      source: "appleWatch",
      timestamp: date,
      metadata: JSON.stringify({
        activityType: "resting",
        confidence: "high"
      })
    });
  }
  
  // Sleep data (hours)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await storage.createHealthData({
      userId: user.id,
      type: "sleepQuality",
      value: 5 + Math.random() * 3, // Random between 5-8 hours
      unit: "hours",
      source: "appleWatch",
      timestamp: date,
      metadata: JSON.stringify({
        deepSleep: (1 + Math.random() * 2).toFixed(1),
        remSleep: (1 + Math.random() * 2).toFixed(1),
        lightSleep: (3 + Math.random() * 1).toFixed(1)
      })
    });
  }
  
  // Recovery score (percentage)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await storage.createHealthData({
      userId: user.id,
      type: "recovery",
      value: 30 + Math.floor(Math.random() * 70), // Random between 30-100%
      unit: "percent",
      source: "appleWatch",
      timestamp: date,
      metadata: JSON.stringify({
        hrvScore: Math.floor(Math.random() * 100),
        sleepQualityFactor: Math.floor(Math.random() * 100),
        restingHeartRate: 55 + Math.floor(Math.random() * 10)
      })
    });
  }
  
  // Daily steps
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    await storage.createHealthData({
      userId: user.id,
      type: "steps",
      value: 5000 + Math.floor(Math.random() * 7000), // Random between 5k-12k steps
      unit: "count",
      source: "appleWatch",
      timestamp: date,
      metadata: JSON.stringify({
        activeMinutes: 30 + Math.floor(Math.random() * 60),
        distance: (3 + Math.random() * 6).toFixed(2)
      })
    });
  }
};

// Execute it asynchronously
addHealthData();
