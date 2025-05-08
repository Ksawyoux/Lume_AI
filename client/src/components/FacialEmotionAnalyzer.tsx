import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EmotionType } from '@/types';
import { Camera, X, Check, RefreshCw, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface FacialEmotionAnalyzerProps {
  onEmotionDetected: (emotion: EmotionType, confidence: number) => void;
  onClose: () => void;
}

export default function FacialEmotionAnalyzer({ onEmotionDetected, onClose }: FacialEmotionAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [emotionResult, setEmotionResult] = useState<{
    emotion: EmotionType;
    confidence: number;
    description: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Map API emotion names to our EmotionType
  const mapEmotionToType = (emotion: string): EmotionType => {
    const mapping: Record<string, EmotionType> = {
      'happy': 'happy',
      'joy': 'happy',
      'content': 'content',
      'satisfied': 'content',
      'calm': 'neutral',
      'neutral': 'neutral',
      'sad': 'worried',
      'sadness': 'worried',
      'anxious': 'worried',
      'worried': 'worried',
      'angry': 'stressed',
      'anger': 'stressed',
      'stressed': 'stressed',
      'fear': 'stressed',
      'disgust': 'stressed'
    };
    
    return mapping[emotion.toLowerCase()] || 'neutral';
  };

  // Start camera
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Capture image and analyze
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    setIsAnalyzing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image data (JPEG format)
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    try {
      // Extract the base64 data part (remove the data:image/jpeg;base64, prefix)
      const base64Data = imageData.split(',')[1];
      
      // Send to API for analysis
      const response = await apiRequest('POST', '/api/ml/emotions/analyze-face', {
        image: base64Data
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze expression');
      }
      
      const result = await response.json();
      
      // Map the detected emotion to our emotion types
      const mappedEmotion = mapEmotionToType(result.primaryEmotion);
      
      setEmotionResult({
        emotion: mappedEmotion,
        confidence: result.confidence || result.emotionIntensity || 0.75,
        description: result.description || `Detected ${result.primaryEmotion} in your expression`
      });
      
    } catch (err) {
      console.error('Error analyzing facial expression:', err);
      setError('Unable to analyze expression. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Accept the detected emotion
  const acceptEmotion = () => {
    if (emotionResult) {
      onEmotionDetected(emotionResult.emotion, emotionResult.confidence);
    }
  };

  // Reset the analysis
  const resetAnalysis = () => {
    setEmotionResult(null);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative">
      {/* Accessibility enhancements */}
      <VisuallyHidden>
        <DialogTitle>Facial Emotion Analysis</DialogTitle>
      </VisuallyHidden>
      
      <div className="p-4 bg-[#1c2127] rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Facial Emotion Analysis</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          {cameraActive ? (
            <>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              
              {/* Camera active UI overlay */}
              {!emotionResult && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-dashed border-[#00f19f] rounded-full w-28 h-28 flex items-center justify-center opacity-70">
                    <div className="text-[#00f19f] text-xs text-center">
                      <Camera size={24} className="mx-auto mb-1" />
                      Center your face
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading UI overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#00f19f] mx-auto mb-3" />
                    <p className="text-white text-sm">Analyzing your expression...</p>
                  </div>
                </div>
              )}
              
              {/* Results UI overlay */}
              {emotionResult && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-[#252a2e] p-4 rounded-lg max-w-xs text-center">
                    <div className={`text-2xl mb-2 font-bold ${
                      emotionResult.emotion === 'happy' ? 'text-green-400' :
                      emotionResult.emotion === 'content' ? 'text-[#00f19f]' :
                      emotionResult.emotion === 'neutral' ? 'text-blue-400' :
                      emotionResult.emotion === 'worried' ? 'text-yellow-400' :
                      'text-red-500'
                    }`}>
                      {emotionResult.emotion.charAt(0).toUpperCase() + emotionResult.emotion.slice(1)}
                    </div>
                    <p className="text-gray-300 mb-4">{emotionResult.description}</p>
                    <div className="flex space-x-2 justify-center">
                      <Button 
                        onClick={resetAnalysis}
                        variant="outline" 
                        size="sm"
                        className="border-gray-700"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Retry
                      </Button>
                      <Button 
                        onClick={acceptEmotion}
                        size="sm"
                        className="bg-[#00f19f] text-black hover:bg-[#00d88a]"
                      >
                        <Check size={16} className="mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full flex-col">
              <Camera size={36} className="text-[#00f19f] mb-4 opacity-70" />
              <p className="text-sm text-gray-300 mb-4 text-center px-4">
                Allow camera access to analyze your facial expression
              </p>
              <Button 
                onClick={startCamera} 
                variant="outline"
                className="border-gray-700 bg-[#252a2e] pulse-animation"
              >
                <Camera size={20} className="mr-2 text-[#00f19f]" />
                Enable Camera
              </Button>
            </div>
          )}
          
          {/* Hidden canvas for capturing frames */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        {cameraActive && !emotionResult && (
          <div className="flex flex-col items-center">
            <Button
              onClick={captureAndAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-[#00f19f] text-black hover:bg-[#00d88a] py-6 relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1c2127] rounded-full border-2 border-[#00f19f] w-7 h-7 flex items-center justify-center">
                <Camera size={16} className="text-[#00f19f]" />
              </div>
              <span className="flex items-center justify-center">
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera size={18} className="mr-2" />
                    Take Photo
                  </>
                )}
              </span>
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Center your face in the frame and click "Take Photo"
            </p>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-400">
          <p>Your privacy is important. Images are analyzed locally and are not saved.</p>
        </div>
      </div>
      
      {/* Animation styles are defined in global CSS */}
    </div>
  );
}