import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertEmotionSchema, insertHealthDataSchema, insertTransactionSchema, insertUserSchema, insertBudgetSchema, HealthMetricType } from "@shared/schema";
import emotionAnalysisRoutes from "./routes/emotion-analysis";
import insightsGeneratorRoutes from "./routes/insights-generator";
import facialAnalysisRoutes from "./routes/facial-analysis";
import emotionReferenceImageRoutes from "./routes/emotion-reference-images";
import advancedEmotionAnalysisRoutes from "./routes/advanced-emotion-analysis";
import voiceEmotionAnalysisRoutes from "./routes/voice-emotion-analysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: User registration, login, and session management is now handled by the auth.ts module
  
  // Emotion routes
  app.get("/api/users/:userId/emotions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const emotions = await storage.getEmotionsByUserId(userId);
      res.json(emotions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/emotions", async (req, res) => {
    try {
      const emotionData = insertEmotionSchema.parse(req.body);
      const user = await storage.getUser(emotionData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newEmotion = await storage.createEmotion(emotionData);
      res.status(201).json(newEmotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:userId/emotions/latest", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const latestEmotion = await storage.getLatestEmotionByUserId(userId);
      
      if (!latestEmotion) {
        return res.status(404).json({ message: "No emotions found for this user" });
      }
      
      res.json(latestEmotion);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transaction routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transactions = await storage.getTransactionsByUserId(userId, limit);
      
      // Enhance transactions with emotion data
      const enhancedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          let emotion = undefined;
          
          if (transaction.emotionId) {
            emotion = await storage.getEmotionById(transaction.emotionId);
          }
          
          return {
            ...transaction,
            emotion
          };
        })
      );
      
      res.json(enhancedTransactions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const user = await storage.getUser(transactionData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (transactionData.emotionId) {
        const emotion = await storage.getEmotionById(transactionData.emotionId);
        
        if (!emotion) {
          return res.status(404).json({ message: "Emotion not found" });
        }
      }
      
      const newTransaction = await storage.createTransaction(transactionData);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Insight routes
  app.get("/api/users/:userId/insights", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const insights = await storage.getInsightsByUserId(userId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Health data routes
  app.get("/api/users/:userId/health/:type", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.params.type as HealthMetricType;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate health metric type
      const validTypes = ["heartRate", "sleepQuality", "recovery", "strain", "readiness", "steps", "calories", "workout"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid health metric type" });
      }
      
      const healthData = await storage.getHealthDataByUserId(userId, type, limit);
      res.json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:userId/health/:type/latest", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.params.type as HealthMetricType;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate health metric type
      const validTypes = ["heartRate", "sleepQuality", "recovery", "strain", "readiness", "steps", "calories", "workout"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid health metric type" });
      }
      
      const latestHealthData = await storage.getLatestHealthDataByType(userId, type);
      
      if (!latestHealthData) {
        return res.status(404).json({ message: `No ${type} data found for this user` });
      }
      
      res.json(latestHealthData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:userId/health/:type/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.params.type as HealthMetricType;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate health metric type
      const validTypes = ["heartRate", "sleepQuality", "recovery", "strain", "readiness", "steps", "calories", "workout"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid health metric type" });
      }
      
      const stats = await storage.getHealthDataStats(userId, type, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/health", async (req, res) => {
    try {
      const healthData = insertHealthDataSchema.parse(req.body);
      const user = await storage.getUser(healthData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newHealthData = await storage.createHealthData(healthData);
      res.status(201).json(newHealthData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Analytics routes
  app.get("/api/users/:userId/analytics/spending-by-emotion", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get spending by emotion data
      const spendingByEmotion = await storage.getSpendingByEmotion(userId);
      
      // Get recent transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const transactions = await storage.getTransactionsByUserId(userId);
      
      // Calculate additional metrics
      let totalSpending = 0;
      let emotionImpact = 32; // default value
      let impulsePercentage = 0;
      
      if (transactions && transactions.length > 0) {
        // Calculate total spending
        const expenses = transactions
          .filter(t => t.amount < 0)
          .map(t => Math.abs(t.amount));
          
        totalSpending = expenses.reduce((sum, amount) => sum + amount, 0);
        
        // Calculate impulse percentage
        const emotionPurchases = transactions.filter(t => t.emotionId !== null).length;
        if (transactions.length > 0) {
          impulsePercentage = Math.round((emotionPurchases / transactions.length) * 100);
        } else {
          impulsePercentage = 0; // Set to 0 explicitly when no transactions
        }
        
        // Calculate emotion impact - variance in spending
        if (spendingByEmotion.length > 1) {
          const values = spendingByEmotion.map(item => item.amount);
          const max = Math.max(...values);
          const min = Math.min(...values);
          emotionImpact = max > 0 ? Math.round(((max - min) / max) * 100) : emotionImpact;
        }
      }
      
      // Get budget information for savings calculation
      const budgets = await storage.getActiveBudgetsByUserId(userId);
      let savingsTarget = 0; // default to 0 when no data instead of -12
      
      if (budgets && budgets.length > 0) {
        const monthlyBudget = budgets.find(b => 
          b.type.toLowerCase() === 'monthly' || b.type.toLowerCase() === 'overall'
        );
        
        if (monthlyBudget && totalSpending > 0) {
          savingsTarget = Math.round(((monthlyBudget.amount - totalSpending) / monthlyBudget.amount) * 100);
        }
      }
      
      // Create emotionSpending object from array data
      const emotionSpending: Record<string, number> = {
        stressed: 0,
        content: 0,
        worried: 0,
        neutral: 0,
        happy: 0
      };
      
      spendingByEmotion.forEach(item => {
        emotionSpending[item.emotion] = item.amount;
      });
      
      // Return the formatted data that matches our frontend interface
      res.json({
        totalSpending,
        emotionImpact,
        impulsePercentage,
        savingsTarget,
        emotionSpending
      });
    } catch (error) {
      console.error('Error getting analytics data:', error);
      res.status(500).json({ 
        message: "Internal server error",
        totalSpending: 0,
        emotionImpact: 32,
        impulsePercentage: 0,
        savingsTarget: 0,
        emotionSpending: {
          stressed: 0,
          content: 0,
          worried: 0,
          neutral: 0,
          happy: 0
        }
      });
    }
  });

  // Budget routes
  app.get("/api/users/:userId/budgets", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const budgets = await storage.getBudgetsByUserId(userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/budgets/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.query.type as string | undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      try {
        const budgets = await storage.getActiveBudgetsByUserId(userId, type);
        // If no budgets, return empty array instead of 404
        return res.json(budgets || []);
      } catch (budgetError) {
        console.error('Error getting active budgets:', budgetError);
        // Return empty array on budget retrieval error
        return res.json([]);
      }
    } catch (error) {
      console.error('Error in active budgets endpoint:', error);
      res.status(500).json({ message: "Internal server error", detail: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/budgets/:id", async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      
      if (isNaN(budgetId)) {
        return res.status(400).json({ message: "Invalid budget ID" });
      }
      
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const user = await storage.getUser(budgetData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newBudget = await storage.createBudget(budgetData);
      res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/budgets/:id", async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      
      if (isNaN(budgetId)) {
        return res.status(400).json({ message: "Invalid budget ID" });
      }
      
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      // Only validate partial updates
      const updatedBudget = await storage.updateBudget(budgetId, req.body);
      res.json(updatedBudget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      
      if (isNaN(budgetId)) {
        return res.status(400).json({ message: "Invalid budget ID" });
      }
      
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const success = await storage.deleteBudget(budgetId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete budget" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/budgets/:budgetId/spending", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const budgetId = parseInt(req.params.budgetId);
      
      if (isNaN(userId) || isNaN(budgetId)) {
        return res.status(400).json({ message: "Invalid user ID or budget ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const spending = await storage.getBudgetSpending(userId, budgetId);
      res.json(spending);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Machine Learning Emotion Analysis routes
  app.use('/api/ml/emotions', emotionAnalysisRoutes);
  
  // AI-powered Insights Generator routes
  app.use('/api/insights', insightsGeneratorRoutes);
  
  // Facial Expression Analysis routes - mounted at a separate path to avoid conflicts
  app.use('/api/ml/facial', facialAnalysisRoutes);
  
  // Emotion Reference Images routes
  app.use('/api/emotion-reference-images', emotionReferenceImageRoutes);
  
  // Advanced Emotion Analysis with Health and Finance Data
  app.use('/api/advanced-analytics', advancedEmotionAnalysisRoutes);
  
  // Voice Emotion Analysis routes
  app.use('/api/ml/voice', voiceEmotionAnalysisRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
