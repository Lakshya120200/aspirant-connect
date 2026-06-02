import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white pb-20">
      <Navbar />
      <HeroSection />
      <MatchSimulator />
      
      {/* The Chat component MUST be inside this return block to show up on screen */}
      <div className="mt-12">
        <Chat />
      </div>
      
    </div>
  );
}

export default App;