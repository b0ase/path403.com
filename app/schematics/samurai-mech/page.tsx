import GLBViewer from '@/components/3d/GLBViewer';

export default function SamuraiMechPage() {
  return (
    <GLBViewer
      modelPath="/3d_vehicle_design_practice__samurai_mech.glb"
      title="Samurai Mech"
      description="3D vehicle design practice featuring a mechanical samurai warrior with traditional armor aesthetics merged with futuristic technology"
      autoRotate={true}
      wireframe={false}
    />
  );
}