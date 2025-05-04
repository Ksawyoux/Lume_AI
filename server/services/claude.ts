import Anthropic from '@anthropic-ai/sdk';

// Note that the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
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
  try {
    const prompt = `Please analyze the following text for emotional content and respond with only a valid JSON object.

Text to analyze:
"${text}"

Analyze for:
- The primary emotion being expressed
- The intensity of the emotion (scale of 0-1)
- All emotions detected
- Potential emotional triggers from the content
- Short recommendations for emotional well-being
- Overall sentiment (positive/negative/neutral)
- Analysis confidence (scale of 0-1)

Respond ONLY with a JSON object with these keys: primaryEmotion, emotionIntensity, detectedEmotions (array), emotionalTriggers (array), recommendations (array of max 3 items), sentiment, confidence`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the JSON response
    const content = response.content[0] as { text: string };
    const result = JSON.parse(content.text);
    
    return {
      primaryEmotion: result.primaryEmotion,
      emotionIntensity: result.emotionIntensity,
      detectedEmotions: result.detectedEmotions,
      emotionalTriggers: result.emotionalTriggers,
      recommendations: result.recommendations,
      sentiment: result.sentiment,
      confidence: result.confidence
    };
  } catch (error: any) {
    console.error('Error analyzing emotion:', error);
    throw new Error(`Failed to analyze emotion: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyzes emotional patterns over time from a collection of text entries
 */
export async function analyzeEmotionalPatterns(entries: {text: string, date: string}[]): Promise<any> {
  try {
    // Format entries into a string
    const entriesText = entries.map(entry => `Date: ${entry.date}\nEntry: ${entry.text}`).join('\n\n');
    
    const prompt = `Please analyze these journal entries for emotional patterns over time and respond with only a valid JSON object.

Entries:
${entriesText}

Analyze for:
- Dominant emotional patterns
- Emotional triggers that repeat
- Emotional growth or decline trends
- Correlation between days of week and emotions
- Actionable insights based on the patterns

Respond ONLY with a JSON object with these keys: patterns (array), triggers (array), trends (object), dayCorrelations (object), insights (array)`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the JSON response
    const content1 = response.content[0] as { text: string };
    return JSON.parse(content1.text);
  } catch (error: any) {
    console.error('Error analyzing emotional patterns:', error);
    throw new Error(`Failed to analyze emotional patterns: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generates personalized emotional insights based on financial behavior and emotional data
 */
export async function generatePersonalizedInsights(
  emotionalData: { type: string; date: string; notes?: string }[],
  financialData: { amount: number; category: string; date: string; description: string }[]
): Promise<any> {
  try {
    // Format the data for Claude
    const emotionalDataString = JSON.stringify(emotionalData, null, 2);
    const financialDataString = JSON.stringify(financialData, null, 2);
    
    const prompt = `Based on this emotional and financial data, generate personalized insights about the relationship between emotional states and financial behavior. Respond with only a valid JSON object.

Emotional Data:
${emotionalDataString}

Financial Data:
${financialDataString}

Generate insights on:
- Correlation between specific emotions and spending patterns
- Financial triggers for negative emotions
- Recommendations for improved financial well-being based on emotional patterns
- Potential savings opportunities based on emotional awareness

Respond ONLY with a JSON object with these keys: correlations (array), financialTriggers (array), recommendations (array), savingsOpportunities (array)`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the JSON response
    const content2 = response.content[0] as { text: string };
    return JSON.parse(content2.text);
  } catch (error: any) {
    console.error('Error generating personalized insights:', error);
    throw new Error(`Failed to generate personalized insights: ${error.message || 'Unknown error'}`);
  }
}
