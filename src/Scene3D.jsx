import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, DepthOfField, Bloom } from "@react-three/postprocessing";
import LoaderScreen from "../components/LoaderScreen";
import ScrollWorld from "./ScrollWorld";
import WallOfBeauty from "./WallOfBeauty";
import { useMusic } from "./MusicContext";
import * as THREE from "three";

function LightingController() {
  const { getAverageFrequency } = useMusic();
  const envRef = useRef();
  const lightRef = useRef();

  useFrame(() => {
    const avgFreq = getAverageFrequency();
    // Normalize frequency (0-255) to a suitable intensity range
    // Base intensity 0.5, add kick up to 2.5
    const intensity = 0.5 + (avgFreq / 255) * 4.0; 
    
    // Smooth lerp
    if (envRef.current) {
        envRef.current.environmentIntensity = THREE.MathUtils.lerp(envRef.current.environmentIntensity, intensity, 0.1);
    }
    if (lightRef.current) {
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 1.4 + (avgFreq/255) * 3, 0.1);
    }
  });

  return (
    <>
      <Environment ref={envRef} preset="city" environmentIntensity={0.5} />
      <directionalLight ref={lightRef} position={[5, 5, 5]} intensity={1.4} />
      <ambientLight intensity={0.2} />
    </>
  );
}

export default function Scene3D({ currentView }) {
  return (
    <div className="canvasWrap">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <LoaderScreen />
        
        <LightingController />

        <Suspense fallback={null}>
          {currentView === "story" ? <ScrollWorld /> : <WallOfBeauty />}
        </Suspense>

        {/* ✅ Cinematic Post Processing */}
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
