import { EmotionType } from '@shared/schema';
import { emotionRecoveryPercentages } from '@/lib/emotionUtils';

interface MoodRecoveryCircleProps {
  weeklyMoods?: EmotionType[];
}

/**
 * A circular visualization for weekly mood recovery
 * Shows dots around a circle representing the week's moods
 */
export default function MoodRecoveryCircle({ weeklyMoods }: MoodRecoveryCircleProps) {
  // Default to empty array if no moods are provided
  const moods = weeklyMoods || [];
  
  // Create a full week of mood slots - we'll fill in what we have
  const moodSlots: (EmotionType | null)[] = Array(12).fill(null);
  
  // Fill in the mood slots from what we have
  moods.forEach((mood, index) => {
    if (index < moodSlots.length) {
      moodSlots[index] = mood;
    }
  });
  
  // To match the screenshot, all dots are white or dark
  const getMoodColor = (mood: EmotionType | null): string => {
    if (mood === null) {
      return '#2A363D'; // dark for empty slots
    }
    return '#FFFFFF'; // white for filled slots
  };
  
  // Get opacity for a specific position
  const getOpacity = (index: number, mood: EmotionType | null): number => {
    if (mood === null) return 0.7; // Empty slots are dimmed
    return 1;
  };
  
  // Calculate positions for 12 dots around a circle
  const generateCirclePositions = (numberOfDots: number, radius: number = 40) => {
    const positions = [];
    const angleStep = (2 * Math.PI) / numberOfDots;
    
    for (let i = 0; i < numberOfDots; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from the top (-90 degrees)
      const x = radius * Math.cos(angle) + 50; // Center at (50, 50)
      const y = radius * Math.sin(angle) + 50;
      positions.push({ x, y });
    }
    
    return positions;
  };
  
  // Calculate recovery average
  const calculateRecoveryAverage = (): number => {
    if (moods.length === 0) return 0;
    
    const total = moods.reduce((sum, mood) => {
      return sum + emotionRecoveryPercentages[mood];
    }, 0);
    
    return Math.round(total / moods.length);
  };
  
  const positions = generateCirclePositions(moodSlots.length);
  const recoveryAverage = calculateRecoveryAverage();
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Dots around the circle */}
          {moodSlots.map((mood, index) => {
            const { x, y } = positions[index];
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={mood === null ? 3 : 4} // Slightly larger dots for recorded moods
                fill={getMoodColor(mood)}
                opacity={getOpacity(index, mood)}
              />
            );
          })}
          
          {/* Middle text container */}
          <g>
            {/* Recovery percentage */}
            <text 
              x="50" 
              y="45" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fontSize="12" 
              fontWeight="bold" 
              fill="#00f19f"
            >
              {recoveryAverage}%
            </text>
            
            {/* MOOD text */}
            <text 
              x="50" 
              y="60" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fontSize="8" 
              fontWeight="bold" 
              fill="#94A3B8"
              style={{ textTransform: 'uppercase' }}
            >
              MOOD
            </text>
          </g>
        </svg>
      </div>
      <div className="text-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">WEEKLY RECOVERY</span>
      </div>
    </div>
  );
}