"use client";

import { useCallback, useEffect, useState } from "react";
import { Clone, useGLTF } from "@react-three/drei";

interface AnimatedPebbleModelProps {
  visible: boolean;
  delay: number;
  reverseDelay: number;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export const AnimatedPebbleModel = ({ 
  visible, 
  delay, 
  reverseDelay, 
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  castShadow = false,
  receiveShadow = false
}: AnimatedPebbleModelProps) => {
  const { scene } = useGLTF("/models/pebble.glb");
  const [scaleValue, setScaleValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const animateIn = useCallback(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 400, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setScaleValue(easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, []);

  const animateOut = useCallback(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 300, 1);
      const easeIn = Math.pow(progress, 3);
      setScaleValue(1 - easeIn);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
        setScaleValue(0);
      }
    };
    animate();
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        animateIn();
      }, delay);

      return () => clearTimeout(timer);
    } else {
      if (isVisible) {
        const timer = setTimeout(() => {
          animateOut();
        }, reverseDelay);

        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
        setScaleValue(0);
      }
    }
  }, [visible]);

  if (!isVisible && !visible) return null;

  return (
    <Clone
      object={scene}
      position={position}
      scale={[scale * scaleValue, scale * scaleValue, scale * scaleValue]}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
};
