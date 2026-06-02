import { useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const PresenceManager = () => {
  useEffect(() => {
    let currentUser = null;

    const setOnline = async () => {
      if (!currentUser) return;
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { 
          isOnline: true, 
          lastActive: serverTimestamp() 
        });
      } catch (error) { console.error(error); }
    };

    const setOffline = async () => {
      if (!currentUser) return;
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), { 
          isOnline: false, 
          lastActive: serverTimestamp() 
        });
      } catch (error) { console.error(error); }
    };

    // Listen to Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        setOnline(); // Set online immediately on login/load
      } else {
        if (currentUser) setOffline();
        currentUser = null;
      }
    });

    // Detect if user switches tabs or minimizes browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      } else {
        setOffline();
      }
    };

    // Detect if user closes the tab/browser entirely
    const handleBeforeUnload = () => {
      setOffline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribeAuth();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOffline(); // Set offline if component unmounts
    };
  }, []);

  return null; // This component operates invisibly in the background
};

export default PresenceManager;