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
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <button onClick={onBack} className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition">
        <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">We're Listening</h2>
        <p className="text-slate-400 text-sm mb-8">
          AspirantConnect is growing fast! Let us know what features you want to see next or what we should fix.
        </p>

        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-white font-bold text-lg">Feedback Received!</h3>
            <p className="text-slate-400 text-sm mt-1">Thanks for helping us build a better platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[150px] mb-6 text-sm"
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
    </div>
  );
};

export default Feedback;