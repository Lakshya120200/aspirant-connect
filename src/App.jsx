import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <HeroSection />
      <MatchSimulator />
    </div>
  );
}

export default App;