import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Onboarding = ({ onProfileCreated, user }) => {
  // Track which screen the user is on (1, 2, or 3)
  const [step, setStep] = useState(1);

  // Common State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Exam State
  const [examTarget, setExamTarget] = useState('');

  // Stream-Specific State
  const [targetYear, setTargetYear] = useState('');
  const [optionalSubject, setOptionalSubject] = useState('');
  const [studyBase, setStudyBase] = useState('');
  const [preferredPost, setPreferredPost] = useState('');

  // Move to Step 2
  const handleBasicsSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  // Move to Step 3
  const selectExam = (exam) => {
    setExamTarget(exam);
    setStep(3);
  };

  // Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const profileData = {
      name,
      age,
      gender,
      examTarget,
      email: user.email,
      createdAt: serverTimestamp(),
      targetYear,
    };

    if (examTarget === 'UPSC Civil Services') {
      profileData.optionalSubject = optionalSubject;
      profileData.studyBase = studyBase;
    } else if (examTarget === 'SSC CGL') {
      profileData.preferredPost = preferredPost;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), profileData);
      onProfileCreated(); 
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center pt-16 px-6 text-white font-sans">
      
      {/* ================= STEP 1: BASICS ================= */}
      {step === 1 && (
        <div className="w-full max-w-md animate-fade-in mt-12">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-bold tracking-tight">Let's get started.</h2>
             <p className="mt-2 text-slate-400">Just the basics for your profile.</p>
          </div>

          <form onSubmit={handleBasicsSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Age</label>
                <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
                <select required value={gender} onChange={(e) => setGender(e.target.value)} 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none">
                  <option value="" className="bg-slate-900">Select</option>
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors mt-8">
              Continue
            </button>
          </form>
        </div>
      )}

      {/* ================= STEP 2: EXAM SELECTION (From Screenshot) ================= */}
      {step === 2 && (
        <div className="w-full max-w-md animate-fade-in mt-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome, Comrade!</h1>
            <p className="text-slate-400 text-[15px] leading-relaxed px-4">
              Let's strip away the isolation. What major checkpoint are you clearing next?
            </p>
          </div>

          <div className="space-y-4">
            {/* UPSC Card */}
            <button onClick={() => selectExam('UPSC Civil Services')} className="w-full flex items-center justify-between bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-2xl p-5 transition-all text-left group">
              <div>
                <h3 className="text-xl font-semibold mb-1">UPSC Civil Services</h3>
                <p className="text-sm text-slate-500">IAS, IPS, IFS Trackers</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
            </button>

            {/* NEET Card */}
            <button onClick={() => selectExam('NEET UG')} className="w-full flex items-center justify-between bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-2xl p-5 transition-all text-left group">
              <div>
                <h3 className="text-xl font-semibold mb-1">NEET UG</h3>
                <p className="text-sm text-slate-500">Medical Aspirants Forum</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
            </button>

            {/* FMGE Card */}
            <button onClick={() => selectExam('FMGE')} className="w-full flex items-center justify-between bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-2xl p-5 transition-all text-left group">
              <div>
                <h3 className="text-xl font-semibold mb-1">FMGE Aspirants</h3>
                <p className="text-sm text-slate-500">Foreign Medical Aspirants Forum</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
            </button>

            {/* SSC Card */}
            <button onClick={() => selectExam('SSC CGL')} className="w-full flex items-center justify-between bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-2xl p-5 transition-all text-left group">
              <div>
                <h3 className="text-xl font-semibold mb-1">SSC CGL</h3>
                <p className="text-sm text-slate-500">Combined Graduate Level</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
            </button>
          </div>
          
          <button onClick={() => setStep(1)} className="w-full text-center mt-8 text-sm text-slate-500 hover:text-slate-300">
            ← Back to basics
          </button>
        </div>
      )}

      {/* ================= STEP 3: STREAM DETAILS ================= */}
      {step === 3 && (
        <div className="w-full max-w-md animate-fade-in mt-12">
          <div className="text-center mb-10">
             <h2 className="text-2xl font-bold tracking-tight text-indigo-400">{examTarget}</h2>
             <p className="mt-2 text-slate-400">Let's refine your target profile.</p>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Year</label>
              <input type="text" required placeholder="e.g., 2026" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>

            {examTarget === 'UPSC Civil Services' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Optional Subject</label>
                  <input type="text" required placeholder="e.g., PSIR, Sociology" value={optionalSubject} onChange={(e) => setOptionalSubject(e.target.value)} 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Base / Location</label>
                  <input type="text" required placeholder="e.g., Old Rajinder Nagar" value={studyBase} onChange={(e) => setStudyBase(e.target.value)} 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </>
            )}

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors">
                Back
              </button>
              <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors">
                Enter Study Room
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Onboarding;