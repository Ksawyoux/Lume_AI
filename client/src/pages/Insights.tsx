import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { EmotionType, emotionConfig } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpendingByEmotion {
  emotion: EmotionType;
  amount: number;
}

export default function Insights() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("spending");
  
  const { data: spendingByEmotion, isLoading } = useQuery<SpendingByEmotion[]>({
    queryKey: user ? [`/api/users/${user.id}/analytics/spending-by-emotion`] : [],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Find maximum spending for normalization
  const maxSpending = spendingByEmotion 
    ? Math.max(...spendingByEmotion.map(item => item.amount), 1) 
    : 0;
  
  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Your Insights</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Understand the connection between your emotions and finances
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Tabs defaultValue="spending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="spending">Spending by Emotion</TabsTrigger>
              <TabsTrigger value="trends">Emotion Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spending">
              <Card className="bg-white rounded-xl border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-neutral-800">Spending by Emotion</h4>
                    <span className="text-xs text-neutral-500">Last 30 days</span>
                  </div>
                  
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full mr-2 bg-neutral-200"></div>
                              <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                            </div>
                            <div className="h-4 w-12 bg-neutral-200 rounded"></div>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {spendingByEmotion?.map((item) => (
                        <div key={item.emotion}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: emotionConfig[item.emotion].color }}
                              ></div>
                              <span className="text-xs text-neutral-700">
                                {emotionConfig[item.emotion].label}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-neutral-800">
                              {formatAmount(item.amount)}
                            </span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                backgroundColor: emotionConfig[item.emotion].color,
                                width: `${(item.amount / maxSpending) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 py-2 text-sm font-medium text-primary border-primary-200 rounded-lg hover:bg-primary-50"
                  >
                    View Detailed Analysis
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-xl border border-neutral-200 mt-4">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-neutral-800 mb-3">Key Observations</h4>
                  
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-2 mt-0.5">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                      </div>
                      <span>You spend 35% more money when stressed or worried.</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-2 mt-0.5">
                        <i className="fas fa-info-circle text-xs"></i>
                      </div>
                      <span>Happy and content states lead to healthier financial decisions.</span>
                    </li>
                    
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-2 mt-0.5">
                        <i className="fas fa-lightbulb text-xs"></i>
                      </div>
                      <span>Consider setting spending limits when tracking stressed emotions.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends">
              <Card className="bg-white rounded-xl border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-neutral-800">Emotion Trends</h4>
                    <span className="text-xs text-neutral-500">Last 30 days</span>
                  </div>
                  
                  <div className="h-48 flex items-end justify-between border-b border-neutral-200 pb-2 mb-4">
                    {[...Array(7)].map((_, i) => {
                      const heights = [30, 60, 45, 75, 40, 90, 65];
                      const emotions: EmotionType[] = ["stressed", "worried", "neutral", "content", "content", "happy", "neutral"];
                      
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div 
                            className="w-8 rounded-t-sm" 
                            style={{ 
                              height: `${heights[i]}%`,
                              backgroundColor: emotionConfig[emotions[i]].color
                            }}
                          ></div>
                          <span className="text-xs text-neutral-500 mt-2">{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      {(["stressed", "worried", "neutral", "content", "happy"] as EmotionType[]).map((emotion) => (
                        <div key={emotion} className="flex items-center mr-3">
                          <div 
                            className="w-3 h-3 rounded-full mr-1" 
                            style={{ backgroundColor: emotionConfig[emotion].color }}
                          ></div>
                          <span className="text-xs text-neutral-600">{emotionConfig[emotion].label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-xl border border-neutral-200 mt-4">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-neutral-800 mb-3">Your Emotional Balance</h4>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <i className="fas fa-brain"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-neutral-700">Weekly Balance</span>
                        <span className="text-sm font-medium text-green-600">Good</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-600">
                    You've maintained a positive emotional balance this week. Continue with your mood-boosting
                    activities for consistent wellness.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
