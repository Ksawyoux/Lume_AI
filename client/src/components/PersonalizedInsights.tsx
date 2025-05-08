import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, BarChart3 } from 'lucide-react';

interface Insight {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  date: string;
}

export default function PersonalizedInsights() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  
  // Get insights for the user
  const { 
    data: insights, 
    isLoading: isLoadingInsights 
  } = useQuery<Insight[]>({
    queryKey: user ? [`/api/users/${user.id}/insights`] : [],
    enabled: !!user,
  });
  
  // Get transactions to check if we have enough to generate insights
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions 
  } = useQuery<any[]>({
    queryKey: user ? [`/api/users/${user.id}/transactions`] : [],
    enabled: !!user,
  });

  // Mutation to generate insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      const res = await apiRequest('POST', '/api/insights/generate', {
        userId: user.id
      });
      
      return res.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/insights`] });
      }
      toast({
        title: "Insights generated",
        description: "Your personalized insights have been updated.",
      });
      setGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error generating insights",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setGenerating(false);
    },
  });

  // Handle generate insights button click
  const handleGenerateInsights = () => {
    setGenerating(true);
    generateInsightsMutation.mutate();
  };

  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'emotion-finance-correlation':
        return <TrendingUp className="h-4 w-4 text-[hsl(var(--recovery-high))]" />;
      case 'spending-trigger':
        return <AlertTriangle className="h-4 w-4 text-[hsl(var(--recovery-low))]" />;
      case 'action-recommendation':
        return <Lightbulb className="h-4 w-4 text-[hsl(var(--recovery-medium))]" />;
      default:
        return <BarChart3 className="h-4 w-4 text-primary" />;
    }
  };

  // Generate appropriate class based on insight type
  const getInsightCardClass = (type: string) => {
    switch (type) {
      case 'emotion-finance-correlation':
        return 'border-[hsl(var(--recovery-high))]';
      case 'spending-trigger':
        return 'border-[hsl(var(--recovery-low))]';
      case 'action-recommendation':
        return 'border-[hsl(var(--recovery-medium))]';
      default:
        return 'border-border';
    }
  };

  // Check if we have enough transactions to generate insights
  const hasEnoughTransactions = transactions && transactions.length >= 3;
  
  // Determine if we have no insights
  const hasNoInsights = insights && insights.length === 0;
  
  return (
    <section className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-foreground uppercase tracking-wider flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
          Insights
        </h3>
        {!isLoadingTransactions && hasEnoughTransactions ? (
          <Button
            onClick={handleGenerateInsights}
            disabled={generating || generateInsightsMutation.isPending}
            size="sm"
            variant="outline"
            className="text-xs border-border"
          >
            {generating || generateInsightsMutation.isPending ? "Generating..." : "Update Insights"}
          </Button>
        ) : null}
      </div>

      {isLoadingInsights || isLoadingTransactions ? (
        <div className="space-y-3">
          <Skeleton className="w-full h-[100px] rounded-lg" />
          <Skeleton className="w-full h-[100px] rounded-lg" />
        </div>
      ) : hasNoInsights ? (
        <div className="bg-accent/50 rounded-lg p-4 border border-border">
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Sparkles className="h-8 w-8 mb-3 text-[hsl(var(--primary))]" />
            <h4 className="text-sm font-medium text-foreground mb-1">No insights available yet</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {hasEnoughTransactions 
                ? "Generate insights to see patterns in your financial behavior and emotions."
                : "Record at least 3 transactions to generate personalized insights."}
            </p>
            {hasEnoughTransactions ? (
              <Button
                onClick={handleGenerateInsights}
                disabled={generating || generateInsightsMutation.isPending}
                size="sm"
                className="text-xs"
              >
                {generating || generateInsightsMutation.isPending ? "Generating..." : "Generate Insights"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights && insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`border ${getInsightCardClass(insight.type)} bg-accent/20 shadow-sm overflow-hidden`}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium flex items-center">
                  {getInsightIcon(insight.type)}
                  <span className="ml-2">{insight.title}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {new Date(insight.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs">
                {insight.description}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}