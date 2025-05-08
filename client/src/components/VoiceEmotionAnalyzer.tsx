import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { EmotionType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface VoiceEmotionAnalyzerProps {
  onResult: (result: { emotion: EmotionType, confidence: number, transcript: string }) => void;
  isProcessing: boolean;
}

const VoiceEmotionAnalyzer: React.FC<VoiceEmotionAnalyzerProps> = ({ onResult, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update recording duration
    if (isRecording) {
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // Update component status based on isProcessing prop
    if (isProcessing) {
      setStatus('processing');
    } else if (isRecording) {
      setStatus('recording');
    } else {
      setStatus('idle');
    }
  }, [isProcessing, isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setStatus('recording');
      setRecordingDuration(0);
      setTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio blob and analyze it
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeAudio(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) {
            throw new Error('Failed to convert audio to base64');
          }

          // Send audio for analysis
          setStatus('processing');
          const response = await apiRequest('POST', '/api/ml/voice/analyze-voice', {
            audio: base64Audio
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to analyze voice emotion');
          }

          const result = await response.json();
          setTranscript(result.transcript || '');
          
          // Pass result to parent component
          onResult({
            emotion: result.emotion,
            confidence: result.confidence,
            transcript: result.transcript || ''
          });
        } catch (err) {
          console.error('Error in reader.onloadend:', err);
          setStatus('idle');
          // Create and dispatch a custom event to notify the parent about the error
          const errorEvent = new CustomEvent('voiceAnalysisError', { 
            detail: { message: err instanceof Error ? err.message : 'Failed to analyze voice' }
          });
          window.dispatchEvent(errorEvent);
        }
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="voice-emotion-analyzer">
      <div className="flex flex-col items-center gap-4">
        {transcript && (
          <div className="w-full p-3 bg-card/50 rounded-md mb-2 text-sm">
            <p className="text-foreground">"{transcript}"</p>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <Button 
              onClick={startRecording}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Voice Analysis
            </Button>
          )}

          {status === 'recording' && (
            <>
              <div className="text-sm text-primary animate-pulse mr-2">
                Recording {formatDuration(recordingDuration)}
              </div>
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}

          {status === 'processing' && (
            <Button disabled className="bg-primary/50 text-primary-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceEmotionAnalyzer;