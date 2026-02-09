'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';
import type { ColorTheme } from '@/components/ThemePicker';

// Color theme configurations for Three.js
// colorTheme controls background color (black, white, red, green, blue, yellow)
// colorIntense toggles between white and black wireframes for all themes
const THEME_COLORS = {
  black: {
    background: 0x000000,
  },
  white: {
    background: 0xffffff,
  },
  yellow: {
    background: 0xfbbf24,
  },
  red: {
    background: 0xef4444,
  },
  green: {
    background: 0x22c55e,
  },
  blue: {
    background: 0x3b82f6,
  }
};

interface WireframeAnimationProps {
  isDark?: boolean;
  structured?: boolean;
  colorIntense?: boolean;
  isHovered?: boolean;
  zoomLevel?: number;
  modelType?: 'wireframe' | 'gundam' | 'both';
  onZoomChange?: (newZoom: number) => void;
  modelRotation?: number;
  modelFloatY?: number;
  modelJudderX?: number;
  modelJudderZ?: number;
  shadeLevel?: number;
  colorTheme?: ColorTheme;
  minimalMode?: boolean; // Skip bloom, satellites, env maps for better performance
}

// Wireframe Animation Component
export default function WireframeAnimation({
  isDark = true,
  structured = false,
  colorIntense = false,
  isHovered = false,
  zoomLevel = 50,
  modelType = 'wireframe',
  onZoomChange,
  modelRotation = 0,
  modelFloatY = 0,
  modelJudderX = 0,
  modelJudderZ = 0,
  shadeLevel = 2,
  colorTheme = 'black',
  minimalMode = true // Default to minimal for better performance
}: WireframeAnimationProps) {
  // Get colors based on theme
  const themeColors = THEME_COLORS[colorTheme] || THEME_COLORS.black;

  // Helper to get background color
  const getBackgroundColor = () => {
    return themeColors.background as number;
  };

  // Helper to get element colors (stars, wireframes, accent)
  // colorIntense toggles wireframe to red/orange glow in all themes
  // For black theme with shadeLevel > 0, use golden wireframes
  const getElementColor = (element: 'stars' | 'wireframe' | 'accent') => {
    // 1. Black Theme
    if (colorTheme === 'black') {
      if (colorIntense) {
        // Vibrant/Classic: White wireframes on black (the original look)
        if (element === 'wireframe') return 0xffffff; // White
        if (element === 'accent') return 0xf0f0f0;    // Light gray
        if (element === 'stars') return 0xffffff;     // White
      } else {
        // Subtle: Red/Orange accent
        if (element === 'wireframe') return 0xdc2626; // Red
        if (element === 'accent') return 0xf59e0b;    // Orange
        if (element === 'stars') return 0xffffff;     // White
      }
      return 0xffffff;
    }

    // 2. Vibrant Mode for Colored Themes
    if (colorIntense) {
      if (colorTheme === 'blue') {
        if (element === 'wireframe') return 0x00ffff; // Cyan
        if (element === 'accent') return 0x0088ff;    // Sky Blue
        return 0x00ffff; // Stars
      }
      if (colorTheme === 'green') {
        if (element === 'wireframe') return 0x00ff00; // Neon Green
        if (element === 'accent') return 0x00cc00;    // Matrix Green
        return 0x00ff00;
      }
      if (colorTheme === 'red') {
        if (element === 'wireframe') return 0xff3333; // Bright Red
        if (element === 'accent') return 0xff0000;    // Deep Red
        return 0xff5555;
      }
      if (colorTheme === 'yellow') {
        if (element === 'wireframe') return 0x000000; // Black on Yellow (high contrast) or Bright Orange?
        // User wants "vibrant". Yellow bg usually needs dark contrast or very distinct color.
        // Let's use darker Orange/Red for vibrant yellow theme to stand out?
        // Or actually, vibrant usually means "glowing". Glowing yellow on yellow is invisible.
        // Maybe Purple or Blue for contrast?
        // Let's stick to "matching" color. A darker burnt orange works.
        if (element === 'wireframe') return 0xff4400; // Red-Orange
        if (element === 'accent') return 0xff8800;
        return 0xff4400;
      }
      if (colorTheme === 'white') {
        // Vibrant on white -> Cyberpunk pink/purple or Blue?
        if (element === 'wireframe') return 0xec4899; // Pink
        if (element === 'accent') return 0x8b5cf6;    // Violet
        return 0xec4899;
      }
    }

    // 3. Subtle Mode Defaults
    // Dark backgrounds (red, blue, green) get white wireframes
    if (colorTheme === 'red' || colorTheme === 'blue' || colorTheme === 'green') return 0xffffff;

    // Light backgrounds (white, yellow) get black wireframes
    return 0x000000;
  };

  const mountRef = useRef<HTMLDivElement>(null);
  const { audioData, isAnalyzing } = usePersistentMusic();
  const isHoveredRef = useRef(isHovered);
  const zoomLevelRef = useRef(zoomLevel);
  const isMobileRef = useRef(false);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const isPausedRef = useRef(false);
  const isDevMode = process.env.NODE_ENV === 'development';
  const savedCameraState = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  } | null>(null);

  // Pause animation when tab is not visible (major performance optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Update the refs when props change
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;

    // When zoom slider changes and 3D control is active, update camera position
    if (isHovered && controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      const camera = cameraRef.current;

      // Calculate target distance based on zoom level
      const minDist = controls.minDistance || 20;
      const maxDist = controls.maxDistance || 150;
      const normalizedZoom = (zoomLevel - 10) / 190; // 0 to 1
      const targetDistance = maxDist - (normalizedZoom * (maxDist - minDist));

      // Update camera position
      const direction = camera.position.clone().normalize();
      camera.position.copy(direction.multiplyScalar(targetDistance));
      controls.update();
    }
  }, [zoomLevel, isHovered]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing content first
    mountRef.current.innerHTML = '';

    // Detect mobile device
    isMobileRef.current = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // ========== MINIMAL MODE: Ultra-lightweight static wireframe ==========
    if (minimalMode) {
      const scene = new THREE.Scene();
      const bgColor = getBackgroundColor();
      scene.background = new THREE.Color(bgColor);

      const camera = new THREE.PerspectiveCamera(
        60,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        500
      );
      camera.position.set(0, 0, 50);

      const renderer = new THREE.WebGLRenderer({
        antialias: false, // Disable AA for performance
        powerPreference: "low-power",
        alpha: false
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(1); // Force 1x pixel ratio for performance
      mountRef.current.appendChild(renderer.domElement);

      // Simple wireframe sphere - detail level 2 (much simpler than 5)
      const geometry = new THREE.IcosahedronGeometry(25, 2);
      const wireColor = getElementColor('wireframe');
      const material = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Minimal star field - just 100 stars
      const starCount = 100;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = THREE.MathUtils.randFloatSpread(150);
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: getElementColor('stars'),
        size: 0.1,
        transparent: true,
        opacity: 0.5
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // Very simple animation - just slow rotation, 15 FPS
      let lastTime = 0;
      const frameInterval = 1000 / 15; // 15 FPS

      const animate = (currentTime: number = 0) => {
        if (isPausedRef.current) {
          requestAnimationFrame(animate);
          return;
        }

        if (currentTime - lastTime < frameInterval) {
          requestAnimationFrame(animate);
          return;
        }
        lastTime = currentTime;

        mesh.rotation.y += 0.002;
        mesh.rotation.x += 0.0005;
        stars.rotation.y += 0.0001;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      // Simple resize handler
      const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
      };
    }

    // ========== FULL MODE: Complex animation with all features ==========

    // Save current camera state before clearing
    if (controlsRef.current && cameraRef.current) {
      savedCameraState.current = {
        position: cameraRef.current.position.clone(),
        target: controlsRef.current.target.clone(),
        zoom: cameraRef.current.zoom
      };
    }

    // If modelType is gundam or both, load the dedicated Gundam schematic instead
    if (modelType === 'gundam' || modelType === 'both') {
      // Clear any existing content
      mountRef.current.innerHTML = '';

      // Create Gundam schematic scene (based on /schematics/gundam)
      const scene = new THREE.Scene();
      const bgColor = getBackgroundColor();
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.Fog(bgColor, 20, 100);

      const camera = new THREE.PerspectiveCamera(
        45,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(25, 15, 35);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1.0;
      mountRef.current.appendChild(renderer.domElement);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 5;
      controls.maxDistance = 50;
      controls.target.set(0, 5, 0);
      controls.enabled = isHovered;
      controls.autoRotate = !isHovered;
      controls.autoRotateSpeed = 0.5;
      controls.update();

      // Store controls and camera in refs for external control
      controlsRef.current = controls;
      cameraRef.current = camera;

      // Add change listener to sync zoom with parent
      controls.addEventListener('change', () => {
        if (isHovered && onZoomChange) {
          const distance = camera.position.distanceTo(controls.target);
          // Convert distance to zoom level (5-50 distance to 10-200 zoom)
          const normalizedDistance = (distance - 5) / (50 - 5);
          const newZoomLevel = 200 - (normalizedDistance * 190);
          onZoomChange(Math.max(10, Math.min(200, newZoomLevel)));
        }
      });

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = false;
      scene.add(directionalLight);

      // Load the actual Gundam GLB model
      const loader = new GLTFLoader();
      let gundamModel: THREE.Group | null = null;

      // Create wireframe material for the loaded model with color intensity support
      const getGundamColor = () => {
        // Use the theme's wireframe color
        return getElementColor('wireframe');
      };

      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: getGundamColor(),
        wireframe: true
      });

      loader.load(
        '/gundam_mecha.glb',
        (gltf) => {
          gundamModel = gltf.scene;

          // Apply wireframe material to all meshes
          gundamModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = wireframeMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Scale and position the model appropriately
          gundamModel.scale.setScalar(0.1); // Start with an even smaller base scale
          gundamModel.position.y = -2; // Ground it properly
          gundamModel.position.x = 0;
          gundamModel.position.z = 0;

          scene.add(gundamModel);
        },
        (progress) => {
          console.log('Loading Gundam model:', (progress.loaded / progress.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading Gundam model:', error);

          // Fallback: create a simple placeholder if GLB fails to load
          const fallbackGeometry = new THREE.BoxGeometry(4, 8, 2);
          const fallbackColor = colorIntense ? 0xff6b35 : (['black', 'red', 'blue', 'green'].includes(colorTheme) ? 0xffffff : 0x000000);
          const fallbackMaterial = new THREE.MeshBasicMaterial({
            color: fallbackColor,
            wireframe: true
          });
          const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
          fallbackMesh.position.y = 4;
          scene.add(fallbackMesh);
        }
      );

      // Animation loop with frame rate limiting for mobile and dev mode
      let lastTime = 0;
      const targetFPS = isMobileRef.current ? 15 : (isDevMode ? 30 : 60); // Lower FPS on mobile and dev
      const frameInterval = 1000 / targetFPS;

      const animate = (currentTime: number = 0) => {
        requestAnimationFrame(animate);

        // Skip rendering when tab is hidden (major perf optimization)
        if (isPausedRef.current) return;

        // Frame rate limiting
        if (currentTime - lastTime < frameInterval) return;
        lastTime = currentTime;

        controls.update();

        // Apply zoom level to Gundam model scale and update colors
        if (gundamModel) {
          const zoomFactor = (zoomLevel - 10) / 190; // 0 to 1 (10 is min zoom, 200 is max zoom)
          const baseScale = 0.1; // Even smaller base scale
          const minScale = baseScale * 0.5; // 50% of base size at minimum zoom (0.05)
          const maxScale = baseScale * 20; // 2000% of base size at maximum zoom (2.0)
          const currentScale = minScale + (zoomFactor * (maxScale - minScale));
          gundamModel.scale.setScalar(currentScale);

          // Update Gundam wireframe color based on colorIntense
          const gundamColor = colorIntense ? 0xff6b35 : (['black', 'red', 'blue', 'green'].includes(colorTheme) ? 0xffffff : 0x000000);

          gundamModel.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.color.setHex(gundamColor);
            }
          });
        }

        // Music-reactive Gundam animations
        if (gundamModel) {
          // Apply passed-in rotation
          gundamModel.rotation.y = modelRotation * Math.PI / 180;

          // Apply floating effect
          gundamModel.position.y = 4 + modelFloatY;

          // Apply judder effect
          gundamModel.position.x = modelJudderX;
          gundamModel.position.z = modelJudderZ;

          // Bass-reactive scaling (pulse effect)
          if (isAnalyzing && audioData.bassNorm > 0.1) {
            const bassScale = 1 + (audioData.bassNorm * 0.2); // 0-20% scale increase
            const zoomFactor = (zoomLevel - 10) / 190;
            const baseScale = 0.1;
            const minScale = baseScale * 0.5;
            const maxScale = baseScale * 20;
            const currentScale = (minScale + (zoomFactor * (maxScale - minScale))) * bassScale;
            gundamModel.scale.setScalar(currentScale);
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      // Cleanup
      return () => {
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.clear();
      };
    }

    // Original wireframe animation for other models...

    // Scene setup
    const scene = new THREE.Scene();
    const bgColor = getBackgroundColor();
    scene.background = new THREE.Color(bgColor);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1200
    );
    camera.position.set(0, -5, 50);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    // Reduce pixel ratio on mobile to prevent crashes
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(bgColor, 1.0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for mouse and touch interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI;
    controls.enabled = isHovered;
    controls.enablePan = false;
    controls.enableZoom = isHovered;
    controls.enableRotate = isHovered;
    controls.zoomSpeed = 2.0;
    controls.rotateSpeed = 2.0;
    controls.panSpeed = 2.0;
    controls.autoRotate = !isHovered;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0, 0);
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE
    };

    // Store controls and camera in refs for external control
    controlsRef.current = controls;
    cameraRef.current = camera;

    // Add change listener to sync zoom with parent
    controls.addEventListener('change', () => {
      if (isHovered && onZoomChange) {
        const distance = camera.position.distanceTo(controls.target);
        const normalizedDistance = (distance - 20) / (150 - 20);
        const newZoomLevel = 200 - (normalizedDistance * 190);
        onZoomChange(Math.max(10, Math.min(200, newZoomLevel)));
      }
    });

    // Restore saved camera state if it exists
    if (savedCameraState.current) {
      camera.position.copy(savedCameraState.current.position);
      controls.target.copy(savedCameraState.current.target);
      camera.zoom = savedCameraState.current.zoom;
      camera.updateProjectionMatrix();
    }

    controls.update();

    // === CREATIVE EFFECTS (only when not in minimal mode) ===
    let composer: EffectComposer | null = null;
    const satellites: THREE.Mesh[] = [];
    const isBlackMode = colorTheme === 'black';

    if (!minimalMode) {
      // Post-processing with bloom for that sci-fi glow
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
        isBlackMode ? 0.8 : 0.3,  // strength - more bloom in black mode
        0.4,  // radius
        isBlackMode ? 0.7 : 0.85  // threshold - lower = more bloom
      );
      composer.addPass(bloomPass);

      // Procedural environment map for reflections (creates a gradient cubemap)
      const envScene = new THREE.Scene();
      const envCamera = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(256));

      // Create gradient sphere for environment
      const gradientMaterial = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color(isBlackMode ? 0x111122 : 0x8888ff) },
          bottomColor: { value: new THREE.Color(isBlackMode ? 0x000000 : 0xffffff) },
          horizonColor: { value: new THREE.Color(isBlackMode ? 0x222244 : 0xaaaaff) },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform vec3 horizonColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            vec3 color = mix(bottomColor, horizonColor, smoothstep(-0.2, 0.0, h));
            color = mix(color, topColor, smoothstep(0.0, 0.5, h));
            gl_FragColor = vec4(color, 1.0);
          }
        `
      });
      const envSphere = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), gradientMaterial);
      envScene.add(envSphere);
      envCamera.position.set(0, 0, 0);
      envCamera.update(renderer, envScene);
      scene.environment = envCamera.renderTarget.texture;

      // Orbiting satellite shapes
      const satelliteCount = 5;
      const satelliteGeometries = [
        new THREE.OctahedronGeometry(1.5, 0),
        new THREE.TetrahedronGeometry(1.8, 0),
        new THREE.IcosahedronGeometry(1.2, 0),
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.TorusGeometry(1.2, 0.4, 8, 16),
      ];

      for (let i = 0; i < satelliteCount; i++) {
        const geo = satelliteGeometries[i % satelliteGeometries.length];
        // Satellite color respects colorIntense toggle
        let satelliteColor: number;
        if (colorIntense) {
          satelliteColor = 0xf59e0b; // Orange/amber when intense
        } else if (colorTheme === 'black') {
          satelliteColor = 0x222222;
        } else if (colorTheme === 'white') {
          satelliteColor = 0xdddddd;
        } else {
          satelliteColor = getElementColor('wireframe');
        }
        const mat = new THREE.MeshStandardMaterial({
          color: satelliteColor,
          metalness: 0.9,
          roughness: 0.1,
          envMapIntensity: 1.5,
        });
        const satellite = new THREE.Mesh(geo, mat);
        satellite.userData = {
          orbitRadius: 35 + i * 8,
          orbitSpeed: 0.2 + Math.random() * 0.3,
          orbitOffset: (Math.PI * 2 * i) / satelliteCount,
          verticalOffset: Math.sin(i * 1.5) * 10,
          rotationSpeed: new THREE.Vector3(
            Math.random() * 0.02,
            Math.random() * 0.02,
            Math.random() * 0.02
          ),
        };
        satellites.push(satellite);
        scene.add(satellite);
      }
    }

    // === END CREATIVE EFFECTS ===

    // Star field background with inverted colors - significantly reduced density
    const starCount = isMobile ? 300 : 800;
    const starColor = getElementColor('stars');
    const starField = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position',
        new THREE.Float32BufferAttribute(Array.from({ length: starCount * 3 }, () => THREE.MathUtils.randFloatSpread(200)), 3)
      ),
      new THREE.PointsMaterial({
        color: starColor,
        size: isDark ? 0.08 : 0.12,
        sizeAttenuation: true,
        depthWrite: false,
        transparent: true,
        opacity: isDark ? (colorIntense ? 0.8 : 0.6) : (colorIntense ? 0.9 : 0.7),
        // Use normal blending for light mode so stars are visible on white
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      })
    );
    scene.add(starField);

    // Color palettes - use theme colors
    const getColorPalettes = () => {
      const wireColor = new THREE.Color(getElementColor('wireframe'));
      const accentColor = new THREE.Color(getElementColor('accent'));
      const starsColor = new THREE.Color(getElementColor('stars'));

      // Create variations for visual interest
      return [
        [wireColor, wireColor.clone().multiplyScalar(0.95), wireColor.clone().multiplyScalar(0.9), accentColor],
        [accentColor, wireColor, starsColor, wireColor.clone().multiplyScalar(0.85)]
      ];
    };
    const colorPalettes = getColorPalettes();

    let activePaletteIndex = 1;

    let morphableGeometries: {
      sphereNodePositions: number[];
      starNodePositions: number[];
      sphereConnectionPositions: Float32Array;
      starConnectionPositions: Float32Array;
      sphereGeometry: THREE.IcosahedronGeometry;
    };
    let nodesMesh: THREE.Points, connectionsMesh: THREE.LineSegments;
    let solidMesh: THREE.Mesh | null = null;

    // Add lighting for shaded mode
    if (shadeLevel > 0) {
      const isBlackMode = colorTheme === 'black';

      const ambientLight = new THREE.AmbientLight(0xffffff, isBlackMode ? 0.1 : 0.4);
      scene.add(ambientLight);

      // Key light from above-front
      const keyLight = new THREE.DirectionalLight(0xffffff, isBlackMode ? 1.2 : 0.8);
      keyLight.position.set(0, 50, 50);
      scene.add(keyLight);

      // For black mode: strong rim lights to show the glossy edges
      if (isBlackMode) {
        const rimLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight1.position.set(-50, 0, -30);
        scene.add(rimLight1);

        const rimLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        rimLight2.position.set(50, -20, -20);
        scene.add(rimLight2);
      } else {
        // Soft fill for other modes
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(0, -30, 30);
        scene.add(fillLight);
      }
    }

    function createMorphableGeometries() {
      const scale = 25;
      const baseGeometry = new THREE.IcosahedronGeometry(scale, 5);

      const sphereVertices: THREE.Vector3[] = [];
      const spherePositions = baseGeometry.attributes.position.array;

      const uniqueVerticesMap = new Map();
      for (let i = 0; i < spherePositions.length; i += 3) {
        const key = `${spherePositions[i].toFixed(3)},${spherePositions[i + 1].toFixed(3)},${spherePositions[i + 2].toFixed(3)}`;
        if (!uniqueVerticesMap.has(key)) {
          const vertex = new THREE.Vector3(spherePositions[i], spherePositions[i + 1], spherePositions[i + 2]);
          uniqueVerticesMap.set(key, vertex);
          sphereVertices.push(vertex);
        }
      }

      const starVertices = sphereVertices.map(v => {
        const v_clone = v.clone();
        const spherical = new THREE.Spherical().setFromVector3(v_clone);
        const spikeFactor = 0.4 * Math.sin(spherical.phi * 6) * Math.sin(spherical.theta * 6);
        spherical.radius *= 1 + spikeFactor;
        return new THREE.Vector3().setFromSpherical(spherical);
      });

      const edgeGeometry = new THREE.EdgesGeometry(baseGeometry, 1);
      const sphereConnectionPositions = edgeGeometry.attributes.position.array as Float32Array;
      const starConnectionPositions = new Float32Array(sphereConnectionPositions.length);

      const tempVec = new THREE.Vector3();
      for (let i = 0; i < sphereConnectionPositions.length; i += 3) {
        tempVec.set(sphereConnectionPositions[i], sphereConnectionPositions[i + 1], sphereConnectionPositions[i + 2]);
        const spherical = new THREE.Spherical().setFromVector3(tempVec);
        const spikeFactor = 0.4 * Math.sin(spherical.phi * 6) * Math.sin(spherical.theta * 6);
        spherical.radius *= 1 + spikeFactor;
        tempVec.setFromSpherical(spherical);
        starConnectionPositions[i] = tempVec.x;
        starConnectionPositions[i + 1] = tempVec.y;
        starConnectionPositions[i + 2] = tempVec.z;
      }

      morphableGeometries = {
        sphereNodePositions: sphereVertices.flatMap(v => [v.x, v.y, v.z]),
        starNodePositions: starVertices.flatMap(v => [v.x, v.y, v.z]),
        sphereConnectionPositions,
        starConnectionPositions,
        sphereGeometry: baseGeometry
      };
    }

    function createVisualization() {
      if (nodesMesh) scene.remove(nodesMesh);
      if (connectionsMesh) scene.remove(connectionsMesh);

      const palette = colorPalettes[activePaletteIndex];

      const nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(morphableGeometries.sphereNodePositions, 3));
      nodeGeometry.morphAttributes.position = [new THREE.Float32BufferAttribute(morphableGeometries.starNodePositions, 3)];
      nodeGeometry.computeBoundingSphere();

      const nodeColors = new Float32Array(morphableGeometries.sphereNodePositions.length);
      for (let i = 0; i < morphableGeometries.sphereNodePositions.length / 3; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const glowIntensity = colorIntense ? 1.3 : 1.1;
        nodeColors[i * 3] = Math.min(1.0, color.r * glowIntensity);
        nodeColors[i * 3 + 1] = Math.min(1.0, color.g * glowIntensity);
        nodeColors[i * 3 + 2] = Math.min(1.0, color.b * glowIntensity);
      }
      nodeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nodeColors, 3));

      const nodeMaterial = new THREE.PointsMaterial({
        size: 0.2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.8 : 0.9,
        depthWrite: false,
        // Additive blending only works on dark backgrounds - use normal blending for light
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        alphaTest: 0.1
      });

      nodesMesh = new THREE.Points(nodeGeometry, nodeMaterial);
      if (!nodesMesh.morphTargetInfluences) {
        nodesMesh.morphTargetInfluences = [0];
      }
      scene.add(nodesMesh);

      const connectionGeometry = new THREE.BufferGeometry();
      connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(morphableGeometries.sphereConnectionPositions, 3));
      connectionGeometry.morphAttributes.position = [new THREE.Float32BufferAttribute(morphableGeometries.starConnectionPositions, 3)];
      connectionGeometry.computeBoundingSphere();

      const connectionColors: number[] = [];
      for (let i = 0; i < morphableGeometries.sphereConnectionPositions.length / 6; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const glowIntensity = colorIntense ? 1.2 : 1.05;
        const r = Math.min(1.0, color.r * glowIntensity);
        const g = Math.min(1.0, color.g * glowIntensity);
        const b = Math.min(1.0, color.b * glowIntensity);
        connectionColors.push(r, g, b, r, g, b);
      }
      connectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(connectionColors, 3));

      const connectionMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.6 : 0.8,
        depthWrite: false,
        // Additive blending only works on dark backgrounds - use normal blending for light
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      });

      connectionsMesh = new THREE.LineSegments(connectionGeometry, connectionMaterial);
      if (!connectionsMesh.morphTargetInfluences) {
        connectionsMesh.morphTargetInfluences = [0];
      }
      scene.add(connectionsMesh);

      // Add solid shaded mesh when shadeLevel > 0
      if (shadeLevel > 0) {
        // Clean up existing solid mesh and its wireframe
        if (solidMesh) {
          scene.remove(solidMesh);
          const wireframeMesh = (solidMesh as any).wireframeMesh;
          if (wireframeMesh) {
            scene.remove(wireframeMesh);
          }
        }

        // Determine solid color based on theme and colorIntense
        let solidColor: THREE.Color;

        if (colorIntense) {
          // Intense mode: red/orange color
          solidColor = new THREE.Color(0xdc2626);
        } else {
          // Subtle mode: use theme-appropriate color
          if (colorTheme === 'black') {
            solidColor = new THREE.Color(0x000000);
          } else if (colorTheme === 'white') {
            solidColor = new THREE.Color(0xffffff);
          } else if (colorTheme === 'red') {
            solidColor = new THREE.Color(0xcc0000);
          } else if (colorTheme === 'blue') {
            solidColor = new THREE.Color(0x0066cc);
          } else if (colorTheme === 'green') {
            solidColor = new THREE.Color(0x00aa44);
          } else if (colorTheme === 'yellow') {
            solidColor = new THREE.Color(0xddaa00);
          } else {
            solidColor = new THREE.Color(isDark ? 0x000000 : 0xffffff);
          }
        }

        const isBlackMode = colorTheme === 'black' && !colorIntense;
        const solidMaterial = new THREE.MeshStandardMaterial({
          color: solidColor,
          metalness: isBlackMode ? 0.9 : (colorIntense ? 0.7 : 0.3),
          roughness: isBlackMode ? 0.1 : (colorIntense ? 0.3 : 0.7),
          flatShading: shadeLevel < 2,
          side: THREE.DoubleSide,
        });

        // Hide the wireframe when showing solid - make points and lines invisible
        nodesMesh.visible = false;
        connectionsMesh.visible = false;

        // Clone the base geometry and create morph targets for it
        const solidGeometry = morphableGeometries.sphereGeometry.clone();

        // Create star morph target for the solid mesh (same transformation as wireframe)
        const spherePositions = solidGeometry.attributes.position.array;
        const starPositions = new Float32Array(spherePositions.length);
        const tempVec = new THREE.Vector3();

        for (let i = 0; i < spherePositions.length; i += 3) {
          tempVec.set(spherePositions[i], spherePositions[i + 1], spherePositions[i + 2]);
          const spherical = new THREE.Spherical().setFromVector3(tempVec);
          const spikeFactor = 0.4 * Math.sin(spherical.phi * 6) * Math.sin(spherical.theta * 6);
          spherical.radius *= 1 + spikeFactor;
          tempVec.setFromSpherical(spherical);
          starPositions[i] = tempVec.x;
          starPositions[i + 1] = tempVec.y;
          starPositions[i + 2] = tempVec.z;
        }

        // Add position morph target
        solidGeometry.morphAttributes.position = [new THREE.Float32BufferAttribute(starPositions, 3)];

        // Create a temporary geometry to compute normals for the star shape
        const tempStarGeometry = solidGeometry.clone();
        tempStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        tempStarGeometry.computeVertexNormals();

        // Add normal morph target so lighting works correctly during morph
        const starNormals = tempStarGeometry.attributes.normal.array;
        solidGeometry.morphAttributes.normal = [new THREE.Float32BufferAttribute(starNormals as Float32Array, 3)];

        solidGeometry.computeVertexNormals();

        solidMesh = new THREE.Mesh(solidGeometry, solidMaterial);
        solidMesh.morphTargetInfluences = [0];
        scene.add(solidMesh);

        // For black mode, create golden wireframe lines positioned slightly outside the solid
        if (isBlackMode) {
          // Scale up the wireframe slightly to position it outside the solid
          const wireframeScale = 1.005; // Very close to the solid - just 0.5% larger
          const scaledNodePositions = morphableGeometries.sphereNodePositions.map((v, i) => v * wireframeScale);
          const scaledStarPositions = morphableGeometries.starNodePositions.map((v, i) => v * wireframeScale);
          const scaledConnectionPositions = new Float32Array(morphableGeometries.sphereConnectionPositions.length);
          const scaledStarConnections = new Float32Array(morphableGeometries.starConnectionPositions.length);

          for (let i = 0; i < morphableGeometries.sphereConnectionPositions.length; i++) {
            scaledConnectionPositions[i] = morphableGeometries.sphereConnectionPositions[i] * wireframeScale;
            scaledStarConnections[i] = morphableGeometries.starConnectionPositions[i] * wireframeScale;
          }

          // Create golden wireframe geometry
          const wireframeGeometry = new THREE.BufferGeometry();
          wireframeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(scaledConnectionPositions, 3));
          wireframeGeometry.morphAttributes.position = [new THREE.Float32BufferAttribute(scaledStarConnections, 3)];

          const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0xFFD700, // Golden
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });

          const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
          wireframeMesh.morphTargetInfluences = [0];
          scene.add(wireframeMesh);

          // Store reference to update morph influences
          (solidMesh as any).wireframeMesh = wireframeMesh;
        }
      } else {
        // shadeLevel is 0, show wireframe and remove solid mesh
        nodesMesh.visible = true;
        connectionsMesh.visible = true;

        if (solidMesh) {
          scene.remove(solidMesh);
          const wireframeMesh = (solidMesh as any).wireframeMesh;
          if (wireframeMesh) {
            scene.remove(wireframeMesh);
          }
          solidMesh = null;
        }
      }
    }

    // Morphing state - start in messy state (star shape) unless structured is true
    let isMorphed = !structured; // Inverted: false = sphere (structured), true = star (messy)
    let morphProgress = structured ? 0 : 1; // Start at the desired position
    let autoMorphTarget = isMorphed; // For automatic toggling independent of audio/structured

    // Initialize all geometries and visualization
    createMorphableGeometries();
    createVisualization();

    const clock = new THREE.Clock();

    function updateMorphing() {
      if (nodesMesh && connectionsMesh) {
        if (!nodesMesh.morphTargetInfluences) {
          nodesMesh.morphTargetInfluences = [0];
        }
        if (!connectionsMesh.morphTargetInfluences) {
          connectionsMesh.morphTargetInfluences = [0];
        }

        const targetMorphValue = isMorphed ? 1 : 0;
        morphProgress += (targetMorphValue - morphProgress) * 0.02;

        nodesMesh.morphTargetInfluences[0] = morphProgress;
        connectionsMesh.morphTargetInfluences[0] = morphProgress;
      }

      // Update solid mesh morphing if it exists
      if (solidMesh && solidMesh.morphTargetInfluences) {
        const targetMorphValue = isMorphed ? 1 : 0;
        morphProgress += (targetMorphValue - morphProgress) * 0.02;
        solidMesh.morphTargetInfluences[0] = morphProgress;

        // Update golden wireframe if it exists
        const wireframeMesh = (solidMesh as any).wireframeMesh;
        if (wireframeMesh && wireframeMesh.morphTargetInfluences) {
          wireframeMesh.morphTargetInfluences[0] = morphProgress;
        }
      }
    }

    // Animation loop with frame rate limiting for mobile and dev mode
    let lastTime = 0;
    const targetFPS = isMobile ? 15 : (isDevMode ? 30 : 60); // Lower FPS in dev mode
    const frameInterval = 1000 / targetFPS;

    function animate() {
      const currentTime = performance.now();

      // Skip rendering when tab is hidden (major perf optimization)
      if (isPausedRef.current) {
        requestAnimationFrame(animate);
        return;
      }

      if (currentTime - lastTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      const elapsedTime = clock.getElapsedTime();

      // Morphing logic: prioritize audio > structured prop > auto-toggle
      if (isAnalyzing && audioData.midsNorm > 0.7) {
        // Audio-reactive morphing with oscillation
        const baseTarget = structured ? 0 : 1;
        const oscillation = Math.sin(elapsedTime * 10) * audioData.midsNorm * 0.3;
        isMorphed = (baseTarget + oscillation) > 0.5;
      } else if (isAnalyzing && audioData.bassNorm > 0.3) {
        // Audio-reactive morphing based on bass
        isMorphed = audioData.bassNorm > 0.5;
      } else if (!structured) {
        // Automatic gradual toggling when no audio and not forced to structured
        isMorphed = autoMorphTarget;
      } else {
        // Structured prop forces sphere state
        isMorphed = false;
      }

      updateMorphing();

      // Animate orbiting satellites (only when not in minimal mode)
      if (!minimalMode) {
        satellites.forEach((satellite) => {
          const data = satellite.userData;
          const angle = elapsedTime * data.orbitSpeed + data.orbitOffset;
          satellite.position.x = Math.cos(angle) * data.orbitRadius;
          satellite.position.z = Math.sin(angle) * data.orbitRadius;
          satellite.position.y = data.verticalOffset + Math.sin(elapsedTime * 0.5 + data.orbitOffset) * 3;

          // Rotate satellites
          satellite.rotation.x += data.rotationSpeed.x;
          satellite.rotation.y += data.rotationSpeed.y;
          satellite.rotation.z += data.rotationSpeed.z;
        });
      }

      // Star field rotation
      const baseStarRotation = 0.0001;
      const musicStarRotation = isAnalyzing
        ? baseStarRotation * (1 + audioData.overallNorm * 3)
        : baseStarRotation;
      starField.rotation.y += musicStarRotation;

      controls.update();

      // Use composer for bloom effects, or renderer directly in minimal mode
      if (composer && !minimalMode) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    }

    // Handle window resize
    function handleResize() {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      if (composer && !minimalMode) {
        composer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    }
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Auto-morphing and palette changes with state cycling
    const morphInterval = setInterval(() => {
      autoMorphTarget = !autoMorphTarget; // Toggle the auto-morph target

      if (Math.random() > 0.7) {
        activePaletteIndex = (activePaletteIndex + 1) % colorPalettes.length;
        createVisualization();
      }
    }, 6000 + Math.random() * 4000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(morphInterval);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };

  }, [isDark, structured, colorIntense, colorTheme, isHovered, modelType, modelRotation, modelFloatY, modelJudderX, modelJudderZ, onZoomChange, themeColors, minimalMode, shadeLevel]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{
        opacity: 1,
        transition: 'none',
        backgroundColor: 'transparent'
      }}
    />
  );
}