import { EmotionType } from '@shared/schema';

interface MoodWeeklyRecoveryProps {
  weeklyMoods?: EmotionType[];
}

/**
 * A simple circular visualization showing "MOOD" text in the middle
 * With dots around the circle representing the week's moods
 * Matching the provided screenshot design
 */
export default function MoodWeeklyRecovery({ weeklyMoods }: MoodWeeklyRecoveryProps) {
  // Default to empty array if no moods are provided
  const moods = weeklyMoods || [];
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Circle with mood dots */}
      <div className="relative w-24 h-24 mb-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer circle of dots */}
          {Array(12).fill(null).map((_, index) => {
            // Calculate position on the circle
            const angle = (index / 12) * Math.PI * 2 - Math.PI / 2; // Start from top
            const radius = 40; // Circle radius
            const cx = 50 + radius * Math.cos(angle);
            const cy = 50 + radius * Math.sin(angle);
            
            // Determine if this dot should be filled based on available mood data
            const isFilled = index < moods.length;
            
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={3.5}
                fill={isFilled ? "#E5E7EB" : "#4B5563"}
                className={isFilled ? "" : "opacity-50"}
              />
            );
          })}
          
          {/* Middle text */}
          <text 
            x="50" 
            y="50" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="10" 
            fontWeight="bold" 
            fill="#E5E7EB"
            style={{ textTransform: 'uppercase' }}
          >
            MOOD
          </text>
        </svg>
      </div>
      <p className="text-xs text-gray-400 uppercase">WEEKLY RECOVERY</p>
    </div>
  );
}