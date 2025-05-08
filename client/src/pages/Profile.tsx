import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import EmotionReferenceImageManager from '@/components/EmotionReferenceImageManager';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Bell, Lock, Eye, HelpCircle, LogOut, Activity, Zap, Loader2, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useUser();
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState(true);
  const [emotionTracking, setEmotionTracking] = useState(true);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-foreground uppercase tracking-wider">YOUR PROFILE</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage account settings and preferences
          </p>
        </section>
        
        <section className="px-4 py-2">
          {/* WHOOP-style profile card */}
          <div className="whoop-container mb-5">
            <div className="grid grid-cols-2 items-center">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-[#2A363D] flex items-center justify-center">
                  <span className="text-xl font-bold text-[#00f19f] uppercase">{user.username.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold text-foreground uppercase">{user.username}</h3>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="hsl(var(--recovery-high))"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.51)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-[hsl(var(--recovery-high))]">51%</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">RECOVERY</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="py-5 border-border bg-card hover:bg-accent text-foreground uppercase text-xs tracking-wider"
              >
                EDIT PROFILE
              </Button>
              <Button 
                variant="outline" 
                className="py-5 border-border bg-card hover:bg-accent text-foreground uppercase text-xs tracking-wider flex items-center justify-center"
              >
                <Activity size={14} className="mr-1" />
                ACTIVITY
              </Button>
              <Button 
                variant="outline" 
                className="py-5 border-border bg-card hover:bg-accent text-foreground uppercase text-xs tracking-wider flex items-center justify-center"
              >
                <Zap size={14} className="mr-1" />
                INSIGHTS
              </Button>
            </div>
          </div>
          
          {/* App Settings */}
          <div className="whoop-container mb-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">APP SETTINGS</h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-primary mr-3">
                    <Bell size={16} />
                  </div>
                  <div>
                    <span className="text-sm text-foreground font-medium uppercase tracking-wider">NOTIFICATIONS</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Get alerts for mood patterns</p>
                  </div>
                </div>
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <Separator className="bg-border" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-primary mr-3">
                    <Eye size={16} />
                  </div>
                  <div>
                    <span className="text-sm text-foreground font-medium uppercase tracking-wider">TREND ANALYSIS</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Advanced insights on spending patterns</p>
                  </div>
                </div>
                <Switch 
                  checked={trendAnalysis}
                  onCheckedChange={setTrendAnalysis}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <Separator className="bg-border" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-primary mr-3">
                    <Lock size={16} />
                  </div>
                  <div>
                    <span className="text-sm text-foreground font-medium uppercase tracking-wider">EMOTION TRACKING</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Daily mood monitoring and analysis</p>
                  </div>
                </div>
                <Switch 
                  checked={emotionTracking}
                  onCheckedChange={setEmotionTracking}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
          
          {/* Emotion Reference Images */}
          <div className="whoop-container mb-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">EMOTION RECOGNITION</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-primary mr-3">
                  <Camera size={16} />
                </div>
                <div>
                  <span className="text-sm text-foreground font-medium uppercase tracking-wider">FACIAL RECOGNITION</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize how the app recognizes your emotions</p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                To help the app better recognize your facial expressions, you can provide reference images for different emotions.
                These images are stored securely and used only to improve the accuracy of emotion detection.
              </p>
              
              <div className="mt-2">
                <EmotionReferenceImageManager />
              </div>
            </div>
          </div>
          
          {/* Support */}
          <div className="whoop-container mb-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">SUPPORT</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between py-3 text-sm text-foreground hover:text-primary transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-primary mr-3">
                    <HelpCircle size={16} />
                  </div>
                  <span className="uppercase tracking-wider font-medium">HELP & SUPPORT</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              
              <Separator className="bg-border" />
              
              <button 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center justify-between py-3 text-sm text-foreground hover:text-[hsl(var(--recovery-low))] transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--recovery-low)/0.1)] flex items-center justify-center text-[hsl(var(--recovery-low))] mr-3">
                    {logoutMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogOut size={16} />
                    )}
                  </div>
                  <span className="uppercase tracking-wider font-medium">
                    {logoutMutation.isPending ? "LOGGING OUT..." : "LOG OUT"}
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="w-7 h-7 mx-auto mb-2 flex items-center justify-center">
              <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M4.75 14L12 18.25L19.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">LUME v1.0.0</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              © 2025 LUME. ALL RIGHTS RESERVED.
            </p>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
