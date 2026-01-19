import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image, Text, useTexture } from "@react-three/drei";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { images } from "./data";

gsap.registerPlugin(ScrollTrigger);

// ✅ Preload images for smoother experience
images.forEach((img) => useTexture.preload(img));

export default function ScrollWorld() {
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  
  const group = useRef();
  const cards = useRef([]);
  const neonText = useRef();
  const camRig = useRef();

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".pinSection",
        start: "top top",
        end: "+=5000",
        scrub: 1.5, // slightly more smoothing for "flow" feel
        pin: true,
      },
    });

    const totalDuration = 10;
    const step = totalDuration / (images.length + 1);

    // ✅ CINEMA CAMERA PATH (continuous flow)
    tl.fromTo(camRig.current.position, 
      { x: 0, y: 0, z: 6 }, 
      { x: 0, y: 0, z: 4.5, duration: totalDuration }, 
      0
    );
    
    // Add some sway to camera
    tl.to(camRig.current.position, { x: -0.5, y: 0.2, duration: totalDuration * 0.3 }, 0);
    tl.to(camRig.current.position, { x: 0.5, y: -0.1, duration: totalDuration * 0.3 }, totalDuration * 0.3);
    tl.to(camRig.current.position, { x: 0, y: 0, duration: totalDuration * 0.4 }, totalDuration * 0.6);


    // ✅ neon text animation
    tl.to(neonText.current.position, { y: 5, duration: 1.5 }, 0);
    tl.to(neonText.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.5 }, 0);
    tl.to(neonText.current.material, { opacity: 0, duration: 0.5 }, 1); // Fade out
    

    // ✅ Images slide one-by-one UNIFORMLY
    images.forEach((_, i) => {
      const startTime = (i + 0.5) * step;
      const isLast = i === images.length - 1;
      
      tl.to(
        cards.current[i].position,
        { 
          x: 0, 
          y: isLast ? (isMobile ? 0.35 : 0.25) : 0, // Adjusted for mobile
          z: i * 0.05, 
          duration: step * 0.8, 
          ease: "power1.out" 
        }, 
        startTime
      );
      tl.to(
        cards.current[i].rotation, 
        { 
          y: 0, 
          z: isLast ? 0 : (Math.random() - 0.5) * 0.2, 
          duration: step * 0.8, 
          ease: "power1.out" 
        }, 
        startTime
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [isMobile]);

  // ✅ Smooth parallax mouse feel
  useFrame(({ mouse, camera }) => {
    if (!group.current || !camRig.current) return;

    group.current.rotation.y = mouse.x * 0.1;
    group.current.rotation.x = mouse.y * 0.05;

    camera.position.lerp(camRig.current.position, 0.08);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[45, 30]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      <group ref={camRig} position={[0, 0, 6]} />

      <Text
        ref={neonText}
        fontSize={isMobile ? 0.4 : 0.7}
        position={[0, 1.8, 0]}
        color="#ff2df7"
        anchorX="center"
        anchorY="middle"
      >
        Sweaty Jiii
        <meshStandardMaterial emissive="#ff2df7" emissiveIntensity={2.7} transparent />
      </Text>

      <group ref={group} position={[0, 0, 0]}>
        {images.map((src, i) => {
          const isLast = i === images.length - 1;
          const spread = isMobile ? 3 : 4;
          
          return (
            <group
              key={i}
              ref={(el) => (cards.current[i] = el)}
              position={[i % 2 === 0 ? -spread : spread, (Math.random() - 0.5) * 2, -5 - i * 2]}
              rotation={[0, 0, (Math.random() - 0.5) * 0.5]}
            >
              {isLast && (
                <group position={[0, -0.3, -0.01]}>
                  <mesh>
                    <boxGeometry args={[isMobile ? 2.1 : 2.6, isMobile ? 3.2 : 3.8, 0.05]} />
                    <meshStandardMaterial color="#fff" roughness={0.8} />
                  </mesh>
                  <Text
                    position={[0, isMobile ? -1.3 : -1.5, 0.06]}
                    fontSize={isMobile ? 0.2 : 0.25}
                    color="#000"
                    anchorX="center"
                    anchorY="middle"
                  >
                    Sorry mam
                  </Text>
                </group>
              )}
              
              <Image 
                url={src} 
                scale={isMobile ? [1.8, 2.8, 1] : [2.2, 3.2, 1]} 
                radius={isLast ? 0.05 : 0.12} 
                toneMapped={false} 
              />
            </group>
          );
        })}
      </group>
    </>
  );
}
