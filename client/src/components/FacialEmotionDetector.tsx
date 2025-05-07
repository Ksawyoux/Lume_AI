import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmotionType } from "@shared/schema";
import { Loader2, CameraOff, Camera, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FacialEmotionDetectorProps {
  onEmotionDetected: (emotion: EmotionType, confidence: number) => void;
}

// Map face-api expressions to our EmotionType
const expressionToEmotionMap: Record<string, EmotionType> = {
  happy: "happy",
  angry: "stressed",
  disgusted: "stressed",
  fearful: "worried",
  sad: "worried",
  surprised: "worried",
  neutral: "neutral"
};

// Helper to determine the dominant emotion from face-api results
const getDominantEmotion = (expressions: faceapi.FaceExpressions): { emotion: EmotionType, confidence: number } => {
  let highestScore = 0;
  let dominantExpression = 'neutral';

  // Find the expression with highest confidence
  Object.entries(expressions).forEach(([expression, score]) => {
    if (score > highestScore) {
      highestScore = score;
      dominantExpression = expression;
    }
  });

  // Map to our emotion types
  let mappedEmotion: EmotionType = expressionToEmotionMap[dominantExpression] || "neutral";
  
  // For happy and neutral, we can map happy to "happy", high neutral to "content"
  if (dominantExpression === "neutral" && highestScore > 0.7) {
    mappedEmotion = "content";
  }

  return { 
    emotion: mappedEmotion, 
    confidence: highestScore
  };
};

export default function FacialEmotionDetector({ onEmotionDetected }: FacialEmotionDetectorProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: EmotionType, confidence: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        
        // The path to the models relative to the public folder
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setIsModelLoading(false);
      }
    };
    
    loadModels();
  }, []);
  
  // Setup face detection
  const handleAnalyzeClick = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current || analyzing) return;
    
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    // Create a progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + 5;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 100);
    
    try {
      // Capture frames over a short period to get a more stable reading
      const emotionReadings: { emotion: EmotionType, confidence: number }[] = [];
      
      // Take 5 readings over 2.5 seconds
      for (let i = 0; i < 5; i++) {
        if (!webcamRef.current?.video) break;
        
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        
        // Make sure video is playing
        if (video.readyState !== 4) continue;
        
        // Detect faces with expressions
        const detections = await faceapi.detectAllFaces(
          video, 
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();
        
        // If we found a face, analyze its emotion
        if (detections.length > 0) {
          const dominantEmotion = getDominantEmotion(detections[0].expressions);
          emotionReadings.push(dominantEmotion);
          
          // Draw face detection results on canvas for visualization
          const displaySize = { width: video.width, height: video.height };
          faceapi.matchDimensions(canvas, displaySize);
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Clear previous drawings
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw detection results
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }
        
        // Wait 500ms before next reading
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Determine the most common emotion
      if (emotionReadings.length > 0) {
        // Count occurrences of each emotion
        const emotionCounts: Record<string, { count: number, totalConfidence: number }> = {};
        
        emotionReadings.forEach(reading => {
          if (!emotionCounts[reading.emotion]) {
            emotionCounts[reading.emotion] = { count: 0, totalConfidence: 0 };
          }
          emotionCounts[reading.emotion].count += 1;
          emotionCounts[reading.emotion].totalConfidence += reading.confidence;
        });
        
        // Find the most common emotion
        let maxCount = 0;
        let dominantEmotion: EmotionType = "neutral";
        let avgConfidence = 0;
        
        Object.entries(emotionCounts).forEach(([emotion, data]) => {
          if (data.count > maxCount) {
            maxCount = data.count;
            dominantEmotion = emotion as EmotionType;
            avgConfidence = data.totalConfidence / data.count;
          }
        });
        
        const result = { emotion: dominantEmotion, confidence: avgConfidence };
        setDetectedEmotion(result);
        onEmotionDetected(result.emotion, result.confidence);
      }
      
      setAnalysisProgress(100);
    } catch (error) {
      console.error('Error during face analysis:', error);
    } finally {
      clearInterval(progressInterval);
      setAnalyzing(false);
    }
  }, [analyzing, onEmotionDetected]);
  
  const toggleCamera = () => {
    setCameraActive(prev => !prev);
  };
  
  const getEmotionDisplayName = (emotion: EmotionType): string => {
    const displayNames: Record<EmotionType, string> = {
      stressed: "Stressed",
      worried: "Worried",
      neutral: "Neutral",
      content: "Content",
      happy: "Happy"
    };
    return displayNames[emotion] || emotion;
  };
  
  const getEmotionColor = (emotion: EmotionType): string => {
    const colors: Record<EmotionType, string> = {
      stressed: "text-red-500",
      worried: "text-amber-500",
      neutral: "text-blue-500",
      content: "text-emerald-500",
      happy: "text-green-500"
    };
    return colors[emotion] || "";
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Facial Emotion Analysis</CardTitle>
        <CardDescription>
          Analyze your facial expressions to detect your current emotional state
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="relative mb-4 aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
          {isModelLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-400">Loading emotion detection models...</p>
            </div>
          ) : cameraActive ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute top-0 left-0 w-full h-full object-cover"
                videoConstraints={{
                  facingMode: "user",
                  aspectRatio: 16/9
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              
              {analyzing && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <CameraOff className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">Camera is turned off</p>
            </div>
          )}
        </div>
        
        {detectedEmotion && (
          <div className="mb-4 p-3 bg-gray-900 rounded-md">
            <p className="text-sm text-gray-400 mb-1">Detected emotion:</p>
            <div className="flex items-center">
              <span className={`text-xl font-semibold ${getEmotionColor(detectedEmotion.emotion)}`}>
                {getEmotionDisplayName(detectedEmotion.emotion)}
              </span>
              <span className="ml-auto text-sm text-gray-400">
                {Math.round(detectedEmotion.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={toggleCamera}
          disabled={isModelLoading}
        >
          {cameraActive ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              Turn Off Camera
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Turn On Camera
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleAnalyzeClick}
          disabled={!cameraActive || isModelLoading || analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze Emotion
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}