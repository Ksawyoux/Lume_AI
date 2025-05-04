import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Watch, BarChart3, Heart, CircleCheck, Lock, PlusCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HealthMetricToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
}

export default function AppleWatchIntegration() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  
  // Health metrics that can be integrated from Apple Watch
  const healthMetrics: HealthMetricToggle[] = [
    {
      id: 'heartRate',
      label: 'Heart Rate',
      description: 'Monitor your heart rate throughout the day',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      defaultEnabled: true
    },
    {
      id: 'sleepQuality',
      label: 'Sleep Quality',
      description: 'Track your sleep duration and quality',
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      defaultEnabled: true
    },
    {
      id: 'recovery',
      label: 'Daily Recovery',
      description: 'Monitor your body\'s recovery from physical and mental stress',
      icon: <CircleCheck className="h-5 w-5 text-green-500" />,
      defaultEnabled: true
    },
    {
      id: 'steps',
      label: 'Steps & Activity',
      description: 'Track daily steps and overall activity level',
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      defaultEnabled: true
    }
  ];
  
  // State to track which metrics are enabled
  const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>({
    heartRate: true,
    sleepQuality: true,
    recovery: true,
    steps: true
  });
  
  // Mutation for connecting Apple Watch
  const { mutate: connectAppleWatch, isPending: isConnecting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/connect-apple-watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metrics: Object.keys(enabledMetrics).filter(key => enabledMetrics[key]) })
      });
      return response.json();
    },
    onSuccess: () => {
      setIsConnected(true);
      // Invalidate health data queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/health`] });
      toast({
        title: 'Successfully connected',
        description: 'Your Apple Watch has been successfully connected',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect your Apple Watch. Please try again.',
        variant: 'destructive',
      });
      console.error('Error connecting Apple Watch:', error);
    }
  });
  
  // Handle toggling health metrics
  const handleToggleMetric = (metricId: string) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };
  
  // Handle connecting Apple Watch
  const handleConnectWatch = () => {
    connectAppleWatch();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Watch className="h-6 w-6 text-primary" />
            <CardTitle>Apple Watch Integration</CardTitle>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect your Apple Watch to track your health metrics and understand how your physical well-being affects your financial decisions.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Select health metrics to track</h3>
            <div className="space-y-4">
              {healthMetrics.map((metric) => (
                <div key={metric.id} className="flex items-start space-x-4">
                  <div className="bg-background/80 p-1.5 rounded-full border border-border">
                    {metric.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={metric.id} className="font-medium">
                        {metric.label}
                      </Label>
                      <Switch
                        id={metric.id}
                        checked={enabledMetrics[metric.id]}
                        onCheckedChange={() => handleToggleMetric(metric.id)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="rounded-md bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="text-sm font-medium">Privacy First</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your health data is kept private and secure. We only use this data to provide insights on how your well-being correlates with your financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleConnectWatch} 
          disabled={isConnecting || isConnected} 
          className="w-full"
        >
          {isConnecting ? (
            'Connecting...'
          ) : isConnected ? (
            'Connected'
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Connect Apple Watch
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
