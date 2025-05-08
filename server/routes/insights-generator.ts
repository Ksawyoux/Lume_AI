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
    
    // Get existing insights to potentially remove them before adding new ones
    const existingInsights = await storage.getInsightsByUserId(userId);
    
    // If we already have insights, remove them to keep the latest ones only
    if (existingInsights && existingInsights.length > 0) {
      // Delete all existing insights for this user
      for (const insight of existingInsights) {
        // We should add a deleteInsight method to storage, but for now we'll work around it
        // This would be better implemented server-side
        console.log(`Would delete insight ${insight.id}`);
      }
    }
    
    // Store each insight for the user (max 5 total)
    const storedInsights = [];
    const MAX_INSIGHTS = 5;
    
    // Prepare all potential insights
    const allInsightContents = [];
    
    // Add emotion finance correlations
    if (insights.emotionFinanceCorrelations) {
      for (const correlation of insights.emotionFinanceCorrelations) {
        allInsightContents.push({
          type: 'emotion-finance-correlation',
          title: 'Emotion-Finance Pattern',
          description: correlation,
        });
      }
    }
    
    // Add spending triggers
    if (insights.spendingTriggers) {
      for (const trigger of insights.spendingTriggers) {
        allInsightContents.push({
          type: 'spending-trigger',
          title: 'Spending Trigger Identified',
          description: trigger,
        });
      }
    }
    
    // Add actionable insights
    if (insights.actionableInsights) {
      for (const actionable of insights.actionableInsights) {
        allInsightContents.push({
          type: 'action-recommendation',
          title: 'Recommended Action',
          description: actionable,
        });
      }
    }
    
    // Shuffle the insights to get a random selection from different categories
    const shuffled = [...allInsightContents].sort(() => 0.5 - Math.random());
    
    // Take only the number we want
    const selectedInsights = shuffled.slice(0, MAX_INSIGHTS);
    
    // Create the selected insights
    for (const insightContent of selectedInsights) {
      const insight = await storage.createInsight({
        userId,
        type: insightContent.type,
        title: insightContent.title,
        description: insightContent.description,
        date: new Date(),
        updatedDate: new Date()
      });
      storedInsights.push(insight);
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