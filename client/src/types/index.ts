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
}> = {
  stressed: {
    icon: "frown",
    color: "hsl(0, 84%, 60%)",
    bgColor: "hsl(0, 84%, 97%)",
    borderColor: "hsl(0, 84%, 90%)",
    label: "Stressed"
  },
  worried: {
    icon: "meh",
    color: "hsl(30, 92%, 45%)",
    bgColor: "hsl(30, 92%, 97%)",
    borderColor: "hsl(30, 92%, 90%)",
    label: "Worried"
  },
  neutral: {
    icon: "meh-blank",
    color: "hsl(45, 93%, 47%)",
    bgColor: "hsl(45, 93%, 97%)",
    borderColor: "hsl(45, 93%, 90%)",
    label: "Neutral"
  },
  content: {
    icon: "smile",
    color: "hsl(142, 71%, 45%)",
    bgColor: "hsl(142, 71%, 97%)",
    borderColor: "hsl(142, 71%, 90%)",
    label: "Content"
  },
  happy: {
    icon: "grin-beam",
    color: "hsl(216, 92%, 58%)",
    bgColor: "hsl(216, 92%, 97%)",
    borderColor: "hsl(216, 92%, 90%)",
    label: "Happy"
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
