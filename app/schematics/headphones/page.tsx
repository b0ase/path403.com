'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function HeadphonesSchematic() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 40;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff0000, 0.5, 100);
    pointLight.position.set(-10, 10, 0);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x0000ff, 0.3, 100);
    pointLight2.position.set(10, -10, 0);
    scene.add(pointLight2);

    // Create headphones group
    const headphonesGroup = new THREE.Group();

    // Materials
    const plasticMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });

    const cushionMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff3333,
      metalness: 0,
      roughness: 0.8,
      clearcoat: 0.3,
      clearcoatRoughness: 0.7,
    });

    const metalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.3,
    });

    // Left Ear Cup
    const leftEarCup = new THREE.Group();
    const cupGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1, 32);
    const leftCup = new THREE.Mesh(cupGeometry, plasticMaterial);
    leftCup.rotation.z = Math.PI / 2;
    leftCup.position.x = -4;
    leftEarCup.add(leftCup);

    // Left Cushion
    const cushionGeometry = new THREE.TorusGeometry(2.2, 0.6, 16, 32);
    const leftCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    leftCushion.rotation.y = Math.PI / 2;
    leftCushion.position.x = -4.8;
    leftEarCup.add(leftCushion);

    // Left Speaker Grid
    const gridGeometry = new THREE.CircleGeometry(1.8, 32);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const leftGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    leftGrid.rotation.y = Math.PI / 2;
    leftGrid.position.x = -3.5;
    leftEarCup.add(leftGrid);

    // Add perforations to speaker grid
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const holeGeometry = new THREE.CircleGeometry(0.1, 8);
        const hole = new THREE.Mesh(holeGeometry, wireMaterial);
        hole.position.x = -3.49;
        hole.position.y = (i - 2.5) * 0.5;
        hole.position.z = (j - 2.5) * 0.5;
        hole.rotation.y = Math.PI / 2;
        leftEarCup.add(hole);
      }
    }

    headphonesGroup.add(leftEarCup);

    // Right Ear Cup (mirror of left)
    const rightEarCup = leftEarCup.clone();
    rightEarCup.position.x = 8;
    rightEarCup.scale.x = -1;
    headphonesGroup.add(rightEarCup);

    // Headband
    const headbandGroup = new THREE.Group();
    
    // Main arc
    const arcCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-4, 0, 0),
      new THREE.Vector3(-4, 6, 0),
      new THREE.Vector3(4, 6, 0),
      new THREE.Vector3(4, 0, 0)
    );
    
    const tubeGeometry = new THREE.TubeGeometry(arcCurve, 64, 0.3, 8, false);
    const headbandArc = new THREE.Mesh(tubeGeometry, metalMaterial);
    headbandGroup.add(headbandArc);

    // Headband padding
    const paddingGeometry = new THREE.TubeGeometry(arcCurve, 64, 0.5, 8, false);
    const paddingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      metalness: 0,
      roughness: 0.9,
    });
    const headbandPadding = new THREE.Mesh(paddingGeometry, paddingMaterial);
    headbandPadding.position.y = 0.2;
    headbandGroup.add(headbandPadding);

    // Adjustment sliders
    const sliderGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.6);
    const leftSlider = new THREE.Mesh(sliderGeometry, metalMaterial);
    leftSlider.position.set(-3.8, 1.5, 0);
    headbandGroup.add(leftSlider);

    const rightSlider = new THREE.Mesh(sliderGeometry, metalMaterial);
    rightSlider.position.set(3.8, 1.5, 0);
    headbandGroup.add(rightSlider);

    headphonesGroup.add(headbandGroup);

    // Cable
    const cableGroup = new THREE.Group();
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, -1, 0),
      new THREE.Vector3(-4, -3, 1),
      new THREE.Vector3(-3, -5, 2),
      new THREE.Vector3(-2, -7, 1.5),
      new THREE.Vector3(-1, -9, 0),
    ]);
    
    const cableGeometry = new THREE.TubeGeometry(cableCurve, 32, 0.1, 8, false);
    const cableMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.2,
      roughness: 0.6,
    });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cableGroup.add(cable);

    // 3.5mm Jack
    const jackGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1.2, 12);
    const jackMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.1,
    });
    const jack = new THREE.Mesh(jackGeometry, jackMaterial);
    jack.position.set(-1, -9.6, 0);
    jack.rotation.z = Math.PI / 8;
    cableGroup.add(jack);

    headphonesGroup.add(cableGroup);

    // Add wireframe overlay
    const wireframeGroup = new THREE.Group();
    headphonesGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
        const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireMaterial);
        wireframeMesh.position.copy(child.position);
        wireframeMesh.rotation.copy(child.rotation);
        wireframeMesh.scale.copy(child.scale);
        wireframeGroup.add(wireframeMesh);
      }
    });
    scene.add(wireframeGroup);

    scene.add(headphonesGroup);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Add glow effect particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate headphones
      headphonesGroup.rotation.y += rotationSpeed;
      
      // Animate particles
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      
      // Pulsing lights
      const time = Date.now() * 0.001;
      pointLight.intensity = 0.5 + Math.sin(time * 2) * 0.2;
      pointLight2.intensity = 0.3 + Math.cos(time * 1.5) * 0.1;
      
      // Hover effect
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(headphonesGroup.children, true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object instanceof THREE.Mesh) {
          object.scale.setScalar(1.02);
        }
      }
      
      // Reset scale for non-hovered objects
      headphonesGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && !intersects.find(i => i.object === child)) {
          child.scale.setScalar(1);
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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rotationSpeed]);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">3D Headphones</h1>
        <p className="text-gray-400">Interactive Audio Equipment Visualization</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 p-8 bg-black/80 backdrop-blur-sm rounded-tr-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Rotation Speed</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setRotationSpeed(0)}
            className={`px-3 py-1 rounded text-xs transition-all ${
              rotationSpeed === 0 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Stop
          </button>
          <button
            onClick={() => setRotationSpeed(0.005)}
            className={`px-3 py-1 rounded text-xs transition-all ${
              rotationSpeed === 0.005 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Slow
          </button>
          <button
            onClick={() => setRotationSpeed(0.01)}
            className={`px-3 py-1 rounded text-xs transition-all ${
              rotationSpeed === 0.01 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Fast
          </button>
        </div>
      </div>

      {/* Component Info */}
      <div className="absolute top-0 right-0 p-8 bg-black/80 backdrop-blur-sm rounded-bl-2xl max-w-sm">
        <h3 className="text-xl font-bold text-white mb-2">Components</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Dynamic drivers with perforated grills</li>
          <li>• Memory foam ear cushions</li>
          <li>• Adjustable metal headband</li>
          <li>• Detachable 3.5mm cable</li>
          <li>• Swivel hinges for comfort</li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 right-0 p-8">
        <div className="text-sm text-gray-500">
          <p>Drag to rotate view</p>
          <p>Scroll to zoom</p>
          <p>Hover for details</p>
        </div>
      </div>
    </div>
  );
}