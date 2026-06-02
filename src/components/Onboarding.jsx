import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Onboarding = ({ onProfileCreated, user }) => {
  // 1. Common State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [photo, setPhoto] = useState(null); // We will wire this to Firebase Storage next!

  // 2. Exam State
  const [examTarget, setExamTarget] = useState('');

  // 3. Stream-Specific State
  const [targetYear, setTargetYear] = useState('');
  const [optionalSubject, setOptionalSubject] = useState('');
  const [studyBase, setStudyBase] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [preferredPost, setPreferredPost] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Package the standard data
    const profileData = {
      name,
      age,
      gender,
      examTarget,
      email: user.email,
      createdAt: serverTimestamp(),
    };

    // Attach stream-specific data based on what they chose
    if (examTarget === 'UPSC') {
      profileData.targetYear = targetYear;
      profileData.optionalSubject = optionalSubject;
      profileData.studyBase = studyBase;
    } else if (examTarget === 'SSC') {
      profileData.targetYear = targetYear;
      profileData.preferredPost = preferredPost;
    } else if (examTarget === 'NEET') {
      profileData.targetYear = targetYear;
      profileData.targetScore = targetScore;
    }

    try {
      // Save this new profile document into Firestore using their secure Google ID
      await setDoc(doc(db, 'users', user.uid), profileData);
      
      // Tell App.jsx that the profile is done so it loads the Chat/Simulator!
      onProfileCreated(); 
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold">Build Your Profile</h2>
        <p className="mt-2 text-sm text-slate-400">Help us find your perfect study peer</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- COMMON INPUTS --- */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
              <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
              <select required value={gender} onChange={(e) => setGender(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500" />
          </div>

          {/* --- EXAM SELECTION --- */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-sm font-medium text-indigo-400 mb-1">Target Examination</label>
            <select required value={examTarget} onChange={(e) => setExamTarget(e.target.value)} 
              className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold">
              <option value="">Select your path...</option>
              <option value="UPSC">UPSC CSE</option>
              <option value="SSC">SSC CGL / CHSL</option>
              <option value="NEET">NEET UG</option>
            </select>
          </div>

          {/* --- DYNAMIC: UPSC INPUTS --- */}
          {examTarget === 'UPSC' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Year</label>
                <input type="text" required placeholder="e.g., 2026" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Optional Subject</label>
                <input type="text" required placeholder="e.g., PSIR, Sociology" value={optionalSubject} onChange={(e) => setOptionalSubject(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Current Base / Location</label>
                <input type="text" required placeholder="e.g., Old Rajinder Nagar, Delhi" value={studyBase} onChange={(e) => setStudyBase(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
            </div>
          )}

          {/* --- DYNAMIC: SSC INPUTS --- */}
          {examTarget === 'SSC' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Year</label>
                <input type="text" required value={targetYear} onChange={(e) => setTargetYear(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Post</label>
                <input type="text" placeholder="e.g., Income Tax Inspector" value={preferredPost} onChange={(e) => setPreferredPost(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
            </div>
          )}

          {/* --- DYNAMIC: NEET INPUTS --- */}
          {examTarget === 'NEET' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Year</label>
                <input type="text" required value={targetYear} onChange={(e) => setTargetYear(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Score</label>
                <input type="text" placeholder="e.g., 650+" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 px-4 rounded-xl font-bold transition mt-6">
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};
export default Onboarding;