import express, { Request, Response } from 'express';
import { analyzeFacialExpression } from '../services/gemini';

const router = express.Router();

// API endpoint to analyze facial expressions
router.post('/analyze-face', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        error: 'Missing image data' 
      });
    }
    
    // Use the Gemini Vision API to analyze the facial expression
    const result = await analyzeFacialExpression(image);
    
    res.json(result);
  } catch (error) {
    console.error('Error in facial expression analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze facial expression',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;