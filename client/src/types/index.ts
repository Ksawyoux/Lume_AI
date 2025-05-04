export type EmotionType = "stressed" | "worried" | "neutral" | "content" | "happy";

export interface User {
  id: number;
  username: string;
  name: string;
  initials: string;
}

export interface Emotion {
  id: number;
  userId: number;
  type: EmotionType;
  notes?: string;
  date: string | Date;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  category: string;
  date: string | Date;
  emotionId?: number;
  emotion?: Emotion;
}

export interface Insight {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  date: string | Date;
  updatedDate?: string | Date;
}

// This maps emotion types to their visual representation
export const emotionConfig: Record<EmotionType, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  cssClass: string;
}> = {
  stressed: {
    icon: "frown",
    color: "hsl(var(--emotion-stressed))",
    bgColor: "hsl(var(--emotion-stressed) / 0.1)",
    borderColor: "hsl(var(--emotion-stressed) / 0.2)",
    label: "Stressed",
    cssClass: "emotion-stressed"
  },
  worried: {
    icon: "meh",
    color: "hsl(var(--emotion-worried))",
    bgColor: "hsl(var(--emotion-worried) / 0.1)",
    borderColor: "hsl(var(--emotion-worried) / 0.2)",
    label: "Worried",
    cssClass: "emotion-worried"
  },
  neutral: {
    icon: "meh-blank",
    color: "hsl(var(--emotion-neutral))",
    bgColor: "hsl(var(--emotion-neutral) / 0.1)",
    borderColor: "hsl(var(--emotion-neutral) / 0.2)",
    label: "Neutral",
    cssClass: "emotion-neutral"
  },
  content: {
    icon: "smile",
    color: "hsl(var(--emotion-content))",
    bgColor: "hsl(var(--emotion-content) / 0.1)",
    borderColor: "hsl(var(--emotion-content) / 0.2)",
    label: "Content",
    cssClass: "emotion-content"
  },
  happy: {
    icon: "grin-beam",
    color: "hsl(var(--emotion-happy))",
    bgColor: "hsl(var(--emotion-happy) / 0.1)",
    borderColor: "hsl(var(--emotion-happy) / 0.2)",
    label: "Happy",
    cssClass: "emotion-happy"
  }
};

// Transaction category icons
export const categoryIcons: Record<string, string> = {
  grocery: "shopping-cart",
  food: "utensils",
  restaurant: "utensils",
  entertainment: "film",
  income: "hand-holding-usd",
  shopping: "shopping-bag",
  transport: "car",
  health: "heartbeat",
  education: "graduation-cap",
  housing: "home",
  utilities: "bolt",
  other: "tag"
};

// Insight type icons and colors
export const insightConfig: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  "stress-triggered": {
    icon: "exclamation-circle",
    color: "hsl(0, 84%, 60%)",
    bgColor: "hsl(0, 84%, 97%)"
  },
  "positive-pattern": {
    icon: "lightbulb",
    color: "hsl(142, 71%, 45%)",
    bgColor: "hsl(142, 71%, 97%)"
  },
  "mood-boosting": {
    icon: "brain",
    color: "hsl(270, 76%, 66%)",
    bgColor: "hsl(270, 76%, 97%)"
  }
};
