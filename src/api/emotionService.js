// Simulated emotion analysis service
// In a real application, this would connect to your backend API

export const analyzeEmotion = async (text) => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // that uses Anthropic's API for analysis
    // const response = await fetch('/api/analyze-emotion', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text })
    // });
    // return await response.json();
    
    // Simulated response for demo purposes
    return simulateResponse(text);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    throw new Error('Failed to analyze emotion');
  }
};

export const analyzeEmotionalPatterns = async (entries) => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch('/api/emotional-patterns', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ entries })
    // });
    // return await response.json();
    
    // Simulated response for demo purposes
    return {
      primaryEmotionTrend: 'content',
      emotionalStability: 0.72,
      emotionalTriggers: ['work stress', 'financial concerns', 'social events'],
      recommendations: [
        'Schedule regular financial reviews on days when you feel content',
        'Avoid making major financial decisions when stressed',
        'Consider stress-reducing activities before financial planning'
      ],
      emotionBreakdown: [
        { emotion: 'content', percentage: 35 },
        { emotion: 'happy', percentage: 25 },
        { emotion: 'neutral', percentage: 20 },
        { emotion: 'worried', percentage: 12 },
        { emotion: 'stressed', percentage: 8 }
      ]
    };
  } catch (error) {
    console.error('Error analyzing emotional patterns:', error);
    throw new Error('Failed to analyze emotional patterns');
  }
};

export const generatePersonalizedInsights = async (userId, timeframe = 'month') => {
  try {
    // In a real app, this would be a fetch call to your API endpoint
    // const response = await fetch(`/api/insights?userId=${userId}&timeframe=${timeframe}`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // return await response.json();
    
    // Simulated response for demo purposes
    return {
      insights: [
        {
          id: 1,
          title: 'Emotional Spending Pattern',
          description: 'You tend to spend 35% more when feeling stressed compared to when you\'re feeling content.',
          recommendations: [
            'Consider implementing a 24-hour waiting period for purchases when feeling stressed',
            'Create a budget specifically for stress-relief activities'
          ],
          confidenceScore: 0.85
        },
        {
          id: 2,
          title: 'Recovery & Financial Discipline',
          description: 'Days with recovery scores above 80 show a 28% improvement in financial discipline.',
          recommendations: [
            'Schedule important financial decisions for days with high recovery',
            'Prioritize sleep before major financial planning sessions'
          ],
          confidenceScore: 0.91
        }
      ],
      correlations: [
        {
          metric1: 'stress',
          metric2: 'impulse_spending',
          correlation: 0.72,
          direction: 'positive',
          description: 'Higher stress correlates with more impulse spending'
        },
        {
          metric1: 'sleep_quality',
          metric2: 'saving_rate',
          correlation: 0.68,
          direction: 'positive',
          description: 'Better sleep quality correlates with higher saving rates'
        }
      ]
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate personalized insights');
  }
};

// Helper function to simulate emotion analysis response
const simulateResponse = (text) => {
  // Simple sentiment analysis simulation based on keywords
  const happyWords = ['happy', 'joy', 'exciting', 'pleased', 'thrilled', 'delighted'];
  const contentWords = ['content', 'satisfied', 'comfortable', 'pleasant', 'calm'];
  const worriedWords = ['worried', 'anxious', 'concern', 'uncertain', 'nervous'];
  const stressedWords = ['stressed', 'overwhelmed', 'pressure', 'tense', 'exhausted'];
  
  const lowerText = text.toLowerCase();
  
  // Count occurrences of emotion words
  const counts = {
    happy: happyWords.filter(word => lowerText.includes(word)).length,
    content: contentWords.filter(word => lowerText.includes(word)).length,
    worried: worriedWords.filter(word => lowerText.includes(word)).length,
    stressed: stressedWords.filter(word => lowerText.includes(word)).length
  };
  
  // Determine primary emotion
  let primaryEmotion = 'neutral';
  let maxCount = 0;
  
  Object.entries(counts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryEmotion = emotion;
    }
  });
  
  // If no emotion words detected, stay neutral
  const emotionIntensity = maxCount > 0 ? Math.min(0.5 + (maxCount * 0.1), 1) : 0.5;
  
  // Determine all detected emotions
  const detectedEmotions = [];
  Object.entries(counts).forEach(([emotion, count]) => {
    if (count > 0) {
      detectedEmotions.push(emotion);
    }
  });
  
  // If no emotions detected, default to neutral
  if (detectedEmotions.length === 0) {
    detectedEmotions.push('neutral');
  }
  
  // Generate recommendations based on primary emotion
  let recommendations = [];
  let emotionalTriggers = [];
  let sentiment = 'neutral';
  let confidence = 0.7 + (Math.random() * 0.25);
  
  switch (primaryEmotion) {
    case 'happy':
      recommendations = [
        'Consider increasing your savings rate while you\'re feeling positive',
        'This is a good time to review your financial goals',
        'Your positive mood can help with long-term financial planning'
      ];
      emotionalTriggers = ['achievement', 'social connection', 'good news'];
      sentiment = 'positive';
      break;
    case 'content':
      recommendations = [
        'This balanced emotional state is ideal for making financial decisions',
        'Consider reviewing your investment portfolio',
        'A good time to evaluate recurring expenses'
      ];
      emotionalTriggers = ['stability', 'balance', 'routine'];
      sentiment = 'positive';
      break;
    case 'worried':
      recommendations = [
        'Try to avoid making major financial decisions when worried',
        'Consider speaking with someone you trust about your concerns',
        'Practice a quick relaxation technique before financial planning'
      ];
      emotionalTriggers = ['uncertainty', 'unexpected expenses', 'future concerns'];
      sentiment = 'negative';
      break;
    case 'stressed':
      recommendations = [
        'Postpone major financial decisions if possible',
        'Focus on self-care to reduce stress levels',
        'Consider implementing a 24-hour rule for purchases when stressed'
      ];
      emotionalTriggers = ['work pressure', 'financial strain', 'time constraints'];
      sentiment = 'negative';
      break;
    default:
      recommendations = [
        'Maintain awareness of how your emotions affect financial decisions',
        'This is a good time for routine financial maintenance',
        'Consider tracking your mood alongside spending'
      ];
      emotionalTriggers = ['daily routine', 'typical activities'];
      sentiment = 'neutral';
  }
  
  return {
    primaryEmotion,
    emotionIntensity,
    detectedEmotions,
    emotionalTriggers,
    recommendations,
    sentiment,
    confidence
  };
};