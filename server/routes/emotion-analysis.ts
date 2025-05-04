import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { analyzeEmotion, analyzeEmotionalPatterns, generatePersonalizedInsights } from '../services/claude';

const router = Router();

// Analyze text for emotional content using Claude API
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }
    
    const analysis = await analyzeEmotion(text);
    return res.json(analysis);
  } catch (error) {
    console.error('Error in emotion analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze emotions',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Analyze emotional patterns over time
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's emotion entries
    const emotions = await storage.getEmotionsByUserId(userId);
    
    if (!emotions || emotions.length === 0) {
      return res.status(404).json({ error: 'No emotion data found for this user' });
    }
    
    // Convert emotions to the format expected by Claude service
    const entries = emotions.map(emotion => ({
      text: emotion.notes || '',
      date: new Date(emotion.date).toISOString(),
      type: emotion.type
    }));
    
    const patterns = await analyzeEmotionalPatterns(entries);
    return res.json(patterns);
  } catch (error) {
    console.error('Error in emotion pattern analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze emotion patterns',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate personalized insights by combining financial and emotional data
router.post('/insights/finance', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's emotion and transaction data
    const emotions = await storage.getEmotionsByUserId(userId);
    const transactions = await storage.getTransactionsByUserId(userId);
    
    if (!emotions || emotions.length === 0) {
      return res.status(404).json({ error: 'No emotion data found for this user' });
    }
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'No transaction data found for this user' });
    }
    
    // Format data for the AI service
    const emotionData = emotions.map(emotion => ({
      type: emotion.type,
      date: new Date(emotion.date).toISOString(),
      notes: emotion.notes
    }));
    
    const transactionData = transactions.map(tx => ({
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: new Date(tx.date).toISOString(),
      emotionId: tx.emotionId
    }));
    
    const insights = await generatePersonalizedInsights(emotionData, transactionData);
    return res.json(insights);
  } catch (error) {
    console.error('Error generating personalized financial insights:', error);
    return res.status(500).json({ 
      error: 'Failed to generate personalized insights',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
