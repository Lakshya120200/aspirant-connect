const Navbar = () => {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <span className="font-bold px-1">AC</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">
            AspirantConnect
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#mission" className="hover:text-white transition">Our Mission</a>
        </nav>
        <div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            Try Prototype
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;