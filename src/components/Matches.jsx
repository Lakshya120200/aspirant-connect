import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, collectionGroup } from 'firebase/firestore';

const Matches = ({ onSelectMatch }) => {
  const [matches, setMatches] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const matchMap = new Map();

    // Helper: Update match data and re-sort
    const updateMatches = (id, data = {}, lastTime = 0) => {
      const existing = matchMap.get(id) || { id };
      const updated = { 
        ...existing, 
        ...data, 
        lastMessageAt: Math.max(lastTime, existing.lastMessageAt || 0) 
      };
      
      matchMap.set(id, updated);
      // Sort: Always keep most active at index 0
      const sorted = Array.from(matchMap.values()).sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
      setMatches(sorted);
    };

    // 1. Connection Listener
    const connectionQueries = [
      query(collection(db, 'swipes'), where('to', '==', myId)),
      query(collection(db, 'swipes'), where('from', '==', myId)),
      query(collection(db, 'thunderbolts'), where('to', '==', myId)),
      query(collection(db, 'thunderbolts'), where('from', '==', myId))
    ];

    const unsubs = connectionQueries.map(q => onSnapshot(q, async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const otherId = data.from === myId ? data.to : data.from;
        const snapUser = await getDoc(doc(db, 'users', otherId));
        if (snapUser.exists()) updateMatches(otherId, snapUser.data());
      }
    }));

    // 2. Optimized Message Listener
    const unsubMessages = onSnapshot(query(collectionGroup(db, 'messages')), (snap) => {
      const counts = {};
      snap.docs.forEach(d => {
        const msg = d.data();
        if (d.ref.parent && d.ref.parent.parent) {
          const roomId = d.ref.parent.parent.id; 
          
          if (roomId.includes(myId)) {
            const peerId = roomId.split('_').find(id => id !== myId);
            if (peerId) {
              const time = msg.createdAt?.toMillis() || 0;
              
              // Increment count if it's a new message for me
              if (msg.to === myId && msg.read === false) {
                 counts[peerId] = (counts[peerId] || 0) + 1;
              }
              
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
      unsubs.forEach(unsub => unsub());
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
              <button 
                key={match.id} 
                onClick={() => onSelectMatch(match)} 
                className="flex flex-col items-center gap-2 min-w-[72px] relative transition-all duration-300 hover:scale-105"
              >
                {/* Badge: Conditional visibility based on unreadCounts */}
                {unreadCounts[match.id] > 0 && (
                  <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10 animate-pulse border-2 border-slate-900">
                    {unreadCounts[match.id]}
                  </div>
                )}
                
                {match.photoURL ? (
                  <img src={match.photoURL} alt={match.name} className={`w-16 h-16 rounded-full object-cover border-2 ${unreadCounts[match.id] > 0 ? 'border-rose-500' : 'border-indigo-500/50'} transition-all`} />
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-slate-950 border-2 ${unreadCounts[match.id] > 0 ? 'border-rose-500' : 'border-indigo-500/50'} flex items-center justify-center font-bold text-indigo-400`}>
                    {match.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-300 truncate w-full text-center">
                  {match.name?.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;