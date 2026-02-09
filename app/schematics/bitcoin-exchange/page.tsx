'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const bitcoinApps = [
  { name: 'Bitcoin-Writer', angle: 0, color: '#FF6B6B' },
  { name: 'Bitcoin-Bank', angle: 45, color: '#4ECDC4' },
  { name: 'Bitcoin-Ai', angle: 90, color: '#45B7D1' },
  { name: 'Bitcoin-Cards', angle: 135, color: '#FFA07A' },
  { name: 'Bitcoin-Games', angle: 180, color: '#98D8C8' },
  { name: 'Bitcoin-Market', angle: 225, color: '#F7DC6F' },
  { name: 'Bitcoin-Social', angle: 270, color: '#BB8FCE' },
  { name: 'Bitcoin-Media', angle: 315, color: '#85C1E2' }
];

export default function BitcoinExchangeSchematic() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [wireframeMode, setWireframeMode] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark
  const [isRotating, setIsRotating] = useState(true);
  
  // Check for dark mode on mount
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes to dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x000000 : 0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 30;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Mandala Network - Multiple Exchange Hubs
    const mandalaGroup = new THREE.Group();
    const hubPositions = [
      { x: 0, z: -1.5 },      // Top
      { x: 1.3, z: 0.75 },    // Bottom-right
      { x: -1.3, z: 0.75 },   // Bottom-left
    ];
    
    const hubs: THREE.Mesh[] = [];
    
    // Create three exchange hubs
    hubPositions.forEach((pos, index) => {
      const hubGroup = new THREE.Group();
      
      // Core hub
      const coreGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
      const coreMaterial = new THREE.MeshPhongMaterial({ 
        color: isDarkMode ? 0xcccccc : 0x000000, // Light grey in dark mode, black in light mode
        shininess: 100,
        wireframe: wireframeMode
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(pos.x, 0, pos.z);
      hubGroup.add(core);
      hubs.push(core);

      // Mini turbine blades for each hub
      const bladeCount = 12;
      for (let i = 0; i < bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        const bladeGeometry = new THREE.BoxGeometry(0.05, 0.7, 0.15);
        const bladeMaterial = new THREE.MeshPhongMaterial({ 
          color: isDarkMode ? 0x999999 : 0x1a1a1a, // Medium grey in dark mode
          shininess: 80,
          wireframe: wireframeMode
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.x = pos.x + Math.cos(angle) * 0.6;
        blade.position.z = pos.z + Math.sin(angle) * 0.6;
        blade.rotation.y = angle;
        hubGroup.add(blade);
      }

      // Hub ring
      const ringGeometry = new THREE.TorusGeometry(0.9, 0.08, 8, 32);
      const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: isDarkMode ? 0xaaaaaa : 0x000000, // Light grey in dark mode
        shininess: 100,
        wireframe: wireframeMode
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(pos.x, 0, pos.z);
      hubGroup.add(ring);
      
      mandalaGroup.add(hubGroup);
    });

    // Connect the hubs to each other
    const hubConnections: THREE.Line[] = [];
    for (let i = 0; i < hubPositions.length; i++) {
      for (let j = i + 1; j < hubPositions.length; j++) {
        const points = [
          new THREE.Vector3(hubPositions[i].x, 0, hubPositions[i].z),
          new THREE.Vector3(hubPositions[j].x, 0, hubPositions[j].z)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x000000,
          opacity: 0.2,
          transparent: true,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        hubConnections.push(line);
        mandalaGroup.add(line);
      }
    }

    scene.add(mandalaGroup);

    // Bitcoin Apps as satellites
    const appMeshes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];
    
    bitcoinApps.forEach((app) => {
      const angleRad = (app.angle * Math.PI) / 180;
      const distance = 7;
      
      // App sphere
      const appGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const appMaterial = new THREE.MeshPhongMaterial({ 
        color: app.color,
        shininess: 50,
        wireframe: wireframeMode
      });
      const appMesh = new THREE.Mesh(appGeometry, appMaterial);
      appMesh.position.x = Math.cos(angleRad) * distance;
      appMesh.position.z = Math.sin(angleRad) * distance;
      appMesh.userData = { name: app.name };
      appMeshes.push(appMesh);
      scene.add(appMesh);

      // Find nearest hub
      let nearestHub = hubPositions[0];
      let minDist = Infinity;
      hubPositions.forEach(hub => {
        const dist = Math.sqrt(
          Math.pow(appMesh.position.x - hub.x, 2) + 
          Math.pow(appMesh.position.z - hub.z, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestHub = hub;
        }
      });

      // Connection line to nearest hub
      const points = [
        new THREE.Vector3(nearestHub.x, 0, nearestHub.z),
        new THREE.Vector3(
          Math.cos(angleRad) * distance,
          0,
          Math.sin(angleRad) * distance
        )
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x333333,
        opacity: 0.3,
        transparent: true
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      connections.push(line);
      scene.add(line);

      // App's own exchange (smaller node)
      const exchangeGeometry = new THREE.OctahedronGeometry(0.3, 0);
      const exchangeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a,
        shininess: 100,
        wireframe: wireframeMode
      });
      const exchangeMesh = new THREE.Mesh(exchangeGeometry, exchangeMaterial);
      exchangeMesh.position.x = Math.cos(angleRad) * distance * 0.8;
      exchangeMesh.position.z = Math.sin(angleRad) * distance * 0.8;
      scene.add(exchangeMesh);
    });

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(appMeshes);
      
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        setSelectedApp(clicked.userData.name);
      } else {
        setSelectedApp(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate the mandala network when enabled
      if (isRotating) {
        mandalaGroup.rotation.y += 0.005;
      }
      
      // Pulse app connections
      connections.forEach((line, idx) => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.3 + Math.sin(Date.now() * 0.001 + idx) * 0.2;
      });

      // Hover effect
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(appMeshes);
      
      appMeshes.forEach(mesh => {
        const material = mesh.material as THREE.MeshPhongMaterial;
        if (intersects.length > 0 && intersects[0].object === mesh) {
          mesh.scale.setScalar(1.2);
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveIntensity = 0.3;
        } else {
          mesh.scale.setScalar(1);
          material.emissive = new THREE.Color(0x000000);
          material.emissiveIntensity = 0;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      const mount = mountRef.current;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [wireframeMode, isDarkMode, isRotating]);

  return (
    <div className={`relative w-full h-screen ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-8">
        <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Bitcoin Exchange</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Central Exchange Engine Architecture</p>
      </div>

      {/* Legend - moved down to avoid overlapping title */}
      <div className={`absolute left-8 top-36 p-4 ${isDarkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-sm rounded-xl shadow-lg`} style={{ zIndex: 10 }}>
        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>Bitcoin Apps</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {bitcoinApps.map(app => (
            <div key={app.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: app.color }}
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected App Info */}
      {selectedApp && (
        <div className={`absolute top-0 right-0 p-8 ${isDarkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm rounded-bl-2xl max-w-sm`}>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedApp}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connected to central Bitcoin Exchange via dedicated exchange backend.
            Each app maintains its own specialized exchange for its domain.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 right-0 p-8 flex flex-col items-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isDarkMode 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isRotating 
                ? isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
                : isDarkMode ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRotating ? '⏸ Pause' : '▶️ Rotate'}
          </button>
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {wireframeMode ? '🎨 Solid' : '🕸 Wireframe'}
          </button>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <p>Click apps to view details</p>
          <p>Drag to rotate view</p>
          <p>Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}