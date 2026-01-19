import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export default function CubeGallery({ images = [], position = [2.5, 0, 1.2] }) {
  const textures = useLoader(THREE.TextureLoader, images);

  const materials = useMemo(() => {
    const mats = textures.map((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({
        map: t,
        metalness: 0.2,
        roughness: 0.6,
      });
    });

    const placeholder = new THREE.MeshStandardMaterial({ color: "#222" });

    // cube requires 6 materials
    return [
      mats[0] || placeholder,
      mats[1] || placeholder,
      mats[2] || placeholder,
      mats[3] || placeholder,
      mats[0] || placeholder,
      mats[1] || placeholder,
    ];
  }, [textures]);

  return (
    <mesh position={position} rotation={[0.2, 0.5, 0]}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      {materials.map((m, i) => (
        <primitive key={i} object={m} attach={`material-${i}`} />
      ))}
    </mesh>
  );
}
