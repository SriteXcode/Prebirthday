import { createContext, useContext, useEffect, useRef, useState } from "react";

const MusicContext = createContext();

export function useMusic() {
  return useContext(MusicContext);
}

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  const initAudio = () => {
    if (audioCtxRef.current) return; // Already initialized

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    if (audioRef.current) {
        // Create source only once
        if (!sourceRef.current) {
            sourceRef.current = audioCtx.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyser);
            analyser.connect(audioCtx.destination);
        }
    }

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    // Initialize on first interaction
    if (!audioCtxRef.current) {
        initAudio();
    }

    // Always ensure context is running
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
          await audioRef.current.play();
          setIsPlaying(true);
      } catch (e) {
          console.error("Audio play failed:", e);
      }
    }
  };

  const getAverageFrequency = () => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume/beat
    const length = dataArrayRef.current.length;
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += dataArrayRef.current[i];
    }
    return sum / length;
  };

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay, audioRef, getAverageFrequency }}>
      {children}
      <audio 
        ref={audioRef} 
        src="/music.mp3" 
        loop 
        crossOrigin="anonymous" 
        style={{ display: 'none' }}
      />
    </MusicContext.Provider>
  );
}
