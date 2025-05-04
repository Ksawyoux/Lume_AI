import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import EmotionTracker from '@/components/EmotionTracker';
import RecentTransactions from '@/components/RecentTransactions';
import PersonalizedInsights from '@/components/PersonalizedInsights';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  
  // Weekly summary data
  const { data: emotionData, isLoading: isEmotionLoading } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/analytics/spending-by-emotion`] : [],
    enabled: !!user,
  });
  
  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen flex flex-col">
      <Header />
      
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
              <h2 className="text-xl font-semibold text-neutral-800">Hi, {user?.name}</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Track your finances and emotions to build better habits
              </p>
            </>
          )}
        </section>
        
        {/* Emotion Tracker */}
        <EmotionTracker />
        
        {/* Mood and Finance Summary */}
        <section className="px-4 py-2">
          <Card className="bg-neutral-50 border border-neutral-200">
            <CardContent className="p-4">
              <h3 className="text-base font-medium text-neutral-700 mb-3">Your Week at a Glance</h3>
              
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
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-neutral-700">Mood Balance</span>
                        <span className="text-sm font-medium text-green-600">+12%</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-neutral-700">Financial Health</span>
                        <span className="text-sm font-medium text-green-600">Good</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
        
        {/* Recent Transactions */}
        <RecentTransactions />
        
        {/* Personalized Insights */}
        <PersonalizedInsights />
      </main>

      <BottomNavigation />
    </div>
  );
}
