import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = 'claude-3-7-sonnet-20250219';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
 * Analyzes text to detect emotional patterns
 */
export async function analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const systemPrompt = `You are a specialized emotional intelligence AI. Analyze the provided text to identify emotional patterns.
    
    Please output in JSON format with the following structure:
    {
      "primaryEmotion": "the most prominent emotion detected",
      "emotionIntensity": "a number between 0 and 1 representing intensity",
      "detectedEmotions": ["an array of all emotions detected"],
      "emotionalTriggers": ["potential triggers for these emotions"],
      "recommendations": ["3-5 personalized recommendations based on the emotional state"],
      "sentiment": "positive, negative, or neutral",
      "confidence": "a number between 0 and 1 representing your confidence in this analysis"
    }`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    });

    // Extract and parse the JSON response
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]) as EmotionAnalysisResult;
    
    // Validate the response structure
    if (!result.primaryEmotion || 
        typeof result.emotionIntensity !== 'number' || 
        !Array.isArray(result.detectedEmotions) ||
        !Array.isArray(result.emotionalTriggers) ||
        !Array.isArray(result.recommendations) ||
        !['positive', 'negative', 'neutral'].includes(result.sentiment) ||
        typeof result.confidence !== 'number') {
      throw new Error('Invalid response format from AI');
    }

    return result;
  } catch (error) {
    console.error('Error analyzing emotion with Claude:', error);
    throw error;
  }
}

/**
 * Analyzes emotional patterns over time from a collection of text entries
 */
export async function analyzeEmotionalPatterns(entries: {text: string, date: string, type?: string}[]): Promise<any> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const systemPrompt = `You are a specialized emotional intelligence AI that helps users understand their emotional patterns over time.
    
    Analyze the provided emotional data entries and identify patterns, trends, and insights.
    
    Please output in JSON format with the following structure:
    {
      "emotionalTrends": ["key trends identified"],
      "cyclicalPatterns": ["any recurring emotional patterns"],
      "triggers": ["common triggers identified"],
      "recommendations": ["3-5 personalized recommendations based on the patterns"],
      "insightSummary": "a brief paragraph summarizing the insights"
    }`;

    // Format the entries for the prompt
    const entriesText = JSON.stringify(entries, null, 2);
    const userPrompt = `Please analyze these emotional entries over time:\n${entriesText}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract and parse the JSON response
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing emotional patterns with Claude:', error);
    throw error;
  }
}

/**
 * Generates personalized emotional insights based on financial behavior and emotional data
 */
export async function generatePersonalizedInsights(
  emotionData: {type: string, date: string, notes?: string}[],
  financialData: {amount: number, category: string, description: string, date: string, emotionId?: number | null}[]
): Promise<any> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const systemPrompt = `You are a specialized emotional intelligence AI that helps users understand the connection between their emotions and financial behaviors.
    
    Analyze the provided emotional and financial data to identify patterns, correlations, and insights.
    
    Please output in JSON format with the following structure:
    {
      "emotionFinanceCorrelations": ["identified correlations between emotions and spending/saving"],
      "spendingTriggers": ["emotional triggers that may lead to specific spending behaviors"],
      "positivePatterns": ["positive financial behaviors and associated emotional states"],
      "improvementAreas": ["areas where emotional awareness could improve financial decisions"],
      "actionableInsights": ["3-5 personalized recommendations based on the analysis"],
      "summary": "a brief paragraph summarizing the insights"
    }`;

    // Format the data for the prompt
    const dataPrompt = JSON.stringify({
      emotions: emotionData,
      finances: financialData
    }, null, 2);
    
    const userPrompt = `Please analyze these emotional and financial data points to identify correlations and patterns:\n${dataPrompt}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract and parse the JSON response
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating personalized insights with Claude:', error);
    throw error;
  }
}
