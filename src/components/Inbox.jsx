import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const Inbox = ({ onAccept }) => {
  const [requests, setRequests] = useState([]); // Thunderbolts
  const [likes, setLikes] = useState([]);       // Regular Swipes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const myId = auth.currentUser.uid;

    // 1. Listen for incoming Thunderbolts (Messages)
    const qThunder = query(
      collection(db, 'thunderbolts'), 
      where('to', '==', myId),
      where('status', '==', 'pending_reply')
    );

    const unsubThunder = onSnapshot(qThunder, async (snapshot) => {
      const pendingRequests = [];
      for (const reqDoc of snapshot.docs) {
        const reqData = reqDoc.data();
        const senderSnap = await getDoc(doc(db, 'users', reqData.from));
        if (senderSnap.exists()) {
          const senderData = senderSnap.data();
          pendingRequests.push({
            id: reqDoc.id,
            senderId: reqData.from,
            senderName: senderData.name,
            senderTarget: senderData.examTarget,
            message: reqData.message,
            photoURL: senderData.photoURL || null
          });
        }
      }
      setRequests(pendingRequests);
    });

    // 2. Listen for incoming Swipes (Likes)
    const qLikes = query(
      collection(db, 'swipes'),
      where('to', '==', myId)
    );

    const unsubLikes = onSnapshot(qLikes, async (snapshot) => {
      const pendingLikes = [];
      for (const likeDoc of snapshot.docs) {
        const likeData = likeDoc.data();
        const mutualCheck = await getDoc(doc(db, 'swipes', `${myId}_${likeData.from}`));
        
        if (!mutualCheck.exists()) {
          const senderProfileSnap = await getDoc(doc(db, 'users', likeData.from));
          if (senderProfileSnap.exists()) {
            const senderData = senderProfileSnap.data();
            pendingLikes.push({
              id: likeDoc.id,
              senderId: likeData.from,
              senderName: senderData.name,
              senderTarget: senderData.examTarget,
              senderLocation: senderData.studyBase || 'India',
              photoURL: senderData.photoURL || null
            });
          }
        }
      }
      setLikes(pendingLikes);
      setLoading(false);
    });

    return () => {
      unsubThunder(); // Now properly defined and callable
      unsubLikes();
    };
  }, []);

  // --- Thunderbolt Actions ---
  const handleAcceptThunderbolt = async (request) => {
    try {
      await updateDoc(doc(db, 'thunderbolts', request.id), { status: 'active' });
      onAccept({ id: request.senderId, name: request.senderName, target: request.senderTarget });
    } catch (error) { console.error("Error accepting request:", error); }
  };

  const handleDeclineThunderbolt = async (requestId) => {
    try {
      await updateDoc(doc(db, 'thunderbolts', requestId), { status: 'declined' });
    } catch (error) { console.error("Error declining request:", error); }
  };

  // --- Like Actions ---
  const handleMatchLike = async (like) => {
    try {
      await setDoc(doc(db, 'swipes', `${auth.currentUser.uid}_${like.senderId}`), {
        from: auth.currentUser.uid,
        to: like.senderId,
        timestamp: serverTimestamp()
      });
      onAccept({ id: like.senderId, name: like.senderName, target: like.senderTarget });
    } catch (error) { console.error("Error matching like:", error); }
  };

  const handlePassLike = async (likeId) => {
    try {
      await deleteDoc(doc(db, 'swipes', likeId));
    } catch (error) { console.error("Error passing like:", error); }
  };

  if (loading) return null;
  if (requests.length === 0 && likes.length === 0) return null; 

  return (
    <div className="max-w-4xl mx-auto w-full mb-8 space-y-8 animate-fade-in">
      {requests.length > 0 && (
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="flex items-center gap-3 mb-6 pl-2">
          <i className="fa-solid fa-bolt text-indigo-400 text-xl"></i>
          <h3 className="text-xl font-bold text-white">Priority Messages</h3>
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1 flex items-center">
                    {req.photoURL && <img src={req.photoURL} alt={req.senderName} className="inline w-6 h-6 rounded-full object-cover mr-2 border border-indigo-500/30"/>}
                    {req.senderName}
                </h4>
                <p className="text-xs text-indigo-400 mb-4">{req.senderTarget} Aspirant</p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-6 relative">
                  <p className="text-sm text-slate-300 italic pl-4">"{req.message}"</p>
                </div>
              </div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => handleDeclineThunderbolt(req.id)} className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Pass</button>
                <button onClick={() => handleAcceptThunderbolt(req)} className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg">Accept & Chat</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {likes.length > 0 && (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="flex items-center gap-3 mb-6 pl-2">
          <i className="fa-solid fa-heart text-emerald-400 text-xl"></i>
          <h3 className="text-xl font-bold text-white">People Who Liked You</h3>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{likes.length}</span>
        </div>
        <div className="space-y-3">
          {likes.map((like) => (
            <div key={like.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {like.photoURL ? (
                    <img src={like.photoURL} alt={like.senderName} className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" />
                ) : (
                    <div className="w-10 h-10 bg-slate-800 border border-emerald-500/30 rounded-full flex items-center justify-center text-sm font-bold text-slate-400">
                        {like.senderName.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-base">{like.senderName}</h4>
                      <span className="text-[9px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Wants to connect</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{like.senderTarget} • {like.senderLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePassLike(like.id)} className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                <button onClick={() => handleMatchLike(like)} className="px-4 h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition font-bold text-sm shadow-lg flex items-center gap-2">
                    <i className="fa-solid fa-check"></i> Match Back
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default Inbox;