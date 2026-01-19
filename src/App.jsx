import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import Scene3D from "./Scene3D";
import NavBar from "../components/NavBar";
import AudioPlayer from "../components/AudioPlayer";

export default function App() {
  const lenisRef = useRef(null);
  const [currentView, setCurrentView] = useState("story");

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="page">
      <NavBar currentView={currentView} onChange={setCurrentView} />
      <AudioPlayer />
      <section className="relative w-full h-full pinSection">
        <Scene3D currentView={currentView} />
      </section>
    </div>
  );
}
