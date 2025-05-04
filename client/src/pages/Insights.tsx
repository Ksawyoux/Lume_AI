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
  
  // Generate points for line graphs (simulated data for visual demonstration)
  const generateLinePoints = (width: number, height: number, points: number) => {
    const result = [];
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * width;
      // Create a wave pattern
      const y = height/2 + Math.sin(i * 0.5) * (height/3) + (Math.random() * height/4);
      result.push([x, y]);
    }
    return result.map(([x, y]) => `${x},${y}`).join(' ');
  };
  
  // Generate bar chart points
  const generateBarPoints = (width: number, height: number, points: number) => {
    const result = [];
    const barWidth = width / points;
    for (let i = 0; i < points; i++) {
      const barHeight = Math.random() * height * 0.8 + height * 0.2; // Random height 20-100%
      result.push({
        x: i * barWidth,
        width: barWidth * 0.7, // Slightly narrower than the spacing
        height: barHeight
      });
    }
    return result;
  };
  
  return (
    <div className="max-w-md mx-auto bg-[#1a2126] text-white min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Analytics</h2>
              <p className="text-sm text-gray-400 mt-1">
                Financial behavior insights
              </p>
            </div>
            <div className="rounded-full bg-[#2A363D] p-1.5">
              <BarChart3 size={20} className="text-[#00f19f]" />
            </div>
          </div>
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
                  <h4 className="text-sm font-medium text-foreground">Emotion-Spending Correlation</h4>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {/* Bar chart showing spending by emotion */}
                    <div className="h-64 mb-5 pt-5">
                      <div className="flex items-end h-52 justify-between border-b border-l border-border relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between pr-2 -ml-7 text-xs text-muted-foreground">
                          <span>$100</span>
                          <span>$75</span>
                          <span>$50</span>
                          <span>$25</span>
                          <span>$0</span>
                        </div>
                        
                        {/* Bars */}
                        {spendingByEmotion?.map((item, index) => {
                          // Calculate height based on amount (normalized to 100)
                          const maxHeight = 200; // Max visual height in pixels
                          const height = maxSpending > 0 ? (item.amount / maxSpending) * maxHeight : 0;
                          
                          return (
                            <div key={item.emotion} className="flex flex-col items-center mx-2 flex-1">
                              <div 
                                className="w-full rounded-t-sm relative group"
                                style={{ 
                                  height: `${height}px`,
                                  backgroundColor: emotionConfig[item.emotion].color,
                                  transition: 'height 0.5s ease-in-out'
                                }}
                              >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                                  {formatAmount(item.amount)}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground font-medium">
                                {emotionConfig[item.emotion].label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Correlation data */}
                    <div className="rounded-md border border-border p-3 bg-card">
                      <h5 className="text-sm font-medium mb-2">Correlation Analysis</h5>
                      <div className="space-y-3">
                        {spendingByEmotion?.sort((a, b) => b.amount - a.amount).map((item, index) => {
                          // Calculate percentage of total
                          const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
                          // Determine impact level (high for top spender, medium for second, low for others)
                          const impactLevel = index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low';
                          // Color based on impact
                          const impactColor = index === 0 ? 'text-red-500' : index === 1 ? 'text-amber-500' : 'text-green-500';
                          
                          return (
                            <div key={item.emotion} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: emotionConfig[item.emotion].color }}
                                ></div>
                                <span className="text-xs text-foreground">
                                  {emotionConfig[item.emotion].label}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium mr-2">
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className={`text-xs font-medium ${impactColor}`}>
                                  {impactLevel}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="whoop-container mt-4 rounded-md border border-border p-4 bg-card/50">
                <h4 className="text-sm font-medium text-foreground mb-3">Emotional Spending Patterns</h4>
                
                <div className="space-y-4">
                  <div className="rounded-md p-3 bg-red-500/10 border border-red-500/20">
                    <h6 className="text-sm font-medium mb-1 text-red-500">High Correlation</h6>
                    <p className="text-xs text-muted-foreground">
                      During <strong>stressed</strong> periods, your spending increases by <strong>35%</strong> with most transactions in <strong>food delivery</strong> and <strong>impulse purchases</strong>.
                    </p>
                  </div>
                  
                  <div className="rounded-md p-3 bg-yellow-500/10 border border-yellow-500/20">
                    <h6 className="text-sm font-medium mb-1 text-yellow-500">Medium Correlation</h6>
                    <p className="text-xs text-muted-foreground">
                      <strong>Neutral</strong> emotional states show <strong>15%</strong> higher spending compared to positive states, primarily in <strong>routine shopping</strong>.
                    </p>
                  </div>
                  
                  <div className="rounded-md p-3 bg-green-500/10 border border-green-500/20">
                    <h6 className="text-sm font-medium mb-1 text-green-500">Financial Optimization</h6>
                    <p className="text-xs text-muted-foreground">
                      <strong>Happy</strong> and <strong>content</strong> emotional states correlate with more <strong>deliberate purchases</strong> and <strong>less regretted spending</strong>.
                    </p>
                  </div>
                </div>
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
