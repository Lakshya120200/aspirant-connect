const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> Eliminating Isolation in Test Prep
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Beat the loneliness of exams. Find your <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Study Crew</span>.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          No endless scrolling. No generic advice. Just high-empathy connections and safe spaces designed exclusively for your specific exam stream.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition shadow-xl shadow-indigo-600/20">
            Launch App Simulator
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;