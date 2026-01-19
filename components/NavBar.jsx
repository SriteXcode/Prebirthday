export default function NavBar({ currentView, onChange }) {
  return (
    <div className="fixed top-6 right-6 flex gap-4 z-50">
      <button
        onClick={() => onChange("story")}
        className={`px-6 py-2 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer font-bold shadow-lg ${
          currentView === "story"
            ? "bg-[#ff2df7]/30 border-[#ff2df7] text-white shadow-[0_0_15px_rgba(255,45,247,0.5)]"
            : "bg-black/40 border-white/20 text-white/90 hover:bg-black/60 hover:text-white hover:border-white/40"
        }`}
      >
        Story
      </button>
      <button
        onClick={() => onChange("wall")}
        className={`px-6 py-2 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer font-bold shadow-lg ${
          currentView === "wall"
            ? "bg-[#ff2df7]/30 border-[#ff2df7] text-white shadow-[0_0_15px_rgba(255,45,247,0.5)]"
            : "bg-black/40 border-white/20 text-white/90 hover:bg-black/60 hover:text-white hover:border-white/40"
        }`}
      >
        Wall of Beauty
      </button>
    </div>
  );
}
