import React from 'react';
import { Pill, ShieldCheck, Heart, AlertTriangle, RotateCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/signin', '/register', '/signup', '/logout'].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  if (isAuthPage) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Pill className="w-4 h-4" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center border border-white">
                  <RotateCw className="w-2 h-2" />
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">MediCycle</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Hackathon Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              A healthcare-first concept tackling pharmaceutical waste through structured submission, authorized pharmacist verification, and controlled affordable redistribution.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety First • Verified Integrity • Zero Peer-to-Peer Selling</span>
            </div>
          </div>

          {/* Platform / Account Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              {isAuthenticated ? 'Platform' : 'Account'}
            </h4>
            <ul className="space-y-2 text-xs">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/find-medicines" className="hover:text-emerald-600 transition-colors">
                      Browse Verified Medicines
                    </Link>
                  </li>
                  <li>
                    <Link to="/donate-medicine" className="hover:text-emerald-600 transition-colors">
                      Submit Unused Medicine
                    </Link>
                  </li>
                  <li>
                    <Link to="/track-activity" className="hover:text-emerald-600 transition-colors">
                      User Tracking Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-emerald-600 transition-colors">
                      My Profile
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-emerald-600 transition-colors">
                      Login In to Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-emerald-600 transition-colors">
                      Create an Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Hackathon Disclaimer Card */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Regulatory Notice
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-600">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Non-Commercial Prototype</span>
              </div>
              All medicine records, batches, and prices shown are fictional demo data for hackathon presentation. Actual medicine redistribution must comply with all applicable pharmacy laws.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediCycle Prototype. Built for Hackathon Demonstration.</p>
          <div className="flex items-center gap-1 font-medium">
            <span>Built with care for sustainable healthcare</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
