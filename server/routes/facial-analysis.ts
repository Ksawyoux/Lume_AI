import express, { Request, Response } from 'express';
import { analyzeFacialExpression } from '../services/gemini';

const router = express.Router();

// API endpoint to analyze facial expressions
router.post('/analyze-face', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    // Validate image data
    if (!image) {
      return res.status(400).json({ 
        error: 'Missing image data' 
      });
    }
    
    // Check for valid base64 data (basic validation)
    if (typeof image !== 'string' || image.length < 100) {
      return res.status(400).json({
        error: 'Invalid image data',
        message: 'The provided image data is too short or in an invalid format.'
      });
    }
    
    console.log(`Analyzing facial expression from image data (${Math.floor(image.length / 1024)}kb)`);
    
    // Use the Gemini Vision API to analyze the facial expression
    const result = await analyzeFacialExpression(image);
    
    // Validate the response to ensure it has the required fields
    if (!result || !result.primaryEmotion) {
      console.error('Invalid response from facial analysis service:', result);
      return res.status(500).json({
        error: 'The analysis service returned incomplete data',
        message: 'Please try again with a clearer image of your face.'
      });
    }
    
    // Add a timestamp for tracking
    const response = {
      ...result,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in facial expression analysis:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        // Handle API key issues
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'The facial analysis service is currently unavailable. Please try the manual selection.'
        });
      } else if (error.message.includes('timeout') || error.message.includes('limit')) {
        // Handle rate limits or timeouts
        res.status(429).json({ 
          error: 'Service busy',
          message: 'The facial analysis service is currently busy. Please try again in a moment.'
        });
      } else {
        // Generic error with details
        res.status(500).json({ 
          error: 'Failed to analyze facial expression',
          message: 'Please try again or use manual selection.',
          details: error.message
        });
      }
    } else {
      // Fallback for non-Error objects
      res.status(500).json({ 
        error: 'Unknown error during facial analysis',
        message: 'Please try again or use manual selection.'
      });
    }
  }
});

export default router;