import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';

const Inbox = ({ onAccept }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for any Thunderbolts sent TO this user that are still "pending"
    const q = query(
      collection(db, 'thunderbolts'), 
      where('to', '==', auth.currentUser?.uid),
      where('status', '==', 'pending_reply')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const pendingRequests = [];
      
      // 2. Because the thunderbolt only has their ID, we need to look up their actual Name and Details
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data();
        
        // Fetch the sender's profile
        const senderProfileSnap = await getDoc(doc(db, 'users', requestData.from));
        
        if (senderProfileSnap.exists()) {
          const senderData = senderProfileSnap.data();
          pendingRequests.push({
            id: requestDoc.id, // The ID of the thunderbolt request
            senderId: requestData.from,
            message: requestData.message,
            senderName: senderData.name,
            senderTarget: senderData.examTarget,
          });
        }
      }
      
      setRequests(pendingRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async (request) => {
    try {
      // 1. Change the status in the database to 'active' so the lock is removed
      await updateDoc(doc(db, 'thunderbolts', request.id), {
        status: 'active'
      });

      // 2. Tell App.jsx to instantly open the Chat box with this person!
      onAccept({
        id: request.senderId,
        name: request.senderName,
        target: request.senderTarget
      });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      // If they decline, we just update the status to declined to remove it from the inbox
      await updateDoc(doc(db, 'thunderbolts', requestId), {
        status: 'declined'
      });
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  if (loading) return null; // Don't show anything while loading
  if (requests.length === 0) return null; // Hide the inbox if there are no pending requests

  return (
    <div className="max-w-4xl mx-auto w-full mb-8 animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <i className="fa-solid fa-inbox text-indigo-400 text-xl"></i>
          <h3 className="text-xl font-bold text-white">Pending Connection Requests</h3>
          <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {requests.length} New
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">{req.senderName}</h4>
                <p className="text-xs text-indigo-400 mb-4">{req.senderTarget} Aspirant</p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-6 relative">
                  <i className="fa-solid fa-quote-left text-slate-700 absolute top-2 left-2 text-[10px]"></i>
                  <p className="text-sm text-slate-300 italic pl-4">"{req.message}"</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => handleDecline(req.id)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Pass
                </button>
                <button 
                  onClick={() => handleAccept(req)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  Accept & Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inbox;