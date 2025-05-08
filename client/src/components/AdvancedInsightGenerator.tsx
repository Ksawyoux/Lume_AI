import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Brain,
  Sparkles,
  Loader2,
  ArrowRight,
  Lightbulb,
  Activity,
  Heart
} from 'lucide-react';

/**
 * Advanced Insight Generator component that combines emotional, financial, and health data
 * to provide deep, personalized insights using AI
 */
export default function AdvancedInsightGenerator() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Type definition for our insights response
  interface AdvancedAnalysisResponse {
    message: string;
    analysis: {
      emotionPatterns: Array<{
        patternName: string;
        description: string;
        confidence: number;
        affectedMetrics: string[];
        recommendedActions: string[];
        severity: 'low' | 'medium' | 'high';
      }>;
      emotionFinanceCorrelations: Array<{
        emotionType: string;
        spendingCategory: string;
        correlation: number;
        averageAmount: number;
        description: string;
        recommendedAction: string;
      }>;
      emotionHealthCorrelations: Array<{
        emotionType: string;
        healthMetric: string;
        correlation: number;
        description: string;
        recommendedAction: string;
      }>;
      overallInsights: string;
      primaryInfluencers: string[];
      actionPlan: string[];
    };
    storedInsights: Array<{
      id: number;
      userId: number;
      type: string;
      title: string;
      description: string;
      date: string;
    }>;
  }

  // Mutation for generating advanced insights
  const generateAdvancedInsightsMutation = useMutation<AdvancedAnalysisResponse, Error>({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const response = await apiRequest('/advanced-analytics/analyze', 'POST', {});
      return await response.json();
    },
    onSuccess: (data) => {
      if (user) {
        // Invalidate insights query to refresh the list
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/insights`] });
        
        // Display success with insight count
        const insightCount = data?.storedInsights?.length || 0;
        toast({
          title: "Advanced analysis complete",
          description: `${insightCount} new insights generated based on your emotional, financial, and health data.`,
        });
      }
      setGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "There was an error analyzing your data. Please try again later.",
        variant: "destructive",
      });
      setGenerating(false);
    },
  });

  // Handle generate insights button click
  const handleGenerateAdvancedInsights = () => {
    setGenerating(true);
    generateAdvancedInsightsMutation.mutate();
  };

  return (
    <div className="rounded-lg bg-black/20 border border-gray-800 p-5 my-4">
      <div className="flex items-center mb-3">
        <Brain className="h-5 w-5 text-[#00f19f] mr-2" />
        <h3 className="text-lg font-medium text-white">Advanced Emotional Pattern Analysis</h3>
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Generate deeper insights by combining your emotional states, financial behaviors, and health metrics.
        This advanced analysis uses machine learning to identify patterns and correlations that can help you
        make better decisions.
      </p>

      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex items-center">
          <Sparkles className="h-4 w-4 text-[#00f19f] mr-2" />
          <p className="text-sm text-gray-300">Emotion-Finance Correlations</p>
        </div>
        <div className="flex items-center">
          <Heart className="h-4 w-4 text-[#00f19f] mr-2" />
          <p className="text-sm text-gray-300">Emotion-Health Connections</p>
        </div>
        <div className="flex items-center">
          <Lightbulb className="h-4 w-4 text-[#00f19f] mr-2" />
          <p className="text-sm text-gray-300">Financial Pattern Recognition</p>
        </div>
        <div className="flex items-center">
          <Activity className="h-4 w-4 text-[#00f19f] mr-2" />
          <p className="text-sm text-gray-300">Personalized Wellness Action Plan</p>
        </div>
      </div>

      <Button
        onClick={handleGenerateAdvancedInsights}
        disabled={generating || generateAdvancedInsightsMutation.isPending}
        className="w-full bg-gradient-to-r from-[#00f19f] to-[#00d88a] text-black hover:from-[#00d88a] hover:to-[#00c27a] transition-all duration-300"
      >
        {generating || generateAdvancedInsightsMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing your patterns...
          </>
        ) : (
          <>
            Generate Advanced Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}