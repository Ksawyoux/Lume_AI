import React from "react";
import { EmotionType } from "@shared/schema";
import { emotionConfig } from "@/types";
import { cn } from "@/lib/utils";

interface EmojiSelectorProps {
  selectedEmotion: EmotionType | null;
  onSelect: (emotion: EmotionType) => void;
}

export default function EmojiSelector({
  selectedEmotion,
  onSelect,
}: EmojiSelectorProps) {
  const emotions: EmotionType[] = ["stressed", "worried", "neutral", "content", "happy"];

  return (
    <div className="flex justify-between mb-4">
      {emotions.map((emotion) => (
        <div 
          key={emotion}
          className="flex flex-col items-center"
          onClick={() => onSelect(emotion)}
        >
          <div 
            className={cn(
              "emotion-icon w-12 h-12 mb-1 cursor-pointer",
              emotionConfig[emotion].cssClass,
              selectedEmotion === emotion && "selected"
            )}
          >
            <i className={`fas fa-${emotionConfig[emotion].icon} text-xl`}></i>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{emotionConfig[emotion].label}</span>
        </div>
      ))}
    </div>
  );
}
