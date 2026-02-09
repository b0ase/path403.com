'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { portfolioData } from '@/lib/data';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export default function MetanetPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const projects = useMemo(() => portfolioData.projects, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 55);

    // Simple WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // CSS2D Renderer for floating pill labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;

    // Simple ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Node positions
    const nodePositions: THREE.Vector3[] = [];
    const labels: CSS2DObject[] = [];

    // Fibonacci sphere distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    projects.forEach((project, i) => {
      const t = i / Math.max(projects.length - 1, 1);
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const radius = 26 + (Math.sin(i * 0.5) * 4);
      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * Math.sin(inclination) * Math.sin(azimuth);
      const z = radius * Math.cos(inclination);

      const position = new THREE.Vector3(x, y, z);
      nodePositions.push(position);

      // Pill-style label (no glow)
      const projectImage = project.cardImageUrls?.[0] || '/b0ase_logo.png';
      const isLive = project.status === 'Live' || project.status === 'Production' || project.status === 'Active';
      const isBeta = project.status === 'Beta' || project.status === 'Development';
      const statusColor = isLive ? '#22c55e' : isBeta ? '#fbbf24' : '#6b7280';

      const labelDiv = document.createElement('div');
      labelDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;background:rgba(0,0,0,0.9);border:1px solid rgba(255,255,255,0.2);border-radius:9999px;cursor:pointer;transition:all 0.2s;">
          <img src="${projectImage}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.3);" onerror="this.src='/b0ase_logo.png'"/>
          <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};flex-shrink:0;"></span>
          <span style="color:rgba(255,255,255,0.9);font-size:12px;font-family:system-ui;font-weight:500;white-space:nowrap;">${project.title}</span>
        </div>
      `;
      labelDiv.style.pointerEvents = 'auto';
      labelDiv.onmouseenter = () => {
        const inner = labelDiv.firstElementChild as HTMLElement;
        if (inner) {
          inner.style.background = 'rgba(255,255,255,0.1)';
          inner.style.borderColor = 'rgba(255,255,255,0.4)';
        }
        setHoveredProject(String(project.id));
      };
      labelDiv.onmouseleave = () => {
        const inner = labelDiv.firstElementChild as HTMLElement;
        if (inner) {
          inner.style.background = 'rgba(0,0,0,0.9)';
          inner.style.borderColor = 'rgba(255,255,255,0.2)';
        }
        setHoveredProject(null);
      };
      labelDiv.onclick = () => window.open(project.liveUrl || `/portfolio/${project.slug}`, '_blank');

      const label = new CSS2DObject(labelDiv);
      label.position.copy(position);
      scene.add(label);
      labels.push(label);
    });

    // Simple white connection lines between nearby nodes
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const distance = nodePositions[i].distanceTo(nodePositions[j]);
        if (distance < 18) {
          const points = [nodePositions[i], nodePositions[j]];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
        }
      }
    }

    // Animation loop
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    const onMouseMove = () => {
      container.style.cursor = 'grab';
    };

    container.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(labelRenderer.domElement);
    };
  }, [projects]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Hovered project info */}
      {hoveredProject && (
        <div className="absolute bottom-4 left-4 z-50 px-4 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg">
          <p className="text-white text-sm font-mono">
            {projects.find(p => String(p.id) === hoveredProject)?.title}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-50 flex gap-3 text-[10px]">
        <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500"></span>Live</span>
        <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Beta</span>
        <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-500"></span>Archive</span>
      </div>

      {/* Three.js container */}
      <div ref={containerRef} className="w-full h-full" style={{ cursor: 'grab' }} />
    </div>
  );
}
