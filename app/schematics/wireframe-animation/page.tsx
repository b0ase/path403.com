'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function WireframeAnimationSchematic() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [colorMode, setColorMode] = useState<'white' | 'red'>('red');
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Create wireframe geometry
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const edges = new THREE.EdgesGeometry(geometry);
    
    // Material based on color mode
    const getMaterial = (mode: 'white' | 'red') => {
      return new THREE.LineBasicMaterial({
        color: mode === 'red' ? 0xff3333 : 0xffffff,
        transparent: true,
        opacity: 0.8
      });
    };

    const wireframe = new THREE.LineSegments(edges, getMaterial(colorMode));
    scene.add(wireframe);

    // Create inner core
    const coreGeometry = new THREE.SphereGeometry(0.5, 8, 6);
    const coreEdges = new THREE.EdgesGeometry(coreGeometry);
    const core = new THREE.LineSegments(coreEdges, getMaterial(colorMode));
    scene.add(core);

    // Create orbiting elements
    const orbitGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const orbitGeometry = new THREE.RingGeometry(1 + i * 0.5, 1.1 + i * 0.5, 16);
      const orbitEdges = new THREE.EdgesGeometry(orbitGeometry);
      const orbit = new THREE.LineSegments(orbitEdges, getMaterial(colorMode));
      orbit.rotation.x = (Math.PI / 4) * i;
      orbit.rotation.y = (Math.PI / 3) * i;
      orbitGroup.add(orbit);
    }
    scene.add(orbitGroup);

    // Particle field
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: colorMode === 'red' ? 0xff3333 : 0xffffff,
      size: 0.02,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isPlaying) {
        time += 0.005 * animationSpeed;
        
        // Rotate main wireframe
        wireframe.rotation.x = time;
        wireframe.rotation.y = time * 0.7;
        
        // Counter-rotate core
        core.rotation.x = -time * 1.5;
        core.rotation.y = time * 1.2;
        
        // Animate orbits
        orbitGroup.rotation.z = time * 0.5;
        orbitGroup.children.forEach((orbit, index) => {
          orbit.rotation.z = time * (1 + index * 0.3);
        });
        
        // Animate particles
        particles.rotation.y = time * 0.1;
        particles.rotation.x = time * 0.05;
        
        // Pulsing effect
        const scale = 1 + Math.sin(time * 2) * 0.1;
        wireframe.scale.setScalar(scale);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Update materials when color mode changes
    const updateMaterials = () => {
      const newMaterial = getMaterial(colorMode);
      wireframe.material = newMaterial;
      core.material = newMaterial;
      orbitGroup.children.forEach((orbit) => {
        (orbit as THREE.LineSegments).material = newMaterial;
      });
      particles.material = new THREE.PointsMaterial({
        color: colorMode === 'red' ? 0xff3333 : 0xffffff,
        size: 0.02,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
      });
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Update materials when colorMode changes
    updateMaterials();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colorMode, animationSpeed, isPlaying]);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">Wireframe Animation</h1>
        <p className="text-gray-400">Interactive Geometric Visualization</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 p-8 bg-black/80 backdrop-blur-sm rounded-tr-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Animation Controls</h3>
        
        {/* Play/Pause */}
        <div className="mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              isPlaying 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Color Mode */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Color Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setColorMode('red')}
              className={`px-3 py-1 rounded text-xs transition-all ${
                colorMode === 'red' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => setColorMode('white')}
              className={`px-3 py-1 rounded text-xs transition-all ${
                colorMode === 'white' 
                  ? 'bg-white text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              White
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Speed: {animationSpeed}x</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full accent-red-600"
          />
        </div>
      </div>

      {/* Info */}
      <div className="absolute top-0 right-0 p-8 bg-black/80 backdrop-blur-sm rounded-bl-2xl max-w-sm">
        <h3 className="text-xl font-bold text-white mb-2">Components</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Icosahedral wireframe geometry</li>
          <li>• Rotating orbital rings</li>
          <li>• Central core sphere</li>
          <li>• Particle field background</li>
          <li>• Synchronized animations</li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 right-0 p-8">
        <div className="text-sm text-gray-500">
          <p>Drag to rotate view</p>
          <p>Scroll to zoom</p>
          <p>Pan with right click</p>
        </div>
      </div>
    </div>
  );
}