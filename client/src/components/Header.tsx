import { useUser } from "@/context/UserContext";
import { BellIcon, MoonIcon, Settings } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  
  // Use a large number similar to the WHOOP interface
  const dailyScore = 152;
  const previousScore = 148;
  
  return (
    <header className="px-4 py-4 flex items-center justify-between bg-background">
      <div className="flex items-center">
        {/* WHOOP-inspired title/logo */}
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Lume</h1>
      </div>
      
      {/* WHOOP-inspired center score display */}
      <div className="bg-card py-1.5 px-4 rounded-full flex items-center space-x-1 border border-border shadow-sm">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-foreground">{dailyScore}</span>
            <span className="ml-1 text-xs text-primary">▲</span>
          </div>
          <span className="text-xs text-muted-foreground">{previousScore}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <BellIcon className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        {user && (
          <div className="w-8 h-8 bg-card text-foreground rounded-full flex items-center justify-center shadow-sm border border-border">
            <span className="text-xs font-medium">{user.initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}
