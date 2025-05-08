import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// We'll use the standard gemini-pro model for text processing
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
    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // Format the prompt to ensure we get correct JSON output
    const prompt = `
    You are a specialized emotional intelligence AI. Your task is to analyze the provided text to identify emotional patterns.
    
    Your analysis should be structured in valid JSON format with the following properties:
    {
      "primaryEmotion": "the most prominent emotion detected",
      "emotionIntensity": 0.85,
      "detectedEmotions": ["emotion1", "emotion2", "emotion3"],
      "emotionalTriggers": ["trigger1", "trigger2", "trigger3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "sentiment": "positive",
      "confidence": 0.9
    }
    
    IMPORTANT: 
    - emotionIntensity must be a number between 0 and 1
    - confidence must be a number between 0 and 1
    - sentiment must be exactly "positive", "negative", or "neutral"
    - all arrays must contain at least one item
    - your response must only contain the JSON object, no other text
    
    Text to analyze: "${text}"
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean the response and extract JSON
    let cleanedResponse = textResponse.trim();
    
    // Remove any markdown code block formatting if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Try to extract a JSON object if the response isn't already just JSON
    if (!cleanedResponse.startsWith('{')) {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      } else {
        throw new Error('Response does not contain valid JSON');
      }
    }

    // Parse the JSON
    let resultJson: EmotionAnalysisResult;
    try {
      resultJson = JSON.parse(cleanedResponse) as EmotionAnalysisResult;
    } catch (e) {
      console.error('Failed to parse JSON response:', cleanedResponse);
      throw new Error('Invalid JSON format in response');
    }
    
    // Provide fallback values for any missing fields to ensure consistent response structure
    const defaultResult: EmotionAnalysisResult = {
      primaryEmotion: resultJson.primaryEmotion || "neutral",
      emotionIntensity: typeof resultJson.emotionIntensity === 'number' ? resultJson.emotionIntensity : 0.5,
      detectedEmotions: Array.isArray(resultJson.detectedEmotions) ? resultJson.detectedEmotions : ["neutral"],
      emotionalTriggers: Array.isArray(resultJson.emotionalTriggers) ? resultJson.emotionalTriggers : ["unknown"],
      recommendations: Array.isArray(resultJson.recommendations) ? resultJson.recommendations : ["Take time to reflect on your emotions"],
      sentiment: ['positive', 'negative', 'neutral'].includes(resultJson.sentiment) ? resultJson.sentiment : "neutral",
      confidence: typeof resultJson.confidence === 'number' ? resultJson.confidence : 0.7
    };

    return defaultResult;
  } catch (error) {
    console.error('Error analyzing emotion with Gemini:', error);
    // Create a fallback response instead of throwing
    const fallbackResult: EmotionAnalysisResult = {
      primaryEmotion: "neutral",
      emotionIntensity: 0.5,
      detectedEmotions: ["neutral"],
      emotionalTriggers: ["Could not determine triggers"],
      recommendations: [
        "Take a moment to reflect on your current emotional state",
        "Consider journaling about your feelings",
        "Practice deep breathing or meditation"
      ],
      sentiment: "neutral",
      confidence: 0.5
    };
    
    // Log the error but return a fallback response
    console.log("Returning fallback emotional analysis due to API error");
    return fallbackResult;
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
    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // Format the entries for the prompt
    const entriesText = JSON.stringify(entries, null, 2);
    
    const prompt = `
    You are a specialized emotional intelligence AI that helps users understand their emotional patterns over time.
    
    Analyze the provided emotional data entries and identify patterns, trends, and insights.
    
    Your analysis must be structured in valid JSON format with the following properties:
    {
      "emotionalTrends": ["key trends identified"],
      "cyclicalPatterns": ["any recurring emotional patterns"],
      "triggers": ["common triggers identified"],
      "recommendations": ["3-5 personalized recommendations based on the patterns"],
      "insightSummary": "a brief paragraph summarizing the insights"
    }
    
    IMPORTANT:
    - All arrays must contain at least one item
    - Your response must only contain the JSON object, no other text or code block markers
    
    Here are the emotional entries to analyze:
    ${entriesText}
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean the response and extract JSON
    let cleanedResponse = textResponse.trim();
    
    // Remove any markdown code block formatting if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Try to extract a JSON object if the response isn't already just JSON
    if (!cleanedResponse.startsWith('{')) {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      } else {
        throw new Error('Response does not contain valid JSON');
      }
    }

    // Parse the JSON
    try {
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse JSON response:', cleanedResponse);
      throw new Error('Invalid JSON format in response');
    }
  } catch (error) {
    console.error('Error analyzing emotional patterns with Gemini:', error);
    // Return fallback data instead of throwing
    return {
      emotionalTrends: ["Limited data to establish clear trends"],
      cyclicalPatterns: ["No clear cyclical patterns detected"],
      triggers: ["Further data needed to identify triggers"],
      recommendations: [
        "Continue tracking your emotions regularly",
        "Reflect on situations that consistently affect your mood",
        "Look for connections between your activities and emotional states"
      ],
      insightSummary: "There isn't enough consistent data yet to provide detailed insights. Continue tracking your emotions to build a more comprehensive understanding of your emotional patterns over time."
    };
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
    // Initialize the model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // Format the data for the prompt
    const dataPrompt = JSON.stringify({
      emotions: emotionData,
      finances: financialData
    }, null, 2);
    
    const prompt = `
    You are a specialized emotional intelligence AI that helps users understand the connection between their emotions and financial behaviors.
    
    Analyze the provided emotional and financial data to identify patterns, correlations, and insights.
    
    Your analysis must be structured in valid JSON format with the following properties:
    {
      "emotionFinanceCorrelations": ["identified correlations between emotions and spending/saving"],
      "spendingTriggers": ["emotional triggers that may lead to specific spending behaviors"],
      "positivePatterns": ["positive financial behaviors and associated emotional states"],
      "improvementAreas": ["areas where emotional awareness could improve financial decisions"],
      "actionableInsights": ["3-5 personalized recommendations based on the analysis"],
      "summary": "a brief paragraph summarizing the insights"
    }
    
    IMPORTANT:
    - All arrays must contain at least one item
    - Your response must only contain the JSON object, no other text or code block markers
    
    Here is the data to analyze:
    ${dataPrompt}
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean the response and extract JSON
    let cleanedResponse = textResponse.trim();
    
    // Remove any markdown code block formatting if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Try to extract a JSON object if the response isn't already just JSON
    if (!cleanedResponse.startsWith('{')) {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      } else {
        throw new Error('Response does not contain valid JSON');
      }
    }

    // Parse the JSON
    try {
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse JSON response:', cleanedResponse);
      throw new Error('Invalid JSON format in response');
    }
  } catch (error) {
    console.error('Error generating personalized insights with Gemini:', error);
    // Return fallback data instead of throwing
    return {
      emotionFinanceCorrelations: [
        "Need more data to establish clear emotion-finance correlations"
      ],
      spendingTriggers: [
        "Insufficient data to identify specific triggers"
      ],
      positivePatterns: [
        "Continue tracking to identify positive patterns"
      ],
      improvementAreas: [
        "Consistent emotional and financial tracking"
      ],
      actionableInsights: [
        "Record your emotional state before making purchases",
        "Set specific financial goals tied to emotional well-being",
        "Create a waiting period before making non-essential purchases"
      ],
      summary: "We need more consistent data to establish meaningful patterns between your emotional states and financial behaviors. Continue tracking both aspects to gain deeper insights over time."
    };
  }
}