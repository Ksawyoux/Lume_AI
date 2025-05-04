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
import { Camera, Mic } from 'lucide-react';

export default function EmotionTracker() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>("content");
  const [notes, setNotes] = useState("");
  
  const mutation = useMutation({
    mutationFn: async (data: { userId: number; type: EmotionType; notes: string }) => {
      const res = await apiRequest('POST', '/api/emotions', data);
      return res.json();
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
  
  const handleSaveEmotion = () => {
    if (!user || !selectedEmotion) return;
    
    mutation.mutate({
      userId: user.id,
      type: selectedEmotion,
      notes: notes,
    });
  };

  return (
    <section className="px-4 py-4">
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
            placeholder="Add notes about how you're feeling (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="mt-3 flex space-x-3">
            {/* WHOOP-inspired input methods */}
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
              title="Take a selfie"
            >
              <Camera className="h-5 w-5" />
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
