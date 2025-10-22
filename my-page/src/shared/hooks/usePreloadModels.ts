"use client";

import { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

export const usePreloadModels = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  
  // 모델 프리로딩
  const pebble = useGLTF("/models/pebble.glb");
  const pebble2 = useGLTF("/models/pebble2.glb");
  
  useEffect(() => {
    const startTime = Date.now();
    const minLoadingTime = 1500; // 최소 1.5초
    
    const checkLoading = () => {
      const elapsed = Date.now() - startTime;
      const modelsLoaded = pebble.scene && pebble2.scene;
      
      if (modelsLoaded && elapsed >= minLoadingTime) {
        setIsLoaded(true);
        setShowLoading(false);
      } else if (modelsLoaded && elapsed < minLoadingTime) {
        // 모델은 로드되었지만 최소 시간이 지나지 않음
        const remainingTime = minLoadingTime - elapsed;
        setTimeout(() => {
          setIsLoaded(true);
          setShowLoading(false);
        }, remainingTime);
      }
    };
    
    checkLoading();
  }, [pebble.scene, pebble2.scene]);
  
  return {
    isLoaded,
    showLoading,
    models: {
      pebble: pebble.scene,
      pebble2: pebble2.scene
    }
  };
};
