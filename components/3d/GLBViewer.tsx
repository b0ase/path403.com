'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Link from 'next/link';
import { FiArrowLeft, FiMaximize2, FiMinimize2, FiRefreshCw } from 'react-icons/fi';

interface GLBViewerProps {
  modelPath: string;
  title: string;
  description?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
  enablePostProcessing?: boolean;
}

export default function GLBViewer({ 
  modelPath, 
  title, 
  description,
  wireframe = false,
  autoRotate = true,
  enablePostProcessing = false
}: GLBViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWireframe, setShowWireframe] = useState(wireframe);
  const [rotation, setRotation] = useState(autoRotate);
  
  // Check for dark mode on mount
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
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
    
    // Detect mobile device and disable 3D rendering to prevent memory leaks
    const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      mount.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, #2563eb 0%, #7c3aed 100%);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          color: white;
        ">
          <div style="
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
          ">${title}</div>
          <div style="
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 16px;
          ">${description || 'Interactive 3D Model'}</div>
          <div style="
            font-size: 12px;
            opacity: 0.7;
          ">Desktop view for full 3D experience</div>
        </div>
      `;
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x000000 : 0xffffff);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 3, 5);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false 
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.autoRotate = rotation;
    controls.autoRotateSpeed = 0.5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 
      isDarkMode ? 0x444444 : 0xcccccc,
      isDarkMode ? 0x222222 : 0xeeeeee
    );
    scene.add(gridHelper);
    
    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.3,
      color: isDarkMode ? 0xffffff : 0x000000
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        
        // Calculate bounding box and center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Scale model to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        model.scale.setScalar(scale);
        
        // Center model at origin
        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale;
        model.position.z = -center.z * scale;
        
        // Set camera position based on model size
        const distance = maxDim * 2;
        camera.position.set(distance, distance * 0.7, distance);
        controls.target.set(0, (size.y * scale) / 2, 0);
        controls.update();
        
        // Apply materials and shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply wireframe if enabled
            if (showWireframe && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.wireframe = true;
                });
              } else {
                child.material.wireframe = true;
              }
            }
          }
        });
        
        scene.add(model);
        setIsLoading(false);
        
        // Log model info
        console.log('Model loaded:', {
          path: modelPath,
          size: size,
          center: center,
          scale: scale,
          animations: gltf.animations.length
        });
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total * 100).toFixed(0);
        console.log(`Loading ${modelPath}: ${percentComplete}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
        setLoadError(`Failed to load model: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    );
    
    // Animation loop
    let animationFrame: number;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      
      controls.autoRotate = rotation;
      controls.update();
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Handle fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      
      // Dispose of geometries and materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [modelPath, isDarkMode, showWireframe, rotation]);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  
  const toggleWireframe = () => {
    setShowWireframe(!showWireframe);
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.wireframe = !showWireframe;
            });
          } else {
            child.material.wireframe = !showWireframe;
          }
        }
      });
    }
  };
  
  return (
    <div className={`relative w-full h-screen ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* 3D Scene */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Loading Model...</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
            <p className="font-bold mb-2">Error Loading Model</p>
            <p className="text-sm">{loadError}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            href="/schematics" 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
          >
            <FiArrowLeft />
            Back to Schematics
          </Link>
          <h1 className={`text-3xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {title}
          </h1>
          {description && (
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setRotation(!rotation)}
            className={`p-3 rounded-lg backdrop-blur-md transition-all ${
              rotation
                ? isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-blue-500/20 text-blue-600'
                : isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
            title="Toggle Auto-Rotate"
          >
            <FiRefreshCw />
          </button>
          <button
            onClick={toggleWireframe}
            className={`p-3 rounded-lg backdrop-blur-md transition-all ${
              showWireframe
                ? isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-blue-500/20 text-blue-600'
                : isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
            title="Toggle Wireframe"
          >
            W
          </button>
          <button
            onClick={toggleFullscreen}
            className={`p-3 rounded-lg backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-8 right-8 pointer-events-none">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Left-click + drag to rotate</p>
          <p>Scroll to zoom</p>
          <p>Right-click + drag to pan</p>
        </div>
      </div>
    </div>
  );
}