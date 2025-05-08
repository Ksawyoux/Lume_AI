import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import EmotionTracker from '@/components/EmotionTracker';
import RecentTransactions from '@/components/RecentTransactions';
import QuickAddTransaction from '@/components/QuickAddTransaction';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Emotion } from '@/types';
import { HelpCircle } from 'lucide-react';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  
  // Weekly summary data
  const { data: emotionData, isLoading: isEmotionLoading } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/analytics/spending-by-emotion`] : [],
    enabled: !!user,
  });
  
  // Latest emotion data
  const { data: latestEmotion } = useQuery<Emotion>({
    queryKey: user ? [`/api/users/${user.id}/emotions/latest`] : [],
    enabled: !!user,
  });
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col relative">
      <Header />
      
      {/* Quick Add Button with fixed positioning is within the QuickAddTransaction component */}
      <QuickAddTransaction />
      
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Greeting */}
        <section className="px-4 pt-6 pb-2">
          {isUserLoading ? (
            <>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground">Hi, {user?.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your finances and emotions to build better habits
              </p>
            </>
          )}
        </section>
        
        {/* Emotion Tracker */}
        <EmotionTracker />
        
        {/* Mood and Finance Summary - WHOOP-inspired minimalist dashboard */}
        <section className="px-4 py-2">
          <div className="whoop-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground">Your Dashboard</h3>
              <span className="text-xs text-muted-foreground">{format(new Date(), 'MMM d, yyyy')}</span>
            </div>
            
            {isEmotionLoading ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Current Mood Status - No Data Available */}
                <div className="p-3 mb-4 rounded-lg bg-accent/50 border border-border">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-muted/50">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Current Mood: No Data</div>
                      <div className="text-xs text-muted-foreground">Track your first mood to get started</div>
                    </div>
                  </div>
                </div>
                
                {/* WHOOP-style metrics overview - Empty State */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* WHOOP-inspired Mood Recovery - Empty State */}
                  <div className="flex flex-col items-center justify-center p-3">
                    <div className="relative w-24 h-24 mb-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                        />
                        {/* Empty progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth="8"
                          strokeDasharray="4, 12"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-muted-foreground">--</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">MOOD</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground uppercase">Weekly Recovery</span>
                    </div>
                  </div>

                  {/* Financial Health Chart - Empty State */}
                  <div className="flex flex-col p-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-foreground uppercase tracking-wider">FINANCIAL</span>
                      <span className="text-sm font-medium text-muted-foreground">--</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-wider">SPENDING</span>
                          <span className="text-muted-foreground">NO DATA</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" 
                            style={{ width: '0%', backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-wider">SAVING</span>
                          <span className="text-muted-foreground">NO DATA</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" 
                            style={{ width: '0%', backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-wider">EMOTION</span>
                          <span className="text-muted-foreground">NO DATA</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" 
                            style={{ width: '0%', backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weekly Trends - Empty State */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">DAILY TRENDS</span>
                    <span className="text-xs text-[hsl(var(--primary))] uppercase tracking-wider">VIEW ALL</span>
                  </div>
                  <div className="h-24 flex items-end justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-5 rounded-sm border border-dashed border-muted-foreground/30" 
                          style={{ 
                            height: '10%',
                            backgroundColor: 'transparent'
                          }}
                        ></div>
                        <span className="text-xs text-muted-foreground mt-2">{index}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <span className="text-xs text-muted-foreground italic">
                      Track your mood over time to see trends
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        
        {/* Recent Transactions */}
        <RecentTransactions />
      </main>

      <BottomNavigation />
    </div>
  );
}
