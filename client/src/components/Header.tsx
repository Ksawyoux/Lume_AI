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
    <header className="px-4 py-4 flex items-center justify-between bg-background">
      <div className="flex items-center">
        {/* WHOOP-style wordmark in uppercase with letter spacing */}
        <h1 className="text-xl font-bold text-foreground tracking-widest uppercase">LUME</h1>
      </div>
      
      {/* WHOOP-style center recovery score display */}
      <div className="py-1.5 px-4 flex items-center space-x-1">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            {/* Main recovery score with appropriate color based on value */}
            <span className={`text-2xl font-bold ${getRecoveryColorClass()}`}>{recoveryScore}%</span>
            
            {/* Score change indicator */}
            {scoreDiff !== 0 && (
              <span className={`ml-1 text-xs ${isScoreUp ? 'text-[hsl(var(--recovery-high))]' : 'text-[hsl(var(--recovery-low))]'}`}>
                {isScoreUp ? '+' : ''}{scoreDiff}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">RECOVERY</span>
        </div>
      </div>
      
      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <BellIcon className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        {user && (
          <div className="w-8 h-8 bg-card text-foreground rounded-full flex items-center justify-center shadow-sm border border-border">
            <span className="text-xs font-medium uppercase tracking-wider">{user.initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}
