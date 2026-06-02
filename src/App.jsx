import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';
import Chat from './components/Chat';
import Onboarding from './components/Onboarding';
import Inbox from './components/Inbox';
import Matches from './components/Matches';
import Profile from './components/Profile'; // <-- 1. IMPORTED NEW COMPONENT

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tracks who you are chatting with.
  const [activePeer, setActivePeer] = useState(null); 

  // <-- 2. NEW STATE: Tracks if we should show the Profile page
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
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

  if (!user) {
    return <Login />;
  }

  if (!hasProfile) {
    return <Onboarding onProfileCreated={() => setHasProfile(true)} user={user} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* 3. We pass the trigger down to the Navbar! */}
      <Navbar onOpenProfile={() => setShowProfile(true)} />
      
      {/* 4. IF showProfile is true, show the settings page. IF false, show the dashboard! */}
      {showProfile ? (
        <div className="pt-12 px-4 sm:px-6 lg:px-8">
            <Profile onBack={() => setShowProfile(false)} />
        </div>
      ) : (
        <>
          <HeroSection />
          
          <MatchSimulator onConnect={(peer) => setActivePeer(peer)} />
          
          <div className="mt-12 px-4 sm:px-6 lg:px-8">
            
            {/* The Pending Requests & Likes */}
            <Inbox onAccept={(peer) => setActivePeer(peer)} />

            {/* The Permanent Instagram-style Match List */}
            <Matches onSelectMatch={(peer) => setActivePeer(peer)} />

            {/* The Private Chat Room */}
            <Chat peer={activePeer} onClearPeer={() => setActivePeer(null)} />
            
          </div>
        </>
      )}
    </div>
  );
}

export default App;