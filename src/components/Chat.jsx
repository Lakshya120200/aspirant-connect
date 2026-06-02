import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmojiPicker from 'emoji-picker-react';

const Chat = ({ peer, onClearPeer }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [peerStatus, setPeerStatus] = useState('offline');
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef();
  const emojiPickerRef = useRef(null);

  // FIXED: Mark as read only once per peer selection (prevents loops)
  useEffect(() => {
    const markAsRead = async () => {
      if (!peer || !auth.currentUser) return;
      const roomId = getRoomId();
      const q = query(
        collection(db, 'rooms', roomId, 'messages'), 
        where('to', '==', auth.currentUser.uid), 
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((docSnap) => updateDoc(docSnap.ref, { read: true }));
    };

    if (peer) markAsRead();
  }, [peer]); 

  // Close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Presence Listener
  useEffect(() => {
    if (!peer || !peer.id) return;
    const unsubPresence = onSnapshot(doc(db, 'users', peer.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPeerStatus(data.isOnline ? 'online' : 'offline');
      }
    });
    return () => unsubPresence();
  }, [peer]);

  const getRoomId = () => {
    if (!peer || !auth.currentUser) return null;
    return auth.currentUser.uid < peer.id ? `${auth.currentUser.uid}_${peer.id}` : `${peer.id}_${auth.currentUser.uid}`;
  };

  // Message Listener
  useEffect(() => {
    let q;
    if (!peer) {
      q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    } else {
      const roomId = getRoomId();
      if (!roomId) return;
      q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, [peer]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    try {
        const payload = {
            text: newMessage,
            createdAt: serverTimestamp(),
            from: auth.currentUser.uid,
            senderName: auth.currentUser.displayName || "Aspirant",
            read: false 
        };
        if (!peer) {
            await addDoc(collection(db, 'messages'), payload);
        } else {
            await addDoc(collection(db, 'rooms', getRoomId(), 'messages'), { ...payload, to: peer.id });
        }
        setNewMessage("");
    } catch (error) { console.error("Error sending:", error); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const payload = {
        imageURL: downloadURL,
        createdAt: serverTimestamp(),
        from: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Aspirant",
        read: false
      };
      if (!peer) {
        await addDoc(collection(db, 'messages'), payload);
      } else {
        await addDoc(collection(db, 'rooms', getRoomId(), 'messages'), { ...payload, to: peer.id });
      }
    } catch (error) { console.error("Error uploading image:", error); }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-2xl relative">
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onEmojiClick={(e) => { setNewMessage(prev => prev + e.emoji); setShowEmojiPicker(false); }} theme="dark" />
        </div>
      )}

      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-white text-lg">{peer ? `Room: ${peer.name}` : 'Global Study Room'}</h3>
        {peer && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${peerStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className="text-[12px] text-slate-400 capitalize">{peerStatus}</span>
            </div>
            <button onClick={onClearPeer} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition">Close</button>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg) => {
          const isMe = msg.from === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.senderName}</span>}
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                {msg.imageURL ? <img src={msg.imageURL} alt="shared" className="rounded-lg max-w-full" /> : <p>{msg.text}</p>}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div> 
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 items-center shrink-0">
        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-white px-1 shrink-0"><i className="fa-solid fa-face-smile"></i></button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        <button type="button" onClick={() => fileInputRef.current.click()} className="text-slate-400 hover:text-white px-1 shrink-0"><i className="fa-solid fa-image"></i></button>
        <input 
          type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none text-sm"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm shrink-0">Send</button>
      </form>
    </div>
  );
};

export default Chat;