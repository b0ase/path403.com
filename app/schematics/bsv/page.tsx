'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function BSVSchematic() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ year: 2008, blockSize: '1 MB', tps: '7' });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    // --- 2. Camera ---
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 30, 40);

    // --- 3. Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // --- 4. Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // --- 5. Lights ---
    const ambientLight = new THREE.AmbientLight(0x001133, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 2, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    // --- 6. Blockchain Visualization ---
    const blocks: THREE.Mesh[] = [];
    const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x002244,
      emissive: 0x0044aa,
      emissiveIntensity: 0.5,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });

    const blockCount = 10;
    for (let i = 0; i < blockCount; i++) {
      const block = new THREE.Mesh(baseGeometry, material);
      const edges = new THREE.EdgesGeometry(baseGeometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ffff }));
      block.add(line);
      blocks.push(block);
      scene.add(block);
    }

    // --- 7. Transaction Mesh (Particle System) ---
    const particleCount = 10000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xff8800,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 8. Animation & Scaling Logic ---
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.002; // Time speed

      // Calculate current year: oscillate 2008 to 2025
      const cycle = (Math.sin(frame) + 1) / 2; // 0 to 1
      const year = 2008 + cycle * (2025 - 2008);

      // Data Scaling Logic
      // 2008: 1MB, 2025: 4GB (4096MB)
      const blockSizeMB = 1 + Math.pow(cycle, 4) * 4095;
      const tps = 7 + Math.pow(cycle, 5) * 1100000;

      // Visual Scaling
      const visualScale = 2 + Math.pow(cycle, 2) * 10;

      blocks.forEach((block, i) => {
        block.scale.set(visualScale, visualScale, visualScale);
        block.position.y = (i - blockCount / 2) * (visualScale + 2);
        block.rotation.y += 0.005;
      });

      // Particle speed/density based on TPS
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      const speed = 0.05 + cycle * 0.5;
      const spread = 20 + cycle * 40;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += speed * (Math.random() + 0.5);
        if (positions[i3 + 1] > 50) {
          positions[i3 + 1] = -50;
          positions[i3] = (Math.random() - 0.5) * spread;
          positions[i3 + 2] = (Math.random() - 0.5) * spread;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      particlesMaterial.size = 0.05 + cycle * 0.15;
      particlesMaterial.opacity = 0.3 + cycle * 0.7;

      // Update State (Throttled for React)
      if (Math.floor(frame * 100) % 10 === 0) {
        setStats({
          year: Math.floor(year),
          blockSize: blockSizeMB > 1024 ? `${(blockSizeMB / 1024).toFixed(2)} GB` : `${Math.floor(blockSizeMB)} MB`,
          tps: Math.floor(tps).toLocaleString()
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-white">
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Dynamic Stats UI */}
      <div className="absolute top-0 left-0 p-8 z-10 pointer-events-none w-full bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-start max-w-7xl mx-auto">
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-2 text-white">
              BSV_SCALING
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-zinc-500 text-xs tracking-widest uppercase">Protocol Evolution</span>
              </div>
              <div className="text-cyan-400 font-bold text-xl">
                {stats.year}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-right">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Block Size</div>
              <div className="text-4xl font-bold font-mono text-white">{stats.blockSize}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">TX Per Second</div>
              <div className="text-4xl font-bold font-mono text-orange-500">{stats.tps}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 z-10 max-w-sm">
        <div className="bg-black/80 backdrop-blur border border-zinc-800 p-6 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <h3 className="text-xl font-bold mb-2 uppercase tracking-tight italic">Teranode Phase</h3>
          <p className="text-zinc-400 text-xs leading-relaxed uppercase tracking-wider">
            Visualizing the transition from gigabyte blocks to terabyte capability.
            BSV protocol ensures that the block size ceiling is removed, allowing nodes to handle
            unlimited data for global enterprise utility.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900 z-20">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${((stats.year - 2008) / (2025 - 2008)) * 100}%` }}
        />
      </div>

      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-8">
        {[
          { label: 'Network', value: 'Teranode' },
          { label: 'Status', value: 'Scaling' },
          { label: 'Layer', value: 'L1 Base' },
          { label: 'Efficiency', value: '99.9%' }
        ].map((item) => (
          <div key={item.label} className="text-right">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest leading-none mb-1">{item.label}</div>
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-tighter">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}