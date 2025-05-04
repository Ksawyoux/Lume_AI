import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Emotion, emotionConfig } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

export default function Emotions() {
  const { user } = useUser();
  
  const { data: emotions, isLoading } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Emotion Journal</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Track how your emotions influence your financial decisions
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="journal">Journal</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="journal">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border border-neutral-200">
                      <CardContent className="p-4">
                        <div className="flex">
                          <Skeleton className="w-10 h-10 rounded-full mr-3" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {emotions?.map((emotion) => {
                    const emotionType = emotion.type;
                    const date = new Date(emotion.date);
                    
                    return (
                      <Card 
                        key={emotion.id} 
                        className="border border-neutral-200 hover:shadow-sm transition-all"
                      >
                        <CardContent className="p-4">
                          <div className="flex">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{ 
                                backgroundColor: emotionConfig[emotionType].bgColor,
                                color: emotionConfig[emotionType].color
                              }}
                            >
                              <i className={`fas fa-${emotionConfig[emotionType].icon} text-lg`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium text-sm">{emotionConfig[emotionType].label}</span>
                                <span className="text-xs text-neutral-500">
                                  {format(date, "MMM d")} · {formatDistanceToNow(date, { addSuffix: true })}
                                </span>
                              </div>
                              
                              {emotion.notes && (
                                <p className="text-sm text-neutral-600">"{emotion.notes}"</p>
                              )}
                              
                              {!emotion.notes && (
                                <p className="text-sm text-neutral-400 italic">No notes added</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="patterns">
              <Card className="border border-neutral-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-neutral-800 mb-3">Your Emotional Patterns</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                        <i className="fas fa-frown text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-neutral-800">Stress Triggers</h5>
                        <p className="text-xs text-neutral-600 mt-1">
                          Your stress levels peak on Mondays and towards month-end when bills are due.
                          These times also show higher impulse spending.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                        <i className="fas fa-smile text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-neutral-800">Positive Influences</h5>
                        <p className="text-xs text-neutral-600 mt-1">
                          Your mood improves after social activities and outdoor exercise. These periods
                          also show more mindful spending and better financial decisions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                        <i className="fas fa-lightbulb text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-neutral-800">Recommendation</h5>
                        <p className="text-xs text-neutral-600 mt-1">
                          Schedule more outdoor activities during high-stress periods. Plan a small "feel good"
                          budget to improve emotional balance without significant financial impact.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <h4 className="text-sm font-medium text-primary-800 mb-2">Track More for Better Insights</h4>
                <p className="text-xs text-primary-700">
                  The more consistently you track your emotions, the more accurate your patterns
                  and financial insights will be. Aim to record at least once daily.
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
