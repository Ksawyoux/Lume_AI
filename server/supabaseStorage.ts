import { createClient } from '@supabase/supabase-js';
import { emotions, transactions, insights, users, healthData } from "@shared/schema";
import type { User, InsertUser, Emotion, InsertEmotion, Transaction, InsertTransaction, Insight, InsertInsight, EmotionType, InsertHealthData, HealthData, HealthMetricType, HealthSource } from "@shared/schema";
import { format, subDays } from "date-fns";
import session from "express-session";
import createMemoryStore from "memorystore";
import { IStorage } from './storage';

// Initialize Supabase client
const supabaseUrl = 'https://rjcirrjwekqlqeztoono.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqY2lycmp3ZWtxbHFlenRvb25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjkwMjYsImV4cCI6MjA2MjIwNTAyNn0.c0L0AkiT02Pip6S9fsigSjmhRZMcL0ZlRANPk6ZorxA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MemoryStore = createMemoryStore(session);

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Ensure tables exist
    this.initTables();
  }

  private async initTables() {
    // Note: In a real implementation we would create the tables if they don't exist
    // For this implementation, we'll assume the tables already exist in Supabase
    console.log('Initializing Supabase storage...');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([insertUser])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error?.message}`);
    }
    
    return data as User;
  }
  
  // Emotion methods
  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    const { data, error } = await supabase
      .from('emotions')
      .insert([insertEmotion])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating emotion:', error);
      throw new Error(`Failed to create emotion: ${error?.message}`);
    }
    
    return data as Emotion;
  }
  
  async getEmotionsByUserId(userId: number): Promise<Emotion[]> {
    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching emotions:', error);
      return [];
    }
    
    return data as Emotion[];
  }
  
  async getEmotionById(id: number): Promise<Emotion | undefined> {
    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching emotion:', error);
      return undefined;
    }
    
    return data as Emotion;
  }
  
  async getLatestEmotionByUserId(userId: number): Promise<Emotion | undefined> {
    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error('Error fetching latest emotion:', error);
      return undefined;
    }
    
    return data as Emotion;
  }
  
  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([insertTransaction])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error?.message}`);
    }
    
    return data as Transaction;
  }
  
  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data as Transaction[];
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching transaction:', error);
      return undefined;
    }
    
    return data as Transaction;
  }
  
  // Insight methods
  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const { data, error } = await supabase
      .from('insights')
      .insert([insertInsight])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating insight:', error);
      throw new Error(`Failed to create insight: ${error?.message}`);
    }
    
    return data as Insight;
  }
  
  async getInsightsByUserId(userId: number): Promise<Insight[]> {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
    
    return data as Insight[];
  }
  
  async getInsightById(id: number): Promise<Insight | undefined> {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching insight:', error);
      return undefined;
    }
    
    return data as Insight;
  }
  
  // Health Data methods
  async createHealthData(insertHealthData: InsertHealthData): Promise<HealthData> {
    const { data, error } = await supabase
      .from('health_data')
      .insert([insertHealthData])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating health data:', error);
      throw new Error(`Failed to create health data: ${error?.message}`);
    }
    
    return data as HealthData;
  }
  
  async getHealthDataByUserId(userId: number, type?: HealthMetricType, limit?: number): Promise<HealthData[]> {
    let query = supabase
      .from('health_data')
      .select('*')
      .eq('userId', userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    query = query.order('timestamp', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching health data:', error);
      return [];
    }
    
    return data as HealthData[];
  }
  
  async getLatestHealthDataByType(userId: number, type: HealthMetricType): Promise<HealthData | undefined> {
    const { data, error } = await supabase
      .from('health_data')
      .select('*')
      .eq('userId', userId)
      .eq('type', type)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error('Error fetching latest health data:', error);
      return undefined;
    }
    
    return data as HealthData;
  }
  
  async getHealthDataStats(userId: number, type: HealthMetricType, days: number = 7): Promise<{ min: number, max: number, avg: number, count: number }> {
    const cutoffDate = subDays(new Date(), days).toISOString();
    
    const { data, error } = await supabase
      .from('health_data')
      .select('value')
      .eq('userId', userId)
      .eq('type', type)
      .gte('timestamp', cutoffDate);
    
    if (error || !data || data.length === 0) {
      console.error('Error fetching health data stats:', error);
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    
    const values = data.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    
    return {
      min,
      max,
      avg,
      count: values.length
    };
  }

  // Analytics methods
  async getSpendingByEmotion(userId: number): Promise<Array<{ emotion: EmotionType, amount: number }>> {
    // Initialize results with all emotion types
    const emotionTypes: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];
    const result = emotionTypes.map(emotion => ({ emotion, amount: 0 }));
    
    // Get transactions with their associated emotions
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        emotions:emotionId (
          type
        )
      `)
      .eq('userId', userId)
      .lt('amount', 0); // Only include expenses (negative amounts)
    
    if (error || !data) {
      console.error('Error fetching spending by emotion:', error);
      return result;
    }
    
    // Calculate spending by emotion
    for (const item of data) {
      if (item.emotions?.type) {
        const emotionType = item.emotions.type as EmotionType;
        const index = result.findIndex(r => r.emotion === emotionType);
        if (index !== -1) {
          result[index].amount += Math.abs(item.amount);
        }
      }
    }
    
    return result;
  }
}

// Export a singleton instance
export const supabaseStorage = new SupabaseStorage();