import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import EmotionTracker from '@/components/EmotionTracker';
import RecentTransactions from '@/components/RecentTransactions';
import QuickAddTransaction from '@/components/QuickAddTransaction';
import MoodRecoveryCircle from '@/components/MoodRecoveryCircle';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Budget, Emotion, EmotionType } from '@shared/schema';
import { HelpCircle } from 'lucide-react';

interface BudgetSpending {
  spent: number;
  remaining: number;
  percentage: number;
}

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  
  // Weekly summary data
  const { data: emotionData, isLoading: isEmotionLoading } = useQuery<{ totalSpending: number, emotions: { emotion: EmotionType, amount: number }[] }>({
    queryKey: user ? [`/api/users/${user.id}/analytics/spending-by-emotion`] : [],
    enabled: !!user,
  });
  
  // Weekly emotions data
  const { data: weeklyEmotions } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  // Find the most frequent emotion
  const getMostFrequentEmotion = (): { emotion: EmotionType, count: number } | null => {
    if (!weeklyEmotions || weeklyEmotions.length === 0) return null;
    
    const emotionCounts: Record<EmotionType, number> = {
      happy: 0,
      content: 0,
      neutral: 0,
      worried: 0,
      stressed: 0
    };
    
    weeklyEmotions.forEach(emotion => {
      emotionCounts[emotion.type as EmotionType]++;
    });
    
    let mostFrequentEmotion: EmotionType = 'neutral';
    let highestCount = 0;
    
    for (const [emotion, count] of Object.entries(emotionCounts) as [EmotionType, number][]) {
      if (count > highestCount) {
        mostFrequentEmotion = emotion;
        highestCount = count;
      }
    }
    
    return { emotion: mostFrequentEmotion, count: highestCount };
  };
  
  const topEmotion = getMostFrequentEmotion();
  
  // Get active budgets
  const { data: budgets } = useQuery<Budget[]>({
    queryKey: user ? [`/api/users/${user.id}/budgets/active`] : [],
    enabled: !!user,
  });
  
  // Get the main monthly budget if it exists
  const monthlyBudget = budgets?.find(budget => budget.type === 'monthly' && !budget.category);
  
  // Get budget spending data for the monthly budget
  const { data: budgetSpending } = useQuery<BudgetSpending>({
    queryKey: user && monthlyBudget ? [`/api/users/${user.id}/budgets/${monthlyBudget.id}/spending`] : [],
    enabled: !!user && !!monthlyBudget,
  });
  
  // Extract the emotion types from the weekly emotions for the MoodRecoveryCircle
  const weeklyMoodTypes = weeklyEmotions?.map(emotion => emotion.type as EmotionType) || [];
  
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
                {/* Top Emotion Box */}
                <div className="p-3 mb-4 rounded-lg bg-[#1a2126] border border-[#2A363D]">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase mb-1 tracking-wider">TOP EMOTION</span>
                    
                    {topEmotion ? (
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-white capitalize mb-1">
                          {topEmotion.emotion}
                        </span>
                        <span className="text-xs text-gray-400">Most frequent</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-400">No Data</span>
                        <span className="text-xs text-gray-500">Track your mood to see trends</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* WHOOP-style metrics overview - Empty State */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* WHOOP-inspired Mood Recovery Circle */}
                  <div 
                    className="flex flex-col items-center justify-center p-3 bg-[#1a2126] rounded-lg hover:bg-[#1F2932] transition-colors cursor-pointer"
                    onClick={() => window.location.href = '/mood-dashboard'}
                  >
                    {weeklyMoodTypes.length > 0 ? (
                      <MoodRecoveryCircle weeklyMoods={weeklyMoodTypes} />
                    ) : (
                      <MoodRecoveryCircle />
                    )}
                  </div>

                  {/* Financial Health Chart */}
                  <div className="flex flex-col p-3 bg-[#1a2126] rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-foreground uppercase tracking-wider">FINANCIAL</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {budgets && budgets.length > 0 ? budgets[0].currency : '--'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-400 uppercase tracking-wider">SPENDING</span>
                          <span className="text-gray-400">
                            {budgetSpending ? budgetSpending.spent.toFixed(0) : '--'}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-[#2A363D] rounded-full overflow-hidden">
                          <div className="h-full bg-[#00f19f]" 
                            style={{ 
                              width: budgetSpending ? `${budgetSpending.percentage}%` : '0%',
                              backgroundColor: budgetSpending && budgetSpending.percentage && budgetSpending.percentage > 90 ? '#FF5630' : 
                                              budgetSpending && budgetSpending.percentage && budgetSpending.percentage > 75 ? '#FFAB00' : '#00f19f'
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-400 uppercase tracking-wider">SAVING</span>
                          <span className="text-gray-400">
                            {budgets && budgets.length > 0 && budgetSpending ? 
                              (budgets[0].amount - budgetSpending.spent).toFixed(0) : 
                              '--'
                            }
                          </span>
                        </div>
                        <div className="h-1 w-full bg-[#2A363D] rounded-full overflow-hidden">
                          <div className="h-full bg-[#4CC9F0]" 
                            style={{ 
                              width: budgetSpending && budgetSpending.percentage ? 
                                    `${100 - budgetSpending.percentage}%` : 
                                    '0%' 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-400 uppercase tracking-wider">BUDGET</span>
                          <span className="text-gray-400">
                            {budgets && budgets.length > 0 ? 
                              budgets[0].amount.toFixed(0) : 
                              '--'
                            }
                          </span>
                        </div>
                        <div className="h-1 w-full bg-[#2A363D] rounded-full overflow-hidden">
                          <div className="h-full bg-[#8D99AE]" 
                            style={{ width: budgets && budgets.length > 0 ? '100%' : '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weekly Trends */}
                <div className="mt-4 pt-4 border-t border-[#2A363D]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-white uppercase tracking-wider">DAILY TRENDS</span>
                    <span className="text-xs text-[#00f19f] uppercase tracking-wider">VIEW ALL</span>
                  </div>
                  <div className="bg-[#1a2126] rounded-lg p-4">
                    <div className="h-24 flex items-end justify-between">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-6 rounded-sm" 
                            style={{ 
                              height: index === 3 ? '80%' : index === 1 ? '60%' : index === 5 ? '40%' : '20%',
                              backgroundColor: index === 3 ? '#00f19f' : index === 1 ? '#4CC9F0' : index === 5 ? '#EEB868' : '#8D99AE',
                              opacity: weeklyMoodTypes.length > 0 ? 1 : 0.3
                            }}
                          ></div>
                          <span className="text-xs text-gray-400 mt-2">{day}</span>
                        </div>
                      ))}
                    </div>
                    {weeklyMoodTypes.length === 0 && (
                      <div className="mt-4 flex justify-center">
                        <span className="text-xs text-gray-400 italic">
                          Track your mood over time to see trends
                        </span>
                      </div>
                    )}
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
