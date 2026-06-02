import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// We added 'onClearPeer' so you can click a button to go back to the Global room
const Chat = ({ peer, onClearPeer }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Generates the private room ID if you are looking at a peer
  const getRoomId = () => {
    if (!peer) return null;
    const myId = auth.currentUser.uid;
    const peerId = peer.id; 
    return myId < peerId ? `${myId}_${peerId}` : `${peerId}_${myId}`;
  };

  useEffect(() => {
    let q;
    
    // IF NO PEER IS SELECTED: Listen to the Global Chat
    if (!peer) {
      q = query(collection(db, 'messages'), orderBy('createdAt'));
    } 
    // IF A PEER IS SELECTED: Listen to the Private Room
    else {
      const roomId = getRoomId();
      q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });
    
    return () => unsubscribe();
  }, [peer]); // This automatically re-runs whenever you switch between Global and Private

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const { uid } = auth.currentUser;

    // Send to Global
    if (!peer) {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: uid,
      });
    } 
    // Send to Private
    else {
      const roomId = getRoomId();
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: uid,
      });
    }

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-2xl transition-all">
      
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">
            {peer ? `Study Room: ${peer.name}` : 'Study Room: Global'}
          </h3>
          <p className="text-xs text-indigo-400">
            {peer ? 'Private 1-on-1 Session' : 'Live Community Discussion'}
          </p>
        </div>
        
        {/* Only show this button if we are in a private chat */}
        {peer && (
          <button 
            onClick={onClearPeer}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition"
          >
            ← Back to Global
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => {
          const isMe = msg.uid === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div> 
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
        <input 
          type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder={peer ? `Message ${peer.name}...` : "Discuss the latest mock test..."}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;