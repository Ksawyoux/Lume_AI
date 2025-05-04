import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { EmotionType } from '@/types';
import { Loader2, Check, AlertCircle, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number; // 0-1 scale
  detectedEmotions: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
}

export default function EmotionAnalyzer() {
  const { user } = useUser();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Mutation for analyzing text emotions
  const analyzeEmotion = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest<EmotionAnalysisResult>('/api/ml/emotions/analyze', 'POST', {
        text
      });
    },
    onSuccess: () => {
      setShowResult(true);
      toast({
        title: 'Emotion analyzed',
        description: 'Your text has been successfully analyzed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred during analysis.',
        variant: 'destructive',
      });
    },
  });

  // Use the mutation data directly instead of an additional query
  const analysisResult = analyzeEmotion.data as EmotionAnalysisResult | undefined;

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: 'Empty text',
        description: 'Please enter some text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    // Reset any previous result view
    setShowResult(false);
    
    // Trigger the analysis
    await analyzeEmotion.mutateAsync(text);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'neutral':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const truncateAndCapitalize = (text: string) => {
    // Capitalize first letter and truncate if too long
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur-md dark:bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" /> Advanced Emotion Analysis
          </CardTitle>
          <CardDescription>
            Enter some thoughts, feelings, or experiences and our AI will analyze the emotional content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-[100px]"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setText('')}
            disabled={analyzeEmotion.isPending}
          >
            Clear
          </Button>
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeEmotion.isPending || text.trim() === ''}
          >
            {analyzeEmotion.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Emotions'
            )}
          </Button>
        </CardFooter>
      </Card>

      {showResult && analysisResult && (
        <Card className="overflow-hidden bg-card/60 backdrop-blur-md dark:bg-card/60 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge className={getSentimentColor(analysisResult.sentiment)}>
                {truncateAndCapitalize(analysisResult.sentiment)}
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your emotional state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Emotion with Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Primary Emotion</h4>
                <span className="text-xs text-muted-foreground">
                  {Math.round(analysisResult.emotionIntensity * 100)}% Intensity
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg font-semibold">{truncateAndCapitalize(analysisResult.primaryEmotion)}</span>
              </div>
              <Progress value={analysisResult.emotionIntensity * 100} className="h-2" />
            </div>

            {/* Detected Emotions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Detected Emotions</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.detectedEmotions.map((emotion, index) => (
                  <Badge key={index} variant="outline">{truncateAndCapitalize(emotion)}</Badge>
                ))}
              </div>
            </div>

            {/* Emotional Triggers */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Potential Triggers</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {analysisResult.emotionalTriggers.map((trigger, index) => (
                  <li key={index}>{trigger}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Analysis Confidence */}
            <div className="border-t pt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                AI Confidence
              </span>
              <span className="font-medium">{Math.round(analysisResult.confidence * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
