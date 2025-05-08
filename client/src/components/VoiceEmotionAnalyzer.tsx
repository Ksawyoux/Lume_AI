import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmotionType } from '@shared/schema';
import { useUser } from '@/context/UserContext';
import { apiRequest } from '@/lib/queryClient';
import { emotionConfig } from '@/lib/emotionUtils';

// Extend window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// TypeScript interface for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface VoiceEmotionAnalyzerProps {
  onEmotionDetected: (emotion: EmotionType, notes: string) => void;
}

export default function VoiceEmotionAnalyzer({ onEmotionDetected }: VoiceEmotionAnalyzerProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionImpl) {
      speechRecognitionRef.current = new SpeechRecognitionImpl();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < Object.keys(event.results).length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + ' ' + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update with interim results for real-time feedback
        const interimElement = document.getElementById('interim-transcript');
        if (interimElement) {
          interimElement.textContent = interimTranscript;
        }
      };
      
      speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: 'Speech Recognition Error',
          description: `Error: ${event.error}. Please try again.`,
          variant: 'destructive',
        });
      };
    } else {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      
      // Start speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
      
      // Start duration timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
        
        // Automatically stop after 60 seconds
        if (seconds >= 60) {
          stopRecording();
        }
      }, 1000);
      
      toast({
        title: 'Recording Started',
        description: 'Speak clearly about how you feel right now.',
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Error',
        description: 'Could not access your microphone. Please check your permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      
      // Clear duration timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Clear interim transcript
      document.getElementById('interim-transcript')!.textContent = '';
    }
  };

  const analyzeVoiceEmotion = async () => {
    if (!audioBlob || !user) return;
    
    try {
      setIsProcessing(true);
      
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1]; // Remove data URL prefix
        
        // Send both audio and transcript for analysis
        const response = await apiRequest('POST', '/api/ml/emotions/analyze-voice', {
          audioData: base64Audio,
          transcript: transcript.trim(),
          userId: user.id
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze voice emotion');
        }
        
        const { emotion, confidence } = await response.json();
        
        // Ensure we have a valid emotion type
        const detectedEmotion = emotion as EmotionType;
        
        toast({
          title: 'Emotion Detected',
          description: `You sound ${emotionConfig[detectedEmotion].label.toLowerCase()} (${Math.round(confidence * 100)}% confidence)`,
        });
        
        // Pass the detected emotion and transcript as notes
        onEmotionDetected(detectedEmotion, transcript.trim());
        
        // Reset state
        setAudioBlob(null);
        setTranscript('');
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error analyzing voice emotion:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze your voice. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="whoop-container p-4 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Voice Emotion Analysis</h3>
      
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary/20 text-primary'
            }`}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </div>
          
          {isRecording && (
            <div className="mt-2 text-sm text-muted-foreground">
              {formatTime(recordingDuration)}
            </div>
          )}
        </div>
        
        <div className="min-h-[100px] bg-card/50 rounded-md p-3 text-sm">
          <p className="text-foreground">{transcript}</p>
          <p id="interim-transcript" className="text-muted-foreground italic"></p>
          
          {!transcript && !isRecording && !isProcessing && (
            <p className="text-muted-foreground italic">
              Your voice will be transcribed here. Speak clearly about how you're feeling.
            </p>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              disabled={isProcessing}
              variant="default"
              className="text-background"
            >
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive"
            >
              Stop Recording
            </Button>
          )}
          
          {audioBlob && !isRecording && (
            <Button 
              onClick={analyzeVoiceEmotion} 
              disabled={isProcessing}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Emotion'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}