import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';

const DisclaimerBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  const isAuthPage = ['/login', '/signin', '/register', '/signup', '/logout'].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  if (dismissed || isAuthPage) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="leading-normal font-normal">
            <strong className="font-bold text-amber-950">Hackathon Prototype Notice:</strong> MediCycle is an educational prototype demonstrating responsible medicine waste reduction. Actual medicine redistribution, handling, storage, and disposal are subject to applicable Indian pharmaceutical laws, prescription regulations, and safety standards. Unrestricted peer-to-peer medicine selling is strictly prohibited.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 flex-shrink-0 transition-colors"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
