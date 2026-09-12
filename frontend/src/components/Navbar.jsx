import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Pill, 
  RotateCw,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  ArrowRight,
  Award
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import SafetyCenterModal from './SafetyCenterModal';
import MediPointsHistoryModal from './MediPointsHistoryModal';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, demoLogin, isAdmin, isPharmacist, isPersonA, isPersonB, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);

  const demoDropdownRef = useRef(null);
  const headerRef = useRef(null);

  // Outside click & Escape key dismiss for Demo Roles dropdown
  useEffect(() => {
    if (!demoOpen) return;

    const handleOutsideClick = (e) => {
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(e.target)) {
        setDemoOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDemoOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [demoOpen]);

  // Outside click & Escape key dismiss for Mobile Menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isAuthPage = ['/login', '/signin', '/register', '/signup', '/logout'].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const isRegisterPage = location.pathname.includes('register') || location.pathname.includes('signup');
  const isHome = location.pathname === '/' || location.pathname === '/pharmacist';

  const handleDemoSwitch = async (role) => {
    setDemoOpen(false);
    setMobileMenuOpen(false);
    await demoLogin(role);
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'pharmacist') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-1.5 lg:gap-2 xl:gap-3 flex-wrap xl:flex-nowrap">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2 shrink-0 mr-1 select-none cursor-default">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xs">
              <Pill className="w-4 h-4 text-white stroke-[2.2]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center border border-white">
                <RotateCw className="w-2 h-2" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
                Medi<span className="text-emerald-600">Cycle</span>
              </span>
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5 whitespace-nowrap">
                Responsible Redistribution
              </span>
            </div>
          </div>

          {/* Center: Dynamic Role-Specific Website Navigation */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 flex-nowrap shrink-0">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  /* 1. ADMIN (OVERSEER) NAVBAR */
                  <>
                    <Link
                      to="/admin"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        (location.pathname === '/admin' && (!location.search || location.search.includes('tab=overview'))) || location.pathname === '/admin/overview'
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      🏠 Overview
                    </Link>

                    <Link
                      to="/admin/people"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        location.pathname.includes('/people') || location.search.includes('tab=people')
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      👥 People
                    </Link>

                    <Link
                      to="/admin/medicines"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        location.pathname.includes('/medicines') || location.search.includes('tab=medicines')
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      💊 Medicines
                    </Link>

                    <Link
                      to="/admin/requests"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        location.pathname.includes('/requests') || location.search.includes('tab=requests')
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      📋 Requests
                    </Link>

                    <Link
                      to="/admin/activity"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        location.pathname.includes('/activity') || location.search.includes('tab=activity')
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      📊 Activity
                    </Link>

                    <Link
                      to="/admin/alerts"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        location.pathname.includes('/alerts') || location.search.includes('tab=alerts')
                          ? 'text-purple-900 font-bold bg-purple-50'
                          : 'text-slate-700 hover:text-purple-800 hover:bg-slate-50'
                      }`}
                    >
                      ⚠️ Alerts
                    </Link>
                  </>
                ) : isPharmacist ? (
                  /* 2. PHARMACIST (DR. ANITA) NAVBAR */
                  <>
                    <Link
                      to="/"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        isHome ? 'text-amber-900 font-bold bg-amber-50' : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      🏠 Home
                    </Link>

                    <Link
                      to="/pharmacist/verification"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.startsWith('/pharmacist/verification') || (location.pathname === '/admin' && (!location.search || location.search.includes('tab=verification')))
                          ? 'text-amber-900 font-bold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>🔍 Verification Queue</span>
                    </Link>

                    <Link
                      to="/pharmacist/requests"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.includes('/requests') || location.search.includes('tab=requests')
                          ? 'text-amber-900 font-bold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>📋 Medicine Requests</span>
                    </Link>

                    <Link
                      to="/pharmacist/inventory"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.includes('/inventory') || location.search.includes('tab=all-medicines')
                          ? 'text-amber-900 font-bold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>💊 Medicine Inventory</span>
                    </Link>

                    <Link
                      to="/pharmacist/expiry-alerts"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.includes('/expiry-alerts') || location.search.includes('tab=expiry-alerts')
                          ? 'text-amber-900 font-bold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>⚠️ Expiry Alerts</span>
                    </Link>

                    <Link
                      to="/pharmacist/activity"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.search.includes('tab=impact') || location.pathname.includes('/activity')
                          ? 'text-amber-900 font-bold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>📊 Impact / Activity</span>
                    </Link>
                  </>
                ) : (
                  /* 3. UNIFIED USER (ALL COMMUNITY CITIZENS: AARAV, PRIYA, ETC.) */
                  <>
                    <Link
                      to="/"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg ${
                        isHome ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      🏠 Home
                    </Link>

                    <Link
                      to="/donate-medicine"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.startsWith('/donate-medicine') || location.pathname.startsWith('/submit')
                          ? 'text-emerald-700 font-bold bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>💊 Donate Medicine</span>
                    </Link>

                    <Link
                      to="/my-donations"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname === '/my-donations'
                          ? 'text-emerald-700 font-bold bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>📦 My Donations</span>
                    </Link>

                    <Link
                      to="/find-medicines"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname.startsWith('/find-medicines') || location.pathname.startsWith('/browse')
                          ? 'text-emerald-700 font-bold bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>🔍 Find Medicines</span>
                    </Link>

                    <Link
                      to="/my-requests"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname === '/my-requests'
                          ? 'text-emerald-700 font-bold bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>📋 My Requests</span>
                    </Link>

                    <Link
                      to="/track-activity"
                      className={`text-xs font-semibold transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg flex items-center gap-1 ${
                        location.pathname === '/track-activity' || location.pathname === '/dashboard' || location.pathname === '/activity'
                          ? 'text-emerald-700 font-bold bg-emerald-50'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>🔄 Track Activity</span>
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </nav>

          {/* Right: Actions & Fast Demo Tool */}
          <div className="hidden md:flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Demo Switcher Dropdown (subtle pill) */}
            <div className="relative" ref={demoDropdownRef}>
              <button
                onClick={() => setDemoOpen((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-all shrink-0 cursor-pointer"
                title="Switch demo presenter account"
                aria-expanded={demoOpen}
                aria-haspopup="true"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Roles</span>
                <ChevronDown className={`w-3 h-3 text-emerald-600 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
              </button>

              {demoOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-card p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Presentation Role:
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('user')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex flex-col gap-0.5 mt-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-900">👤 User (Aarav / Priya)</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">Community</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Donate surplus & request eligible medicines</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('pharmacist')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950">👨‍⚕️ Pharmacist (Dr. Anita)</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">Clinical</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Verifies batch, audits Rx & dispenses</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-950">👑 Admin (MediCycle Admin)</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">Overseer</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Monitor people, platform flow & activity</span>
                  </button>

                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        setDemoOpen(false);
                        try {
                          await api.resetDemo();
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-full text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors flex items-center justify-between text-xs font-bold cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="w-3 h-3 text-amber-700" />
                        Reset Demo Scenario
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded font-black">
                        DEMO ONLY
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Safety Center Button */}
            <button
              onClick={() => setSafetyModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer shrink-0"
              title="View MediCycle Safety Center & Protocols"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safety Center</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 shrink-0">
                <NotificationDropdown />

                {/* MediPoints Passbook trigger for community members */}
                {!isAdmin && !isPharmacist && (
                  <button
                    onClick={() => setPointsModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 hover:bg-teal-100/80 transition-all text-xs font-bold text-teal-800 shadow-xs cursor-pointer shrink-0 group"
                    title="View your MediPoints balance and passbook"
                  >
                    <Award className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                    <span className="font-mono font-extrabold text-teal-900">
                      {(user.mediPoints || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold uppercase">pts</span>
                  </button>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors shrink-0"
                  title="View Profile & Impact"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[70px] xl:max-w-[85px]">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {isRegisterPage ? (
                  <Link
                    to="/login"
                    className="px-5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 transition-colors"
                  >
                    Login
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="px-5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white flex flex-col gap-2 animate-in fade-in duration-150">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 rounded-xl flex items-center justify-between"
                    >
                      <span>📊 Overview</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">HQ</span>
                    </Link>
                    <Link
                      to="/admin/people"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      👥 People
                    </Link>
                    <Link
                      to="/admin/medicines"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      💊 Medicines
                    </Link>
                    <Link
                      to="/admin/requests"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      📋 Requests
                    </Link>
                    <Link
                      to="/admin/activity"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      📜 Activity
                    </Link>
                    <Link
                      to="/admin/alerts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between"
                    >
                      <span>🔔 Alerts</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Center</span>
                    </Link>
                  </>
                ) : isPharmacist ? (
                  <>
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      🏠 Home
                    </Link>
                    <Link
                      to="/pharmacist/verification"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 rounded-xl flex items-center justify-between"
                    >
                      <span>🔍 Verification Queue</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Queue</span>
                    </Link>
                    <Link
                      to="/pharmacist/requests"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 rounded-xl"
                    >
                      📋 Medicine Requests
                    </Link>
                    <Link
                      to="/pharmacist/inventory"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 rounded-xl"
                    >
                      💊 Medicine Inventory
                    </Link>
                    <Link
                      to="/pharmacist/expiry-alerts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 rounded-xl"
                    >
                      ⚠️ Expiry Alerts
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      🏠 Home
                    </Link>
                    <Link
                      to="/donate-medicine"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      💊 Donate Medicine
                    </Link>
                    <Link
                      to="/my-donations"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      📦 My Donations
                    </Link>
                    <Link
                      to="/find-medicines"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between"
                    >
                      <span>🔍 Find Medicines</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Catalog</span>
                    </Link>
                    <Link
                      to="/my-requests"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      📋 My Requests
                    </Link>
                    <Link
                      to="/track-activity"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      🔄 Track Activity
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  👤 Profile
                </Link>
              </>
            ) : null}

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase px-3">
                Switch Demo Presenter:
              </span>
              <div className="grid grid-cols-3 gap-1.5 px-3">
                <button
                  onClick={() => handleDemoSwitch('user')}
                  className="px-2 py-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-center"
                >
                  👤 User
                </button>
                <button
                  onClick={() => handleDemoSwitch('pharmacist')}
                  className="px-2 py-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold text-center"
                >
                  👩‍⚕️ Pharm
                </button>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="px-2 py-2 text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl font-bold text-center"
                >
                  👑 Admin
                </button>
              </div>

              {isAuthenticated ? (
                <div className="px-3 pt-2 flex flex-col gap-2">
                  <Link
                    to={isAdmin ? '/admin' : isPharmacist ? '/' : '/track-activity'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold bg-slate-100 rounded-xl"
                  >
                    Open {isAdmin ? 'Admin Portal' : isPharmacist ? 'Pharmacist Portal' : 'My Activity'}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl text-center"
                  >
                    Sign Out ({user.name})
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3 pt-2">
                  {isRegisterPage ? (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 text-white text-center rounded-xl"
                    >
                      Login In to Account
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 text-white text-center rounded-xl"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Safety Center Modal */}
      <SafetyCenterModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* MediPoints Passbook Modal */}
      <MediPointsHistoryModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
