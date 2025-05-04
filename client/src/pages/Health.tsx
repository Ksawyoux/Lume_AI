import React from 'react';
import { useUser } from '@/context/UserContext';
import { HealthDataGrid } from '@/components/HealthDataWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Apple, AreaChart, Watch } from 'lucide-react';
import Header from '@/components/Header';

export default function Health() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Health Data</h1>
        
        <Card className="bg-gradient-to-r from-zinc-900 to-zinc-950 shadow-lg mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Apple className="mr-2" />
              <span>Apple Watch Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="bg-zinc-800 p-3 rounded-full mr-4">
                <Watch className="h-10 w-10 text-teal-500" />
              </div>
              <div>
                <h3 className="font-semibold">Apple Watch Series 8</h3>
                <p className="text-sm text-zinc-400">Last synced today at 10:15 AM</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Your health data is synced from your Apple Watch. The data helps us correlate your physical well-being with your financial decisions.
            </p>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-teal-500" /> Recovery & Readiness
          </h2>
          <HealthDataGrid 
            metrics={['recovery', 'sleepQuality', 'heartRate', 'strain']} 
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AreaChart className="mr-2 text-teal-500" /> Activity Metrics
          </h2>
          <HealthDataGrid 
            metrics={['steps', 'calories']} 
          />
        </div>
      </main>
    </div>
  );
}
