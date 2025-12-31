import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import UI from './components/UI';

function App() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* Hand Tracking & Camera Background */}
      <HandTracker />

      {/* 3D Scene */}
      <Canvas
        className="absolute inset-0 z-10"
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }} // Enable transparency
      >
        {/* No background color, let camera show through */}
        <Suspense fallback={null}>
          <ParticleSystem />
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={2} 
          maxDistance={20} 
          autoRotate={false}
        />
      </Canvas>

      {/* UI Overlay */}
      <UI />
    </div>
  );
}

export default App;
