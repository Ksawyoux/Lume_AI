import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EmotionType } from '@/types';
import { Camera, X, Check, RefreshCw, Loader2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

interface EmotionReferenceImage {
  id: number;
  userId: number;
  emotion: EmotionType;
  imageData: string;
  description: string | null;
  createdAt: string;
}

export default function EmotionReferenceImageManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('content');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing reference images
  const { data: referenceImages, isLoading: isLoadingImages } = useQuery({
    queryKey: ['/api/emotion-reference-images'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/emotion-reference-images');
      return res.json() as Promise<EmotionReferenceImage[]>;
    }
  });

  // Group images by emotion
  const groupedImages = referenceImages ? 
    referenceImages.reduce((acc, img) => {
      if (!acc[img.emotion]) {
        acc[img.emotion] = [];
      }
      acc[img.emotion].push(img);
      return acc;
    }, {} as Record<EmotionType, EmotionReferenceImage[]>) : {};

  // Create new reference image
  const createMutation = useMutation({
    mutationFn: async (data: { emotion: EmotionType, imageData: string }) => {
      const res = await apiRequest('POST', '/api/emotion-reference-images', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reference image added",
        description: "Your facial expression reference has been saved",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emotion-reference-images'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding reference image",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete reference image
  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest('DELETE', `/api/emotion-reference-images/${imageId}`);
    },
    onSuccess: () => {
      toast({
        title: "Reference image deleted",
        description: "The reference image has been removed",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emotion-reference-images'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting reference image",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize camera
  const startCamera = async () => {
    setCameraError(null);
    
    // Check if navigator.mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access.");
      return;
    }
    
    // Ensure the video element exists
    if (!videoRef.current) {
      setCameraError("Could not initialize camera.");
      return;
    }
    
    try {
      // Camera configuration
      const constraints = { 
        audio: false,
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Update video source and handle playback
      videoRef.current.srcObject = stream;
      
      // Setup event handlers
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(error => {
          setCameraError("Error starting video playback. Please grant camera permissions.");
        });
      };
      
      videoRef.current.onplaying = () => {
        setCameraActive(true);
      };
      
      videoRef.current.onerror = () => {
        setCameraError("Video error: " + (videoRef.current?.error?.message || "Unknown error"));
      };
    } catch (error) {
      console.error("Camera access error:", error);
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError("Camera access denied. Please check your browser permissions.");
        } else if (error.name === 'NotFoundError') {
          setCameraError("No camera found on your device.");
        } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
          setCameraError("Cannot access your camera. It may be in use by another application.");
        } else {
          setCameraError("Camera error: " + error.message);
        }
      } else {
        setCameraError("Could not access camera. Please check your browser permissions.");
      }
    }
  };

  // Stop camera
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

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      try {
        setIsCapturing(true);
        
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
          setCapturedImage(dataUrl);
        }
      } catch (err) {
        console.error("Error capturing video frame:", err);
        setCameraError("Error capturing image: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsCapturing(false);
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Save reference image
  const saveReferenceImage = () => {
    if (capturedImage && selectedEmotion) {
      // Extract base64 data from data URL
      const base64Data = capturedImage.split(',')[1];
      
      // Save to API
      createMutation.mutate({
        emotion: selectedEmotion,
        imageData: base64Data
      });
    }
  };

  // Handle delete image
  const handleDeleteImage = (imageId: number) => {
    if (confirm("Are you sure you want to delete this reference image?")) {
      deleteMutation.mutate(imageId);
    }
  };

  // Open dialog
  const handleOpen = () => {
    setIsOpen(true);
    setCapturedImage(null);
  };

  // Close dialog
  const handleClose = () => {
    setIsOpen(false);
    stopCamera();
    setCapturedImage(null);
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen && !cameraActive && !capturedImage) {
      startCamera();
    }
    
    return () => {
      if (isOpen) {
        stopCamera();
      }
    };
  }, [isOpen]);

  return (
    <>
      <Button 
        onClick={handleOpen} 
        variant="outline" 
        className="mt-4"
      >
        <Camera size={16} className="mr-2" />
        Manage Reference Images
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emotion Reference Images</DialogTitle>
            <DialogDescription>
              Create reference images to help the app recognize your emotions more accurately.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="capture">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="capture">Capture New</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="capture" className="mt-4">
              <div className="space-y-4">
                {capturedImage ? (
                  // Show captured image
                  <div className="relative rounded-md overflow-hidden aspect-video bg-black">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  // Show camera feed
                  <div className="relative rounded-md overflow-hidden aspect-video bg-black">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    
                    {cameraError && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                        <div className="text-center">
                          <AlertCircle size={40} className="text-red-400 mx-auto mb-2" />
                          <p className="text-white text-sm">{cameraError}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-dashed border-[#00f19f] rounded-full w-28 h-28 flex items-center justify-center opacity-70">
                        <div className="text-[#00f19f] text-xs text-center">
                          <Camera size={24} className="mx-auto mb-1" />
                          Center your face
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="space-y-3">
                  <Select 
                    value={selectedEmotion} 
                    onValueChange={(value) => setSelectedEmotion(value as EmotionType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy" className="text-green-400">Happy</SelectItem>
                      <SelectItem value="content" className="text-[#00f19f]">Content</SelectItem>
                      <SelectItem value="neutral" className="text-blue-400">Neutral</SelectItem>
                      <SelectItem value="worried" className="text-yellow-400">Worried</SelectItem>
                      <SelectItem value="stressed" className="text-red-500">Stressed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {capturedImage ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={retakePhoto}
                        className="flex-1"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Retake
                      </Button>
                      <Button 
                        onClick={saveReferenceImage}
                        className="flex-1 bg-[#00f19f] text-black hover:bg-[#00d88a]"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <Check size={16} className="mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={captureImage}
                      disabled={isCapturing || !cameraActive || !!cameraError}
                      className="w-full"
                    >
                      {isCapturing ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Camera size={16} className="mr-2" />
                      )}
                      Capture Image
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-4">
              {isLoadingImages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
              ) : (
                <div className="space-y-6">
                  {['happy', 'content', 'neutral', 'worried', 'stressed'].map((emotion) => (
                    <div key={emotion} className="space-y-2">
                      <h3 className={`text-sm font-medium ${
                        emotion === 'happy' ? 'text-green-400' :
                        emotion === 'content' ? 'text-[#00f19f]' :
                        emotion === 'neutral' ? 'text-blue-400' :
                        emotion === 'worried' ? 'text-yellow-400' :
                        'text-red-500'
                      }`}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </h3>
                      
                      {groupedImages[emotion as EmotionType]?.length ? (
                        <div className="grid grid-cols-3 gap-2">
                          {groupedImages[emotion as EmotionType].map((image) => (
                            <div key={image.id} className="relative group">
                              <img 
                                src={`data:image/jpeg;base64,${image.imageData}`} 
                                alt={`Reference for ${emotion}`}
                                className="w-full h-20 object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md bg-slate-800/50 p-6 flex flex-col items-center justify-center space-y-2">
                          <p className="text-xs text-gray-400">No reference images for {emotion}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              setSelectedEmotion(emotion as EmotionType);
                              document.querySelector('[data-value="capture"]')?.dispatchEvent(
                                new MouseEvent('click', { bubbles: true })
                              );
                            }}
                          >
                            <Plus size={12} className="mr-1" />
                            Add Reference
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}