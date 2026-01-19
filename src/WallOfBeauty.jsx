import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image, Text, useTexture, Html } from "@react-three/drei";
import { images } from "./data";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useMusic } from "./MusicContext";

gsap.registerPlugin(ScrollTrigger);

// Simple Joystick Component
function Joystick({ onMove, onStop }) {
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });

    const handleStart = (e) => {
        // e.preventDefault(); // React synthetic events might warn, but let's try just passive: false if native. 
        // Actually, with React, best to set touch-action: none in CSS (which we have).
        // Let's rely on that first. If fails, we might need ref based listener.
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startPos.current = { x: clientX, y: clientY };
        setActive(true);
        onMove({ x: 0, y: 0 });
    };

    const handleMove = (e) => {
        if (!active) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        
        const distance = Math.min(40, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
        const angle = Math.atan2(deltaY, deltaX);
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        setPosition({ x, y });
        onMove({ x: x / 40, y: y / 40 }); 
    };

    const handleEnd = () => {
        setActive(false);
        setPosition({ x: 0, y: 0 });
        onStop();
    };

    return (
        <div 
            className="fixed bottom-8 left-8 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 touch-none pointer-events-auto flex items-center justify-center z-50 md:hidden"
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            <div 
                className="w-10 h-10 bg-[#ff2df7]/80 rounded-full shadow-[0_0_15px_rgba(255,45,247,0.5)] transition-transform duration-75"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            />
        </div>
    );
}

export default function WallOfBeauty() {
  const { viewport } = useThree();
  const { getAverageFrequency } = useMusic();
  const group = useRef();
  const camRig = useRef();
  const sorryTextMat = useRef();
  const [activeIndex, setActiveIndex] = useState(null);
  const lastScrollZ = useRef(0);
  const imageGroups = useRef([]);
  
  // Responsive Settings
  const isMobile = viewport.width < 5;
  const responsiveX = isMobile ? viewport.width / 3.5 : 2.2;
  const zSpacing = isMobile ? 4 : 3;
  const imageScale = isMobile ? [1.6, 2.3, 1] : [2.2, 3.2, 1];

  // Manual Control State
  const [manualControl, setManualControl] = useState(false);
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const rotateLeft = useRef(false);
  const rotateRight = useRef(false);
  const currentYaw = useRef(0);
  const joystickVector = useRef({ x: 0, y: 0 });
  
  // Preload texture
  images.forEach((img) => useTexture.preload(img));

  useEffect(() => {
    const onKeyDown = (e) => {
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': moveForward.current = true; break;
            case 'ArrowDown': case 'KeyS': moveBackward.current = true; break;
            case 'ArrowLeft': case 'KeyA': rotateLeft.current = true; break;
            case 'ArrowRight': case 'KeyD': rotateRight.current = true; break;
        }
    };
    const onKeyUp = (e) => {
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': moveForward.current = false; break;
            case 'ArrowDown': case 'KeyS': moveBackward.current = false; break;
            case 'ArrowLeft': case 'KeyA': rotateLeft.current = false; break;
            case 'ArrowRight': case 'KeyD': rotateRight.current = false; break;
        }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (camRig.current) {
        camRig.current.position.set(0, 0, 6);
        lastScrollZ.current = 6;
    }

    const finalImageZ = -((images.length - 1) * zSpacing);
    const cameraTargetZ = finalImageZ - 10;
    const scrollDistance = Math.max(6000, images.length * (isMobile ? 120 : 200));

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".pinSection",
        start: "top top",
        end: `+=${scrollDistance}`, 
        scrub: 1,
        pin: true,
      },
    });

    tl.to(camRig.current.position, {
        z: cameraTargetZ, 
        duration: 10
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [zSpacing, isMobile]);

  useFrame((state) => {
    if (!group.current || !camRig.current) return;
    
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

    const currentScrollZ = camRig.current.position.z;
    if (!manualControl && activeIndex !== null) {
        if (Math.abs(currentScrollZ - lastScrollZ.current) > 0.001) {
            setActiveIndex(null);
        }
    }
    lastScrollZ.current = currentScrollZ;

    if (manualControl) {
        const moveSpeed = 0.2;
        const rotateSpeed = 0.03;
        let zInput = 0;
        let rotInput = 0;
        
        if (Math.abs(joystickVector.current.y) > 0.1) zInput = -joystickVector.current.y;
        else {
             if (moveForward.current) zInput = -1;
             if (moveBackward.current) zInput = 1;
        }

        if (Math.abs(joystickVector.current.x) > 0.1) rotInput = -joystickVector.current.x;
        else {
            if (rotateLeft.current) rotInput = 1;
            if (rotateRight.current) rotInput = -1;
        }

        state.camera.position.z += zInput * moveSpeed;

        // Apply Rotation (Yaw)
        currentYaw.current += rotInput * rotateSpeed;
        
        // Clamp Rotation (Limit to 10 degrees)
        const maxAngle = THREE.MathUtils.degToRad(10); 
        currentYaw.current = Math.max(-maxAngle, Math.min(maxAngle, currentYaw.current));
        state.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentYaw.current);

        // Clamp Z to hallway bounds

        const finalZ = -((images.length - 1) * zSpacing) - 20;
        state.camera.position.z = Math.max(finalZ, Math.min(10, state.camera.position.z));
        state.camera.position.x = 0;
        state.camera.position.y = 0;

    } else if (activeIndex !== null) {
        const xPos = activeIndex % 2 === 0 ? -responsiveX : responsiveX;
        const zPos = -activeIndex * zSpacing;
        const camX = xPos > 0 ? 0.4 : -0.4; 
        const camZ = zPos + (isMobile ? 4.5 : 3.5); 

        state.camera.position.lerp(new THREE.Vector3(camX, 0, camZ), 0.08);
        state.camera.lookAt(xPos, 0, zPos);
        currentYaw.current = 0;
    } else {
        state.camera.position.lerp(camRig.current.position, 0.1);
        state.camera.lookAt(0, 0, -150); 
        currentYaw.current = 0;
    }

    // Fade in final text and animate beat
    if (sorryTextMat.current) {
        const z = manualControl ? state.camera.position.z : camRig.current.position.z;
        const finalImageZ = -((images.length - 1) * zSpacing);
        const fadeStart = finalImageZ + 15;
        const fadeEnd = finalImageZ;
        
        // Base Opacity based on distance
        const baseOpacity = Math.max(0, Math.min(1, (z - fadeStart) / (fadeEnd - fadeStart)));
        
        // Music Beat Logic
        const freq = getAverageFrequency();
        const beat = freq / 255; // 0 to 1
        
        // Blink Intensity: Base + Beat
        const intensity = 0.8 + (beat * 3.0);
        
        // Color Shift: Cycle Hue based on time + beat kick
        const time = state.clock.elapsedTime;
        const hue = (time * 0.2 + beat * 0.2) % 1; 
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        
        sorryTextMat.current.opacity = baseOpacity;
        sorryTextMat.current.emissiveIntensity = intensity * baseOpacity; // Scale intensity by visibility
        sorryTextMat.current.emissive.copy(color);
        sorryTextMat.current.color.copy(color);
    }
  });

  const finalZ = -((images.length - 1) * zSpacing);

  return (
    <>
       <color attach="background" args={["#050505"]} />

       {manualControl && (
         <Html position={[0,0,0]} fullscreen style={{pointerEvents: 'none'}}>
            <Joystick 
                onMove={(vec) => joystickVector.current = vec}
                onStop={() => joystickVector.current = {x:0, y:0}}
            />
         </Html>
       )}
       
       <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
         <div className="absolute bottom-6 right-6 pointer-events-auto">
            {!manualControl ? (
                <button 
                    onClick={() => setManualControl(true)}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-[#ff2df7]/30 border border-[#ff2df7] text-white font-bold rounded-full backdrop-blur-md hover:bg-[#ff2df7]/50 transition-all shadow-[0_0_15px_rgba(255,45,247,0.4)] cursor-pointer text-sm sm:text-base"
                >
                    Take Control
                </button>
            ) : (
                <div className="text-right">
                    <div className="hidden md:block text-white font-bold text-sm mb-2 drop-shadow-md">WASD to Move & Rotate</div>
                    <button 
                        onClick={() => setManualControl(false)}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-black/40 border border-white/20 text-white font-bold rounded-full backdrop-blur-md hover:bg-black/60 hover:border-white/40 transition-all cursor-pointer shadow-lg text-sm sm:text-base"
                    >
                        Exit Control
                    </button>
                </div>
            )}
         </div>
       </Html>

       <mesh position={[0, 0, finalZ - 50]} onClick={() => !manualControl && setActiveIndex(null)}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={camRig} position={[0, 0, 6]} />

      <Text
        fontSize={isMobile ? 0.5 : 0.8}
        position={[0, 2.5, 0]}
        color="#ff2df7"
        anchorX="center"
        anchorY="middle"
      >
        WALL OF BEAUTY
        <meshStandardMaterial emissive="#ff2df7" emissiveIntensity={2.0} transparent />
      </Text>

      <Text
        fontSize={isMobile ? 0.8 : 1.2}
        position={[0, 0, finalZ - 10]}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        Sorry mam
        <meshStandardMaterial ref={sorryTextMat} emissive="#fff" emissiveIntensity={0.8} transparent opacity={0} />
      </Text>

      <group ref={group}>
        {images.map((src, i) => {
            const xPos = i % 2 === 0 ? -responsiveX : responsiveX;
            const zPos = -i * zSpacing; 
            const isActive = activeIndex === i;
            return (
                <group key={i} position={[xPos, 0, zPos]} rotation={[0, i % 2 === 0 ? 0.5 : -0.5, 0]} ref={el => imageGroups.current[i] = el}>
                    <Image
                        url={src}
                        scale={imageScale}
                        radius={0.1}
                        toneMapped={false}
                        onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                        onPointerOver={() => document.body.style.cursor = "pointer"}
                        onPointerOut={() => document.body.style.cursor = "auto"}
                    />
                    <Text
                        position={[0, isMobile ? -1.4 : -1.8, 0.1]}
                        fontSize={isMobile ? 0.2 : 0.3}
                        color="#ff2df7"
                        anchorX="center"
                        anchorY="middle"
                        visible={isActive}
                    >
                        Sorry {i + 1}
                        <meshStandardMaterial emissive="#ff2df7" emissiveIntensity={2} />
                    </Text>
                </group>
            );
        })}
      </group>
    </>
  );
}