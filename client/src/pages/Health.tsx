import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heart, Moon, Activity, Timer, BarChart2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Health Metrics</h1>
        <p className="text-muted-foreground mb-6 text-sm">Data synced from your Apple Watch</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4">
            {/* Today's summary */}
            <div className="grid grid-cols-2 gap-4">
              <CircularProgressCard 
                title="Recovery" 
                value={recovery?.value || 0}
                icon={<Activity size={18} />}
                color={getRecoveryColor(recovery?.value || 0)}
                subtitle="%"
              />
              
              <CircularProgressCard 
                title="Sleep" 
                value={sleep?.value || 0}
                icon={<Moon size={18} />}
                color={getSleepColor(sleep?.value || 0)}
                max={9}
                subtitle="hours"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CircularProgressCard 
                title="Heart Rate" 
                value={heartRate?.value || 0}
                icon={<Heart size={18} />}
                color="text-red-500 bg-red-100 dark:bg-red-950/30"
                max={120}
                subtitle="bpm"
              />
              
              <CircularProgressCard 
                title="Steps" 
                value={steps?.value || 0}
                icon={<Timer size={18} />}
                color="text-blue-500 bg-blue-100 dark:bg-blue-950/30"
                max={10000}
                subtitle="daily"
              />
            </div>
            
            {/* Sleep Details */}
            {sleep && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sleep Analysis</CardTitle>
                  <CardDescription>
                    {new Date(sleep.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Deep Sleep</span>
                      <span className="text-sm font-medium">{sleepMetadata.deepSleep || '0'} hrs</span>
                    </div>
                    <Progress value={parseFloat(sleepMetadata.deepSleep || '0') / sleep.value * 100} className="h-2" />
                    
                    <div className="flex justify-between mt-3">
                      <span className="text-sm">REM Sleep</span>
                      <span className="text-sm font-medium">{sleepMetadata.remSleep || '0'} hrs</span>
                    </div>
                    <Progress value={parseFloat(sleepMetadata.remSleep || '0') / sleep.value * 100} className="h-2" />
                    
                    <div className="flex justify-between mt-3">
                      <span className="text-sm">Light Sleep</span>
                      <span className="text-sm font-medium">{sleepMetadata.lightSleep || '0'} hrs</span>
                    </div>
                    <Progress value={parseFloat(sleepMetadata.lightSleep || '0') / sleep.value * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Recovery Details */}
            {recovery && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Recovery Score</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecoveryColor(recovery.value)}`}>
                      {recovery.value}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your recovery score is {recovery.value >= 67 ? 'excellent' : recovery.value >= 34 ? 'moderate' : 'low'}. 
                    {recovery.value >= 67 
                      ? 'Your body is well-rested and ready for activity.'
                      : recovery.value >= 34
                      ? 'Moderate training is recommended today.'
                      : 'Consider taking it easy today to allow your body to recover.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-6">
            {/* Weekly Stats */}
            {hrStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Heart Rate</CardTitle>
                  <CardDescription>7-day overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Min</span>
                    <span>Avg</span>
                    <span>Max</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{Math.round(hrStats.min)} bpm</span>
                    <span className="text-lg font-medium">{Math.round(hrStats.avg)} bpm</span>
                    <span className="text-lg font-medium">{Math.round(hrStats.max)} bpm</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {sleepStatsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sleep</CardTitle>
                  <CardDescription>7-day overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Min</span>
                    <span>Avg</span>
                    <span>Max</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{sleepStatsData.min.toFixed(1)} hrs</span>
                    <span className="text-lg font-medium">{sleepStatsData.avg.toFixed(1)} hrs</span>
                    <span className="text-lg font-medium">{sleepStatsData.max.toFixed(1)} hrs</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {recoveryStatsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recovery</CardTitle>
                  <CardDescription>7-day overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Min</span>
                    <span>Avg</span>
                    <span>Max</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{Math.round(recoveryStatsData.min)}%</span>
                    <span className="text-lg font-medium">{Math.round(recoveryStatsData.avg)}%</span>
                    <span className="text-lg font-medium">{Math.round(recoveryStatsData.max)}%</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {stepsStatsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Steps</CardTitle>
                  <CardDescription>7-day overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Min</span>
                    <span>Avg</span>
                    <span>Max</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{Math.round(stepsStatsData.min).toLocaleString()}</span>
                    <span className="text-lg font-medium">{Math.round(stepsStatsData.avg).toLocaleString()}</span>
                    <span className="text-lg font-medium">{Math.round(stepsStatsData.max).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="my-4">
              <Button variant="outline" className="w-full">
                <BarChart2 size={16} className="mr-2" />
                View Detailed Charts
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
