"use client";

import { useGLTF } from "@react-three/drei";

useGLTF.preload("/models/pebble.glb");
useGLTF.preload("/models/pebble2.glb");

export const useModelCache = () => {
  const pebble = useGLTF("/models/pebble.glb");
  const pebble2 = useGLTF("/models/pebble2.glb");
  
  return {
    pebble: pebble.scene,
    pebble2: pebble2.scene
  };
};
