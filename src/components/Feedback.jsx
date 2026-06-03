import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Feedback = ({ onBack }) => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      await addDoc(collection(db, 'feedback'), {
        text: feedback,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in space-y-6">
      {/* Back Button */}
      <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Dashboard
      </button>

      {/* Main Feedback Form Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with Icon */}
        <div className="flex flex-col items-center mb-8 text-center relative z-10">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-indigo-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">We're Listening</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            AspirantConnect is growing fast! Let us know what features you want to see next or what we should fix.
          </p>
        </div>

        {/* Form or Success Message */}
        {submitted ? (
          <div className="text-center py-6 animate-fade-in relative z-10">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-emerald-500/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg">Feedback Received!</h3>
            <p className="text-slate-400 text-sm mt-1">Thanks for helping us build a better platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10">
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[150px] mb-6 text-sm resize-none shadow-inner"
              placeholder="What's one thing that would make your study sessions better?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
            >
              Send Feedback
            </button>
          </form>
        )}
      </div>

      {/* Contact Owner Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Contact the Developer</h3>
            <p className="text-slate-400 text-sm mt-0.5">Reach out directly for inquiries or support.</p>
          </div>
        </div>

        <div className="flex flex-col w-full md:w-auto gap-3">
          {/* Email Button */}
          <a 
            href="mailto:lakshyamehta4@gmail.com" 
            className="flex items-center gap-3 bg-slate-950 border border-slate-800 hover:border-slate-600 px-5 py-3 rounded-xl transition text-slate-300 hover:text-white text-sm w-full md:w-[260px]"
          >
            <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">lakshyamehta4@gmail.com</span>
          </a>
          
          {/* Phone Button */}
          <a 
            href="tel:+919521271506" 
            className="flex items-center gap-3 bg-slate-950 border border-slate-800 hover:border-slate-600 px-5 py-3 rounded-xl transition text-slate-300 hover:text-white text-sm w-full md:w-[260px]"
          >
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>+91 9521271506</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Feedback;