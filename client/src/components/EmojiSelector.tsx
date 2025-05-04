import React from "react";
import { EmotionType, emotionConfig } from "@/types";
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
              "w-12 h-12 rounded-full flex items-center justify-center mb-1 border transition-all duration-200 hover:scale-110 hover:opacity-90 cursor-pointer",
              selectedEmotion === emotion && "scale-110 shadow-sm"
            )}
            style={{
              borderColor: emotionConfig[emotion].borderColor,
              color: emotionConfig[emotion].color,
              backgroundColor: selectedEmotion === emotion ? emotionConfig[emotion].bgColor : 'transparent',
            }}
          >
            <i className={`fas fa-${emotionConfig[emotion].icon} text-xl`}></i>
          </div>
          <span className="text-xs text-neutral-600">{emotionConfig[emotion].label}</span>
        </div>
      ))}
    </div>
  );
}
