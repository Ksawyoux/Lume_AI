import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { generatePersonalizedInsights } from '../services/gemini';

const router = express.Router();

// Endpoint to generate insights based on emotion and transaction history
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get emotions and transactions for the user
    const emotions = await storage.getEmotionsByUserId(userId);
    const transactions = await storage.getTransactionsByUserId(userId);
    
    // Check if there are at least 3 transactions
    if (transactions.length < 3) {
      return res.status(400).json({ 
        message: 'Not enough transaction data to generate insights',
        minimumRequired: 3,
        currentCount: transactions.length
      });
    }
    
    // Prepare data for the AI insights generator
    const emotionData = emotions.map(e => ({
      type: e.type,
      date: e.date.toISOString(),
      notes: e.notes
    }));
    
    const financialData = transactions.map(t => ({
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date.toISOString(),
      emotionId: t.emotionId,
      currency: t.currency
    }));
    
    // Generate insights using the AI service
    const insights = await generatePersonalizedInsights(emotionData, financialData);
    
    // Store each insight for the user
    const storedInsights = [];
    
    if (insights.emotionFinanceCorrelations) {
      for (const correlation of insights.emotionFinanceCorrelations) {
        const insight = await storage.createInsight({
          userId,
          type: 'emotion-finance-correlation',
          title: 'Emotion-Finance Pattern',
          description: correlation,
          date: new Date()
        });
        storedInsights.push(insight);
      }
    }
    
    if (insights.spendingTriggers) {
      for (const trigger of insights.spendingTriggers) {
        const insight = await storage.createInsight({
          userId,
          type: 'spending-trigger',
          title: 'Spending Trigger Identified',
          description: trigger,
          date: new Date()
        });
        storedInsights.push(insight);
      }
    }
    
    if (insights.actionableInsights) {
      for (const actionable of insights.actionableInsights) {
        const insight = await storage.createInsight({
          userId,
          type: 'action-recommendation',
          title: 'Recommended Action',
          description: actionable,
          date: new Date()
        });
        storedInsights.push(insight);
      }
    }
    
    // Return the generated and stored insights
    return res.status(200).json({
      message: 'Insights generated and stored successfully',
      insights: storedInsights,
      summary: insights.summary
    });
    
  } catch (error) {
    console.error('Error generating insights:', error);
    return res.status(500).json({ message: 'Error generating insights' });
  }
});

export default router;