"use client";

import { Suspense, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { Html, Sky } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { AnimatedPebbleModel } from "./AnimatedPebbleModel";
import { AnimatedPebble2Model } from "./AnimatedPebble2Model";

export default function ThreeScene() {
  const pathname = usePathname();

  return (
    <div id="canvas-container" className="fixed inset-0 -z-10">
      <Canvas
        gl={{ antialias: false }}
        camera={{ position: [0, 5, 15], fov: 35, near: 1, far: 30 }}
        shadows
        style={{
          filter: "blur(1.5px)",
        }}
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[-3, 8, 5]}
          angle={0.5}
          penumbra={1}
          intensity={700}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={30}
          shadow-bias={-0.0001}
        />
        <Effects />
        <Sky />

        <mesh position={[0.5, -1, -1]} rotation={[4.5, 0, 0]} receiveShadow>
          <circleGeometry args={[4, 32]} />
          <meshStandardMaterial transparent opacity={0.2} color="#FFFFFF" />
        </mesh>

        <AnimatedPebbleModel
          position={[0, 0, 0]}
          scale={1.2}
          castShadow
          receiveShadow
          visible={
            pathname === "/about/" ||
            pathname === "/stacks/" ||
            pathname === "/projects/"
          }
          delay={0}
          reverseDelay={600}
        />

        <AnimatedPebble2Model
          position={[0.5, 1, 0]}
          scale={1}
          rotation={[0, Math.PI / 2.2, 0]}
          castShadow
          receiveShadow
          visible={pathname === "/stacks/" || pathname === "/projects/"}
          delay={300}
          reverseDelay={300}
        />

        <AnimatedPebbleModel
          position={[0.5, 2.1, 0]}
          scale={1}
          rotation={[Math.PI, Math.PI * 1.3, 0]}
          castShadow
          receiveShadow
          visible={pathname === "/projects/"}
          delay={600}
          reverseDelay={0}
        />
      </Canvas>
    </div>
  );
}

function Effects() {
  const target = new THREE.Vector3();
  const look = new THREE.Vector3();

  useFrame(({ camera, pointer }, dt) => {
    target.set(pointer.x - 1, 5 + pointer.y, 15 + Math.atan(pointer.x * 2));

    const k = 3;
    const alpha = 1 - Math.exp(-k * dt);

    camera.position.lerp(target, alpha);

    look.set(camera.position.x * 0.9 - 1, 2, 0);
    camera.lookAt(look);
  });

  return (
    <EffectComposer
      stencilBuffer
      enableNormalPass={false}
      autoClear={false}
      multisampling={4}
    >
      <ToneMapping />
      <Noise premultiply opacity={0.4} />
      <Vignette eskil={false} offset={0.1} darkness={0.6} />
    </EffectComposer>
  );
}
