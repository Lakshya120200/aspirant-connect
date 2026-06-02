import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, or, and } from 'firebase/firestore';

const Matches = ({ onSelectMatch, onViewProfile }) => {
  const [matches, setMatches] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const matchMap = new Map();

    // Helper to update the state
    const syncMatchesState = (peerId, userData, lastTime) => {
      const existing = matchMap.get(peerId) || { id: peerId };
      matchMap.set(peerId, { 
        ...existing, 
        ...userData, 
        lastMessageAt: Math.max(lastTime, existing.lastMessageAt || 0) 
      });
      setMatches(Array.from(matchMap.values()).sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0)));
    };

    // 1. Connection Listener
    // Note: We separated these into individual listeners to keep the logic clear and explicit
    const qSwipes = query(collection(db, 'swipes'), or(where('from', '==', myId), where('to', '==', myId)));
    const qThunder = query(collection(db, 'thunderbolts'), and(or(where('from', '==', myId), where('to', '==', myId)), where('status', '==', 'active')));

    const unsubSwipes = onSnapshot(qSwipes, async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const otherId = data.from === myId ? data.to : data.from;
        if (!matchMap.has(otherId)) {
          const snapUser = await getDoc(doc(db, 'users', otherId));
          if (snapUser.exists()) syncMatchesState(otherId, snapUser.data(), 0);
        }
      }
    });

    const unsubThunder = onSnapshot(qThunder, async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const otherId = data.from === myId ? data.to : data.from;
        if (!matchMap.has(otherId)) {
          const snapUser = await getDoc(doc(db, 'users', otherId));
          if (snapUser.exists()) syncMatchesState(otherId, snapUser.data(), 0);
        }
      }
    });

    setLoading(false);

    return () => {
      unsubSwipes();
      unsubThunder();
    };
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto w-full mb-8 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 pl-2">Your Active Matches</h3>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No active connections yet.</p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {matches.map(match => (
              <div key={match.id} className="flex flex-col items-center gap-2 min-w-[72px] relative group">
                {/* Profile Photo */}
                <button 
                  onClick={() => onSelectMatch(match)}
                  className="relative transition-all duration-300 hover:scale-105"
                >
                  {match.photoURL ? (
                    <img src={match.photoURL} alt={match.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center font-bold text-indigo-400">
                      {match.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Info Button */}
                <button 
                  onClick={() => onViewProfile(match)}
                  className="text-[10px] bg-slate-800 text-slate-400 hover:text-indigo-400 px-2 py-0.5 rounded-full border border-slate-700"
                >
                  Info
                </button>

                <span className="text-xs font-semibold text-slate-300 truncate w-16 text-center">
                  {match.name?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;