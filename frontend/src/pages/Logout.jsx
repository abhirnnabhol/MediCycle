import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  RotateCw, 
  Pill,
  HeartHandshake,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logout = () => {
  const { logout, demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);
  const [autoRedirectPaused, setAutoRedirectPaused] = useState(false);

  // Ensure user is signed out when reaching this page
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  // Optional countdown to home
  useEffect(() => {
    if (autoRedirectPaused) return;

    if (countdown <= 0) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, autoRedirectPaused, navigate]);

  const handleDemo = async (role) => {
    try {
      await demoLogin(role);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 bg-slate-50 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-xl w-full mx-auto relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card text-center">
          {/* Animated Icon Emblem */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-full h-full rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <LogOut className="w-9 h-9 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Session Securely Closed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-2">
            You Have Been Signed Out
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you for being part of the MediCycle mission. Your actions help reduce medicine waste and ensure affordable healthcare reach.
          </p>

          {/* Impact summary pills */}
          <div className="my-6 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100">
              <Leaf className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-800 text-[11px]">Zero Waste</span>
              <span className="text-[10px] text-slate-500">Landfill Safe</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-600 mb-1" />
              <span className="font-bold text-slate-800 text-[11px]">Pharmacist</span>
              <span className="text-[10px] text-slate-500">Audited Flow</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100">
              <HeartHandshake className="w-4 h-4 text-teal-600 mb-1" />
              <span className="font-bold text-slate-800 text-[11px]">Affordable</span>
              <span className="text-[10px] text-slate-500">Patient Care</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In Again</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>Return to Home</span>
            </Link>
          </div>

          {/* 1-Click Fast Presentation Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Switch Presentation Persona:</span>
              </div>
              <span className="text-[10px] text-slate-400">1-Click Fast Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleDemo('user')}
                className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 font-bold transition-all shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👤 User (Community)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-800 border border-slate-200 hover:border-amber-300 font-bold transition-all shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👩‍⚕️ Pharmacist (Admin)</span>
              </button>
            </div>
          </div>

          {/* Auto redirect info */}
          <div className="mt-6 pt-4 text-[11px] text-slate-400 flex items-center justify-center gap-2">
            {!autoRedirectPaused ? (
              <>
                <span>Returning to homepage in <strong className="text-slate-700">{countdown}s</strong></span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setAutoRedirectPaused(true)}
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Stay on this page
                </button>
              </>
            ) : (
              <span>Automatic redirect paused. Feel free to explore or sign back in.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
