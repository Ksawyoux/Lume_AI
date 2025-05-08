import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import { Emotion, EmotionType } from '@shared/schema';
import { emotionRecoveryPercentages } from '@/lib/emotionUtils';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ChevronRight, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const [confirmLogout, setConfirmLogout] = useState(false);
  
  // Get weekly emotions data to calculate personalized recovery
  const { data: weeklyEmotions } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  // Calculate recovery average from weekly emotions
  const calculateRecoveryAverage = (): number => {
    if (!weeklyEmotions || weeklyEmotions.length === 0) return 0;
    
    const moods = weeklyEmotions.map(emotion => emotion.type as EmotionType);
    const total = moods.reduce((sum, mood) => {
      return sum + emotionRecoveryPercentages[mood];
    }, 0);
    
    return Math.round(total / moods.length);
  };
  
  // Personal recovery score - tends to be lower than the header score
  // to encourage improvement
  const personalRecoveryScore = Math.max(0, calculateRecoveryAverage() - 13);
  
  const handleLogout = () => {
    if (confirmLogout) {
      logout();
    } else {
      setConfirmLogout(true);
      
      // Reset confirm state after 3 seconds
      setTimeout(() => {
        setConfirmLogout(false);
      }, 3000);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16 px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">YOUR PROFILE</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Manage account settings and preferences
        </p>
        
        {/* Profile Card */}
        <div className="p-4 bg-[#1a2126] rounded-lg border border-[#2A363D] mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isUserLoading ? (
                <Skeleton className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#2A363D] flex items-center justify-center">
                  <span className="text-2xl font-semibold text-[#00f19f]">
                    {user?.username?.charAt(0) || 'K'}
                  </span>
                </div>
              )}
              
              <div className="ml-4">
                {isUserLoading ? (
                  <>
                    <Skeleton className="h-7 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold uppercase">{user?.username || 'KSAWYOUX'}</h2>
                    <span className="text-sm text-muted-foreground">Member since 2025</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Personal Recovery Score - Different from header */}
            <div className="w-16 h-16 relative flex items-center justify-center">
              {/* Semi-circle background track */}
              <div className="absolute w-full h-full rounded-full border-4 border-gray-700 opacity-30"></div>
              
              {/* Recovery arc - dynamic based on percentage */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#00f19f" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * personalRecoveryScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Percentage display */}
              <div className="z-10 flex flex-col items-center text-center">
                <span className="text-lg font-bold text-[#00f19f]">
                  {personalRecoveryScore}%
                </span>
              </div>
              <span className="absolute -bottom-6 text-xs text-gray-400 uppercase">RECOVERY</span>
            </div>
          </div>
        </div>
        
        {/* Settings Menu */}
        <div className="space-y-2 mb-8">
          <div className="p-4 bg-[#1a2126] rounded-lg border border-[#2A363D] flex justify-between items-center cursor-pointer hover:bg-[#222a32] transition-colors">
            <span className="text-foreground">Account Settings</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="p-4 bg-[#1a2126] rounded-lg border border-[#2A363D] flex justify-between items-center cursor-pointer hover:bg-[#222a32] transition-colors">
            <span className="text-foreground">Privacy & Data</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="p-4 bg-[#1a2126] rounded-lg border border-[#2A363D] flex justify-between items-center cursor-pointer hover:bg-[#222a32] transition-colors">
            <span className="text-foreground">Notifications</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="p-4 bg-[#1a2126] rounded-lg border border-[#2A363D] flex justify-between items-center cursor-pointer hover:bg-[#222a32] transition-colors">
            <span className="text-foreground">Help & Support</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          className={`w-full p-4 rounded-lg flex items-center justify-center gap-2 ${
            confirmLogout 
              ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
              : 'bg-[#1a2126] text-foreground border border-[#2A363D] hover:bg-[#222a32]'
          } transition-colors`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>{confirmLogout ? 'Confirm Logout' : 'Logout'}</span>
        </button>
      </main>
      
      <BottomNavigation />
    </div>
  );
}