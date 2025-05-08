import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { analyzeAdvancedEmotionalPatterns } from '../services/advancedEmotionAnalysis';
import { requireAuth } from '../middleware/auth';
import { EmotionType, HealthMetricType } from '@shared/schema';

const router = Router();

// Debug middleware for this route
router.use((req, res, next) => {
  console.log(`[Advanced Emotion Analysis] ${req.method} ${req.path}`);
  next();
});

/**
 * Generate advanced emotion insights that combine emotions, health, and finance
 * This endpoint aggregates data across multiple domains to provide deeper insights
 */
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get emotions, transactions, and health data for the user
    const emotions = await storage.getEmotionsByUserId(userId);
    const transactions = await storage.getTransactionsByUserId(userId);
    const healthData = await storage.getHealthDataByUserId(userId);
    
    // Check if there's enough data to perform analysis
    if (emotions.length === 0) {
      return res.status(400).json({ 
        error: 'Not enough emotion data to generate advanced insights',
        minimumRequired: 1,
        currentCount: emotions.length
      });
    }
    
    // Format the data for the AI service - ensuring proper type safety
    const emotionData = emotions.map(e => ({
      id: e.id,
      type: e.type as EmotionType, // Ensure proper typing
      date: e.date.toISOString(),
      notes: e.notes
    }));
    
    const transactionData = transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date.toISOString()
    }));
    
    const healthDataFormatted = healthData.map(h => ({
      id: h.id,
      type: h.type as HealthMetricType, // Ensure proper typing
      value: h.value,
      date: h.timestamp.toISOString() // Use timestamp instead of date
    }));
    
    // Perform the advanced analysis
    const advancedInsights = await analyzeAdvancedEmotionalPatterns(
      emotionData, 
      transactionData, 
      healthDataFormatted
    );
    
    // Store key insights from the analysis
    const storedInsights = [];
    
    const now = new Date();
    
    // Store emotion-finance correlations as insights
    if (advancedInsights.emotionFinanceCorrelations && advancedInsights.emotionFinanceCorrelations.length > 0) {
      for (const correlation of advancedInsights.emotionFinanceCorrelations) {
        // Skip correlations with zero or undefined correlation value
        if (!correlation.correlation) continue;
        
        const insight = await storage.createInsight({
          userId,
          type: 'advanced-finance-correlation',
          title: `${correlation.emotionType} Spending Pattern`,
          description: correlation.description + ' ' + correlation.recommendedAction,
          date: now,
          updatedDate: now
        });
        storedInsights.push(insight);
      }
    }
    
    // Store emotion-health correlations as insights
    if (advancedInsights.emotionHealthCorrelations && advancedInsights.emotionHealthCorrelations.length > 0) {
      for (const correlation of advancedInsights.emotionHealthCorrelations) {
        // Skip correlations with zero or undefined correlation value
        if (!correlation.correlation) continue;
        
        const insight = await storage.createInsight({
          userId,
          type: 'advanced-health-correlation',
          title: `${correlation.emotionType} and ${correlation.healthMetric} Connection`,
          description: correlation.description + ' ' + correlation.recommendedAction,
          date: now,
          updatedDate: now
        });
        storedInsights.push(insight);
      }
    }
    
    // Store overall action plan as an insight
    if (advancedInsights.actionPlan && advancedInsights.actionPlan.length > 0) {
      const actionPlanDescription = "Action Plan: " + advancedInsights.actionPlan.join(". ") + 
        "\n\nOverall Insights: " + advancedInsights.overallInsights;
      
      const insight = await storage.createInsight({
        userId,
        type: 'advanced-action-plan',
        title: `Personalized Wellness Action Plan`,
        description: actionPlanDescription,
        date: now,
        updatedDate: now
      });
      storedInsights.push(insight);
    }
    
    // Return the full analysis and stored insights
    return res.status(200).json({
      message: 'Advanced analysis completed',
      analysis: advancedInsights,
      storedInsights
    });
    
  } catch (error) {
    console.error('Error generating advanced emotion analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze emotional patterns',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;