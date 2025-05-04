import { Router, Request, Response } from 'express';
import { analyzeEmotion, analyzeEmotionalPatterns, generatePersonalizedInsights } from '../services/claude';
import { storage } from '../storage';

const router = Router();

// Analyze emotion from text
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }
    
    const analysis = await analyzeEmotion(text);
    return res.json(analysis);
  } catch (error) {
    console.error('Error in emotion analysis:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during emotion analysis' });
  }
});

// Analyze emotional patterns over time
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's emotions
    const emotions = await storage.getEmotionsByUserId(userId);
    
    if (!emotions || emotions.length === 0) {
      return res.status(404).json({ error: 'No emotions found for this user' });
    }
    
    // Format emotions for analysis
    const entries = emotions.map(emotion => ({
      text: emotion.notes || `Feeling ${emotion.type}`,
      date: new Date(emotion.date).toISOString()
    }));
    
    const patterns = await analyzeEmotionalPatterns(entries);
    return res.json(patterns);
  } catch (error) {
    console.error('Error in emotional pattern analysis:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during pattern analysis' });
  }
});

// Generate personalized financial-emotional insights
router.post('/insights/finance', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's emotional and financial data
    const emotions = await storage.getEmotionsByUserId(userId);
    const transactions = await storage.getTransactionsByUserId(userId);
    
    if (!emotions || emotions.length === 0) {
      return res.status(404).json({ error: 'No emotions found for this user' });
    }
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found for this user' });
    }
    
    // Format data for analysis
    const emotionalData = emotions.map(emotion => ({
      type: emotion.type,
      date: new Date(emotion.date).toISOString(),
      notes: emotion.notes
    }));
    
    const financialData = transactions.map(transaction => ({
      amount: transaction.amount,
      category: transaction.category,
      date: new Date(transaction.date).toISOString(),
      description: transaction.description
    }));
    
    const insights = await generatePersonalizedInsights(emotionalData, financialData);
    return res.json(insights);
  } catch (error) {
    console.error('Error generating personalized insights:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while generating insights' });
  }
});

export default router;
