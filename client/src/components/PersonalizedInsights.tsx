import { useUser } from '@/context/UserContext';
import { Insight, insightConfig } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonalizedInsights() {
  const { user } = useUser();
  
  const { data: insights, isLoading } = useQuery<Insight[]>({
    queryKey: user ? [`/api/users/${user.id}/insights`] : [],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-neutral-700">Personalized Insights</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          Updated Today
        </span>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white rounded-xl border border-neutral-200">
              <CardContent className="p-4">
                <div className="flex">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights?.map((insight) => (
            <Card 
              key={insight.id} 
              className="bg-white rounded-xl border border-neutral-200 transform transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ 
                      backgroundColor: insightConfig[insight.type]?.bgColor || 'rgba(239, 68, 68, 0.1)',
                      color: insightConfig[insight.type]?.color || 'rgb(239, 68, 68)'
                    }}
                  >
                    <i className={`fas fa-${insightConfig[insight.type]?.icon || 'lightbulb'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-800">{insight.title}</h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
