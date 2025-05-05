import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertEmotionSchema, insertHealthDataSchema, insertTransactionSchema, insertUserSchema, HealthMetricType } from "@shared/schema";
import emotionAnalysisRoutes from "./routes/emotion-analysis";
import { setupAuth } from "./auth";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // User routes - auth is now handled by setupAuth in auth.ts
  
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
      
      const spendingByEmotion = await storage.getSpendingByEmotion(userId);
      res.json(spendingByEmotion);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Machine Learning Emotion Analysis routes
  app.use('/api/ml/emotions', emotionAnalysisRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
