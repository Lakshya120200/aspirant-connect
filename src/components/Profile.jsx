import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import heic2any from 'heic2any'; // <-- 1. IMPORTED THE CONVERTER

const Profile = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // <-- 2. NEW STATE to show a spinner while converting iPhone photos
  const [isConverting, setIsConverting] = useState(false); 

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    studyBase: '',
    targetYear: '',
    examTarget: '',
    prompt: '',
    photoURL: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          name: data.name || '',
          age: data.age || '',
          studyBase: data.studyBase || '',
          targetYear: data.targetYear || '',
          examTarget: data.examTarget || '',
          prompt: data.prompt || '',
          photoURL: data.photoURL || ''
        });
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // <-- 3. UPGRADED IMAGE HANDLER
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if the file is an Apple HEIC image
    if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
      setIsConverting(true);
      try {
        // Convert HEIC to a standard JPEG
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8 // Compresses slightly for faster loading
        });
        
        // Handle edge case where heic2any returns an array of images
        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        
        // Create a new File object that Firebase and browsers understand
        const newFileName = file.name.replace(/\.heic$/i, ".jpg");
        const convertedFile = new File([finalBlob], newFileName, { type: "image/jpeg" });

        setImageFile(convertedFile);
        setFormData({ ...formData, photoURL: URL.createObjectURL(convertedFile) });
      } catch (error) {
        console.error("Error converting HEIC:", error);
        alert("We couldn't process this image format. Please try a standard JPG or PNG.");
      } finally {
        setIsConverting(false);
      }
    } else {
      // If it's already a normal JPG/PNG, proceed normally!
      setImageFile(file);
      setFormData({ ...formData, photoURL: URL.createObjectURL(file) });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let updatedPhotoURL = formData.photoURL;

      // If they selected a new image, upload it to Firebase Storage first!
      if (imageFile) {
        const imageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
        await uploadBytes(imageRef, imageFile);
        updatedPhotoURL = await getDownloadURL(imageRef);
      }

      // Update the Firestore database with the new text and image URL
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        photoURL: updatedPhotoURL
      });

      alert("🎉 Profile updated successfully!");
      onBack(); // Send them back to the dashboard
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white text-center mt-20 font-bold animate-pulse">Loading Profile...</div>;

  return (
    <div className="max-w-3xl mx-auto w-full mb-8 animate-fade-in bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-black text-white">Edit Profile</h2>
        <button onClick={onBack} className="text-slate-400 hover:text-white transition flex items-center gap-2 font-semibold">
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div className="relative group">
            {isConverting ? (
                // <-- 4. Shows a spinner while the iPhone photo converts
                <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                </div>
            ) : formData.photoURL ? (
              <img src={formData.photoURL} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/30" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-indigo-500/30 flex items-center justify-center text-4xl text-slate-500 font-bold">
                {formData.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {!isConverting && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <i className="fa-solid fa-camera text-white text-xl"></i>
                    {/* Updated accept string to explicitly allow HEIC selection on mobile */}
                    <input type="file" accept="image/jpeg, image/png, image/webp, image/heic, .heic" onChange={handleImageChange} className="hidden" />
                </label>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white mb-1">Profile Picture</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-3">Upload a clear photo of yourself. Profiles with photos get 3x more connection requests!</p>
            <label className={`inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer transition border border-slate-700 ${isConverting ? 'opacity-50 pointer-events-none' : ''}`}>
              {isConverting ? 'Processing...' : 'Choose Image'}
              <input type="file" accept="image/jpeg, image/png, image/webp, image/heic, .heic" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Text Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / Study Base</label>
            <input type="text" name="studyBase" value={formData.studyBase} onChange={handleInputChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Year</label>
            <input type="text" name="targetYear" value={formData.targetYear} onChange={handleInputChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio / Prompt (What are you looking for?)</label>
          <textarea name="prompt" value={formData.prompt} onChange={handleInputChange} rows="3" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"></textarea>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button type="submit" disabled={saving || isConverting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;