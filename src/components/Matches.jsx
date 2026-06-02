import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, collectionGroup, or } from 'firebase/firestore';

const Matches = ({ onSelectMatch, onViewProfile }) => {
  const [matches, setMatches] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const matchMap = new Map();

    const updateMatches = (id, data = {}, lastTime = 0) => {
      // GHOST USER FIX: If this person is not in your Match list yet, AND we aren't loading their 
      // profile data right now (meaning this update came from a random message), ignore them completely.
      if (!matchMap.has(id) && !data.name) return;

      const existing = matchMap.get(id) || { id };
      matchMap.set(id, { ...existing, ...data, lastMessageAt: Math.max(lastTime, existing.lastMessageAt || 0) });
      
      const sorted = Array.from(matchMap.values()).sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
      setMatches(sorted);
    };

    // 1. Connection Listeners (Safely split up to fix the InvalidQuery crash)
    const qSwipes = query(collection(db, 'swipes'), or(where('from', '==', myId), where('to', '==', myId)));
    const qThunderFrom = query(collection(db, 'thunderbolts'), where('from', '==', myId), where('status', '==', 'active'));
    const qThunderTo = query(collection(db, 'thunderbolts'), where('to', '==', myId), where('status', '==', 'active'));

    const handleConnectionSnap = async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const otherId = data.from === myId ? data.to : data.from;
        if (!matchMap.has(otherId)) {
          const snapUser = await getDoc(doc(db, 'users', otherId));
          if (snapUser.exists()) updateMatches(otherId, snapUser.data());
        }
      }
    };

    const unsubs = [
      onSnapshot(qSwipes, handleConnectionSnap),
      onSnapshot(qThunderFrom, handleConnectionSnap),
      onSnapshot(qThunderTo, handleConnectionSnap)
    ];

    // 2. YOUR ORIGINAL PERFECT MESSAGE LISTENER (Restores Sorting & Red Bubbles)
    const unsubMessages = onSnapshot(query(collectionGroup(db, 'messages')), (snap) => {
      const counts = {};
      snap.docs.forEach(d => {
        const msg = d.data();
        if (d.ref.parent?.parent) {
          const roomId = d.ref.parent.parent.id; 
          if (roomId.includes(myId)) {
            const peerId = roomId.split('_').find(id => id !== myId);
            if (peerId) {
              const time = msg.createdAt?.toMillis() || 0;
              if (msg.to === myId && msg.read === false) {
                counts[peerId] = (counts[peerId] || 0) + 1;
              }
              // This triggers your sorting automatically
              updateMatches(peerId, {}, time);
            }
          }
        }
      });
      setUnreadCounts(counts);
    });

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
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
              <div key={match.id} className="flex flex-col items-center gap-2 min-w-[72px] relative group">
                <button onClick={() => onSelectMatch(match)} className="relative hover:scale-105 transition">
                  {/* RED UNREAD BADGE */}
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