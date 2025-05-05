import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, Moon, Activity, Timer, BarChart2, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getQueryFn } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

// Types for health data
interface HealthData {
  id: number;
  userId: number;
  type: string;
  value: number;
  unit: string;
  source: string;
  timestamp: string;
  metadata?: string;
}

interface HealthStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

// Utility function to get color based on recovery score
const getRecoveryColor = (value: number) => {
  if (value >= 67) return 'text-green-500 bg-green-100 dark:bg-green-950/30';
  if (value >= 34) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-950/30';
  return 'text-red-500 bg-red-100 dark:bg-red-950/30';
};

// Utility function to get color based on sleep quality
const getSleepColor = (value: number) => {
  if (value >= 7) return 'text-green-500 bg-green-100 dark:bg-green-950/30';
  if (value >= 5) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-950/30';
  return 'text-red-500 bg-red-100 dark:bg-red-950/30';
};

// Format the value based on metric type
const formatValue = (value: number, unit: string, type: string) => {
  if (type === 'heartRate') return `${Math.round(value)} ${unit}`;
  if (type === 'sleepQuality') return `${value.toFixed(1)} ${unit}`;
  if (type === 'recovery') return `${Math.round(value)}%`;
  if (type === 'steps') return value.toLocaleString();
  return `${value} ${unit}`;
};

// Health data cards with circular progress
function CircularProgressCard({ title, value, icon, color, max = 100, subtitle }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  max?: number;
  subtitle?: string;
}) {
  const percentage = (value / max) * 100;
  
  return (
    <Card className="flex-1 min-w-[160px]">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className={`p-1.5 rounded-full ${color}`}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative flex items-center justify-center w-24 h-24 mb-2">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              className="text-muted stroke-current" 
              strokeWidth="8"
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent"
            />
            <circle 
              className={`stroke-current ${color.split(' ')[0]}`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51}, 251.2`}
              strokeDashoffset="0"
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent"
              transform="rotate(-90 50 50)"
            />
            <text 
              x="50" 
              y="50" 
              dominantBaseline="middle" 
              textAnchor="middle"
              className="text-lg font-bold fill-foreground"
            >
              {Math.round(value)}
            </text>
            {subtitle && (
              <text 
                x="50" 
                y="65" 
                dominantBaseline="middle" 
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {subtitle}
              </text>
            )}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Health() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('daily');
  
  // Fetch heart rate data
  const { data: heartRateData } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/heartRate/latest`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch sleep quality data
  const { data: sleepData } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/sleepQuality/latest`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch recovery data
  const { data: recoveryData } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/recovery/latest`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch steps data
  const { data: stepsData } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/steps/latest`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch heart rate stats
  const { data: heartRateStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/heartRate/stats`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch sleep stats
  const { data: sleepStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/sleepQuality/stats`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch recovery stats
  const { data: recoveryStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/recovery/stats`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Fetch steps stats
  const { data: stepsStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/health/steps/stats`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  const heartRate = heartRateData as HealthData;
  const sleep = sleepData as HealthData;
  const recovery = recoveryData as HealthData;
  const steps = stepsData as HealthData;
  
  const hrStats = heartRateStats as HealthStats;
  const sleepStatsData = sleepStats as HealthStats;
  const recoveryStatsData = recoveryStats as HealthStats;
  const stepsStatsData = stepsStats as HealthStats;
  
  // Parse JSON metadata
  const parseMetadata = (data: HealthData) => {
    if (!data?.metadata) return {};
    try {
      return JSON.parse(data.metadata);
    } catch (e) {
      return {};
    }
  };
  
  const sleepMetadata = sleep ? parseMetadata(sleep) : {};
  
  return (
    <div className="min-h-screen flex flex-col bg-[#1a2126] text-white">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Health Report</h2>
            <p className="text-sm text-gray-400 mt-1">
              Based on your Apple Watch data
            </p>
          </div>
          <div className="rounded-full bg-[#2A363D] p-1.5">
            <Activity size={20} className="text-[#00f19f]" />
          </div>
        </div>
        
        {/* WHOOP-style card with grid layout */}
        <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Recovery chart */}
            <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recovery</p>
              <div className="mt-2">
                <div className="relative">
                  {/* Simplified chart */}
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
                    <span className="text-lg font-bold">{recovery?.value || 0}%</span>
                  </div>
                  <span className="text-xs text-gray-400">Today</span>
                </div>
              </div>
            </div>
            
            {/* Heart rate chart */}
            <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[120px]">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Heart Rate</p>
              <div className="mt-2">
                <div className="relative">
                  {/* Simplified chart - bar chart */}
                  <div className="h-10 flex items-end justify-between gap-1">
                    {[65, 78, 72, 68, 79, 75, 70, 80].map((value, index) => (
                      <div 
                        key={index} 
                        className="w-full bg-white bg-opacity-30 rounded-sm" 
                        style={{ height: `${(value / 100) * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-lg font-bold">{heartRate?.value || 0}</span>
                    <span className="text-xs ml-1">bpm</span>
                  </div>
                  <span className="text-xs text-gray-400">Resting</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Sleep chart */}
            <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Sleep</p>
              <div className="mt-auto">
                <div>
                  <span className="text-lg font-bold">{sleep?.value?.toFixed(1) || 0}</span>
                  <span className="text-xs ml-1">hrs</span>
                </div>
                <span className="text-[10px] text-gray-400">Last night</span>
              </div>
            </div>
            
            {/* Strain chart */}
            <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Strain</p>
              <div className="mt-auto">
                <div>
                  <span className="text-lg font-bold">14.2</span>
                </div>
                <span className="text-[10px] text-gray-400">Daily</span>
              </div>
            </div>
            
            {/* Steps chart */}
            <div className="bg-[#2A363D] rounded-lg p-3 flex flex-col justify-between h-[100px]">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Steps</p>
              <div className="mt-auto">
                <div>
                  <span className="text-lg font-bold">{(steps?.value || 0).toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-gray-400">Today</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end items-center">
            <span className="text-[10px] text-gray-400 mr-1">DATA BY</span>
            <span className="font-bold tracking-wider text-xs">WHOOP</span>
          </div>
        </div>
        
        {/* Recommended workout card */}
        <div className="bg-[#1F2932] rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#2A363D] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-l-yellow-400 border-r-yellow-400 border-t-transparent border-b-transparent flex items-center justify-center">
                <Zap size={18} className="text-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Recommended Workout</h3>
              <p className="text-sm text-gray-400">based on your Recovery Score</p>
            </div>
          </div>
          
          <div className="bg-[#2A363D] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium mb-1">Moderate Cardio</h4>
                <p className="text-xs text-gray-400">{recovery?.value || 0}% Recovery · Moderate intensity</p>
              </div>
              <Button variant="ghost" size="sm" className="bg-[#1F2932] hover:bg-[#2A363D]">
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Recovery recommendations */}
        <div className="bg-[#1F2932] rounded-xl p-5 shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#2A363D] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#00f19f] flex items-center justify-center">
                <TrendingUp size={18} className="text-[#00f19f]" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Get back in the Green</h3>
              <p className="text-sm text-gray-400">Recovery recommendations</p>
            </div>
          </div>
          
          <div className="bg-[#2A363D] rounded-lg p-4">
            <p className="text-sm mb-3">
              Based on your metrics, consider the following to improve recovery:
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00f19f]/20 text-[#00f19f] mr-2 mt-0.5">
                  <span className="text-xs">1</span>
                </div>
                <span className="text-sm">Get 7+ hours of sleep tonight</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00f19f]/20 text-[#00f19f] mr-2 mt-0.5">
                  <span className="text-xs">2</span>
                </div>
                <span className="text-sm">Limit screen time 1 hour before bed</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00f19f]/20 text-[#00f19f] mr-2 mt-0.5">
                  <span className="text-xs">3</span>
                </div>
                <span className="text-sm">Maintain consistent sleep schedule</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
