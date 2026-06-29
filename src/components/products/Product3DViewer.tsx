import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Box, Environment } from '@react-three/drei';
import { X, ZoomIn, RotateCcw, Camera, Move } from 'lucide-react';
import * as THREE from 'three';

function FrameModel({ imageUrl, rotation }: { imageUrl: string; rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation * (Math.PI / 180);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 1.2, 0.1]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh position={[1.3, 0, 0.05]}>
        <boxGeometry args={[0.2, 1.2, 0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.3, 0, 0.05]}>
        <boxGeometry args={[0.2, 1.2, 0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.2, 0.15, 0.06]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.65, 0, -1.2]} rotation={[0.15, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.65, 0, -1.2]} rotation={[0.15, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
}

function Scene({ imageUrl, rotation }: { imageUrl: string; rotation: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 5, 5]} intensity={0.4} />
      <FrameModel imageUrl={imageUrl} rotation={rotation} />
      <Environment preset="studio" />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export default function Product3DViewer({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(5);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [view, setView] = useState<'front' | 'side' | 'top'>('front');

  const handleViewChange = (v: 'front' | 'side' | 'top') => {
    setView(v);
    if (v === 'front') setRotation(0);
    if (v === 'side') setRotation(90);
    if (v === 'top') setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] m-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display text-xl font-semibold text-navy-900">3D Product Viewer</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 0, zoom], fov: 50 }}>
            <Suspense fallback={null}>
              <Scene imageUrl={imageUrl} rotation={rotation} />
            </Suspense>
          </Canvas>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur rounded-xl px-4 py-2 shadow-lg">
            <button
              onClick={() => handleViewChange('front')}
              className={`p-2 rounded-lg transition-colors ${view === 'front' ? 'bg-navy-100 text-navy-800' : 'text-gray-500'}`}
              title="Front View"
            >
              <Camera size={20} />
            </button>
            <button
              onClick={() => handleViewChange('side')}
              className={`p-2 rounded-lg transition-colors ${view === 'side' ? 'bg-navy-100 text-navy-800' : 'text-gray-500'}`}
              title="Side View"
            >
              <Move size={20} />
            </button>
            <button
              onClick={() => handleViewChange('top')}
              className={`p-2 rounded-lg transition-colors ${view === 'top' ? 'bg-navy-100 text-navy-800' : 'text-gray-500'}`}
              title="Top View"
            >
              <RotateCcw size={20} />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-2 rounded-lg transition-colors ${isAutoRotate ? 'bg-navy-100 text-navy-800' : 'text-gray-500'}`}
              title="Auto Rotate"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => setZoom(zoom === 5 ? 3 : 5)}
              className="p-2 text-gray-500 hover:text-navy-800"
              title="Zoom"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-gray-50 text-center text-sm text-gray-500">
          Drag to rotate · Scroll to zoom · Right-click to pan
        </div>
      </div>
    </div>
  );
}
