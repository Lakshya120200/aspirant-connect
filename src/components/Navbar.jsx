import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [examTarget, setExamTarget] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch their custom details from the database!
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setProfileName(userDocSnap.data().name);
          setExamTarget(userDocSnap.data().examTarget);
        }
      } else {
        setProfileName("");
        setExamTarget("");
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
              
              {/* Profile Badge */}
              <div className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-white leading-tight">{profileName}</span>
                  <span className="text-[10px] font-medium text-indigo-400">{examTarget}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold border border-slate-700">
                  {profileName.charAt(0).toUpperCase()}
                </div>
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