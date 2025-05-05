import { useUser } from "@/context/UserContext";
import { BellIcon, Settings, ChevronUpIcon } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  
  // WHOOP-style recovery score (67-100% is high recovery)
  const recoveryScore = 87;
  const previousScore = 72;
  const isHighRecovery = recoveryScore >= 67;
  const isMediumRecovery = recoveryScore >= 34 && recoveryScore < 67;
  const isLowRecovery = recoveryScore < 34;
  
  // Determine recovery color class based on score range
  const getRecoveryColorClass = () => {
    if (isHighRecovery) return 'text-[hsl(var(--recovery-high))]';
    if (isMediumRecovery) return 'text-[hsl(var(--recovery-medium))]';
    return 'text-[hsl(var(--recovery-low))]';
  };
  
  // Calculate score difference
  const scoreDiff = recoveryScore - previousScore;
  const isScoreUp = scoreDiff > 0;
  
  return (
    <header className="px-4 py-4 flex items-center justify-between bg-[#1a2126] text-white">
      {/* Left side - LUME wordmark */}
      <div className="w-1/3">
        <h1 className="text-xl font-bold tracking-widest uppercase">LUME</h1>
      </div>
      
      {/* Center - WHOOP-style recovery score display */}
      <div className="w-1/3 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            {/* Main recovery score with appropriate color based on value */}
            <span className={`text-2xl font-bold ${isHighRecovery ? 'text-[#16EC06]' : isMediumRecovery ? 'text-[#FFDE00]' : 'text-[#FF0026]'}`}>
              {recoveryScore}%
            </span>
            
            {/* Score change indicator */}
            {scoreDiff !== 0 && (
              <span className={`ml-1 text-xs ${isScoreUp ? 'text-[#16EC06]' : 'text-[#FF0026]'}`}>
                {isScoreUp ? '+' : ''}{scoreDiff}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-widest">RECOVERY</span>
        </div>
      </div>
      
      {/* Right side icons */}
      <div className="w-1/3 flex justify-end items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <BellIcon className="h-5 w-5" />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        {user && (
          <div className="w-8 h-8 bg-[#2A363D] text-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wider">{user.initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}
