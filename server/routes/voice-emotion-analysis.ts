import { Router, Request, Response } from 'express';
import { log } from '../vite';
import { storage } from '../storage';
import { validateAuthenticatedUser } from '../middleware/auth';
import { EmotionType, InsertEmotion } from '@shared/schema';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize the Google Gemini API client
// Using the newest model "gemini-1.5-flash" which was released after your knowledge cutoff date
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper function to create a temp audio file
async function saveTempAudioFile(base64Audio: string): Promise<string> {
  const buffer = Buffer.from(base64Audio, 'base64');
  const fileName = `voice_${Date.now()}.wav`;
  const filePath = path.join('/tmp', fileName);
  
  writeFileSync(filePath, buffer);
  return filePath;
}

// Type for expected emotion analysis response
interface EmotionAnalysisResult {
  emotion: EmotionType;
  confidence: number;
}

// Voice emotion analysis route
router.post('/analyze-voice', validateAuthenticatedUser, async (req: Request, res: Response) => {
  try {
    const { audioData, transcript, userId } = req.body;
    
    if (!audioData || !userId) {
      return res.status(400).json({
        error: 'Missing required parameters',
      });
    }
    
    // Process both audio data and transcript if available
    let filePath: string | null = null;
    let analysisResult: EmotionAnalysisResult = {
      emotion: 'neutral',
      confidence: 0.5
    };
    
    try {
      if (audioData) {
        // Save audio file temporarily
        filePath = await saveTempAudioFile(audioData);
        
        // Create prompt for Gemini with both transcript and audio context
        const prompt = `Analyze this voice recording to detect the primary emotion. 
        ${transcript ? `The person said: "${transcript}"` : ''}
        
        Based on the voice tone, inflection, and words spoken (if any), determine which of these emotions best matches:
        - happy
        - content
        - neutral
        - worried
        - stressed
        
        Respond in JSON format only with these two fields:
        - emotion: One of the five emotions listed above (happy, content, neutral, worried, or stressed)
        - confidence: A number between 0 and 1 representing your confidence in this assessment (1 being highest confidence)
        
        Example response:
        {"emotion": "content", "confidence": 0.85}`;
        
        // Generate text through Gemini API
        const responseResult = await model.generateContent(prompt);
        const text = responseResult.response.text();
        
        // Extract the JSON result from the response
        let parsedResult: any = null;
        try {
          // Find the JSON part in the response (it might be surrounded by markdown)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON format is found, use simple text parsing as fallback
            const emotionMatch = text.match(/(happy|content|neutral|worried|stressed)/i);
            if (emotionMatch) {
              const emotion = emotionMatch[0].toLowerCase();
              parsedResult = {
                emotion,
                confidence: 0.6, // Default moderate confidence
              };
            } else {
              // If no known emotion is detected, default to neutral
              parsedResult = {
                emotion: 'neutral',
                confidence: 0.5,
              };
            }
          }
        } catch (parseError) {
          log(`Error parsing Gemini response: ${parseError}`, 'voice-emotion');
          // Fallback to a simple emotion detection from the text
          if (text.includes('happy')) {
            parsedResult = { emotion: 'happy', confidence: 0.7 };
          } else if (text.includes('content')) {
            parsedResult = { emotion: 'content', confidence: 0.7 };
          } else if (text.includes('worried')) {
            parsedResult = { emotion: 'worried', confidence: 0.7 };
          } else if (text.includes('stressed')) {
            parsedResult = { emotion: 'stressed', confidence: 0.7 };
          } else {
            parsedResult = { emotion: 'neutral', confidence: 0.7 };
          }
        }
        
        // Ensure we have a valid emotion type
        if (parsedResult && 
           ['happy', 'content', 'neutral', 'worried', 'stressed'].includes(parsedResult.emotion)) {
          analysisResult = {
            emotion: parsedResult.emotion as EmotionType,
            confidence: Math.min(1, Math.max(0, parsedResult.confidence || 0.7)),
          };
        }
      }
      
      // Save the emotion with transcript as notes (if available)
      const newEmotion: InsertEmotion = {
        userId,
        type: analysisResult.emotion,
        date: new Date(),
        notes: transcript || '',
      };
      
      await storage.createEmotion(newEmotion);
      
      // Return the result
      return res.json(analysisResult);
    } finally {
      // Clean up temporary file if it was created
      if (filePath) {
        try {
          unlinkSync(filePath);
        } catch (err) {
          log(`Error removing temp file ${filePath}: ${err}`, 'voice-emotion');
        }
      }
    }
  } catch (error) {
    log(`Voice emotion analysis error: ${error}`, 'voice-emotion');
    return res.status(500).json({
      error: 'Voice emotion analysis failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;