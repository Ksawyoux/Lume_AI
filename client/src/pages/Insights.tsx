import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PersonalizedInsights from '@/components/PersonalizedInsights';
import BudgetManager from '@/components/BudgetManager';
import FinancialTimeline from '@/components/FinancialTimeline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Activity, Lightbulb } from 'lucide-react';

interface EmotionSpending {
  stressed: number;
  content: number;
  worried: number;
  neutral: number;
  happy: number;
}

// Define the structure of the API response
interface SpendingByEmotionData {
  emotion: string;
  amount: number;
}

export default function Analytics() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("spending");
  
  // Get spending by emotion data
  const { 
    data: spendingByEmotion, 
    isLoading 
  } = useQuery<SpendingByEmotionData[]>({
    queryKey: user ? [`/api/users/${user.id}/analytics/spending-by-emotion`] : [],
    enabled: !!user,
  });

  // Derive stats from spendingByEmotion or use defaults if not available
  const totalSpending = 225.57; // This would come from a real API for total spending
  const emotionImpact = 32; // This would be calculated based on emotional variance
  const impulsePercentage = 43; // This would be calculated from transaction data
  const savingsTarget = -12; // This would be calculated from budget vs spending

  // Process emotion spending data from API response
  const getEmotionSpendingData = (): EmotionSpending => {
    if (!spendingByEmotion || spendingByEmotion.length === 0) {
      return { stressed: 0, content: 0, worried: 0, neutral: 0, happy: 0 };
    }

    const totalAmount = spendingByEmotion.reduce((sum, item) => sum + item.amount, 0);
    
    // Create a map of emotion to percentage
    const result: Record<string, number> = {};
    spendingByEmotion.forEach(item => {
      const percentage = totalAmount > 0 ? item.amount / totalAmount : 0;
      result[item.emotion] = percentage;
    });
    
    return {
      stressed: result.stressed || 0,
      content: result.content || 0,
      worried: result.worried || 0,
      neutral: result.neutral || 0,
      happy: result.happy || 0
    };
  };

  const emotionSpendingData = getEmotionSpendingData();

  // Find top emotion (most frequent based on spending percentage)
  const getTopEmotion = (): string => {
    if (!spendingByEmotion || spendingByEmotion.length === 0) {
      return 'neutral';
    }
    
    let maxAmount = 0;
    let topEmotion = 'neutral';
    
    spendingByEmotion.forEach(item => {
      if (item.amount > maxAmount) {
        maxAmount = item.amount;
        topEmotion = item.emotion;
      }
    });
    
    return topEmotion;
  };

  const topEmotion = getTopEmotion();
  
  return (
    <div className="max-w-md mx-auto bg-[#1b1c1e] min-h-screen flex flex-col text-white">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Analytics Page */}
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
                  
                  {/* Emotion-Spending Correlation */}
                  <div className="bg-[#1c2127] rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Emotion-Spending Correlation</h3>
                      <span className="text-xs text-gray-400">30-day analysis</span>
                    </div>
                    
                    {isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : (
                      <>
                        <div className="h-40 mb-3">
                          <div className="relative h-full flex items-end justify-between px-4">
                            <div 
                              className="h-full w-16 bg-red-500" 
                              style={{ height: `${emotionSpendingData.stressed * 100}%` }}
                            ></div>
                            <div 
                              className="h-full w-16 bg-[#00f19f]" 
                              style={{ height: `${emotionSpendingData.content * 100}%` }}
                            ></div>
                            <div 
                              className="h-full w-16 bg-yellow-400" 
                              style={{ height: `${emotionSpendingData.worried * 100}%` }}
                            ></div>
                            <div 
                              className="h-full w-16 bg-blue-400" 
                              style={{ height: `${emotionSpendingData.neutral * 100}%` }}
                            ></div>
                            <div 
                              className="h-full w-16 bg-green-500" 
                              style={{ height: `${emotionSpendingData.happy * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between px-4 mt-2 text-xs text-gray-400">
                            <span>STRESSED</span>
                            <span>CONTENT</span>
                            <span>WORRIED</span>
                            <span>NEUTRAL</span>
                            <span>HAPPY</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <span>STRESSED</span>
                            </div>
                            <span>{(emotionSpendingData.stressed * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-[#00f19f] mr-2"></div>
                              <span>CONTENT</span>
                            </div>
                            <span>{(emotionSpendingData.content * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                              <span>WORRIED</span>
                            </div>
                            <span>{(emotionSpendingData.worried * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                              <span>NEUTRAL</span>
                            </div>
                            <span>{(emotionSpendingData.neutral * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span>HAPPY</span>
                            </div>
                            <span>{(emotionSpendingData.happy * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Budget Manager */}
                  <div className="mt-4">
                    <BudgetManager />
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Financial Journey</h3>
                      <span className="text-xs text-gray-400">Interactive Timeline</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Track your financial milestones and transactions over time. See how your financial journey evolves alongside your emotional state.
                    </p>
                    
                    {/* Import the Financial Timeline component */}
                    <FinancialTimeline />
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="mt-4">
                  {/* Insights tab shows the PersonalizedInsights component */}
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