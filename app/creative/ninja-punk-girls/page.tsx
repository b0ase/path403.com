'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import Link from 'next/link';
import { FiArrowLeft, FiGrid, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

// Black and white shader
const BlackWhiteShader = {
  uniforms: {
    tDiffuse: { value: null },
    contrast: { value: 1.5 },
    brightness: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float contrast;
    uniform float brightness;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Convert to grayscale
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      // Apply contrast and brightness
      gray = (gray - 0.5) * contrast + 0.5 + brightness;
      
      // Add film grain effect
      float grain = (fract(sin(dot(vUv.xy * 100.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.05;
      gray += grain;
      
      // Clamp values
      gray = clamp(gray, 0.0, 1.0);
      
      gl_FragColor = vec4(vec3(gray), color.a);
    }
  `
};

export default function NinjaPunkGirlsPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const modelsRef = useRef<THREE.Group[]>([]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [currentModel, setCurrentModel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contrast, setContrast] = useState(1.5);
  const [brightness, setBrightness] = useState(0.0);
  const [cameraLocked, setCameraLocked] = useState(true);
  
  // Model paths - you can add multiple GLB files here
  const modelPaths = [
    '/mecha_girl_warrior.glb',
    // Add more model paths as needed
  ];
  
  // Check for dark mode on mount
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes
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
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    
    // Post-processing
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const blackWhitePass = new ShaderPass(BlackWhiteShader);
    blackWhitePass.uniforms.contrast.value = contrast;
    blackWhitePass.uniforms.brightness.value = brightness;
    composer.addPass(blackWhitePass);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 1, 0);
    controls.enabled = !cameraLocked; // Start with controls disabled
    controls.update();
    controlsRef.current = controls;
    
    // Lighting - High contrast for noir effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Key light - strong directional
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    
    // Fill light - softer
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 3, -3);
    scene.add(fillLight);
    
    // Rim light - for edge highlighting
    const rimLight = new THREE.DirectionalLight(0xffffff, 1);
    rimLight.position.set(0, 3, -5);
    scene.add(rimLight);
    
    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.3,
      color: 0x000000 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Load models
    const loader = new GLTFLoader();
    const loadedModels: THREE.Group[] = [];
    
    Promise.all(
      modelPaths.map((path, index) => 
        new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            path,
            (gltf) => {
              const model = gltf.scene;
              
              // Center and scale model
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 3 / maxDim;
              model.scale.setScalar(scale);
              
              model.position.x = -center.x * scale;
              model.position.y = -box.min.y * scale;
              model.position.z = -center.z * scale;
              
              // Enable shadows for all meshes
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  // Enhance materials for better black and white conversion
                  if (child.material) {
                    const material = child.material as THREE.MeshStandardMaterial;
                    material.roughness = 0.7;
                    material.metalness = 0.3;
                  }
                }
              });
              
              // Position models for grid view
              if (viewMode === 'grid') {
                const cols = Math.ceil(Math.sqrt(modelPaths.length));
                const row = Math.floor(index / cols);
                const col = index % cols;
                model.position.x = (col - cols / 2) * 4;
                model.position.z = (row - 1) * 4;
              }
              
              model.visible = viewMode === 'single' ? index === currentModel : true;
              
              resolve(model);
            },
            (progress) => {
              console.log(`Loading model ${index + 1}/${modelPaths.length}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
            },
            (error) => {
              console.error(`Error loading model ${path}:`, error);
              reject(error);
            }
          );
        })
      )
    ).then((models) => {
      models.forEach(model => {
        scene.add(model);
        loadedModels.push(model);
      });
      modelsRef.current = loadedModels;
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load models:', error);
      setIsLoading(false);
    });
    
    // Animation loop
    let animationFrame: number;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      
      controls.update();
      
      // Rotate models slowly
      modelsRef.current.forEach((model, index) => {
        if (viewMode === 'single' && index === currentModel) {
          model.rotation.y += 0.002;
        } else if (viewMode === 'grid') {
          model.rotation.y += 0.002;
        }
      });
      
      // Update shader uniforms
      if (blackWhitePass) {
        blackWhitePass.uniforms.contrast.value = contrast;
        blackWhitePass.uniforms.brightness.value = brightness;
      }
      
      composer.render();
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Handle fullscreen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      handleResize();
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Handle spacebar for camera control
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setCameraLocked(false);
        controls.enabled = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setCameraLocked(true);
        controls.enabled = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
      
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
  }, [isDarkMode, viewMode, currentModel, contrast, brightness, cameraLocked]);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Loading Models...</p>
          </div>
        </div>
      )}
      
      {/* Header - Moved down */}
      <div className="absolute top-20 left-0 right-0 p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            href="/creative" 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
          >
            <FiArrowLeft />
            Back to Creative
          </Link>
          <h1 className={`text-4xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Ninja Punk Girls
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Black & White 3D Character Collection
          </p>
        </div>
        
        {/* View Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
            className={`p-3 rounded-lg backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
            title={viewMode === 'single' ? 'Grid View' : 'Single View'}
          >
            <FiGrid />
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
      
      {/* Controls Panel - Moved up slightly */}
      <div className="absolute bottom-20 left-8 pointer-events-none">
        <div className={`backdrop-blur-md rounded-xl p-6 pointer-events-auto ${
          isDarkMode ? 'bg-black/50' : 'bg-white/50'
        }`}>
          <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Visual Controls
          </h3>
          
          {/* Contrast Slider */}
          <div className="mb-4">
            <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
              Contrast: {contrast.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={contrast}
              onChange={(e) => setContrast(parseFloat(e.target.value))}
              className="w-48"
            />
          </div>
          
          {/* Brightness Slider */}
          <div className="mb-4">
            <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
              Brightness: {brightness.toFixed(2)}
            </label>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.05"
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              className="w-48"
            />
          </div>
          
          {/* Model Selector (for single view) */}
          {viewMode === 'single' && modelPaths.length > 1 && (
            <div>
              <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>
                Model Selection
              </label>
              <div className="flex gap-2">
                {modelPaths.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentModel(index)}
                    className={`px-3 py-1 rounded text-xs transition-all ${
                      currentModel === index
                        ? isDarkMode 
                          ? 'bg-white text-black' 
                          : 'bg-black text-white'
                        : isDarkMode
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-black/20 text-black hover:bg-black/30'
                    }`}
                  >
                    Model {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-20 right-8 pointer-events-none">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className={`${!cameraLocked ? 'text-green-400 font-bold' : ''}`}>
            Hold SPACE to move camera
          </p>
          <p className={`${cameraLocked ? 'opacity-40' : ''}`}>Drag to rotate</p>
          <p className={`${cameraLocked ? 'opacity-40' : ''}`}>Scroll to zoom</p>
          <p className={`${cameraLocked ? 'opacity-40' : ''}`}>Right-click + drag to pan</p>
        </div>
      </div>
      
      {/* Camera Lock Indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className={`px-4 py-2 rounded-full backdrop-blur-md transition-all ${
          cameraLocked 
            ? isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-500/20 text-red-600'
            : isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-500/20 text-green-600'
        }`}>
          <p className="text-sm font-medium">
            {cameraLocked ? '🔒 Camera Locked' : '🔓 Camera Unlocked - Move Freely'}
          </p>
        </div>
      </div>
    </div>
  );
}