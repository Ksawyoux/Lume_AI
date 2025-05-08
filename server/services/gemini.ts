import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Using Gemini Pro model
const MODEL_NAME = 'gemini-pro';

export interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number; // 0-1 scale
  detectedEmotions: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
}

/**
 * Analyzes text to detect emotional patterns using Google Gemini AI
 */
export async function analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set');
  }

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    You are a specialized emotional intelligence AI. Analyze the provided text to identify emotional patterns.
    
    Please output in JSON format with the following structure:
    {
      "primaryEmotion": "the most prominent emotion detected",
      "emotionIntensity": "a number between 0 and 1 representing intensity",
      "detectedEmotions": ["an array of all emotions detected"],
      "emotionalTriggers": ["potential triggers for these emotions"],
      "recommendations": ["3-5 personalized recommendations based on the emotional state"],
      "sentiment": "positive, negative, or neutral",
      "confidence": "a number between 0 and 1 representing your confidence in this analysis"
    }
    
    Analyze the following text: ${text}
    
    Respond only with JSON, no preamble or explanation.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Extract and parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const resultJson = JSON.parse(jsonMatch[0]) as EmotionAnalysisResult;
    
    // Validate the response structure
    if (!resultJson.primaryEmotion || 
        typeof resultJson.emotionIntensity !== 'number' || 
        !Array.isArray(resultJson.detectedEmotions) ||
        !Array.isArray(resultJson.emotionalTriggers) ||
        !Array.isArray(resultJson.recommendations) ||
        !['positive', 'negative', 'neutral'].includes(resultJson.sentiment) ||
        typeof resultJson.confidence !== 'number') {
      throw new Error('Invalid response format from AI');
    }

    return resultJson;
  } catch (error) {
    console.error('Error analyzing emotion with Gemini:', error);
    throw error;
  }
}

/**
 * Analyzes emotional patterns over time from a collection of text entries
 */
export async function analyzeEmotionalPatterns(entries: {text: string, date: string, type?: string}[]): Promise<any> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set');
  }

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Format the entries for the prompt
    const entriesText = JSON.stringify(entries, null, 2);
    
    const prompt = `
    You are a specialized emotional intelligence AI that helps users understand their emotional patterns over time.
    
    Analyze the provided emotional data entries and identify patterns, trends, and insights.
    
    Please output in JSON format with the following structure:
    {
      "emotionalTrends": ["key trends identified"],
      "cyclicalPatterns": ["any recurring emotional patterns"],
      "triggers": ["common triggers identified"],
      "recommendations": ["3-5 personalized recommendations based on the patterns"],
      "insightSummary": "a brief paragraph summarizing the insights"
    }
    
    Here are the emotional entries to analyze:
    ${entriesText}
    
    Respond only with JSON, no preamble or explanation.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Extract and parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing emotional patterns with Gemini:', error);
    throw error;
  }
}

/**
 * Generates personalized emotional insights based on financial behavior and emotional data
 */
export async function generatePersonalizedInsights(
  emotionData: {type: string, date: string, notes?: string | null | undefined}[],
  financialData: {amount: number, category: string, description: string, date: string, emotionId?: number | null | undefined}[]
): Promise<any> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set');
  }

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Format the data for the prompt
    const dataPrompt = JSON.stringify({
      emotions: emotionData,
      finances: financialData
    }, null, 2);
    
    const prompt = `
    You are a specialized emotional intelligence AI that helps users understand the connection between their emotions and financial behaviors.
    
    Analyze the provided emotional and financial data to identify patterns, correlations, and insights.
    
    Please output in JSON format with the following structure:
    {
      "emotionFinanceCorrelations": ["identified correlations between emotions and spending/saving"],
      "spendingTriggers": ["emotional triggers that may lead to specific spending behaviors"],
      "positivePatterns": ["positive financial behaviors and associated emotional states"],
      "improvementAreas": ["areas where emotional awareness could improve financial decisions"],
      "actionableInsights": ["3-5 personalized recommendations based on the analysis"],
      "summary": "a brief paragraph summarizing the insights"
    }
    
    Here is the data to analyze:
    ${dataPrompt}
    
    Respond only with JSON, no preamble or explanation.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Extract and parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating personalized insights with Gemini:', error);
    throw error;
  }
}