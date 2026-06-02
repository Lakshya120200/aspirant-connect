import { useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const PresenceManager = () => {
  useEffect(() => {
    const updateUserStatus = async (status) => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          status: status,
          lastSeen: serverTimestamp()
        });
      }
    };

    // Set online on mount
    updateUserStatus('online');

    // Set offline on unmount (when user logs out or closes app)
    return () => {
      updateUserStatus('offline');
    };
  }, []);

  return null; // This component doesn't show anything
};

// Change your last line to this:
export default PresenceManager;