import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  // We swapped the fake 'isAuthenticated' for a real 'user' tracker
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This actively listens to Google to see if you are logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Shows a blank screen for a split second so the login page doesn't flash
  if (loading) return <div className="bg-slate-950 min-h-screen"></div>;

  // If Google says no user is logged in, show the Login page
  if (!user) {
    return <Login />;
  }

  // If they are logged in, show the full app!
  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white pb-20">
      <Navbar />
      <HeroSection />
      <MatchSimulator />
      
      <div className="mt-12">
        <Chat />
      </div>
      
    </div>
  );
}

export default App;