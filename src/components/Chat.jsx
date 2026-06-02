import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(); // Helps us automatically scroll to the newest message

  useEffect(() => {
    // Listening to the global 'messages' bucket
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Whenever a new message arrives, instantly scroll to the bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    // Grab the unique ID of the person typing
    const { uid } = auth.currentUser;

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: uid, // We attach their ID to the message before saving it
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-2xl">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">Study Room: Global</h3>
          <p className="text-xs text-indigo-400">Live Discussion</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => {
          // THE MAGIC LINE: Is this message mine?
          const isMe = msg.uid === auth.currentUser?.uid;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                ${isMe 
                  ? 'bg-indigo-600 text-white rounded-br-none' // My messages (Right, Blue)
                  : 'bg-slate-800 text-slate-200 rounded-bl-none' // Their messages (Left, Gray)
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        {/* Invisible div to help us scroll to the bottom */}
        <div ref={scrollRef}></div> 
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Discuss the latest mock test..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;