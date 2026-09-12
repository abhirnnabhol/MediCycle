import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Calendar, 
  PackageCheck, 
  ArrowRight, 
  User, 
  MapPin, 
  Lock,
  HandHeart,
  CheckCircle2
} from 'lucide-react';

const MedicineCard = ({ medicine, onSelect, onRequest }) => {
  const isSold = medicine.status === 'SOLD';
  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;
  const formattedExpiry = new Date(medicine.expiryDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const savings = Math.max(0, medicine.originalPrice - medicine.affordablePrice);
  const discountPercent = medicine.originalPrice
    ? Math.round((savings / medicine.originalPrice) * 100)
    : 0;

  // Anonymized donor representation
  const donorName = medicine.donorInfo?.displayName || 'Verified Community Member';
  const donorLocation = medicine.donorInfo?.location || medicine.location || 'Indiranagar, Bengaluru';

  return (
    <div className={`bg-white rounded-3xl overflow-hidden flex flex-col group border ${isSold ? 'border-slate-300/80 bg-slate-50/50' : 'border-slate-200/90'} shadow-soft hover:shadow-card-hover hover:border-emerald-300 transition-all duration-300`}>
      {/* Top Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
          alt={medicine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-600 text-white shadow-md border border-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              Dispensed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 shadow-sm border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ✓ Verified
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs">
            {medicine.category}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {medicine.prescriptionRequired ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
              <FileText className="w-3 h-3 text-amber-600" />
              Rx Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-sm">
              No Rx Needed
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="absolute bottom-2.5 right-3">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-black text-white shadow-sm ${isSold ? 'bg-slate-800' : 'bg-emerald-600'}`}>
              {isSold ? `Saved ₹${savings.toLocaleString('en-IN')}` : `${discountPercent}% Subsidized`}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {medicine.name}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
              {medicine.strength}
            </span>
          </div>

          <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1 font-medium">
            Generic: {medicine.genericName}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Qty: <strong className="text-slate-900 font-bold">{medicine.quantity} units</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Exp: <strong className="text-slate-900 font-bold">{formattedExpiry}</strong></span>
            </div>
          </div>

          {/* Donor Information (Privacy Protected) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex flex-col gap-1 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                <User className="w-3 h-3 text-emerald-600" />
                <span>Donated by: <strong className="text-slate-900">{donorName}</strong></span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <Lock className="w-2.5 h-2.5" />
                <span>Protected</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{donorLocation}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Dual Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {isSold ? 'Redistributed Subsidized Fee' : 'Affordable Access Fee'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-black ${isSold ? 'text-slate-800' : 'text-emerald-700'}`}>
                  {formatCurrency(medicine.affordablePrice)}
                </span>
                <span className="text-xs text-slate-400 line-through font-medium">
                  MRP {formatCurrency(medicine.originalPrice)}
                </span>
              </div>
            </div>
            {isSold && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Patient Dispensed
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/medicines/${medicine._id}`}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1 group/btn"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>

            {isSold ? (
              <button
                type="button"
                disabled
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-slate-100 text-purple-700 border border-purple-200 cursor-not-allowed flex items-center justify-center gap-1"
                title="This medicine has already been safely redistributed to a verified patient"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Dispensed</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onRequest) {
                    onRequest(medicine);
                  } else if (onSelect) {
                    onSelect(medicine);
                  }
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <HandHeart className="w-3.5 h-3.5" />
                <span>Request</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
