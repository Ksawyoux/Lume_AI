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
        title: "Emotion saved",
        description: "Your mood has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/emotions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/emotions/latest`] });
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error saving emotion",
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
        <h3 className="text-base font-medium text-neutral-700">How are you feeling today?</h3>
        <span className="text-xs text-neutral-500">
          {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>
      
      <EmojiSelector 
        selectedEmotion={selectedEmotion} 
        onSelect={setSelectedEmotion} 
      />
      
      <div className="mt-2">
        <Textarea
          className="w-full px-4 py-3 text-sm rounded-lg border border-neutral-200 focus-visible:ring-primary resize-none transition"
          placeholder="Add notes about how you're feeling (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="mt-2 flex space-x-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
            title="Record voice note"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full w-9 h-9 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
            title="Take a selfie"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <div className="flex-1"></div>
          <Button
            onClick={handleSaveEmotion}
            disabled={!selectedEmotion || mutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </section>
  );
}
