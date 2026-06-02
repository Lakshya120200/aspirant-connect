import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MatchSimulator from './components/MatchSimulator';
import Login from './components/Login';
import Chat from './components/Chat';
import Onboarding from './components/Onboarding';
import Inbox from './components/Inbox';
import Matches from './components/Matches';
import Profile from './components/Profile';
import PresenceManager from './components/PresenceManager';
// Notice: The PendingRequests import has been safely removed from here!

function App() {
  // State management
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tracks the person being chatted with
  const [activePeer, setActivePeer] = useState(null); 
  
  // View Switcher state
  const [showProfile, setShowProfile] = useState(false);

  // Auth & Profile Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          setHasProfile(userDocSnap.exists());
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Loading state
  if (loading) return <div className="bg-slate-950 min-h-screen"></div>;

  // 1. Auth Gate
  if (!user) return <Login />;

  // 2. Onboarding Gate
  if (!hasProfile) return <Onboarding onProfileCreated={() => setHasProfile(true)} user={user} />;

  // 3. Main Application Dashboard
  return (
    <div className="bg-slate-950 min-h-screen text-white selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Real-time Presence Tracking */}
      <PresenceManager />
      
      {/* Navigation - Passing the trigger to open profile */}
      <Navbar onOpenProfile={() => setShowProfile(true)} />
      
      {/* View Switcher: Profile vs. Dashboard */}
      {showProfile ? (
        <div className="pt-12 px-4 sm:px-6 lg:px-8">
            <Profile onBack={() => setShowProfile(false)} />
        </div>
      ) : (
        <>
          <HeroSection />
          
          <MatchSimulator onConnect={(peer) => setActivePeer(peer)} />
          
          {/* FIXED: Restored the opening div that accidentally got deleted! */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
            
            {/* Inbox, Matches, and Chat components fully retained */}
            <Inbox onAccept={(peer) => setActivePeer(peer)} />
            <Matches onSelectMatch={(peer) => setActivePeer(peer)} />
            
            <Chat peer={activePeer} onClearPeer={() => setActivePeer(null)} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;