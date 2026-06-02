
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

import Inbox from './components/Inbox';

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
      
      <MatchSimulator onConnect={(peer) => setActivePeer(peer)} />
      
      <div className="mt-12 px-4 sm:px-6 lg:px-8">
        
        {/* THE NEW INBOX: When you click Accept, it sets the active peer for the chat! */}
        <Inbox onAccept={(peer) => setActivePeer(peer)} />

        <Chat peer={activePeer} onClearPeer={() => setActivePeer(null)} />
      </div>
    </div>
  );
}

export default App;