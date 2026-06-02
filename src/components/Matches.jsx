import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const Matches = ({ onSelectMatch }) => {
  const [matches, setMatches] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const matchMap = new Map();

    // Unified function to update match state
    const updateMatches = async (id) => {
      if (matchMap.has(id)) return;
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        matchMap.set(id, { id, ...snap.data() });
        setMatches(Array.from(matchMap.values()));
      }
    };

    // 1. Listen for ALL connection types (Swipes & Thunderbolts)
    const queries = [
      query(collection(db, 'swipes'), where('to', '==', myId)),
      query(collection(db, 'swipes'), where('from', '==', myId)),
      query(collection(db, 'thunderbolts'), where('to', '==', myId)),
      query(collection(db, 'thunderbolts'), where('from', '==', myId))
    ];

    const unsubs = queries.map(q => onSnapshot(q, async (snap) => {
      for (const d of snap.docs) {
        const data = d.data();
        const otherId = data.from === myId ? data.to : data.from;
        
        // Check if mutual connection exists
        const mutualCheck = await getDoc(doc(db, 'swipes', `${myId}_${otherId}`));
        const mutualCheckReverse = await getDoc(doc(db, 'swipes', `${otherId}_${myId}`));
        
        if (mutualCheck.exists() || mutualCheckReverse.exists() || data.status === 'active') {
          updateMatches(otherId);
        }
      }
    }));

    // 2. Listen for Unread Messages (New Feature)
    const unsubUnread = onSnapshot(
      query(collection(db, 'messages'), where('to', '==', myId), where('read', '==', false)), 
      (snap) => {
        const counts = {};
        snap.docs.forEach(d => {
          const senderId = d.data().from;
          counts[senderId] = (counts[senderId] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    );

    setTimeout(() => setLoading(false), 800);

    return () => {
      unsubs.forEach(unsub => unsub());
      unsubUnread();
    };
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto w-full mb-8 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pl-2">
          <i className="fa-solid fa-user-group text-indigo-400 text-xl"></i>
          <h3 className="text-xl font-bold text-white">Your Active Matches</h3>
        </div>
        
        {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3"><i className="fa-solid fa-ghost"></i></div>
                <p className="text-sm font-semibold text-slate-400">No active connections yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Start swiping or sending Thunderbolts to build your study circle!</p>
            </div>
        ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
            {matches.map(match => (
                <button 
                key={match.id}
                onClick={() => onSelectMatch({ id: match.id, name: match.name, target: match.examTarget })}
                className="flex flex-col items-center gap-2 min-w-[72px] group transition hover:scale-105 relative"
                >
                {/* Unread Badge */}
                {unreadCounts[match.id] > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 animate-bounce">
                        {unreadCounts[match.id]}
                    </div>
                )}

                {match.photoURL ? (
                    <img src={match.photoURL} alt={match.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 group-hover:border-indigo-400 shadow-lg transition" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-400 group-hover:border-indigo-400 group-hover:bg-slate-800 transition shadow-lg">
                        {(match.name || 'A').charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate w-full text-center">
                    {match.name ? match.name.split(' ')[0] : 'Aspirant'}
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