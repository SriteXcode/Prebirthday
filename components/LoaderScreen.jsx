import { Html, useProgress } from "@react-three/drei";
import { useState, useEffect } from "react";

export default function LoaderScreen() {
  const { progress } = useProgress();
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      // Keep visible for a moment then fade out
      const timer = setTimeout(() => setActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!active) return null;

  return (
    <Html center zIndexRange={[100, 0]}>
      <div className={`w-[260px] p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-opacity duration-700 ${progress === 100 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="font-extrabold mb-2.5">Loading...</div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-[#ff2df7] transition-[width] duration-200" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="mt-2.5 opacity-70 text-sm">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}
