"use client";

import { useCallback, useEffect, useState } from "react";
import { Clone, CloneProps } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

interface AnimatedModelProps extends CloneProps {
  visible: boolean;
  delay: number;
  reverseDelay: number;
}

export const AnimatedModel = ({ visible, delay, reverseDelay, ...props }: AnimatedModelProps) => {
  const [scale, setScale] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scaleValue = typeof props.scale === "number" ? props.scale : 1;

  const animateIn = useCallback(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 400, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setScale(easeOut);

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
      setScale(1 - easeIn);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
        setScale(0);
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
        setScale(0);
      }
    }
  }, [visible]);

  if (!isVisible && !visible) return null;

  return <Clone {...props} scale={[scaleValue * scale, scaleValue * scale, scaleValue * scale]} />;
};
