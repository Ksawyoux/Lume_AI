
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PersonalizedInsights from '@/components/PersonalizedInsights';
import BudgetManager from '@/components/BudgetManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';

// Define the API response type
interface AnalyticsData {
  totalSpending: number;
  emotionImpact: number;
  impulsePercentage: number;
  savingsTarget: number;
  emotionSpending: Record<string, number>;
}

export default function Analytics() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("spending");
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Get analytics data
  const { 
    data, 
    isLoading 
  } = useQuery<AnalyticsData>({
    queryKey: [`/api/users/${user?.id}/analytics/spending-by-emotion`],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/users/${user.id}/analytics/spending-by-emotion`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const [activeTab, setActiveTab] = useState("spending");
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const handleBudgetError = (error: string) => {
    setBudgetError(error);
  };

  // Handle loading state for user
  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-[#1b1c1e] min-h-screen flex flex-col text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading user data...</p>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Use defaults if data is not available
  const totalSpending = data?.totalSpending || 225.57;
  const emotionImpact = data?.emotionImpact || 32;
  const impulsePercentage = data?.impulsePercentage || 43;
  const savingsTarget = data?.savingsTarget || -12;

  // Default to 'neutral' if no top emotion data available
  const topEmotion = !data?.emotionSpending ? 'neutral' : 
    Object.entries(data.emotionSpending)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion)[0] || 'neutral';

  const handleBudgetError = (error: string) => {
    setBudgetError(error);
  };

  return (
    <div className="max-w-md mx-auto bg-[#1b1c1e] min-h-screen flex flex-col text-white">
      <Header />

      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-gray-400 mt-1">Financial behavior insights</p>

            <div className="mt-4">
              <Tabs defaultValue="spending" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 bg-[#252a2e] rounded-lg p-1 h-auto">
                  <TabsTrigger 
                    value="spending" 
                    className={`rounded-md py-3 ${activeTab === 'spending' ? 'bg-[#00f19f] text-black' : 'bg-transparent text-gray-400'}`}
                  >
                    Spending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trends" 
                    className={`rounded-md py-3 ${activeTab === 'trends' ? 'bg-[#00f19f] text-black' : 'bg-transparent text-gray-400'}`}
                  >
                    Trends
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className={`rounded-md py-3 ${activeTab === 'insights' ? 'bg-[#00f19f] text-black' : 'bg-transparent text-gray-400'}`}
                  >
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="spending" className="mt-4">
                  <div className="bg-[#1c2127] rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-4">Spending Report</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Monthly Spending */}
                      <div className="bg-[#252a2e] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-2">MONTHLY SPENDING</p>
                        <div className="h-6 flex items-end space-x-1 mb-2">
                          {[3, 5, 2, 3, 2, 6, 3, 4].map((height, index) => (
                            <div 
                              key={index} 
                              className="w-5 bg-gray-500 rounded-sm"
                              style={{ height: `${height * 4}px` }}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">${totalSpending.toFixed(2)}</span>
                          <span className="text-xs text-gray-400">Total</span>
                        </div>
                      </div>

                      {/* Emotion Impact */}
                      <div className="bg-[#252a2e] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-2">EMOTION IMPACT</p>
                        <div className="relative h-6 mb-2">
                          <svg viewBox="0 0 100 20" className="w-full h-6">
                            <path
                              d="M0,10 Q25,5 50,10 T100,10"
                              fill="none"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">{emotionImpact}%</span>
                          <span className="text-xs text-gray-400">Variance</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Top Emotion */}
                      <div className="bg-[#252a2e] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">TOP EMOTION</p>
                        <p className="text-lg font-bold">
                          {topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1)}
                        </p>
                        <p className="text-xs text-gray-400">Most frequent</p>
                      </div>

                      {/* Impulse */}
                      <div className="bg-[#252a2e] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">IMPULSE</p>
                        <p className="text-lg font-bold">{impulsePercentage}%</p>
                        <p className="text-xs text-gray-400">Of purchases</p>
                      </div>

                      {/* Savings */}
                      <div className="bg-[#252a2e] rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">SAVINGS</p>
                        <p className="text-lg font-bold text-red-500">{savingsTarget}%</p>
                        <p className="text-xs text-gray-400">vs Target</p>
                      </div>
                    </div>

                    <div className="text-right mt-3">
                      <p className="text-xs text-gray-400">POWERED BY LUME</p>
                    </div>
                  </div>

                  {/* Budget Manager with error handling */}
                  <div className="mt-4">
                    {budgetError ? (
                      <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-md text-sm">
                        {budgetError}
                      </div>
                    ) : (
                      <BudgetManager onError={handleBudgetError} />
                    )}
                  </div>

                  {/* Mindful spending recommendation */}
                  <div className="bg-[#1c2127] rounded-lg p-4 mt-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm mb-1">New</div>
                      <h3 className="text-xl font-bold">Get back in the Green</h3>
                      <p className="text-gray-400">Mindful spending meditation</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-gray-700 h-10 w-10 flex items-center justify-center p-0">
                      <Activity size={18} />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="mt-4">
                  <div className="bg-[#1c2127] rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-4">Spending Trends</h3>
                    <p className="text-gray-400">Trend analysis coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="mt-4">
                  <PersonalizedInsights />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
