import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { gestureState, useStore } from '../store/useStore';
import type { GestureType } from '../store/useStore';

const HandTracker: React.FC = () => {
    if (!gestureState) {
        console.error("gestureState is undefined");
        return null;
    }
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        setLoaded(true);
        startWebcam();
      } catch (error) {
        console.error('Error initializing HandLandmarker:', error);
      }
    };

    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: 1280, // Request higher res for background
              height: 720,
            },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
          }
        } catch (err) {
          console.error('Error accessing webcam:', err);
        }
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current) return;

      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      const startTimeMs = performance.now();
      const results = handLandmarker.detectForVideo(video, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        gestureState.isTracking = true;
        const landmarks = results.landmarks[0];
        
        const dist = (a: any, b: any) => Math.sqrt(
          Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
        );

        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const indexMcp = landmarks[5];
        const middleMcp = landmarks[9];
        const ringMcp = landmarks[13];
        const pinkyMcp = landmarks[17];

        const handSize = dist(wrist, middleMcp);
        const isExtended = (tip: any, mcp: any) => dist(wrist, tip) > dist(wrist, mcp) * 1.2;

        const indexExtended = isExtended(indexTip, indexMcp);
        const middleExtended = isExtended(middleTip, middleMcp);
        const ringExtended = isExtended(ringTip, ringMcp);
        const pinkyExtended = isExtended(pinkyTip, pinkyMcp);

        let detectedType: GestureType = 'none';

        const thumbExtended = isExtended(thumbTip, landmarks[2]); // Check vs MCP
        
        // ILY Gesture (Thumb + Index + Pinky) - triggers "I Love You"
        if (thumbExtended && indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
          detectedType = 'victory'; // Maps to "I Love You" text
        }
        // Middle Finger: Only middle extended, others closed
        else if (!indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
             detectedType = 'middle_finger';
        }
        // Peace Gesture (Index + Middle) - NOW triggers Heart
        else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
             detectedType = 'heart';
        }
        else {
          // Open/Closed checks
          if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
            detectedType = 'open';
          }
          else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            detectedType = 'closed';
          }
        }

        gestureState.type = detectedType;

        const tips = [indexTip, middleTip, ringTip, pinkyTip];
        let totalTipDist = 0;
        for (const tip of tips) totalTipDist += dist(wrist, tip);
        const avgTipDist = totalTipDist / tips.length;
        const normalizedOpenness = (avgTipDist / handSize);
        
        const minRatio = 0.9;
        const maxRatio = 1.9;
        let val = (normalizedOpenness - minRatio) / (maxRatio - minRatio);
        val = Math.max(0, Math.min(1, val));
        
        gestureState.value += (val - gestureState.value) * 0.2;

        const centerX = middleMcp.x;
        const centerY = middleMcp.y;
        const targetRotY = (centerX - 0.5) * Math.PI;
        const targetRotX = (centerY - 0.5) * Math.PI;

        gestureState.rotation.x += (targetRotX - gestureState.rotation.x) * 0.1;
        gestureState.rotation.y += (targetRotY - gestureState.rotation.y) * 0.1;
        
      } else {
        gestureState.isTracking = false;
        gestureState.type = 'none';
        gestureState.rotation.x += (0 - gestureState.rotation.x) * 0.05;
        gestureState.rotation.y += (0 - gestureState.rotation.y) * 0.05;
        gestureState.value += (0.5 - gestureState.value) * 0.05;
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setup();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  const { isCameraMinimized } = useStore();

  return (
    <div className="fixed inset-0 w-full h-full bg-black -z-10">
      <video
        ref={videoRef}
        className={`transition-all duration-500 ease-in-out transform -scale-x-100 ${
          isCameraMinimized 
            ? 'fixed bottom-4 right-4 w-64 h-36 rounded-xl border border-white/20 z-[60] object-cover shadow-2xl opacity-100' 
            : 'absolute inset-0 w-full h-full object-cover opacity-80'
        }`}
        autoPlay
        playsInline
        muted
      />
      {/* Dark overlay to make particles pop */}
      <div className="absolute inset-0 bg-black/40" />
      
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-50">
          <div className="bg-black/80 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
            Initializing AI Camera...
          </div>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
