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

    const syncMatchesState = (peerId, userData, lastTime) => {
      const existing = matchMap.get(peerId) || { id: peerId };
      matchMap.set(peerId, { 
        ...existing, 
        ...userData, 
        lastMessageAt: Math.max(lastTime, existing.lastMessageAt || 0) 
      });
      setMatches(Array.from(matchMap.values()).sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0)));
    };

    // 1. Connection Listener (Matches the logic that populates your match bar)
    const qSwipes = query(collection(db, 'swipes'), or(where('from', '==', myId), where('to', '==', myId)));
    const qThunder = query(collection(db, 'thunderbolts'), and(or(where('from', '==', myId), where('to', '==', myId)), where('status', '==', 'active')));

    const unsubs = [
      onSnapshot(qSwipes, async (snap) => {
        for (const d of snap.docs) {
          const data = d.data();
          const otherId = data.from === myId ? data.to : data.from;
          if (!matchMap.has(otherId)) {
            const snapUser = await getDoc(doc(db, 'users', otherId));
            if (snapUser.exists()) syncMatchesState(otherId, snapUser.data(), 0);
          }
        }
      }),
      onSnapshot(qThunder, async (snap) => {
        for (const d of snap.docs) {
          const data = d.data();
          const otherId = data.from === myId ? data.to : data.from;
          if (!matchMap.has(otherId)) {
            const snapUser = await getDoc(doc(db, 'users', otherId));
            if (snapUser.exists()) syncMatchesState(otherId, snapUser.data(), 0);
          }
        }
      })
    ];

    // 2. Unread Message Listener (Restored feature)
    // We target only the rooms of people already in our matchMap
    const unsubMessages = onSnapshot(collection(db, 'rooms'), (snap) => {
      snap.docs.forEach(roomDoc => {
        const roomId = roomDoc.id;
        if (roomId.includes(myId)) {
          const peerId = roomId.split('_').find(id => id !== myId);
          if (peerId && matchMap.has(peerId)) {
            // Check unread messages for this specific room
            const unreadQ = query(collection(db, 'rooms', roomId, 'messages'), where('to', '==', myId), where('read', '==', false));
            getDocs(unreadQ).then(msgSnap => {
               setUnreadCounts(prev => ({ ...prev, [peerId]: msgSnap.size }));
            });
          }
        }
      });
    });

    setLoading(false);
    return () => {
      unsubs.forEach(u => u());
      unsubMessages();
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
              <div key={match.id} className="flex flex-col items-center gap-2 min-w-[72px] relative">
                <button onClick={() => onSelectMatch(match)} className="relative hover:scale-105 transition">
                  {/* RESTORED: Red unread badge */}
                  {unreadCounts[match.id] > 0 && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900">
                      {unreadCounts[match.id]}
                    </div>
                  )}
                  {match.photoURL ? (
                    <img src={match.photoURL} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center font-bold text-indigo-400">
                      {match.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                <button onClick={() => onViewProfile(match)} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 hover:text-indigo-400">Info</button>
                <span className="text-xs font-semibold text-slate-300 truncate w-16 text-center">{match.name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;