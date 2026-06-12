import React from "react";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "all" | "game" | "anime" | "movie";
  setActiveTab: (tab: "all" | "game" | "anime" | "movie") => void;
}

export function Hero({ searchQuery, setSearchQuery, activeTab, setActiveTab }: HeroProps) {
  return (
    <section id="hero" className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28 border-b border-white/[0.04] bg-gradient-to-b from-slate-950 via-background to-slate-950">
      {/* Visual background decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      
      {/* Decorative top grid lines */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none -z-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight mb-12 leading-none max-w-4xl mx-auto">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 tracking-wide py-1">
            BizarreBig
          </span>
        </h1>

        {/* Interactive Control Panel (Search & Tabs) */}
        <div className="glass-panel p-5 rounded-3xl max-w-2xl mx-auto border border-white/[0.08] shadow-2xl relative">
          {/* Subtle panel glow */}
          <div className="absolute -inset-px bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-3xl -z-10 blur-xl opacity-50" />
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเกม, อนิเมะ, ภาพยนตร์, หมวดหมู่ หรือแท็ก..."
                className="w-full h-12 pl-11 pr-10 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 hover:border-white/[0.15] transition-all duration-300 shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-violet-400 transition-colors duration-200">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-bold transition-all"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-950/80 rounded-2xl p-1 border border-white/[0.08] shadow-inner shrink-0">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(139,92,246,0.3)] scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setActiveTab("game")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1 ${
                  activeTab === "game"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(139,92,246,0.3)] scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🎮</span> เกม
              </button>
              <button
                onClick={() => setActiveTab("anime")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1 ${
                  activeTab === "anime"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(139,92,246,0.3)] scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>✨</span> อนิเมะ
              </button>
              <button
                onClick={() => setActiveTab("movie")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1 ${
                  activeTab === "movie"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(139,92,246,0.3)] scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🎬</span> ภาพยนตร์
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
