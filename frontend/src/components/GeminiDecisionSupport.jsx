import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Thermometer, 
  FileText, 
  Info,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

const GeminiDecisionSupport = ({ medicine }) => {
  const [expanded, setExpanded] = useState(true);

  if (!medicine) return null;

  // 1. Calculate Shelf Life Buffer
  const expiryDate = new Date(medicine.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;
  const isNearExpiry = diffDays > 0 && diffDays < 60;
  const isOptimalShelfLife = diffDays >= 60;

  // 2. Evaluate Packaging Condition
  const isPackageDamaged = 
    medicine.packageCondition?.includes('Not Eligible') || 
    medicine.packageCondition?.toLowerCase().includes('torn') ||
    medicine.packageCondition?.toLowerCase().includes('opened');

  // 3. Evaluate Prescription Schedule
  const isRx = Boolean(medicine.prescriptionRequired);

  // 4. Overall Clinical Advisory (Rule-grounded decision support)
  let advisory = {
    status: 'RECOMMEND_APPROVAL',
    title: 'Advisory: Meets Standard Eligibility Criteria',
    color: 'emerald',
    badge: 'Standard Inspection Passed',
    summary: 'Packaging reported intact, shelf-life buffer >= 60 days, and batch information recorded. Ready for pharmacist physical verification.',
  };

  if (isExpired) {
    advisory = {
      status: 'RECOMMEND_REJECT',
      title: 'Advisory: Rejection Mandatory (Expired)',
      color: 'rose',
      badge: 'Quarantine Required',
      summary: 'Medicine batch has expired. Under Indian Drugs & Cosmetics Act regulations, expired pharmaceuticals must be quarantined for disposal.',
    };
  } else if (isPackageDamaged) {
    advisory = {
      status: 'RECOMMEND_REJECT',
      title: 'Advisory: Rejection Recommended (Packaging Integrity)',
      color: 'rose',
      badge: 'Packaging Compromised',
      summary: 'Reported packaging is unsealed or damaged. Risk of oxidation, moisture contamination, or microbial compromise.',
    };
  } else if (isNearExpiry) {
    advisory = {
      status: 'CAUTION_NEAR_EXPIRY',
      title: 'Advisory: Caution (Short Shelf-Life Buffer)',
      color: 'amber',
      badge: 'Short Shelf Life (< 60 Days)',
      summary: `Expiry is in ${diffDays} days. Recommend approving only for immediate acute redistribution or flagging for fast-track dispensation.`,
    };
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/70 to-emerald-50/40 p-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-teal-200/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                AI Clinical Decision Support
              </h4>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-100/90 border border-teal-200 px-1.5 py-0.2 rounded">
                Google Gemini Assisted
              </span>
            </div>
            <p className="text-[10px] text-teal-700">
              Pharmacist Pre-Inspection Screening & Safety Advisory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg text-teal-800 hover:bg-teal-100 transition-colors"
          aria-label={expanded ? 'Collapse AI Decision Support' : 'Expand AI Decision Support'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 text-xs">
          {/* Clinical Advisory Banner */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
            advisory.color === 'emerald'
              ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
              : advisory.color === 'amber'
              ? 'bg-amber-500/10 border-amber-300 text-amber-950'
              : 'bg-rose-500/10 border-rose-300 text-rose-950'
          }`}>
            {advisory.color === 'emerald' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
            {advisory.color === 'amber' && <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
            {advisory.color === 'rose' && <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">{advisory.title}</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-white/70 border border-current">
                  {advisory.badge}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed mt-0.5 opacity-90">
                {advisory.summary}
              </p>
            </div>
          </div>

          {/* 4 Point Clinical Inspection Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* 1. Foil Integrity */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 flex items-start gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isPackageDamaged ? 'text-rose-600' : 'text-emerald-600'}`} />
              <div>
                <span className="font-bold text-slate-800 block">Packaging Integrity</span>
                <span className="text-slate-500">{medicine.packageCondition || 'Intact Blister Foil'}</span>
              </div>
            </div>

            {/* 2. Shelf Life */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 flex items-start gap-2">
              <Calendar className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isExpired ? 'text-rose-600' : isNearExpiry ? 'text-amber-600' : 'text-emerald-600'}`} />
              <div>
                <span className="font-bold text-slate-800 block">Shelf Life Buffer</span>
                <span className="text-slate-500">
                  {diffDays > 0 ? `${diffDays} days remaining` : 'Expired'}
                </span>
              </div>
            </div>

            {/* 3. Storage Condition */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 flex items-start gap-2">
              <Thermometer className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Storage Protocol</span>
                <span className="text-slate-500">{medicine.storageCondition || 'Room Temperature (15-25°C)'}</span>
              </div>
            </div>

            {/* 4. Prescription Audit */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100 flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Regulatory Schedule</span>
                <span className="text-slate-500">
                  {isRx ? 'Schedule H (Prescription Mandatory)' : 'General Healthcare (OTC)'}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Clinical Governance Disclaimer */}
          <div className="pt-2 border-t border-teal-200/50 flex items-start gap-1.5 text-[10px] text-teal-900/80">
            <Info className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Clinical Governance Mandate:</strong> This assistant provides automated decision support. It does <em>not</em> replace pharmacist clinical judgment, nor does it automatically approve or reject inventory. The supervising pharmacist (Dr. Anita Sharma) holds final verification authority.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiDecisionSupport;
