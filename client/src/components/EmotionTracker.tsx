import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { EmotionType } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import EmojiSelector from './EmojiSelector';
import FacialEmotionAnalyzer from './FacialEmotionAnalyzer';
import { Camera, Mic, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionIntensity: number; // 0-1 scale
  detectedEmotions: string[];
  emotionalTriggers: string[];
  recommendations: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
}

export default function EmotionTracker() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>("content");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFacialAnalyzer, setShowFacialAnalyzer] = useState(false);
  
  const mutation = useMutation({
    mutationFn: async (data: { userId: number; type: EmotionType; notes: string }) => {
      return await apiRequest('/api/emotions', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Mood recorded",
        description: "Your emotional state has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/emotions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/emotions/latest`] });
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error saving mood",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Analyze text emotion
  const analyzeEmotion = async () => {
    if (!notes.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setShowAnalysis(false);
      
      const result = await apiRequest<EmotionAnalysisResult>('/api/ml/emotions/analyze', 'POST', {
        text: notes
      });
      
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      // Auto-select the emotion based on analysis
      const emotion = mapToEmotionType(result.primaryEmotion);
      if (emotion) {
        setSelectedEmotion(emotion);
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your emotions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Map the AI's emotion to our app's emotion types
  const mapToEmotionType = (emotion: string): EmotionType | null => {
    const lowerEmotion = emotion.toLowerCase();
    
    if (['stressed', 'anxious', 'afraid', 'frightened', 'nervous'].some(e => lowerEmotion.includes(e))) {
      return "stressed";
    } else if (['worried', 'concerned', 'unsettled', 'uneasy'].some(e => lowerEmotion.includes(e))) {
      return "worried";
    } else if (['neutral', 'okay', 'fine'].some(e => lowerEmotion.includes(e))) {
      return "neutral";
    } else if (['content', 'satisfied', 'pleased', 'serene', 'calm'].some(e => lowerEmotion.includes(e))) {
      return "content";
    } else if (['happy', 'joyful', 'excited', 'delighted', 'cheerful'].some(e => lowerEmotion.includes(e))) {
      return "happy";
    }
    
    return null;
  };
  
  // Handle emotion detected from facial analysis
  const handleFacialEmotionDetected = (emotion: EmotionType, confidence: number) => {
    setSelectedEmotion(emotion);
    setShowFacialAnalyzer(false);
    
    // Add a note about the facial detection
    setNotes(prev => {
      const facialNote = `Facial expression analysis detected ${emotion} emotion with ${Math.round(confidence * 100)}% confidence.`;
      return prev ? `${prev}\n\n${facialNote}` : facialNote;
    });
    
    toast({
      title: "Facial expression analyzed",
      description: `Detected ${emotion} emotion from your expression.`,
    });
  };

  const handleSaveEmotion = () => {
    if (!user || !selectedEmotion) return;
    
    mutation.mutate({
      userId: user.id,
      type: selectedEmotion,
      notes: notes,
    });
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
    <section className="px-4 py-4">
      {/* Facial Expression Analyzer Dialog */}
      <Dialog open={showFacialAnalyzer} onOpenChange={setShowFacialAnalyzer}>
        <DialogContent 
          className="sm:max-w-md p-0 border-0 bg-transparent"
          aria-describedby="facial-analyzer-description"
        >
          <div id="facial-analyzer-description" className="sr-only">
            Facial expression analyzer uses your camera to detect emotions
          </div>
          <FacialEmotionAnalyzer 
            onEmotionDetected={handleFacialEmotionDetected}
            onClose={() => setShowFacialAnalyzer(false)}
            key={showFacialAnalyzer ? 'active' : 'inactive'} // Force re-mount when opened
          />
        </DialogContent>
      </Dialog>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-foreground">How are you feeling today?</h3>
        <span className="text-xs text-muted-foreground">
          {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>
      
      {/* WHOOP-inspired emotion selector */}
      <div className="whoop-container mb-2">
        <EmojiSelector 
          selectedEmotion={selectedEmotion} 
          onSelect={setSelectedEmotion} 
        />
        
        <div className="mt-3">
          <Textarea
            className="w-full px-4 py-3 text-sm rounded-lg border border-border bg-background focus-visible:ring-primary focus-visible:ring-offset-0 resize-none transition"
            placeholder="Add notes about how you're feeling and we'll analyze your emotions (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          
          {showAnalysis && analysisResult && (
            <Card className="mt-3 overflow-hidden bg-card/60 backdrop-blur-md dark:bg-card/60 relative border-border">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Analysis</span>
                  </div>
                  <Badge className={getSentimentColor(analysisResult.sentiment)}>
                    {truncateAndCapitalize(analysisResult.sentiment)}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">{truncateAndCapitalize(analysisResult.primaryEmotion)}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(analysisResult.emotionIntensity * 100)}%</span>
                  </div>
                  <Progress value={analysisResult.emotionIntensity * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-3 flex space-x-3">
            {/* Input methods and analyze button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full w-10 h-10 bg-accent/50 text-primary hover:bg-accent/80 transition shadow-sm"
              title="Record voice note"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full w-10 h-10 bg-accent/50 text-primary hover:bg-accent/80 transition shadow-sm"
              title="Analyze facial expression"
              onClick={() => setShowFacialAnalyzer(true)}
            >
              <Camera className="h-5 w-5" />
            </Button>
            
            {/* AI Analysis button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full w-10 h-10 bg-accent/50 text-primary hover:bg-accent/80 transition shadow-sm"
              title="Analyze with AI"
              onClick={analyzeEmotion}
              disabled={!notes.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Brain className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1"></div>
            <Button
              onClick={handleSaveEmotion}
              disabled={!selectedEmotion || mutation.isPending}
              className="px-5 py-2 rounded-full text-sm font-medium shadow-sm"
            >
              {mutation.isPending ? "Saving..." : "Save Mood"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
