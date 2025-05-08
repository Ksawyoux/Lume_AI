import { EmotionType } from '@shared/schema';

/**
 * Maps emotion types to their recovery percentage values
 * - happiness: 100%
 * - content: 75%
 * - neutral: 50%
 * - worried: 30%
 * - stressed: 20%
 */
export const emotionRecoveryPercentages: Record<EmotionType, number> = {
  "happy": 100,
  "content": 75,
  "neutral": 50,
  "worried": 30,
  "stressed": 20
};

/**
 * Gets the recovery percentage for a specific emotion type
 */
export function getEmotionRecoveryPercentage(emotionType: EmotionType): number {
  return emotionRecoveryPercentages[emotionType];
}

/**
 * Gets the color for a specific emotion type
 */
export function getEmotionColor(emotionType: EmotionType): string {
  switch(emotionType) {
    case 'stressed': return 'hsl(var(--recovery-low))';
    case 'worried': return 'hsl(var(--recovery-medium))';
    case 'neutral': return 'hsl(var(--recovery-neutral))';
    case 'content': return 'hsl(var(--strain))';
    case 'happy': return 'hsl(var(--recovery-high))';
    default: return 'hsl(var(--primary))';
  }
}

/**
 * Emotion configuration for the app
 */
export const emotionConfig: Record<EmotionType, {
  label: string;
  icon: string;
  color: string;
  cssClass: string;
  recoveryPercentage: number;
}> = {
  "stressed": {
    label: "Stressed",
    icon: "dizzy",
    color: "#FF5630",
    cssClass: "bg-[#FF5630]/10 text-[#FF5630]",
    recoveryPercentage: 20
  },
  "worried": {
    label: "Worried", 
    icon: "frown",
    color: "#FFAB00",
    cssClass: "bg-[#FFAB00]/10 text-[#FFAB00]",
    recoveryPercentage: 30
  },
  "neutral": {
    label: "Neutral",
    icon: "meh",
    color: "#36B37E",
    cssClass: "bg-[#36B37E]/10 text-[#36B37E]",
    recoveryPercentage: 50
  },
  "content": {
    label: "Content",
    icon: "smile",
    color: "#00B8D9",
    cssClass: "bg-[#00B8D9]/10 text-[#00B8D9]",
    recoveryPercentage: 75
  },
  "happy": {
    label: "Happy",
    icon: "grin-stars",
    color: "#6554C0",
    cssClass: "bg-[#6554C0]/10 text-[#6554C0]",
    recoveryPercentage: 100
  }
};