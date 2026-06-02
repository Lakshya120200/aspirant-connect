import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const Matches = ({ onSelectMatch }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;

    const connectionIds = new Set();

    const fetchProfileAndAdd = async (id) => {
      if (connectionIds.has(id)) return; 
      
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        connectionIds.add(id);
        setMatches(prev => {
          if (prev.some(p => p.id === id)) return prev;
          return [...prev, { id, ...snap.data() }];
        });
      }
    };

    // 1. Listen for Mutual Swipes (People who liked YOU, and you liked back)
    const unsubSwipesTo = onSnapshot(query(collection(db, 'swipes'), where('to', '==', myId)), (snap) => {
      snap.docs.forEach(async (d) => {
        const senderId = d.data().from;
        const mutualCheck = await getDoc(doc(db, 'swipes', `${myId}_${senderId}`));
        if (mutualCheck.exists()) {
          fetchProfileAndAdd(senderId);
        }
      });
    });

    // 2. Listen for Mutual Swipes (People YOU liked, who just liked you back)
    const unsubSwipesFrom = onSnapshot(query(collection(db, 'swipes'), where('from', '==', myId)), (snap) => {
      snap.docs.forEach(async (d) => {
        const receiverId = d.data().to;
        // Check if the receiver swiped you back
        const mutualCheck = await getDoc(doc(db, 'swipes', `${receiverId}_${myId}`));
        if (mutualCheck.exists()) {
          fetchProfileAndAdd(receiverId);
        }
      });
    });

    // 3. Listen for accepted Thunderbolts TO me (filtered on client-side to prevent Firebase index crashes)
    const unsubT1 = onSnapshot(query(collection(db, 'thunderbolts'), where('to', '==', myId)), (snap) => {
      snap.docs.forEach(d => {
        if (d.data().status === 'active') {
          fetchProfileAndAdd(d.data().from);
        }
      });
    });

    // 4. Listen for accepted Thunderbolts FROM me
    const unsubT2 = onSnapshot(query(collection(db, 'thunderbolts'), where('from', '==', myId)), (snap) => {
      snap.docs.forEach(d => {
        if (d.data().status === 'active') {
          fetchProfileAndAdd(d.data().to);
        }
      });
    });

    // Stop loading indicator after a short delay
    setTimeout(() => setLoading(false), 800);

    return () => {
      unsubSwipesTo();
      unsubSwipesFrom();
      unsubT1();
      unsubT2();
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
                className="flex flex-col items-center gap-2 min-w-[72px] group transition hover:scale-105"
                >
                {/* <-- ADDED: PROFILE PICTURE LOGIC HERE --> */}
                {match.photoURL ? (
                    <img src={match.photoURL} alt={match.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 group-hover:border-indigo-400 shadow-lg transition" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-400 group-hover:border-indigo-400 group-hover:bg-slate-800 transition shadow-lg">
                        {match.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate w-full text-center">
                    {match.name.split(' ')[0]}
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