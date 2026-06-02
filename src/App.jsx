import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'; 

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
import Feedback from './components/Feedback';

// Profile Modal
const ProfileModal = ({ match, onClose, onUnmatch }) => {
  if (!match) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        {match.photoURL ? (
            <img src={match.photoURL} className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-500/50 object-cover" />
        ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-slate-800 flex items-center justify-center text-4xl font-bold text-indigo-400">
                {match.name?.[0]?.toUpperCase()}
            </div>
        )}
        <h2 className="text-2xl font-bold text-white text-center mt-4">{match.name}</h2>
        <p className="text-slate-400 text-center mt-2 px-4">{match.bio || "No bio available."}</p>
        
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-white font-bold transition">Message</button>
          <button 
            onClick={() => {
                if (window.confirm(`Are you sure you want to unmatch with ${match.name}?`)) {
                    onUnmatch(match.id);
                    onClose();
                }
            }} 
            className="bg-slate-800 hover:bg-red-900/50 text-red-400 py-2.5 rounded-xl transition"
          >
            Unmatch
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePeer, setActivePeer] = useState(null); 
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  
  // NEW: Global Toast State
  const [toast, setToast] = useState(null);
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
        setHasProfile(userDocSnap.exists());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUnmatch = async (peerId) => {
    try {
      const myId = auth.currentUser.uid;
      const collections = ['swipes', 'thunderbolts'];
      for (const colName of collections) {
        const q = query(collection(db, colName), where('from', 'in', [myId, peerId]), where('to', 'in', [myId, peerId]));
        const snap = await getDocs(q);
        snap.docs.forEach(async (d) => await deleteDoc(d.ref));
      }
      
      const roomId = myId < peerId ? `${myId}_${peerId}` : `${peerId}_${myId}`;
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      const msgSnap = await getDocs(messagesRef);
      const batch = writeBatch(db);
      msgSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      if (activePeer?.id === peerId) setActivePeer(null); 
      triggerToast("User removed from your matches.");
    } catch (error) {
      console.error("Error unmatching:", error);
    }
  };

  if (loading) return <div className="bg-slate-950 min-h-screen"></div>;
  if (!user) return <Login />;
  if (!hasProfile) return <Onboarding onProfileCreated={() => setHasProfile(true)} user={user} />;

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-20 relative">
      {/* Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl animate-fade-in text-sm font-bold border border-indigo-400">
          {toast}
        </div>
      )}

      <PresenceManager />
      
      <ProfileModal 
        match={viewingProfile} 
        onClose={() => setViewingProfile(null)} 
        onUnmatch={handleUnmatch} 
      />
      
      <Navbar onOpenProfile={() => { setShowProfile(true); setShowFeedback(false); }} />
      
      {showProfile ? (
        <div className="pt-12 px-4"><Profile onBack={() => setShowProfile(false)} /></div>
      ) : showFeedback ? (
        <div className="pt-12 px-4"><Feedback onBack={() => setShowFeedback(false)} /></div>
      ) : (
        <>
          <HeroSection />
          <MatchSimulator onConnect={(peer) => setActivePeer(peer)} />
          
          <div className="max-w-7xl mx-auto px-4 space-y-8 pt-8">
            {/* Pass triggerToast as a prop to Inbox */}
            <Inbox onAccept={(peer) => setActivePeer(peer)} onTriggerToast={triggerToast} />
            
            <Matches 
                onSelectMatch={(peer) => setActivePeer(peer)} 
                onViewProfile={(match) => setViewingProfile(match)} 
            />
            
            <Chat peer={activePeer} onClearPeer={() => setActivePeer(null)} />
            
            <div className="text-center py-6">
                <button onClick={() => setShowFeedback(true)} className="text-slate-500 hover:text-indigo-400 text-sm">
                    Have feedback or want to see a new feature? Let us know!
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;