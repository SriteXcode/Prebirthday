import { useMusic } from "../src/MusicContext";

export default function AudioPlayer() {
  const { isPlaying, togglePlay } = useMusic();

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={togglePlay}
        className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border transition-all duration-300 group cursor-pointer font-bold shadow-lg ${
          isPlaying
            ? "bg-[#ff2df7]/30 border-[#ff2df7] shadow-[0_0_15px_rgba(255,45,247,0.4)]"
            : "bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/40"
        }`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
            {isPlaying ? (
                // Pause Icon
                <div className="flex gap-1 h-3">
                    <span className="w-1 bg-white h-full rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
                    <span className="w-1 bg-white h-full rounded-sm animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
            ) : (
                // Play Icon
                <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent" />
            )}
        </div>
        <span className={`text-sm ${isPlaying ? "text-white" : "text-white/90 group-hover:text-white"}`}>
            {isPlaying ? "Playing Music" : "Play Music"}
        </span>
      </button>
    </div>
  );
}
