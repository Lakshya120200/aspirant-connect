import React, { useState, useEffect, useRef } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal', 
        callback: (response) => {
          setRecaptchaSolved(true);
          setError('');
        },
        'expired-callback': () => {
          setRecaptchaSolved(false);
          setError("reCAPTCHA expired. Please check the box again.");
        }
      });
      
      window.recaptchaVerifier.render().catch(err => {
        console.error("reCAPTCHA render error:", err);
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError('');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!recaptchaSolved) {
      setError("Please check the 'I am not a robot' box first.");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      let cleanNumber = phoneNumber.replace(/[\s\-()]/g, '');
      if (!cleanNumber.startsWith('+')) {
        cleanNumber = `+91${cleanNumber}`;
      }
      
      const confirmation = await signInWithPhoneNumber(auth, cleanNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2); 
    } catch (err) {
      console.error("SMS failed to send:", err);
      setError(`Failed: ${err.message}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.reset();
        setRecaptchaSolved(false);
      }
    } finally {
      // This guarantees the button will NEVER get stuck on "Sending Code..."
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      console.error("OTP Verification failed:", err);
      setError("Invalid OTP. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-6 animate-fade-in">
          <span className="text-2xl font-bold text-white">AC</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Welcome to AspirantConnect
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Join the exclusive network for serious aspirants
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800 text-center relative overflow-hidden">
          
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-left break-words">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="animate-fade-in flex flex-col gap-6">
              <div>
                <p className="text-sm text-slate-400 mb-4">Sign in to continue</p>
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-950 hover:bg-slate-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
                >
                  {/* FULL GOOGLE ICON RESTORED */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.1-1.92 3.31-4.74 3.31-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-medium text-white">Continue with Google</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">Or use phone number</span>
                </div>
              </div>

              <form onSubmit={handleSendCode} className="flex flex-col gap-4 text-left">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-center w-full my-2 min-h-[78px]">
                    <div id="recaptcha-container" ref={recaptchaRef}></div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !phoneNumber || !recaptchaSolved}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending Code..." : "Get OTP"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col gap-6 text-left">
              <p className="text-sm text-slate-400 text-center">
                Code sent to your phone
              </p>
              
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-400 mb-1 text-center">
                    Enter 6-digit OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength="6"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { 
                  setStep(1); 
                  setOtp(''); 
                  setError('');
                  if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.reset();
                    setRecaptchaSolved(false);
                  }
                }}
                className="text-sm text-slate-500 hover:text-white transition mt-2 text-center"
              >
                ← Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;