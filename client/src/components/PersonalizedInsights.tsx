import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, BarChart3, ActivitySquare } from 'lucide-react';
import { format } from 'date-fns';

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
      
      // Fixed parameter order: url, method, data
      return await apiRequest('/insights/generate', 'POST', {
        userId: user.id
      });
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
        return <BarChart3 className="h-5 w-5 text-[#00f19f]" />;
      case 'spending-trigger':
        return <TrendingUp className="h-5 w-5 text-[#00f19f]" />;
      case 'action-recommendation':
        return <ActivitySquare className="h-5 w-5 text-[#00f19f]" />;
      default:
        return <Lightbulb className="h-5 w-5 text-[#00f19f]" />;
    }
  };

  // Get title based on the insight type
  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'emotion-finance-correlation':
        return 'Positive Spending Pattern';
      case 'spending-trigger':
        return 'Stress-Triggered Spending';
      case 'action-recommendation':
        return 'Mood-Boosting Activities';
      default:
        return 'Financial Insight';
    }
  };
  
  // No longer using card classes since we're styling directly now

  // Check if we have enough transactions to generate insights
  const hasEnoughTransactions = transactions && transactions.length >= 3;
  
  // Determine if we have no insights
  const hasNoInsights = insights && insights.length === 0;
  
  // Auto-generate insights when we have transactions but no insights
  useEffect(() => {
    if (!isLoadingTransactions && !isLoadingInsights && 
        hasEnoughTransactions && hasNoInsights && 
        !generating && !generateInsightsMutation.isPending) {
      handleGenerateInsights();
    }
  }, [isLoadingTransactions, isLoadingInsights, hasEnoughTransactions, hasNoInsights, generating, generateInsightsMutation.isPending]);

  return (
    <section className="px-4 py-2">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-2xl font-medium text-foreground flex items-center">
          <Sparkles className="h-6 w-6 mr-3 text-[#00f19f]" />
          INSIGHTS
        </h3>
        {/* Removed "Update Insights" button as requested */}
      </div>

      {isLoadingInsights || isLoadingTransactions ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-[120px] rounded-lg" />
          <Skeleton className="w-full h-[120px] rounded-lg" />
        </div>
      ) : hasNoInsights ? (
        <div className="bg-[#1c2127] rounded-lg p-5 border border-gray-800">
          <div className="flex flex-col items-center justify-center text-center p-3">
            <Sparkles className="h-10 w-10 mb-4 text-[#00f19f]" />
            <h4 className="text-lg font-medium text-white mb-2">No insights available yet</h4>
            <p className="text-sm text-gray-400 mb-4">
              {hasEnoughTransactions 
                ? "Generate insights to see patterns in your financial behavior and emotions."
                : "Record at least 3 transactions to generate personalized insights."}
            </p>
            {hasEnoughTransactions ? (
              <Button
                onClick={handleGenerateInsights}
                disabled={generating || generateInsightsMutation.isPending}
                className="text-sm bg-[#00f19f] text-black hover:bg-[#00d88a] rounded-full px-5"
              >
                {generating || generateInsightsMutation.isPending ? "Generating..." : "Generate Insights"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {insights && insights.map((insight) => (
            <div 
              key={insight.id} 
              className="bg-[#1c2127] rounded-lg p-5 border border-gray-800"
            >
              <div className="flex items-center gap-3 mb-1">
                {getInsightIcon(insight.type)}
                <h3 className="text-lg font-medium text-white">{getInsightTitle(insight.type)}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                {format(new Date(insight.date), 'M/d/yyyy')}
              </p>
              <p className="text-white text-sm leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}