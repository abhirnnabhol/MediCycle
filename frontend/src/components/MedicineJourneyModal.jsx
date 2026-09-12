import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  AlertCircle,
  Truck,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { api } from '../services/api';

export default function MedicineJourneyModal({ medicineId, initialData = null, onClose }) {
  const [loading, setLoading] = useState(!initialData);
  const [journey, setJourney] = useState(initialData);
  const [error, setError] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!medicineId && !initialData) return;

    if (medicineId) {
      let isMounted = true;
      setLoading(true);
      api
        .getMedicineJourney(medicineId)
        .then((res) => {
          if (isMounted) {
            setJourney(res.data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Failed to load medicine lifecycle journey.');
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [medicineId, initialData]);

  if (!medicineId && !initialData) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'Pending trigger';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStepIcon = (key, state) => {
    if (state === 'rejected') return <AlertCircle className="w-5 h-5 text-rose-500" />;
    switch (key) {
      case 'SUBMITTED':
        return <Package className="w-5 h-5" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-5 h-5" />;
      case 'AVAILABLE':
        return <Layers className="w-5 h-5" />;
      case 'REQUESTED':
        return <UserCheck className="w-5 h-5" />;
      case 'REVIEW':
        return <Stethoscope className="w-5 h-5" />;
      case 'DISPENSED':
        return <HeartHandshake className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Ready
        </span>
      );
    }
    if (s === 'REQUESTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3.5 h-3.5" /> Recipient Claimed
        </span>
      );
    }
    if (s === 'DISPENSED' || s === 'COMPLETED' || s === 'SOLD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
          <HeartHandshake className="w-3.5 h-3.5" /> Dispensed to Patient
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5" /> Verification Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5" /> Pending Verification
      </span>
    );
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] my-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  {journey?.name || 'Medicine Lifecycle Journey'}
                </h3>
                {journey && getStatusBadge(journey.currentStatus)}
              </div>
              <p className="text-xs text-slate-500">
                Transparent verification & redistribution timeline from donor to patient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Fetching verified chain of custody...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <p>{error}</p>
            </div>
          )}

          {journey && !loading && (
            <>
              {/* Top Quick Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Donated
                  </span>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">
                    {journey.originalQuantity}{' '}
                    <span className="text-xs font-normal text-slate-500">units</span>
                  </p>
                  <span className="text-[11px] text-slate-500">Batch #{journey.batchNumber}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Available Stock
                  </span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {journey.remainingQuantity}{' '}
                    <span className="text-xs font-normal text-slate-500">units</span>
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {journey.remainingQuantity > 0 ? 'Ready for patient claim' : 'Fully allocated'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Quality Verifier
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {journey.verification?.pharmacistName || 'Pending Review'}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> State Certified
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Recipient Status
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {journey.request
                      ? `${journey.request.quantity} units requested`
                      : 'No Active Claim'}
                  </p>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    {journey.request
                      ? `Status: ${journey.request.status}`
                      : 'Open to eligible patients'}
                  </span>
                </div>
              </div>

              {/* Verified Chain of Custody Timeline */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" /> Complete 6-Stage Journey
                  </h4>
                  <span className="text-xs text-slate-400">Database connected live log</span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {journey.steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';
                    const isRejected = step.status === 'rejected';

                    return (
                      <div key={step.key || idx} className="relative group">
                        {/* Node Icon */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isCompleted
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : isInProgress
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                              : isRejected
                              ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {getStepIcon(step.key, step.status)}
                        </div>

                        {/* Card */}
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-white border-emerald-200 shadow-sm'
                              : isInProgress
                              ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                              : isRejected
                              ? 'bg-rose-50/50 border-rose-200'
                              : 'bg-slate-50/60 border-slate-200/60 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">
                                Stage 0{idx + 1}
                              </span>
                              <h5
                                className={`text-sm font-bold ${
                                  isCompleted
                                    ? 'text-emerald-950'
                                    : isInProgress
                                    ? 'text-amber-950'
                                    : isRejected
                                    ? 'text-rose-950'
                                    : 'text-slate-700'
                                }`}
                              >
                                {step.title}
                              </h5>
                            </div>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(step.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {step.description}
                          </p>

                          {step.detail && (
                            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                              <span className="font-medium text-slate-600">{step.detail}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isInProgress
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : isRejected
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {step.status.replace('_', ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Notice Card */}
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sky-950">
                    Patient & Donor Privacy Standards
                  </span>
                  <p className="text-sky-800/90 text-[11px] leading-relaxed">
                    MediCycle preserves recipient and donor confidentiality. Only verified medical
                    pharmacists inspect prescriptions and identity credentials.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            MediCycle Safe Redistribution Ledger &copy; {new Date().getFullYear()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
          >
            Close Journey
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
