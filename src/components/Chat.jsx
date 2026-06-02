import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Listens to Firebase in real-time
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Sends the message to Google Firestore
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      sender: 'Aspirant' 
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-950 text-white mt-10 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Chat Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Study Room: Indian Polity</h3>
          <p className="text-sm text-indigo-400">Online</p>
        </div>
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
          AC
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            No messages yet. Start the discussion!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-end">
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Discuss the latest mock test..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;