import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  LogIn, 
  Pill, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  RotateCw, 
  Leaf, 
  HeartHandshake, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Crown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DoctorMedi, PipThePill } from '../components/CartoonCharacters';

const Login = () => {
  const { login, demoLogin, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'admin' || loggedUser?.email === 'admin@medicycle.demo') {
        navigate('/admin');
      } else if (loggedUser?.role === 'pharmacist' || loggedUser?.email === 'pharmacist@medicycle.demo') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await demoLogin(role);
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'pharmacist') {
        navigate('/');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Left Column: Brand Story, Visual Highlights & Verification Pillars (Covers full screen on desktop) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 mb-10 select-none cursor-default">
            <div className="relative w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-400 text-slate-900 flex items-center justify-center">
                <RotateCw className="w-2.5 h-2.5 animate-[spin_8s_linear_infinite]" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Medi<span className="text-emerald-400">Cycle</span>
              </span>
              <span className="block text-[10px] font-semibold text-emerald-200 tracking-wider uppercase">
                Closed-Loop Medicine Network
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Clinical Redistribution Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Responsible Redistribution <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
              Powered by Verification.
            </span>
          </h2>

          <p className="text-slate-300 text-base max-w-lg font-normal leading-relaxed">
            Every submission is checked by registered pharmacists to guarantee clinical safety, prevent waste, and provide affordable medicines to those in need.
          </p>

          {/* 3 Core Trust Pillars */}
          <div className="mt-8 space-y-4 max-w-lg">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pharmacist-Led Inspection</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Batch numbers, physical blister integrity, and expiry windows verified before listing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dignified Affordable Access</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pre-screened medicines redistributed with mandatory valid prescription verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Zero Medicine Landfill Impact</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Diverting intact essential medicines away from incinerators into supervised medical care.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Metrics */}
        <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            <span className="font-black text-white text-lg block">1,250+</span>
            <span className="text-[11px] text-slate-400">Medicines Diverted</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-black text-white text-lg block">100%</span>
            <span className="text-[11px] text-slate-400">Pharmacist Screened</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-black text-white text-lg block">₹85,000+</span>
            <span className="text-[11px] text-slate-400">Patient Savings</span>
          </div>
        </div>
      </div>

      {/* Right Column: Clean, Spacious Full-Page Auth Form (Light Theme) */}
      <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 lg:py-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Form Header with Friendly 2D Mascot */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Authentication</span>
              </div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                Log In to MediCycle
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Access your donor submissions, medicine requests, or pharmacist verification console.
              </p>
            </div>
            {/* Friendly Mascot Companion */}
            <div className="hidden sm:block shrink-0 -mr-2 -mt-4">
              <PipThePill className="w-20 h-20 drop-shadow-sm animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* 1-Click Fast Presentation Demo Roles (User, Pharmacist, Admin) */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Select Portal / 1-Click Quick Login:</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                Presentation Mode
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* 1. Community User */}
              <button
                type="button"
                onClick={() => handleDemo('user')}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/70 text-emerald-900 border border-emerald-200 hover:border-emerald-300 font-bold text-center transition-all shadow-2xs hover:shadow-xs flex flex-col items-center gap-1 cursor-pointer group"
                title="Log in as Community User (Aarav Patel)"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900 mt-0.5">
                  User Portal
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Aarav Patel</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
                  Donate & Request
                </span>
              </button>

              {/* 2. Clinical Pharmacist */}
              <button
                type="button"
                onClick={() => handleDemo('pharmacist')}
                className="p-2.5 rounded-xl bg-white hover:bg-teal-50/70 text-teal-900 border border-teal-200 hover:border-teal-300 font-bold text-center transition-all shadow-2xs hover:shadow-xs flex flex-col items-center gap-1 cursor-pointer group"
                title="Log in as Licensed Pharmacist (Dr. Anita Sharma)"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900 mt-0.5">
                  Pharmacist
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Dr. Anita</span>
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 whitespace-nowrap">
                  Verify & Dispense
                </span>
              </button>

              {/* 3. Platform Admin */}
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50/70 text-purple-900 border border-purple-200 hover:border-purple-300 font-bold text-center transition-all shadow-2xs hover:shadow-xs flex flex-col items-center gap-1 cursor-pointer group"
                title="Log in as Platform Administrator (MediCycle Admin)"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900 mt-0.5">
                  Admin Portal
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Admin Overseer</span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 whitespace-nowrap">
                  Monitor & Impact
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Default demo: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">password123</code>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Logging In...' : 'Login In to Account'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
