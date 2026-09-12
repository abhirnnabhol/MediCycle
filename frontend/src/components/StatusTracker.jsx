import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const MedicineStatusTracker = ({ status, rejectionReason }) => {
  const steps = [
    { label: 'Submitted', key: 'SUBMITTED' },
    { label: 'Under Verification', key: 'PENDING' },
    { label: status === 'REJECTED' ? 'Rejected' : 'Approved', key: status },
  ];

  const getStepState = (index) => {
    if (status === 'REJECTED') {
      if (index === 0 || index === 1) return 'completed';
      if (index === 2) return 'rejected';
    }
    if (status === 'APPROVED') {
      return 'completed';
    }
    // status is PENDING
    if (index === 0) return 'completed';
    if (index === 1) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 -z-0 rounded-full" />
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 -z-0 rounded-full ${
            status === 'REJECTED'
              ? 'bg-rose-500 w-full'
              : status === 'APPROVED'
              ? 'bg-emerald-500 w-full'
              : 'bg-emerald-500 w-1/2'
          }`}
        />

        {steps.map((step, idx) => {
          const state = getStepState(idx);
          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                    : state === 'active'
                    ? 'bg-amber-500 text-white shadow-sm ring-4 ring-amber-100 animate-pulse'
                    : state === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm ring-4 ring-rose-100'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {state === 'active' && <Clock className="w-3.5 h-3.5" />}
                {state === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                {state === 'upcoming' && <span className="text-[11px] font-bold">{idx + 1}</span>}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-bold text-center whitespace-nowrap ${
                  state === 'completed'
                    ? 'text-emerald-700'
                    : state === 'active'
                    ? 'text-amber-700'
                    : state === 'rejected'
                    ? 'text-rose-700'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'REJECTED' && rejectionReason && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-950 font-bold">Rejection Reason:</strong> {rejectionReason}
          </div>
        </div>
      )}
    </div>
  );
};

export const RequestStatusTracker = ({ status }) => {
  const steps = ['Pending', 'Approved', 'Completed'];
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, idx) => {
        const isPastOrCurrent = idx <= (currentIndex === -1 ? 0 : currentIndex);
        const isCurrent = step === status;

        return (
          <div key={step} className="flex items-center gap-1">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isCurrent
                  ? step === 'Completed'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 ring-2 ring-sky-100'
                    : step === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 ring-2 ring-emerald-100'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-100'
                  : isPastOrCurrent
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step}
            </span>
        );
      })}
    </div>
  );
};

export const LifecycleStatusBadge = ({ status }) => {
  const s = (status || '').toUpperCase();
  if (s === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Available
      </span>
    );
  }
  if (s === 'REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
        <Clock className="w-3.5 h-3.5" /> Patient Claimed
      </span>
    );
  }
  if (s === 'DISPENSED' || s === 'COMPLETED' || s === 'SOLD') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
        <CheckCircle2 className="w-3.5 h-3.5" /> Dispensed
      </span>
    );
  }
  if (s === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
      <Clock className="w-3.5 h-3.5" /> Pending Verification
    </span>
  );
};

export const FullJourneyMiniStepper = ({ status, onViewJourney }) => {
  const stages = [
    { label: 'Donated', key: 'SUBMITTED' },
    { label: 'Verified', key: 'VERIFIED' },
    { label: 'Available', key: 'AVAILABLE' },
    { label: 'Requested', key: 'REQUESTED' },
    { label: 'Reviewed', key: 'REVIEWED' },
    { label: 'Dispensed', key: 'DISPENSED' },
  ];

  const s = (status || '').toUpperCase();
  let currentStage = 1;
  if (s === 'PENDING') currentStage = 1;
  else if (s === 'APPROVED') currentStage = 3;
  else if (s === 'REQUESTED') currentStage = 4;
  else if (s === 'DISPENSED' || s === 'COMPLETED' || s === 'SOLD') currentStage = 6;
  else if (s === 'REJECTED') currentStage = 1;

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
      <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
        {stages.map((st, i) => {
          const isDone = i < currentStage;
          const isCurrent = i === currentStage - 1;
          return (
            <div key={st.key} className="flex items-center gap-1 flex-1">
              <div
                className={`h-2 rounded-full flex-1 transition-all ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-200'
                }`}
                title={st.label}
              />
            </div>
          );
        })}
      </div>
      {onViewJourney && (
        <button
          onClick={onViewJourney}
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline px-2 py-0.5 rounded bg-emerald-50 whitespace-nowrap"
        >
          View Journey &rarr;
        </button>
      )}
    </div>
  );
};
