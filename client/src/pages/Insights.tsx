import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PersonalizedInsights from '@/components/PersonalizedInsights';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { EmotionType, emotionConfig } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, BarChart2, BriefcaseIcon, UsersIcon, WalletIcon, Lightbulb } from 'lucide-react';

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
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-[#2A363D] rounded-lg overflow-hidden">
              <TabsTrigger value="spending" className="data-[state=active]:bg-[#00f19f] data-[state=active]:text-[#1a2126] py-2 rounded-none">
                Spending
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-[#00f19f] data-[state=active]:text-[#1a2126] py-2 rounded-none">
                Trends
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#00f19f] data-[state=active]:text-[#1a2126] py-2 rounded-none">
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spending">
              {/* Health Report Style Section */}
              <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Spending Report</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Grid of WHOOP-style charts */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Monthly Spending</p>
                    <div className="mt-2">
                      <div className="relative">
                        {/* Bar chart visualization */}
                        <div className="h-10 flex items-end justify-between gap-1">
                          {[...Array(8)].map((_, index) => {
                            const height = 15 + Math.random() * 25;
                            return (
                              <div 
                                key={index} 
                                className="bg-white bg-opacity-30 rounded-sm" 
                                style={{ 
                                  height: `${height}px`,
                                  width: '10px',
                                }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-lg font-bold">{formatAmount(totalSpending).replace('.00', '')}</span>
                        </div>
                        <span className="text-xs text-gray-400">Total</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotion impact chart */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Emotion Impact</p>
                    <div className="mt-2">
                      <div className="relative">
                        {/* Line chart visualization */}
                        <div className="h-10 relative">
                          <svg className="absolute inset-0" viewBox="0 0 100 30">
                            <path 
                              d="M0,15 C10,5 20,25 30,15 C40,5 50,20 60,10 C70,0 80,15 90,20 C95,25 100,15 100,15" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="1.5" 
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold">32%</span>
                        </div>
                        <span className="text-xs text-gray-400">Variance</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Smaller grid for secondary metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Emotional frequency */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Top Emotion</p>
                    <div className="mt-auto">
                      <div>
                        <span className="text-lg font-bold">{spendingByEmotion?.[0]?.emotion || "N/A"}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Most frequent</span>
                    </div>
                  </div>
                  
                  {/* Impulse buys */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Impulse</p>
                    <div className="mt-auto">
                      <div>
                        <span className="text-lg font-bold">43%</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Of purchases</span>
                    </div>
                  </div>
                  
                  {/* Savings status */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Savings</p>
                    <div className="mt-auto">
                      <div>
                        <span className="text-lg font-bold text-[#FF0026]">-12%</span>
                      </div>
                      <span className="text-[10px] text-gray-400">vs Target</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end items-center">
                  <span className="text-[10px] text-gray-400 mr-1">POWERED BY</span>
                  <span className="font-bold tracking-wider text-xs">LUME</span>
                </div>
              </div>
              
              {/* Emotion-Spending Bar Chart */}
              <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-sm font-medium">Emotion-Spending Correlation</h4>
                  <span className="text-xs text-gray-400">30-day analysis</span>
                </div>
                
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00f19f]"></div>
                  </div>
                ) : (
                  <div className="bg-[#2A363D] rounded-lg p-4">
                    {/* Bar chart showing spending by emotion */}
                    <div className="h-56 mb-3">
                      <div className="flex items-end h-48 justify-between relative">
                        {/* Bars */}
                        {spendingByEmotion?.map((item, index) => {
                          // Calculate height based on amount (normalized to 100)
                          const maxHeight = 180; // Max visual height in pixels
                          const height = maxSpending > 0 ? (item.amount / maxSpending) * maxHeight : 0;
                          
                          // WHOOP theme colors based on emotion
                          const getEmotionColor = (emotion: EmotionType) => {
                            switch(emotion) {
                              case "stressed": return "#FF0026"; // red
                              case "worried": return "#FFDE00"; // yellow
                              case "neutral": return "#67AEE6"; // blue
                              case "content": return "#00F19F"; // teal 
                              case "happy": return "#16EC06"; // green
                              default: return "#67AEE6";
                            }
                          };
                          
                          return (
                            <div key={item.emotion} className="flex flex-col items-center mx-2 flex-1">
                              <div 
                                className="w-full rounded-t relative group"
                                style={{ 
                                  height: `${height}px`,
                                  backgroundColor: getEmotionColor(item.emotion),
                                  transition: 'height 0.5s ease-in-out'
                                }}
                              >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#1a2126] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                                  {formatAmount(item.amount)}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-400 font-medium uppercase">
                                {item.emotion}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Legend with percentages */}
                    <div className="mt-3 space-y-2">
                      {spendingByEmotion?.sort((a, b) => b.amount - a.amount).map((item, index) => {
                        // Calculate percentage of total
                        const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
                        // WHOOP theme colors based on emotion
                        const getEmotionColor = (emotion: EmotionType) => {
                          switch(emotion) {
                            case "stressed": return "#FF0026"; // red
                            case "worried": return "#FFDE00"; // yellow
                            case "neutral": return "#67AEE6"; // blue
                            case "content": return "#00F19F"; // teal 
                            case "happy": return "#16EC06"; // green
                            default: return "#67AEE6";
                          }
                        };
                        
                        return (
                          <div key={item.emotion} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: getEmotionColor(item.emotion) }}
                              ></div>
                              <span className="text-xs uppercase">
                                {item.emotion}
                              </span>
                            </div>
                            <span className="text-xs font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Meditation recommendation card like in the WHOOP image */}
              <div className="bg-[#1F2932] rounded-xl overflow-hidden mb-6 shadow-lg">
                <div className="relative h-40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a2126] z-10"></div>
                  <div className="absolute top-4 left-4 bg-[#1a2126] text-white px-2 py-1 rounded-md text-xs z-20">
                    New
                  </div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="text-lg font-bold text-white">Get back in the Green</h3>
                    <p className="text-white text-sm">Mindful spending meditation</p>
                  </div>
                </div>
                
                <div className="p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#2A363D] flex items-center justify-center mr-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-white">
                      <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Recovery based Meditation</p>
                    <p className="text-xs text-gray-400">Meditation series</p>
                  </div>
                </div>
              </div>
              
              {/* Personalized Insights Card */}
              <div className="bg-[#1F2932] rounded-xl p-5 shadow-lg mb-6">
                <h3 className="text-base font-medium mb-4">Personalized Insights</h3>
                
                <div className="bg-[#2A363D] rounded-lg p-4 mb-3">
                  <h4 className="font-medium text-sm mb-1">High Stress Correlation</h4>
                  <p className="text-xs text-gray-400">
                    During <strong>stressed</strong> periods, your spending increases by <strong>35%</strong> with most transactions in <strong>food delivery</strong> and <strong>impulse purchases</strong>.
                  </p>
                </div>
                
                <div className="bg-[#2A363D] rounded-lg p-4 mb-3">
                  <h4 className="font-medium text-sm mb-1">Financial Opportunity</h4>
                  <p className="text-xs text-gray-400">
                    <strong>Happy</strong> emotional states correlate with <strong>18% more savings</strong> and <strong>fewer impulse purchases</strong>. Consider scheduling purchases during these times.
                  </p>
                </div>
                
                <div className="bg-[#2A363D] rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                  <p className="text-xs text-gray-400">
                    Try the <strong>5-minute mindfulness</strong> exercise before online shopping to reduce stress-triggered spending by up to <strong>25%</strong>.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              {/* Health Report Style Section for Emotional Metrics */}
              <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Emotion Report</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Grid of WHOOP-style charts */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Weekly Emotions</p>
                    <div className="mt-2">
                      <div className="relative">
                        {/* Bar chart visualization for emotions */}
                        <div className="h-10 flex items-end justify-between gap-1">
                          {[...Array(7)].map((_, i) => {
                            // Simulate a more complex pattern like in the WHOOP image
                            const heights = [64, 61, 32, 52, 62, 88, 65];
                            const emotions: EmotionType[] = [
                              "content", "content", "stressed", "worried", 
                              "content", "happy", "content"
                            ];
                            
                            // WHOOP theme colors based on emotion
                            const getEmotionColor = (emotion: EmotionType) => {
                              switch(emotion) {
                                case "stressed": return "#FF0026"; // red
                                case "worried": return "#FFDE00"; // yellow
                                case "neutral": return "#67AEE6"; // blue
                                case "content": return "#00F19F"; // teal 
                                case "happy": return "#16EC06"; // green
                                default: return "#67AEE6";
                              }
                            };
                            
                            return (
                              <div 
                                key={i} 
                                className="w-4 rounded-sm" 
                                style={{ 
                                  height: `${heights[i] / 3}px`,
                                  backgroundColor: getEmotionColor(emotions[i]),
                                }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-lg font-bold">74%</span>
                        </div>
                        <span className="text-xs text-gray-400">Positive</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotion metric graph */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Emotional Strain</p>
                    <div className="mt-2">
                      <div className="relative">
                        {/* Line chart visualization */}
                        <div className="h-10 relative">
                          <svg className="absolute inset-0" viewBox="0 0 100 30">
                            <path 
                              d="M0,20 C10,25 20,10 30,15 C40,20 50,10 60,15 C70,20 80,5 90,15 C95,20 100,15 100,15" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="1.5" 
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold">45%</span>
                        </div>
                        <span className="text-xs text-gray-400">Average</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Smaller grid for secondary metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Emotion recovery */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Recovery</p>
                    <div className="mt-auto">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-[#16EC06]">87%</span>
                      </div>
                      <span className="text-[10px] text-gray-400">High</span>
                    </div>
                  </div>
                  
                  {/* Top emotion */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Top Mood</p>
                    <div className="mt-auto">
                      <div>
                        <span className="text-lg font-bold text-[#00F19F]">Content</span>
                      </div>
                      <span className="text-[10px] text-gray-400">4 days</span>
                    </div>
                  </div>
                  
                  {/* Stress days */}
                  <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Stress</p>
                    <div className="mt-auto">
                      <div>
                        <span className="text-lg font-bold">1</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Day this week</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end items-center">
                  <span className="text-[10px] text-gray-400 mr-1">POWERED BY</span>
                  <span className="font-bold tracking-wider text-xs">LUME</span>
                </div>
              </div>
              
              {/* Emotional Correlation Card */}
              <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
                <h3 className="text-base font-medium mb-4">Emotional Balance</h3>
                
                <div className="bg-[#2A363D] rounded-lg p-4 mb-3 flex items-center">
                  <div className="w-14 h-14 rounded-full bg-[#1F2932] mr-3 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#16EC06"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - 0.87)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      87%
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">High Recovery</h4>
                    <p className="text-xs text-gray-400">
                      Your emotional regulation is optimal. Your body is ready for high performance activities.
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#2A363D] rounded-lg p-4 mb-3 flex items-center">
                  <div className="w-14 h-14 rounded-full bg-[#1F2932] mr-3 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#67AEE6"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - 0.45)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      45%
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Moderate Strain</h4>
                    <p className="text-xs text-gray-400">
                      Your emotional load is manageable. Balance productivity with adequate rest periods.
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-3">
                  You've maintained a positive emotional balance this week. Your recovery score indicates good resilience to stress factors.
                </p>
              </div>
            </TabsContent>

            {/* Insights Tab Content */}
            <TabsContent value="insights">
              <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center">
                    <Lightbulb size={18} className="text-[#00f19f] mr-2" />
                    <h4 className="text-sm font-medium">Personalized Insights</h4>
                  </div>
                  <span className="text-xs text-gray-400">Based on your data</span>
                </div>
                
                {/* Use the PersonalizedInsights component */}
                <div className="-mx-5 -mb-5">
                  <PersonalizedInsights />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
