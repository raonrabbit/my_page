"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Clone } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useModelCache } from "../hooks/useModelCache";

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
  receiveShadow = false,
}: AnimatedPebbleModelProps) => {
  const { pebble } = useModelCache();
  const [isVisible, setIsVisible] = useState(false);

  const meshRef = useRef<THREE.Group>(null);

  const baseScaleRef = useRef<number>(scale);
  const animScaleRef = useRef<number>(0);

  const animRef = useRef<{
    isAnimating: boolean;
    direction: "in" | "out" | null;
    startTime: number;
    timeoutId: number | null;
  }>({
    isAnimating: false,
    direction: null,
    startTime: 0,
    timeoutId: null,
  });

  useEffect(() => {
    baseScaleRef.current = scale;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(baseScaleRef.current * animScaleRef.current);
    }
  }, [scale]);

  useFrame(() => {
    const a = animRef.current;
    if (!a.isAnimating || !meshRef.current) return;

    const elapsed = performance.now() - a.startTime;
    const duration = a.direction === "in" ? 400 : 300;
    const t = Math.min(elapsed / duration, 1);

    const value =
      a.direction === "in" ? t * t * (3 - 2 * t) : 1 - Math.pow(t, 3);

    animScaleRef.current = value;
    meshRef.current.scale.setScalar(baseScaleRef.current * animScaleRef.current);

    if (t >= 1) {
      a.isAnimating = false;
      if (a.direction === "out") {
        setIsVisible(false);
        animScaleRef.current = 0;
        meshRef.current.scale.setScalar(0);
      }
    }
  });

  const startAnimation = useCallback((direction: "in" | "out", wait: number) => {
    const a = animRef.current;

    if (a.timeoutId) {
      clearTimeout(a.timeoutId);
      a.timeoutId = null;
    }

    if (direction === "in") {
      setIsVisible(true);
      animScaleRef.current = 0;
      if (meshRef.current) meshRef.current.scale.setScalar(0);
    }

    const id = window.setTimeout(() => {
      a.isAnimating = true;
      a.direction = direction;
      a.startTime = performance.now();
    }, Math.max(0, wait));

    a.timeoutId = id;
  }, []);

  useEffect(() => {
    if (visible) {
      startAnimation("in", delay);
    } else {
      if (isVisible) {
        startAnimation("out", reverseDelay);
      } else {
        setIsVisible(false);
        animScaleRef.current = 0;
        if (meshRef.current) meshRef.current.scale.setScalar(0);
        animRef.current.isAnimating = false;
        animRef.current.direction = null;
      }
    }
  }, [visible, delay, reverseDelay, isVisible, startAnimation]);

  useEffect(() => {
    return () => {
      const a = animRef.current;
      if (a.timeoutId) clearTimeout(a.timeoutId);
    };
  }, []);

  if (!isVisible && !visible) return null;

  return (
    <Clone
      ref={meshRef}
      object={pebble}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
};
