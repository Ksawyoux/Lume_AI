import { EmotionType } from '@shared/schema';

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
  
  // Get color for a specific mood
  const getMoodColor = (mood: EmotionType | null): string => {
    switch (mood) {
      case 'happy':
        return '#00f19f'; // bright teal
      case 'content':
        return '#4CC9F0'; // light blue
      case 'neutral':
        return '#8D99AE'; // gray blue
      case 'worried':
        return '#EEB868'; // amber
      case 'stressed':
        return '#FB5607'; // orange
      default:
        return '#2A363D'; // background color for empty slots
    }
  };
  
  // Get opacity for a specific position
  const getOpacity = (index: number, mood: EmotionType | null): number => {
    if (mood === null) return 0.5; // Empty slots are dimmed
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
  
  const positions = generateCirclePositions(moodSlots.length);
  
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
          
          {/* Middle mood indicator */}
          <text 
            x="50" 
            y="45" 
            textAnchor="middle" 
            fontSize="12" 
            fontWeight="bold" 
            fill="white"
          >
            --
          </text>
          <text 
            x="50" 
            y="60" 
            textAnchor="middle" 
            fontSize="7" 
            fill="#94A3B8"
            style={{ textTransform: 'uppercase' }}
          >
            MOOD
          </text>
        </svg>
      </div>
      <div className="text-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider">WEEKLY RECOVERY</span>
      </div>
    </div>
  );
}