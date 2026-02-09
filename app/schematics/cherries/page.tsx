import GLBViewer from '@/components/3d/GLBViewer';

export default function CherriesPage() {
  return (
    <GLBViewer
      modelPath="/cherries.glb"
      title="Cherries Study"
      description="Photorealistic 3D fruit rendering showcasing advanced material properties, subsurface scattering, and organic modeling"
      autoRotate={true}
      wireframe={false}
    />
  );
}