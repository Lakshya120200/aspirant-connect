import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 1. ADDED: onOpenProfile prop to accept the command from App.jsx
const Navbar = ({ onOpenProfile }) => {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [examTarget, setExamTarget] = useState("");
  const [photoURL, setPhotoURL] = useState(""); // 2. ADDED: State to hold the profile picture

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch their custom details from the database!
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setProfileName(data.name);
          setExamTarget(data.examTarget);
          setPhotoURL(data.photoURL || ""); // 3. ADDED: Fetch the photo if they uploaded one
        }
      } else {
        setProfileName("");
        setExamTarget("");
        setPhotoURL("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The App.jsx file will automatically see this and kick them back to the Login screen!
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT SIDE: Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/20">
              AC
            </div>
            <span className="font-bold text-xl tracking-tight text-white">AspirantConnect</span>
          </div>

          {/* RIGHT SIDE: User Profile & Logout */}
          {user && profileName && (
            <div className="flex items-center gap-4">
              
              {/* Profile Badge - 4. UPDATED: Made it clickable with nice hover effects! */}
              <div 
                onClick={onOpenProfile}
                className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 py-1.5 px-3 rounded-full cursor-pointer transition group"
              >
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-white leading-tight group-hover:text-indigo-400 transition">{profileName}</span>
                  <span className="text-[10px] font-medium text-slate-400">{examTarget}</span>
                </div>

                {/* 5. UPDATED: Render the photo if it exists, otherwise fallback to the initial */}
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-700 group-hover:border-indigo-400 transition" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold border border-slate-700 group-hover:border-indigo-400 transition">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-400 hover:text-rose-400 transition flex items-center gap-2 px-2"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;