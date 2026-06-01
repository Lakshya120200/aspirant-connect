import React from 'react';

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-6">
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
        <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800 text-center">
          
          <p className="text-sm text-slate-400 mb-6">Sign in to continue</p>

          <button
            onClick={(e) => { e.preventDefault(); onLogin(); }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-950 hover:bg-slate-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
          >
            {/* Official Google SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.1-1.92 3.31-4.74 3.31-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-white">Continue with Google</span>
          </button>

          <div className="mt-6 flex items-center justify-center text-xs text-slate-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure Single Sign-On
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;