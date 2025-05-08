import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import { EmotionType, EmotionType as EmotionCategoryType, HealthMetricType } from '@shared/schema';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Use the newest Anthropic model
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219'; // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

// Use the latest Gemini model
const GEMINI_MODEL = 'gemini-2.0-flash';

// Types for our advanced analysis
interface EmotionEntry {
  id: number;
  type: EmotionType;
  date: string;
  notes?: string | null;
}

interface TransactionEntry {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface HealthDataEntry {
  id: number;
  type: HealthMetricType;
  value: number;
  date: string;
}

interface AdvancedEmotionPattern {
  patternName: string;
  description: string;
  confidence: number;
  affectedMetrics: string[];
  recommendedActions: string[];
  severity: 'low' | 'medium' | 'high';
}

interface AdvancedEmotionFinanceCorrelation {
  emotionType: EmotionType;
  spendingCategory: string;
  correlation: number; // -1 to 1
  averageAmount: number;
  description: string;
  recommendedAction: string;
}

interface EmotionHealthCorrelation {
  emotionType: EmotionType;
  healthMetric: HealthMetricType;
  correlation: number; // -1 to 1
  description: string;
  recommendedAction: string;
}

interface AdvancedAnalysisResult {
  emotionPatterns: AdvancedEmotionPattern[];
  emotionFinanceCorrelations: AdvancedEmotionFinanceCorrelation[];
  emotionHealthCorrelations: EmotionHealthCorrelation[];
  overallInsights: string;
  primaryInfluencers: string[];
  actionPlan: string[];
}

/**
 * Performs advanced ML-based emotional pattern recognition
 * This combines emotional data with financial and health data to provide deeper insights
 */
export async function analyzeAdvancedEmotionalPatterns(
  emotions: EmotionEntry[],
  transactions: TransactionEntry[],
  healthData: HealthDataEntry[]
): Promise<AdvancedAnalysisResult> {
  // Determine which AI service to use based on available credentials
  const useClaudeIfAvailable = !!process.env.ANTHROPIC_API_KEY;
  
  try {
    if (useClaudeIfAvailable) {
      return await analyzeWithClaude(emotions, transactions, healthData);
    } else {
      return await analyzeWithGemini(emotions, transactions, healthData);
    }
  } catch (error) {
    console.error('Error in advanced emotional pattern analysis:', error);
    return getFallbackAnalysis();
  }
}

/**
 * Use Claude for advanced analysis (preferred for complex reasoning tasks)
 */
async function analyzeWithClaude(
  emotions: EmotionEntry[],
  transactions: TransactionEntry[],
  healthData: HealthDataEntry[]
): Promise<AdvancedAnalysisResult> {
  // Format the data for the prompt
  const dataPrompt = JSON.stringify({
    emotions,
    transactions,
    healthData
  }, null, 2);
  
  const systemPrompt = `You are a specialized AI expert in behavioral economics, psychology, and health analytics.
  
Your task is to analyze the relationships between emotional states, financial behaviors, and health metrics to identify patterns and correlations.

Analyze the provided data and extract advanced insights about how emotions influence financial decisions and health metrics (and vice versa).

Your response must be in valid JSON format with the following structure:
{
  "emotionPatterns": [
    {
      "patternName": "name of identified pattern",
      "description": "detailed description of the pattern",
      "confidence": 0.85, // number between 0-1
      "affectedMetrics": ["finance", "health metric name", etc.],
      "recommendedActions": ["action 1", "action 2", "action 3"],
      "severity": "low" // must be exactly "low", "medium", or "high"
    }
  ],
  "emotionFinanceCorrelations": [
    {
      "emotionType": "happy", // must be one of the enum values from the data
      "spendingCategory": "category name",
      "correlation": 0.75, // number between -1 and 1
      "averageAmount": 45.50, // average amount spent in this category when experiencing this emotion
      "description": "description of the correlation",
      "recommendedAction": "recommended financial action based on this correlation"
    }
  ],
  "emotionHealthCorrelations": [
    {
      "emotionType": "stressed", // must be one of the enum values from the data
      "healthMetric": "heartRate", // must be one of the enum values from the data
      "correlation": 0.82, // number between -1 and 1
      "description": "description of how this emotion correlates with this health metric",
      "recommendedAction": "recommended action to improve health outcomes"
    }
  ],
  "overallInsights": "a comprehensive paragraph summarizing the key insights",
  "primaryInfluencers": ["factor 1", "factor 2", "factor 3"],
  "actionPlan": ["action 1", "action 2", "action 3"]
}

If there's insufficient data to make strong correlations in any category, provide educated hypotheses based on psychological and financial research, but indicate lower confidence scores.

IMPORTANT:
- All array properties must contain at least one item
- All numerical values must be appropriate numbers within their specified ranges
- Emotion types must be one of: "stressed", "worried", "neutral", "content", "happy"
- Health metric types must be one of: "heartRate", "sleepQuality", "recovery", "strain", "readiness", "steps", "calories", "workout"
- Your response must contain ONLY the JSON object, no text before or after
`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: dataPrompt }],
    });

    // Extract and parse the JSON response
    let responseText = '';
    
    // Handle different content types safely
    if (message.content && message.content.length > 0) {
      const contentBlock = message.content[0]; 
      
      if ('text' in contentBlock) {
        responseText = contentBlock.text;
      } else {
        // If we can't get the text directly, convert the entire response to a string
        responseText = JSON.stringify(message);
      }
    }
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    return JSON.parse(jsonMatch[0]) as AdvancedAnalysisResult;
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
}

/**
 * Use Gemini for advanced analysis (fallback)
 */
async function analyzeWithGemini(
  emotions: EmotionEntry[],
  transactions: TransactionEntry[],
  healthData: HealthDataEntry[]
): Promise<AdvancedAnalysisResult> {
  // Format the data for the prompt
  const dataPrompt = JSON.stringify({
    emotions,
    transactions,
    healthData
  }, null, 2);
  
  const prompt = `
  You are a specialized AI expert in behavioral economics, psychology, and health analytics.
  
  Your task is to analyze the relationships between emotional states, financial behaviors, and health metrics to identify patterns and correlations.
  
  Analyze the provided data and extract advanced insights about how emotions influence financial decisions and health metrics (and vice versa).
  
  Your response must be in valid JSON format with the following structure:
  {
    "emotionPatterns": [
      {
        "patternName": "name of identified pattern",
        "description": "detailed description of the pattern",
        "confidence": 0.85, // number between 0-1
        "affectedMetrics": ["finance", "health metric name", etc.],
        "recommendedActions": ["action 1", "action 2", "action 3"],
        "severity": "low" // must be exactly "low", "medium", or "high"
      }
    ],
    "emotionFinanceCorrelations": [
      {
        "emotionType": "happy", // must be one of the enum values from the data
        "spendingCategory": "category name",
        "correlation": 0.75, // number between -1 and 1
        "averageAmount": 45.50, // average amount spent in this category when experiencing this emotion
        "description": "description of the correlation",
        "recommendedAction": "recommended financial action based on this correlation"
      }
    ],
    "emotionHealthCorrelations": [
      {
        "emotionType": "stressed", // must be one of the enum values from the data
        "healthMetric": "heartRate", // must be one of the enum values from the data
        "correlation": 0.82, // number between -1 and 1
        "description": "description of how this emotion correlates with this health metric",
        "recommendedAction": "recommended action to improve health outcomes"
      }
    ],
    "overallInsights": "a comprehensive paragraph summarizing the key insights",
    "primaryInfluencers": ["factor 1", "factor 2", "factor 3"],
    "actionPlan": ["action 1", "action 2", "action 3"]
  }
  
  If there's insufficient data to make strong correlations in any category, provide educated hypotheses based on psychological and financial research, but indicate lower confidence scores.
  
  IMPORTANT:
  - All array properties must contain at least one item
  - All numerical values must be appropriate numbers within their specified ranges
  - Emotion types must be one of: "stressed", "worried", "neutral", "content", "happy"
  - Health metric types must be one of: "heartRate", "sleepQuality", "recovery", "strain", "readiness", "steps", "calories", "workout"
  - Your response must contain ONLY the JSON object, no text before or after
  
  Here is the data to analyze:
  ${dataPrompt}
  `;

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

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
    return JSON.parse(cleanedResponse) as AdvancedAnalysisResult;
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw error;
  }
}

/**
 * Provide fallback analysis when AI services are unavailable
 */
function getFallbackAnalysis(): AdvancedAnalysisResult {
  return {
    emotionPatterns: [
      {
        patternName: "Insufficient Data for Pattern Recognition",
        description: "There is currently not enough data to identify clear emotional patterns. Continue tracking your emotions, finances, and health metrics to enable more accurate pattern recognition.",
        confidence: 0.3,
        affectedMetrics: ["all metrics"],
        recommendedActions: [
          "Continue logging your emotions daily",
          "Track your spending and categorize transactions",
          "Record health metrics consistently"
        ],
        severity: "low"
      }
    ],
    emotionFinanceCorrelations: [
      {
        emotionType: "neutral",
        spendingCategory: "general",
        correlation: 0,
        averageAmount: 0,
        description: "Insufficient data to establish correlation between emotions and spending patterns.",
        recommendedAction: "Continue tracking both emotional states and financial transactions to identify potential connections."
      }
    ],
    emotionHealthCorrelations: [
      {
        emotionType: "neutral",
        healthMetric: "heartRate",
        correlation: 0,
        description: "Insufficient data to establish correlation between emotions and health metrics.",
        recommendedAction: "Continue tracking both emotional states and health metrics to identify potential connections."
      }
    ],
    overallInsights: "Currently, there isn't enough data to provide comprehensive insights about the relationships between your emotions, financial behaviors, and health metrics. Continue using the app consistently to track these aspects of your life, and more meaningful patterns will emerge over time.",
    primaryInfluencers: [
      "Need more data to identify primary influencers"
    ],
    actionPlan: [
      "Log your emotions at least once daily",
      "Track all financial transactions and categorize them accurately",
      "Record health metrics regularly, especially after significant emotional events"
    ]
  };
}