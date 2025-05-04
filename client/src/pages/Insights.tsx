import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
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
  
  // Calculate total spending
  const totalSpending = spendingByEmotion
    ? spendingByEmotion.reduce((sum, item) => sum + item.amount, 0)
    : 0;
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Understand how emotions impact your financial behavior
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Tabs defaultValue="spending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-card border border-border">
              <TabsTrigger value="spending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Spending Analysis
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Emotion Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spending">
              <div className="whoop-container">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-sm font-medium text-foreground">Emotion Impact</h4>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {/* WHOOP-inspired spending by emotion chart */}
                    <div className="relative w-48 h-48 mb-5">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Create pie chart segments */}
                        {spendingByEmotion?.map((item, index) => {
                          // Calculate the percentage this emotion represents of total spending
                          const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
                          
                          // For pie chart: calculate stroke-dasharray and stroke-dashoffset
                          const circumference = 2 * Math.PI * 40; // 2πr where r=40
                          
                          // Running sum of previous percentages to know where to start this segment
                          const previousPercentagesSum = spendingByEmotion
                            .slice(0, index)
                            .reduce((sum, item) => sum + (item.amount / totalSpending) * 100, 0);
                            
                          // Calculate the dashoffset
                          const dashoffset = circumference - (previousPercentagesSum / 100) * circumference;
                          
                          // Calculate the dash array (how much of the circle to fill)
                          const dasharray = `${(percentage / 100) * circumference} ${circumference}`;
                          
                          return (
                            <circle
                              key={item.emotion}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={emotionConfig[item.emotion].color}
                              strokeWidth="12"
                              strokeDasharray={dasharray}
                              strokeDashoffset={dashoffset}
                              strokeLinecap="butt"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-semibold text-foreground">
                          {formatAmount(totalSpending)}
                        </span>
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                      {spendingByEmotion?.map((item) => (
                        <div key={item.emotion} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: emotionConfig[item.emotion].color }}
                          ></div>
                          <div className="flex-1 flex justify-between">
                            <span className="text-xs text-foreground">
                              {emotionConfig[item.emotion].label}
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {formatAmount(item.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="whoop-container mt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Key Observations</h4>
                
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-finance-negative mr-2 mt-0.5 bg-[hsl(var(--finance-negative)/0.1)]">
                      <i className="fas fa-exclamation-circle text-xs"></i>
                    </div>
                    <span>You spend 35% more when stressed or worried.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-finance-neutral mr-2 mt-0.5 bg-[hsl(var(--finance-neutral)/0.1)]">
                      <i className="fas fa-info-circle text-xs"></i>
                    </div>
                    <span>Happy and content states lead to healthier financial decisions.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-finance-positive mr-2 mt-0.5 bg-[hsl(var(--finance-positive)/0.1)]">
                      <i className="fas fa-lightbulb text-xs"></i>
                    </div>
                    <span>Consider setting spending limits when in stressed states.</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              <div className="whoop-container">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-foreground">Emotional State</h4>
                  <span className="text-xs text-muted-foreground">Last 7 days</span>
                </div>
                
                {/* Trend graph - WHOOP-inspired visualization */}
                <div className="h-48 flex items-end justify-between border-b border-border pb-2 mb-4">
                  {[...Array(9)].map((_, i) => {
                    // Simulate a more complex pattern like in the WHOOP image
                    const heights = [64, 61, 32, 52, 62, 88, 65, 44, 56];
                    const emotions: EmotionType[] = [
                      "content", "content", "stressed", "worried", 
                      "content", "happy", "content", "worried", "neutral"
                    ];
                    
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className="w-5 rounded-sm" 
                          style={{ 
                            height: `${heights[i]}%`,
                            backgroundColor: emotionConfig[emotions[i]].color
                          }}
                        ></div>
                        <span className="text-xs text-muted-foreground mt-1">{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend - made more compact */}
                <div className="flex flex-wrap">
                  {(["stressed", "worried", "neutral", "content", "happy"] as EmotionType[]).map((emotion) => (
                    <div key={emotion} className="flex items-center mr-4 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: emotionConfig[emotion].color }}
                      ></div>
                      <span className="text-xs text-muted-foreground">{emotionConfig[emotion].label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="whoop-container mt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Emotional Metrics</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* WHOOP-inspired circular progress indicator for Emotional Recovery */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-2">
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
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="hsl(var(--finance-positive))"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - 0.87)} // 87% progress
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-semibold text-finance-positive">87%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Recovery</span>
                    </div>
                  </div>

                  {/* WHOOP-inspired circular progress indicator for Emotional Strain */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-2">
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
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="hsl(var(--finance-neutral))"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - 0.45)} // 45% progress
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-semibold text-finance-neutral">45%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Strain</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  You've maintained a positive emotional balance this week. Your recovery score indicates good resilience to stress factors.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
