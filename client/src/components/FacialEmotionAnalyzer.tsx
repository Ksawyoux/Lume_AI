import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EmotionType } from '@/types';
import { Camera, X, Check, RefreshCw, Loader2, AlertCircle, SmilePlus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FacialEmotionAnalyzerProps {
  onEmotionDetected: (emotion: EmotionType, confidence: number) => void;
  onClose: () => void;
}

// Simple manual emotion selector component
const ManualEmotionSelector = ({ 
  onSelect, 
  selectedEmotion 
}: { 
  onSelect: (emotion: EmotionType) => void;
  selectedEmotion: EmotionType;
}) => {
  return (
    <div className="p-4 rounded-lg bg-[#252a2e] w-full max-w-xs mx-auto">
      <h4 className="text-sm font-medium text-center mb-3 text-white">Select your current mood</h4>
      <Select value={selectedEmotion} onValueChange={(value) => onSelect(value as EmotionType)}>
        <SelectTrigger className="w-full bg-[#1c2127] border-gray-700">
          <SelectValue placeholder="Select a mood" />
        </SelectTrigger>
        <SelectContent className="bg-[#1c2127] border-gray-700">
          <SelectItem value="happy" className="text-green-400">Happy</SelectItem>
          <SelectItem value="content" className="text-[#00f19f]">Content</SelectItem>
          <SelectItem value="neutral" className="text-blue-400">Neutral</SelectItem>
          <SelectItem value="worried" className="text-yellow-400">Worried</SelectItem>
          <SelectItem value="stressed" className="text-red-500">Stressed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default function FacialEmotionAnalyzer({ onEmotionDetected, onClose }: FacialEmotionAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false); // Switch to manual selection
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('content');
  const [analysisAttempts, setAnalysisAttempts] = useState(0);
  
  const [emotionResult, setEmotionResult] = useState<{
    emotion: EmotionType;
    confidence: number;
    description: string;
  } | null>(null);

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

  // Initialize camera with improved error handling
  const startCamera = async () => {
    setCameraError(null);
    
    // Check if navigator.mediaDevices is available (browser support)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera API not supported in this browser");
      setCameraError("Your browser doesn't support camera access. Please select your mood manually.");
      setManualMode(true);
      return;
    }
    
    // First ensure the video element actually exists
    if (!videoRef.current) {
      console.error("Video element not initialized");
      setCameraError("Could not initialize camera. Please try manual selection.");
      setManualMode(true);
      return;
    }
    
    try {
      // Basic camera configuration
      const constraints = { 
        audio: false,
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      console.log("Requesting camera access...");
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      console.log("Camera stream obtained, tracks:", stream.getVideoTracks().length);
      
      if (stream.getVideoTracks().length === 0) {
        throw new Error("No video track available in the media stream");
      }
      
      // Update video source and handle playback
      videoRef.current.srcObject = stream;
      
      // Set up event handlers for video element
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        videoRef.current?.play().catch(playError => {
          console.error("Error playing video:", playError);
          setCameraError("Error starting video playback. Please grant camera permissions.");
          setManualMode(true);
        });
      };
      
      videoRef.current.onplaying = () => {
        console.log("Video is now playing");
        setCameraActive(true);
      };
      
      videoRef.current.onerror = (e) => {
        console.error("Video element error:", e);
        setCameraError("Video error: " + (videoRef.current?.error?.message || "Unknown error"));
        setManualMode(true);
      };
    } catch (error) {
      console.error("Camera access error:", error);
      
      // Provide more specific error messages based on the error
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError("Camera access denied. Please check your browser permissions.");
        } else if (error.name === 'NotFoundError') {
          setCameraError("No camera found on your device. Please use manual selection.");
        } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
          setCameraError("Cannot access your camera. It may be in use by another application.");
        } else {
          setCameraError("Camera error: " + error.message);
        }
      } else {
        setCameraError("Could not access camera. Please check your browser permissions.");
      }
      
      setManualMode(true);
    }
  };

  // Switch to manual mode
  const enableManualMode = () => {
    stopCamera();
    setManualMode(true);
    setCameraError(null);
  };

  // Handle manual emotion selection
  const submitManualEmotion = () => {
    setEmotionResult({
      emotion: selectedEmotion,
      confidence: 1.0, // High confidence since user selected it directly
      description: `You selected: ${selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)}`
    });
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  // Capture frame and analyze
  const captureAndAnalyze = async () => {
    setIsAnalyzing(true);
    let imageBase64: string | null = null;
    
    // Camera capture logic
    if (videoRef.current && canvasRef.current && cameraActive) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          // Set canvas dimensions
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get base64 image data
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          imageBase64 = dataUrl.split(',')[1]; // Remove the "data:image/jpeg;base64," part
        }
      } catch (err) {
        console.error("Error capturing video frame:", err);
        setCameraError("Error capturing video: " + (err instanceof Error ? err.message : String(err)));
        setIsAnalyzing(false);
        setManualMode(true);
        return;
      }
    }
    
    if (!imageBase64 || imageBase64.length < 100) {
      console.log("Invalid base64 image data");
      setCameraError("Failed to capture a valid image. Please try again or select manually.");
      setIsAnalyzing(false);
      setManualMode(true);
      return;
    }
    
    try {
      console.log("Sending image for analysis...");
      
      // Send to server for analysis (updated endpoint path and method)
      const response = await fetch('/api/ml/facial/analyze-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageBase64
        }),
        credentials: 'include'
      });
      
      console.log("API Response Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("API Response Error:", errorText);
        
        if (response.status === 404) {
          throw new Error("Emotion analysis endpoint not found. Please check the server.");
        } else if (response.status >= 500) {
          throw new Error("Server error analyzing image. Please try again later.");
        } else {
          throw new Error(`Failed to analyze image: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log("API Response Data:", result);
      
      // Process the result
      const mappedEmotion = mapEmotionToType(result.primaryEmotion);
      
      setEmotionResult({
        emotion: mappedEmotion,
        confidence: result.confidence || result.emotionIntensity || 0.75,
        description: result.description || `Detected ${result.primaryEmotion} in your expression`
      });
      
      // Reset attempts counter on success
      setAnalysisAttempts(0);
    } catch (error) {
      console.error("Error analyzing expression:", error);
      
      // Increment attempt counter
      setAnalysisAttempts(attempts => attempts + 1);
      
      if (analysisAttempts >= 2) { // After 3 attempts (0, 1, 2)
        setCameraError("Unable to analyze facial expression. Please select your mood manually.");
        setManualMode(true);
      } else {
        setCameraError(error instanceof Error ? error.message : "Failed to analyze facial expression. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Accept result and close
  const acceptEmotion = () => {
    if (emotionResult) {
      onEmotionDetected(emotionResult.emotion, emotionResult.confidence);
      onClose();
    }
  };

  // Try again
  const resetAnalysis = () => {
    setEmotionResult(null);
  };

  // Setup and cleanup effects
  useEffect(() => {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Show warnings for problematic browsers
    if (isIOS) {
      console.log("iOS device detected");
      // iOS Safari has issues with camera access in some contexts
      if (isSafari) {
        setCameraError("Note: Camera access on iOS Safari may be limited. If you encounter issues, please use manual selection.");
      }
    }
    
    // Check if camera can be supported in this browser
    const isCameraSupported = 
      typeof navigator !== 'undefined' && 
      navigator.mediaDevices && 
      'getUserMedia' in navigator.mediaDevices;
    
    // Attempt to start camera if supported  
    if (isCameraSupported) {
      // Try to auto-start camera for desktop browsers
      if (!isIOS && !cameraActive && !manualMode) {
        startCamera();
      }
    } else {
      console.log("Media API not supported");
      setCameraError("Your browser doesn't support camera access. Please use manual selection.");
      setManualMode(true);
    }
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative">
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
          {/* Always render the video element, but control its visibility */}
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          
          {cameraActive ? (
            <>              
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
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#00f19f] mx-auto mb-3" />
                    <p className="text-white text-sm">Analyzing your expression...</p>
                  </div>
                </div>
              )}
              
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
          ) : manualMode ? (
            <div className="flex items-center justify-center h-full flex-col">
              <div className="bg-[#252a2e] p-5 rounded-lg text-center">
                <p className="text-sm text-white mb-3">Select your current mood</p>
                <ManualEmotionSelector 
                  selectedEmotion={selectedEmotion} 
                  onSelect={setSelectedEmotion} 
                />
                <Button
                  onClick={submitManualEmotion}
                  className="bg-[#00f19f] text-black hover:bg-[#00d88a] mt-4"
                >
                  <SmilePlus size={18} className="mr-2" />
                  Submit Mood
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full flex-col">
              <Camera size={36} className="text-[#00f19f] mb-4 opacity-70" />
              <p className="text-sm text-gray-300 mb-4 text-center px-4">
                Analyze your facial expression to detect your mood
              </p>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={startCamera} 
                  variant="outline"
                  className="border-gray-700 bg-[#252a2e]"
                >
                  <Camera size={20} className="mr-2 text-[#00f19f]" />
                  Enable Camera
                </Button>
                <Button
                  onClick={enableManualMode}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <SmilePlus size={16} className="mr-2" />
                  Select Manually
                </Button>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {cameraError && (
          <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded-md mb-4 text-sm flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span>{cameraError}</span>
              {!manualMode && (
                <Button 
                  variant="link" 
                  className="text-red-400 underline p-0 h-auto align-baseline ml-1" 
                  onClick={enableManualMode}
                >
                  Select your mood manually instead
                </Button>
              )}
              {analysisAttempts > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  Analysis attempt {analysisAttempts + 1} of 3. {analysisAttempts >= 2 ? "Switching to manual mode." : ""}
                </div>
              )}
            </div>
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
    </div>
  );
}