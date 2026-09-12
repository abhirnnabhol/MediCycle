import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Trash2, 
  Lock,
  Sparkles,
  Scale
} from 'lucide-react';

export default function SafetyCenterModal({ isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Verified Quality & Regulatory Protocols</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                MediCycle Safety & Standards Center
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mandatory health guidelines for pharmaceutical redistribution and public safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-200 shadow-2xs cursor-pointer shrink-0"
            aria-label="Close safety center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          
          {/* Section 1: Accepted vs Rejected Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Accepted Medicines */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-black">Medicines We Accept</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  Approved Criteria
                </span>
              </div>
              <ul className="space-y-2.5 text-slate-700 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✓</span>
                  <span><strong>Sealed / Intact Blisters:</strong> Unopened manufacturer foil strips with unbroken individual pockets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✓</span>
                  <span><strong>Unexpired Shelf-Life:</strong> Minimum 60 days remaining before the printed expiration date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✓</span>
                  <span><strong>Legible Batch Details:</strong> Clear manufacturer batch number, manufacturing date, and expiry stamp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✓</span>
                  <span><strong>Safe Storage History:</strong> Kept in clean household cabinets away from excessive sunlight or moisture.</span>
                </li>
              </ul>
            </div>

            {/* Rejected Medicines */}
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-sm font-black">Medicines We Reject</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900">
                  Strictly Prohibited
                </span>
              </div>
              <ul className="space-y-2.5 text-slate-700 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✕</span>
                  <span><strong>Expired Batches:</strong> Any medicine past its printed expiry is immediately quarantined for incineration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✕</span>
                  <span><strong>Damaged Packaging:</strong> Torn blister foils, opened syrups, unsealed bottles, or loose unboxed pills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✕</span>
                  <span><strong>Unmonitored Cold-Chain:</strong> Insulin, vaccines, or biologics lacking continuous temperature tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">✕</span>
                  <span><strong>Schedule X / Narcotics:</strong> Habit-forming drugs or controlled psychotropics are legally barred.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Prescription Gatekeeping & Pharmacy Laws */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <FileText className="w-5 h-5 text-amber-700 shrink-0" />
              <span className="text-sm font-black">Prescription Controls & Clinical Gatekeeping</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              In accordance with the <strong>Drugs and Cosmetics Act & Pharmacy Practice Regulations</strong>, Schedule H and Schedule H1 prescription medications strictly require a valid doctor's prescription before dispensing. MediCycle does not permit direct, uninspected peer-to-peer exchanges. Every batch is audited by a licensed pharmacist.
            </p>
          </div>

          {/* Section 3: Safe Disposal Policy */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Trash2 className="w-5 h-5 text-slate-600 shrink-0" />
              <span className="text-sm font-black">Safe Disposal for Safety-Quarantined Medicines</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medicines rejected during pharmacist physical inspection are safely segregated and handed over to authorized <strong>Central Pollution Control Board (CPCB)</strong> bio-medical waste operators for high-temperature incineration. Medicines must never be disposed of in domestic sinks, toilets, or open landfills.
            </p>
          </div>

          {/* Demonstration Notice */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 text-[11px] text-sky-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Prototype Demonstration Notice:</span>
              <p className="text-slate-600 leading-normal">
                Clinical profiles such as Dr. Anita Sharma are fictional demonstration personas designed to showcase complete regulatory compliance, physical audit steps, and chain-of-custody tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Protected by MediCycle Closed-Loop Custody</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body) 
    : modalContent;
}
