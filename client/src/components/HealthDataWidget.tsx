import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { HealthData, HealthMetricType } from '../../shared/schema';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Moon, ZapIcon, Activity, WalkIcon } from 'lucide-react';

type MetricConfig = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progressGradient: string;
  unit: string;
  min: number;
  max: number;
  good: (value: number) => boolean;
  normal: (value: number) => boolean;
  valueLabel?: (value: number) => string;
};

const metricConfigs: Record<HealthMetricType, MetricConfig> = {
  heartRate: {
    title: 'Heart Rate',
    description: 'Current resting heart rate',
    icon: <Heart className="w-8 h-8 text-red-500" />,
    color: 'text-red-500',
    progressGradient: 'bg-gradient-to-r from-red-200 to-red-600',
    unit: 'bpm',
    min: 40,
    max: 100,
    good: (value) => value >= 50 && value <= 70,
    normal: (value) => value >= 40 && value <= 90,
    valueLabel: (value) => `${Math.round(value)} bpm`
  },
  sleepQuality: {
    title: 'Sleep',
    description: 'Last night sleep duration',
    icon: <Moon className="w-8 h-8 text-blue-500" />,
    color: 'text-blue-500',
    progressGradient: 'bg-gradient-to-r from-blue-200 to-blue-600',
    unit: 'hours',
    min: 0,
    max: 10,
    good: (value) => value >= 7.5,
    normal: (value) => value >= 6,
    valueLabel: (value) => {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}h ${minutes}m`;
    }
  },
  recovery: {
    title: 'Recovery',
    description: 'Today\'s recovery score',
    icon: <Activity className="w-8 h-8 text-green-500" />,
    color: 'text-green-500',
    progressGradient: 'bg-gradient-to-r from-yellow-200 via-green-300 to-green-500',
    unit: '%',
    min: 0,
    max: 100,
    good: (value) => value >= 75,
    normal: (value) => value >= 50,
    valueLabel: (value) => `${Math.round(value)}%`
  },
  strain: {
    title: 'Strain',
    description: 'Today\'s exertion level',
    icon: <ZapIcon className="w-8 h-8 text-yellow-500" />,
    color: 'text-yellow-500',
    progressGradient: 'bg-gradient-to-r from-green-200 via-yellow-300 to-red-500',
    unit: 'score',
    min: 0,
    max: 21,
    good: (value) => value >= 8 && value <= 14,
    normal: (value) => value >= 4 && value <= 18,
    valueLabel: (value) => value.toFixed(1)
  },
  readiness: {
    title: 'Readiness',
    description: 'Overall readiness score',
    icon: <Activity className="w-8 h-8 text-purple-500" />,
    color: 'text-purple-500',
    progressGradient: 'bg-gradient-to-r from-purple-200 to-purple-600',
    unit: '%',
    min: 0,
    max: 100,
    good: (value) => value >= 75,
    normal: (value) => value >= 50,
    valueLabel: (value) => `${Math.round(value)}%`
  },
  steps: {
    title: 'Steps',
    description: 'Steps taken today',
    icon: <WalkIcon className="w-8 h-8 text-blue-500" />,
    color: 'text-blue-500',
    progressGradient: 'bg-gradient-to-r from-blue-200 to-blue-600',
    unit: 'steps',
    min: 0,
    max: 15000,
    good: (value) => value >= 10000,
    normal: (value) => value >= 5000,
    valueLabel: (value) => `${Math.round(value).toLocaleString()}`
  },
  calories: {
    title: 'Calories',
    description: 'Active calories burned',
    icon: <Activity className="w-8 h-8 text-orange-500" />,
    color: 'text-orange-500',
    progressGradient: 'bg-gradient-to-r from-orange-200 to-orange-600',
    unit: 'kcal',
    min: 0,
    max: 1000,
    good: (value) => value >= 600,
    normal: (value) => value >= 300,
    valueLabel: (value) => `${Math.round(value).toLocaleString()}`
  },
  workout: {
    title: 'Workout',
    description: 'Duration of today\'s workout',
    icon: <Activity className="w-8 h-8 text-purple-500" />,
    color: 'text-purple-500',
    progressGradient: 'bg-gradient-to-r from-purple-200 to-purple-600',
    unit: 'min',
    min: 0,
    max: 120,
    good: (value) => value >= 45,
    normal: (value) => value >= 20,
    valueLabel: (value) => `${Math.round(value)} min`
  }
};

interface HealthDataWidgetProps {
  metricType: HealthMetricType;
  className?: string;
}

const getStatusColor = (metricType: HealthMetricType, value: number) => {
  const config = metricConfigs[metricType];
  if (config.good(value)) return 'bg-green-500';
  if (config.normal(value)) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function HealthDataWidget({ metricType, className = '' }: HealthDataWidgetProps) {
  const { user } = useUser();
  const userId = user?.id;

  const { data: healthData, isLoading } = useQuery<HealthData>({
    queryKey: [`/api/users/${userId}/health/${metricType}/latest`],
    enabled: !!userId,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<{ min: number; max: number; avg: number; count: number }>(
    {
      queryKey: [`/api/users/${userId}/health/${metricType}/stats`],
      enabled: !!userId,
    }
  );

  const config = metricConfigs[metricType];
  
  // Calculate progress value
  const progressValue = healthData ? 
    Math.min(100, Math.max(0, ((healthData.value - config.min) / (config.max - config.min)) * 100)) : 
    0;

  return (
    <Card className={`shadow-md overflow-hidden ${className}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
          <div className="flex justify-center items-center rounded-full w-12 h-12 bg-zinc-800">
            {config.icon}
          </div>
        </div>
        <p className="text-xs text-zinc-400">{config.description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-5 w-32 mt-3" />
          </>
        ) : healthData ? (
          <>
            <div className="flex items-end">
              <div className={`text-3xl font-bold ${config.color}`}>
                {config.valueLabel ? config.valueLabel(healthData.value) : healthData.value}
              </div>
              <div className="text-sm text-zinc-500 ml-1 mb-1">{healthData.unit}</div>
            </div>
            <div className="relative h-2 mt-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${config.progressGradient}`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <div className="mt-2 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(metricType, healthData.value)}`} />
              {statsData && !statsLoading ? (
                <div className="text-xs text-zinc-400">
                  Avg: {config.valueLabel ? config.valueLabel(statsData.avg) : statsData.avg.toFixed(1)} · 
                  Range: {config.valueLabel ? config.valueLabel(statsData.min) : statsData.min.toFixed(1)} - 
                  {config.valueLabel ? config.valueLabel(statsData.max) : statsData.max.toFixed(1)}
                </div>
              ) : (
                <Skeleton className="h-4 w-40" />
              )}
            </div>
          </>
        ) : (
          <div className="text-zinc-500 text-center py-4">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}

interface HealthDataGridProps {
  metrics: HealthMetricType[];
  className?: string;
}

export function HealthDataGrid({ metrics, className = '' }: HealthDataGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {metrics.map((metric) => (
        <HealthDataWidget key={metric} metricType={metric} />
      ))}
    </div>
  );
}
