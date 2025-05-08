import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useQuery } from '@tanstack/react-query';
import { Emotion, EmotionType } from '@shared/schema';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { emotionConfig, getEmotionColor, emotionRecoveryPercentages } from "@/lib/emotionUtils";

export default function Emotions() {
  const { user } = useUser();
  
  const { data: emotions, isLoading } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  // Map emotion types to WHOOP recovery colors
  const getEmotionColorClass = (type: string): string => {
    const emotionType = type as EmotionType;
    switch(emotionType) {
      case 'stressed':
        return 'bg-[hsl(var(--recovery-low)/0.1)] text-[hsl(var(--recovery-low))]';
      case 'worried':
        return 'bg-[hsl(var(--recovery-medium)/0.1)] text-[hsl(var(--recovery-medium))]';
      case 'neutral':
        return 'bg-[hsl(var(--recovery-neutral)/0.1)] text-[hsl(var(--recovery-neutral))]';
      case 'content':
        return 'bg-[hsl(var(--strain)/0.1)] text-[hsl(var(--strain))]';
      case 'happy':
        return 'bg-[hsl(var(--recovery-high)/0.1)] text-[hsl(var(--recovery-high))]';
      default:
        return 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]';
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-foreground uppercase tracking-wider">MOOD JOURNAL</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track how emotions influence your financial behavior
          </p>
        </section>
        
        <section className="px-4 py-2">
          <Tabs defaultValue="journal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-card border border-border">
              <TabsTrigger value="journal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase tracking-wider">
                JOURNAL
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase tracking-wider">
                PATTERNS
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="journal">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="whoop-container">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {emotions?.map((emotion) => {
                    const emotionType = emotion.type;
                    // Ensure we have a valid date object
                    let date;
                    try {
                      date = new Date(emotion.date);
                      // Check if date is valid
                      if (isNaN(date.getTime())) {
                        date = new Date(); // Fallback to current date if invalid
                      }
                    } catch (e) {
                      date = new Date(); // Fallback to current date if error
                    }
                    const colorClass = getEmotionColorClass(emotionType);
                    
                    return (
                      <div 
                        key={emotion.id} 
                        className="whoop-container hover:bg-card/80 transition-all cursor-pointer"
                      >
                        <div className="flex">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${colorClass}`}
                          >
                            <i className={`fas fa-${emotionConfig[emotionType as EmotionType].icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-sm uppercase tracking-wider text-foreground">
                                {emotionConfig[emotionType as EmotionType].label}
                              </span>
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                {/* Format date safely */}
                                {!isNaN(date.getTime()) ? 
                                  <>
                                    {format(date, "MMM d")}
                                    {` · ${formatDistanceToNow(date, { addSuffix: true })}`}
                                  </> : 
                                  "RECENT"}
                              </span>
                            </div>
                            
                            {emotion.notes && (
                              <p className="text-sm text-foreground">"{emotion.notes}"</p>
                            )}
                            
                            {!emotion.notes && (
                              <p className="text-sm text-muted-foreground italic">No notes added</p>
                            )}

                            <div className="mt-2 flex items-center">
                              <div className="h-1 flex-grow bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full" 
                                  style={{ 
                                    width: `${emotionRecoveryPercentages[emotionType as EmotionType]}%`,
                                    backgroundColor: `hsl(var(${emotionType === 'stressed' ? '--recovery-low' : 
                                                             emotionType === 'worried' ? '--recovery-medium' : 
                                                             emotionType === 'neutral' ? '--recovery-neutral' : 
                                                             emotionType === 'content' ? '--strain' : '--recovery-high'}))`
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs ml-2 text-muted-foreground">MOOD SCORE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="patterns">
              <div className="whoop-container mb-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">EMOTIONAL PATTERNS</h4>
                
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--recovery-low)/0.1)] flex items-center justify-center text-[hsl(var(--recovery-low))] mr-3">
                      <i className="fas fa-frown text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">STRESS TRIGGERS</h5>
                      <div className="mt-2 mb-2">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(var(--recovery-low))]" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your stress levels peak on Mondays and towards month-end when bills are due.
                        These times also show higher impulse spending.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--recovery-high)/0.1)] flex items-center justify-center text-[hsl(var(--recovery-high))] mr-3">
                      <i className="fas fa-smile text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">POSITIVE INFLUENCES</h5>
                      <div className="mt-2 mb-2">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(var(--recovery-high))]" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your mood improves after social activities and outdoor exercise. These periods
                        also show more mindful spending and better financial decisions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] mr-3">
                      <i className="fas fa-lightbulb text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">RECOMMENDATION</h5>
                      <div className="mt-2 mb-2">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(var(--primary))]" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Schedule more outdoor activities during high-stress periods. Plan a small "feel good"
                        budget to improve emotional balance without significant financial impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* WHOOP-style recovery chart */}
              <div className="whoop-container">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">WEEKLY MOOD TREND</h4>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">LAST 7 DAYS</span>
                </div>
                
                <div className="mt-4">
                  {/* Weekly trend visualization */}
                  <div className="h-32 flex items-end justify-between pb-2 mb-3 border-b border-border">
                    {[
                      {day: 'M', value: 35, emotion: 'stressed'},
                      {day: 'T', value: 52, emotion: 'worried'},
                      {day: 'W', value: 68, emotion: 'neutral'},
                      {day: 'T', value: 72, emotion: 'neutral'},
                      {day: 'F', value: 85, emotion: 'content'},
                      {day: 'S', value: 90, emotion: 'happy'},
                      {day: 'S', value: 78, emotion: 'content'}
                    ].map((day, index) => {
                      const getColor = (emotion: string) => {
                        switch(emotion) {
                          case 'stressed': return 'hsl(var(--recovery-low))';
                          case 'worried': return 'hsl(var(--recovery-medium))';
                          case 'neutral': return 'hsl(var(--recovery-neutral))';
                          case 'content': return 'hsl(var(--strain))';
                          case 'happy': return 'hsl(var(--recovery-high))';
                          default: return 'hsl(var(--primary))';
                        }
                      };
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-6 rounded-sm" 
                            style={{ 
                              height: `${day.value}%`,
                              backgroundColor: getColor(day.emotion)
                            }}
                          ></div>
                          <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">PEAK STRESS: MONDAY</div>
                    <div className="text-xs text-[hsl(var(--recovery-high))]">BEST DAY: SATURDAY</div>
                  </div>
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
