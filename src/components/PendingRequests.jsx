import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const PendingRequests = () => {
  const [likes, setLikes] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // 1. Fetching "Likes" / Match Requests
    const likesQuery = query(
      collection(db, 'requests'),
      where('senderId', '==', auth.currentUser.uid),
      where('type', '==', 'like'), // Filter by type: like
      where('status', '==', 'pending')
    );

    // 2. Fetching "Message Requests"
    const messagesQuery = query(
      collection(db, 'requests'),
      where('senderId', '==', auth.currentUser.uid),
      where('type', '==', 'message'), // Filter by type: message
      where('status', '==', 'pending')
    );

    const unsubLikes = onSnapshot(likesQuery, (snapshot) => {
      setLikes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubLikes();
      unsubMessages();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-orange-400">⏳</span> Pending Requests
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: LIKES & MATCH REQUESTS */}
        <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
            <span className="text-pink-500">❤️</span> Sent Likes
          </h3>
          
          {likes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-600">
              <i className="fa-solid fa-box-open text-2xl mb-2 opacity-50"></i>
              <p className="text-sm italic">No new requests</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {likes.map(req => (
                <div key={req.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg min-w-[120px] flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-sm mb-2 font-bold text-white">
                    {req.receiverName ? req.receiverName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <p className="text-white text-xs font-medium truncate w-full">{req.receiverName || 'Aspirant'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: MESSAGE REQUESTS */}
        <div className="bg-[#0B0F19] p-5 rounded-xl border border-slate-800">
          <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">💬</span> Message Requests
          </h3>
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-600">
              <i className="fa-solid fa-envelope-open text-2xl mb-2 opacity-50"></i>
              <p className="text-sm italic">No new requests</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map(req => (
                <div key={req.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg min-w-[120px] flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-sm mb-2 font-bold text-white">
                    {req.receiverName ? req.receiverName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <p className="text-white text-xs font-medium truncate w-full">{req.receiverName || 'Aspirant'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PendingRequests;