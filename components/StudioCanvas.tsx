"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function StudioCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-black" />;
  }

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh scale={2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#8352FD" />
      </mesh>
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  );
}
