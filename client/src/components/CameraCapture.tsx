import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CameraCapture({ onCapture, onClose, isOpen }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob with compression for 100KB limit
    const compressImage = (quality: number) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Check if file size is under 100KB
          const maxSize = 100 * 1024; // 100KB
          if (blob.size <= maxSize) {
            const file = new File([blob], `plant-photo-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            onCapture(file);
            handleClose();
            setIsCapturing(false);
          } else if (quality > 0.1) {
            // Reduce quality and try again
            compressImage(quality - 0.1);
          } else {
            // Even at lowest quality, still too large - resize canvas
            const scaleFactor = Math.sqrt(maxSize / blob.size);
            const newWidth = Math.floor(canvas.width * scaleFactor);
            const newHeight = Math.floor(canvas.height * scaleFactor);
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Redraw at smaller size
            context.drawImage(video, 0, 0, newWidth, newHeight);
            compressImage(0.8); // Try again with smaller size
          }
        } else {
          setIsCapturing(false);
        }
      }, "image/jpeg", quality);
    };

    // Start compression process
    compressImage(0.9);
  }, [onCapture]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when component opens
  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [isOpen, stream, startCamera, stopCamera]);

  // Update camera when facing mode changes
  useEffect(() => {
    if (isOpen && stream) {
      startCamera();
    }
  }, [facingMode, isOpen, stream, startCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Take Photo</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="close-camera"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="camera-video"
              />
              
              {/* Camera controls overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                {/* Flip camera button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleCamera}
                  disabled={isCapturing}
                  className="bg-white/90 hover:bg-white"
                  data-testid="flip-camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Capture button */}
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="w-16 h-16 rounded-full bg-white border-4 border-green-500 hover:bg-gray-100"
                  data-testid="capture-photo"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full" />
                </Button>
              </div>
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Position your plant in the frame and tap the capture button
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}