/*import React, { useState, useEffect } from 'react';
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

export default App;*/

import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';
import Chat from './components/Chat';
import Onboarding from './components/Onboarding'; // <--- Brought in the new form!

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false); // <--- New state tracker
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Look inside the "users" collection to see if this candidate already filled out their details
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="bg-slate-950 min-h-screen"></div>;

  // 1. If not logged into Google, go to Login Page
  if (!user) {
    return <Login />;
  }

  // 2. If logged in but hasn't created a profile, force the Onboarding Form
  if (!hasProfile) {
    return <Onboarding onProfileCreated={() => setHasProfile(true)} user={user} />;
  }

  // 3. If everything is complete, show the app dashboard!
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