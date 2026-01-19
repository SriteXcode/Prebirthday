import { RoundedBox } from "@react-three/drei";

export default function PhoneMockup({ position = [0, -0.2, 1.2] }) {
  return (
    <group position={position}>
      {/* Phone body */}
      <RoundedBox args={[1.6, 3.2, 0.15]} radius={0.25}>
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.25} />
      </RoundedBox>

      {/* Screen */}
      <RoundedBox args={[1.4, 2.9, 0.03]} radius={0.18} position={[0, 0, 0.1]}>
        <meshStandardMaterial color="#050505" emissive="#1a1a1a" emissiveIntensity={0.8} />
      </RoundedBox>

      {/* Camera Dot */}
      <mesh position={[0, 1.35, 0.12]}>
        <circleGeometry args={[0.06, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}
