import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const MatchSimulator = ({ onConnect }) => {
  const [profiles, setProfiles] = useState({ UPSC: [], NEET: [], SSC: [] });
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    const fetchRealUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        let loadedProfiles = {
          UPSC: [
              { id: "mock_upsc_1", name: "Rahul Sharma", age: 25, location: "Old Rajinder Nagar", detail: "Targeting 2026 / Economy Mains focused", prompt: "Need someone to trade Daily Answer Reviews for GS-3." },
              { id: "mock_upsc_2", name: "Priya Mehta", age: 24, location: "West Patel Nagar", detail: "PSIR Optional / Srishti Deshmukh notes tracker", prompt: "Looking for an accountability partner for 5 AM silent study sessions." }
          ],
          NEET: [
              { id: "mock_neet_1", name: "Drishya Nair", age: 19, location: "Kota Hub", detail: "Dropper batch / Organic Chemistry specialist", prompt: "Let's test each other on complex plant physiology diagrams." }
          ],
          SSC: [
              { id: "mock_ssc_1", name: "Vikram Singh", age: 23, location: "Mukherjee Nagar", detail: "CGL track / Quant revision enthusiast", prompt: "Can swap advanced math shortcut keys for English vocabulary tests." }
          ]
        };

        querySnapshot.forEach((doc) => {
          if (doc.id === auth.currentUser?.uid) return; 

          const data = doc.data();
          const realUser = {
            id: doc.id,
            name: data.name || "Anonymous",
            age: data.age,
            location: data.studyBase || "India",
            detail: `Targeting ${data.targetYear || 'Next Exam'}`,
            prompt: `Looking for a serious study partner for ${data.examTarget}.`,
            isRealUser: true 
          };

          if (data.examTarget === 'UPSC Civil Services') {
            loadedProfiles.UPSC.unshift(realUser);
          } else if (data.examTarget === 'NEET UG' || data.examTarget === 'FMGE') {
            loadedProfiles.NEET.unshift(realUser);
          } else if (data.examTarget === 'SSC CGL') {
            loadedProfiles.SSC.unshift(realUser);
          }
        });

        setProfiles(loadedProfiles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchRealUsers();
  }, []);

  const handleStreamSelect = (stream) => {
    setSelectedStream(stream);
    setStep(2); 
  };

  const handleVibeSelect = (vibe) => {
    setSelectedVibe(vibe);
    setCurrentCardIndex(0);
    setStep(3); 
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  // ==========================================
  // THE NEW MATCH ENGINE LOGIC
  // ==========================================

  // 1. The "Check" Button (Silent Yes)
  const handleCheck = async () => {
    const currentObj = profiles[selectedStream][currentCardIndex];
    const myId = auth.currentUser.uid;
    const theirId = currentObj.id;

    try {
      // Save my "Yes" swipe to the database
      await setDoc(doc(db, 'swipes', `${myId}_${theirId}`), {
        from: myId,
        to: theirId,
        timestamp: serverTimestamp()
      });

      // Instantly check if they already swiped "Yes" on me!
      const mutualSwipe = await getDoc(doc(db, 'swipes', `${theirId}_${myId}`));
      if (mutualSwipe.exists()) {
        alert(`🎉 MUTUAL MATCH! You and ${currentObj.name} liked each other. A private room has been unlocked in your Inbox.`);
        // Note: In Phase 3, we will route them to the real Inbox instead of an alert.
      }
      
      nextCard();
    } catch (error) {
      console.error("Error saving swipe:", error);
      nextCard();
    }
  };

  // 2. The "Thunderbolt" Button (1-Message Lock)
  const handleThunderbolt = async () => {
    const currentObj = profiles[selectedStream][currentCardIndex];
    const myId = auth.currentUser.uid;
    const theirId = currentObj.id;

    // Trigger a browser popup to grab the icebreaker
    const message = window.prompt(`Send exactly one icebreaker message to ${currentObj.name}. (You cannot message them again until they reply!)`);
    
    // If they click cancel or leave it blank, stop the function
    if (!message || message.trim() === "") return; 

    try {
      // Save the connection request with a "pending_reply" lock
      await setDoc(doc(db, 'thunderbolts', `${myId}_${theirId}`), {
        from: myId,
        to: theirId,
        message: message,
        status: 'pending_reply',
        timestamp: serverTimestamp()
      });

      alert(`⚡ Thunderbolt sent to ${currentObj.name}! It is now locked in your Inbox waiting for their reply.`);
      nextCard();
    } catch (error) {
      console.error("Error sending thunderbolt:", error);
    }
  };

  // 3. The "X" Button (Pass)
  const handlePass = () => {
    // For now, we just skip. We don't need to bloat the database with "No"s yet.
    nextCard();
  };

  const resetSimulator = () => {
    setStep(1);
    setSelectedStream(null);
    setSelectedVibe(null);
    setCurrentCardIndex(0);
  };

  const renderCard = () => {
    if (loading) return <div className="text-white text-center mt-20 font-bold animate-pulse">Loading active peers...</div>;

    const list = profiles[selectedStream];
    if (currentCardIndex >= list.length) {
      return (
        <div className="text-center p-6 space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto text-lg"><i className="fa-solid fa-hourglass-end"></i></div>
          <h5 className="text-sm font-bold text-white">End of Curated Active Feed</h5>
          <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">More candidates are hopping onto this stream daily as onboarding rolls out.</p>
        </div>
      );
    }
    const currentObj = list[currentCardIndex];
    return (
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between h-72 relative overflow-hidden">
          {currentObj.isRealUser && (
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-lg">
              REAL USER
            </div>
          )}
          <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">{currentObj.name} <span className="text-xs font-normal text-slate-400">({currentObj.age})</span></span>
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full"><i className="fa-solid fa-location-dot mr-1 text-slate-500"></i> {currentObj.location}</span>
              </div>
              <p className="text-xs font-semibold text-indigo-400">{currentObj.detail}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-900/60 flex-1 flex items-center">
              <p className="text-xs text-slate-300 italic leading-relaxed">"{currentObj.prompt}"</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <i className="fa-solid fa-shield text-indigo-500/40"></i> {currentObj.isRealUser ? 'Verified Database Profile' : 'Verified Student Profile'}
          </div>
      </div>
    );
  };

  return (
    <section id="prototype" className="py-20 bg-slate-900/40 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Context Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Interactive Live Sandbox
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Experience the Flow Right Now</h2>
                    <p className="text-slate-400 leading-relaxed">
                        We built a mini-simulator directly into our website to show you exactly how effortlessly you can sort through the noise and unlock a relatable community. 
                    </p>
                </div>

                {/* Right Simulator Window Column */}
                <div className="lg:col-span-7 flex justify-center">
                    <div className="w-full max-w-[390px] h-[640px] rounded-[48px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col">
                        
                        <div className="h-6 bg-slate-950 flex items-center justify-between px-8 pt-2 text-[10px] text-slate-400 font-medium z-20">
                            <span>11:23 PM</span>
                            <div className="w-24 h-4 bg-black rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between text-left">
                            
                            {/* STEP 1 VIEW */}
                            {step === 1 && (
                            <div className="space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-extrabold text-white">Welcome, Comrade!</h4>
                                    <p className="text-xs text-slate-400">What major checkpoint are you clearing next?</p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={() => handleStreamSelect('UPSC')} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-indigo-500 group transition">
                                        <p className="font-bold text-white">UPSC Civil Services</p>
                                    </button>
                                    <button onClick={() => handleStreamSelect('NEET')} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-rose-500 group transition">
                                        <p className="font-bold text-white">NEET UG & FMGE</p>
                                    </button>
                                    <button onClick={() => handleStreamSelect('SSC')} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-amber-500 group transition">
                                        <p className="font-bold text-white">SSC CGL</p>
                                    </button>
                                </div>
                            </div>
                            )}

                            {/* STEP 2 VIEW */}
                            {step === 2 && (
                            <div className="space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-extrabold text-white">What's your study style?</h4>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={() => handleVibeSelect('Night Owl')} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-indigo-500 group transition">
                                        <p className="font-bold text-white">Night Owl Operations</p>
                                    </button>
                                    <button onClick={() => handleVibeSelect('Early Bird')} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-indigo-500 group transition">
                                        <p className="font-bold text-white">Early Morning Sprint</p>
                                    </button>
                                </div>
                            </div>
                            )}

                            {/* STEP 3 VIEW (WITH THE NEW DB BUTTONS) */}
                            {step === 3 && (
                            <div className="flex-1 flex flex-col justify-between animate-fade-in">
                                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2">
                                    <span className="text-xs font-bold text-indigo-400">Active {selectedStream} Peers</span>
                                    <button onClick={resetSimulator} className="text-[11px] text-slate-500 hover:text-white transition">Reset</button>
                                </div>
                                
                                <div className="flex-1 flex items-center justify-center">
                                    {renderCard()}
                                </div>

                                {!loading && currentCardIndex < profiles[selectedStream].length && (
                                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-900">
                                    {/* X BUTTON (Pass) */}
                                    <button onClick={handlePass} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center transition shadow-lg"><i className="fa-solid fa-xmark text-lg"></i></button>
                                    
                                    {/* THUNDERBOLT BUTTON (1-Message Lock) */}
                                    <button onClick={handleThunderbolt} className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center transition shadow-xl hover:scale-105 active:scale-95"><i className="fa-solid fa-bolt text-xl"></i></button>
                                    
                                    {/* CHECK BUTTON (Mutual Swipe) */}
                                    <button onClick={handleCheck} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition shadow-lg"><i className="fa-solid fa-check text-lg"></i></button>
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
};

export default MatchSimulator;