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

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // THIS IS THE MISSING LINE! It tracks who you are chatting with.
  const [activePeer, setActivePeer] = useState(null); 

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
      <Navbar />
      <HeroSection />
      
      <MatchSimulator onConnect={(peer) => setActivePeer(peer)} />
      
      <div className="mt-12 px-4 sm:px-6 lg:px-8">
        <Inbox onAccept={(peer) => setActivePeer(peer)} />
        <Chat peer={activePeer} onClearPeer={() => setActivePeer(null)} />
      </div>
    </div>
  );
}

export default App;