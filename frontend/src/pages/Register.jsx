import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  UserPlus, 
  Pill, 
  RotateCw, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HeartHandshake, 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Building2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
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
      await register(formData, false);
      navigate('/login');
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Left Column: Brand Story & Impact Narrative (Covers full screen on desktop) */}
      <div className="lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative glows */}
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
                Controlled Redistribution Network
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Join the Closed-Loop Healthcare Movement</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Transforming Unused Medicine <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
              Into Dignified Access.
            </span>
          </h2>

          <p className="text-slate-300 text-base max-w-lg font-normal leading-relaxed mb-8">
            Whether you are donating unopened medicines or a patient needing low-cost access, MediCycle provides a trusted, pharmacist-supervised pathway.
          </p>

          {/* 4 Steps to Participate */}
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <p className="text-xs text-slate-200">
                <strong className="text-white block font-bold">Submit Unused Medicine</strong>
                Upload details of sealed, unexpired medicines with batch & blister photos.
              </p>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <p className="text-xs text-slate-200">
                <strong className="text-white block font-bold">Clinical Verification</strong>
                Authorized pharmacists inspect safety, packaging, seal, and expiry timeline.
              </p>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <p className="text-xs text-slate-200">
                <strong className="text-white block font-bold">Safe Controlled Access</strong>
                Eligible medicines are provided to pre-screened patients with prescription verification.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Guarantee */}
        <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Strict adherence to pharmacy safety guidelines. Zero unrestricted peer-to-peer selling.
          </span>
        </div>
      </div>

      {/* Right Column: Clean, Spacious Full-Page Register Form (Light Theme) */}
      <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 lg:py-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Account Registration</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Join as an individual donor, patient recipient, or authorized verifier.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Aarav Patel / Dr. Anita Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium transition-all"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium transition-all"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Select Your Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all cursor-pointer"
                >
                  <option value="user">Individual (Donor / Patient Recipient)</option>
                  <option value="admin">Authorized Pharmacist / Admin Verifier</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {formData.role === 'admin' 
                  ? 'Access the clinical inspection queue and approval dashboard.' 
                  : 'Submit surplus medicines or request verified medicines.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
            <div>
              Already registered?{' '}
              <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                Login in to account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
