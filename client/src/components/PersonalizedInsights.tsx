import { useUser } from '@/context/UserContext';
import { Insight, insightConfig } from '@/types';
import { useQuery } from '@tanstack/react-query';
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
      {/* WHOOP-inspired section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-foreground">Personalized Insights</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
          Updated Today
        </span>
      </div>
      
      {/* WHOOP-inspired insights container */}
      <div className="whoop-container">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border-b border-border last:border-0">
                <div className="flex">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {insights?.map((insight, index) => {
              const isLast = index === insights.length - 1;
              
              return (
                <div 
                  key={insight.id} 
                  className={`p-4 hover:bg-accent/10 transition-colors ${!isLast ? 'border-b border-border' : ''}`}
                >
                  <div className="flex">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm"
                      style={{ 
                        backgroundColor: `hsl(${insightConfig[insight.type]?.color.match(/\d+/g)?.[0] || '0'} 80% 95%)`,
                        color: insightConfig[insight.type]?.color || 'hsl(var(--primary))'
                      }}
                    >
                      <i className={`fas fa-${insightConfig[insight.type]?.icon || 'lightbulb'}`}></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
