import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Bell, Lock, Eye, HelpCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState(true);
  const [emotionTracking, setEmotionTracking] = useState(true);
  
  if (!user) return null;
  
  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Profile</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your account and preferences
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Card className="border border-neutral-200 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                  <span className="text-xl font-medium">{user.initials}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-800">{user.name}</h3>
                  <p className="text-sm text-neutral-500">{user.username}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-neutral-200 text-neutral-700"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border border-neutral-200 mb-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-neutral-800 mb-3">App Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <Bell size={16} />
                    </div>
                    <span className="text-sm text-neutral-700">Notifications</span>
                  </div>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <Eye size={16} />
                    </div>
                    <span className="text-sm text-neutral-700">Trend Analysis</span>
                  </div>
                  <Switch 
                    checked={trendAnalysis}
                    onCheckedChange={setTrendAnalysis}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <Lock size={16} />
                    </div>
                    <span className="text-sm text-neutral-700">Emotion Tracking</span>
                  </div>
                  <Switch 
                    checked={emotionTracking}
                    onCheckedChange={setEmotionTracking}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-neutral-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-neutral-800 mb-3">Support</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between py-2 text-sm text-neutral-700 hover:text-neutral-900">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3">
                      <HelpCircle size={16} />
                    </div>
                    <span>Help & Support</span>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400" />
                </button>
                
                <Separator />
                
                <button className="w-full flex items-center justify-between py-2 text-sm text-neutral-700 hover:text-neutral-900">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                      <LogOut size={16} />
                    </div>
                    <span>Log Out</span>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400" />
                </button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-400">MoodMoney v1.0.0</p>
            <p className="text-xs text-neutral-400 mt-1">
              © 2023 MoodMoney. All rights reserved.
            </p>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
