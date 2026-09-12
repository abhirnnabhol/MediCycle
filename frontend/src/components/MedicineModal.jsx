import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  Package, 
  Thermometer, 
  FileText, 
  CheckCircle, 
  Info,
  Hash,
  AlertCircle,
  Award,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const MedicineModal = ({ medicine, onClose, onRequestSuccess }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [requestQty, setRequestQty] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('Partner Dispensing Clinic #14, Sector 7');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [prescriptionAcknowledged, setPrescriptionAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestMode, setRequestMode] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

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

  if (!medicine) return null;

  const unitFee = Number(medicine.affordablePrice) > 0 ? Number(medicine.affordablePrice) : 45;
  const totalFee = requestQty * unitFee;

  // Calculate points tier discount
  const userPoints = user?.mediPoints || 0;
  let eligiblePointsDiscount = 0;
  let pointsToUse = 0;

  if (userPoints >= 5000) {
    eligiblePointsDiscount = Math.min(25, totalFee);
    pointsToUse = 5000;
  } else if (userPoints >= 2000) {
    eligiblePointsDiscount = Math.min(10, totalFee);
    pointsToUse = 2000;
  } else if (userPoints >= 1000) {
    eligiblePointsDiscount = Math.min(5, totalFee);
    pointsToUse = 1000;
  }

  const effectiveDiscount = usePoints ? eligiblePointsDiscount : 0;
  const finalFee = Math.max(0, totalFee - effectiveDiscount);

  const formattedExpiry = new Date(medicine.expiryDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please sign in or use the demo switcher to submit a medicine request.', 'error');
      return;
    }

    if (medicine.prescriptionRequired && !prescriptionAcknowledged) {
      addToast('Prescription verification required. Please check the acknowledgment box.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createRequest({
        medicineId: medicine._id,
        quantity: Number(requestQty),
        deliveryAddress,
        contactPhone: phone,
        prescriptionVerificationConfirmed: prescriptionAcknowledged,
        usePoints: Boolean(usePoints),
      });

      if (res.success) {
        addToast(`Medicine request for ${medicine.name} submitted successfully!`, 'success');
        if (refreshUser) await refreshUser();
        if (onRequestSuccess) onRequestSuccess(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Error submitting request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pharmacist Verified
            </span>
            <span className="text-xs text-slate-500 font-medium">Batch: {medicine.batchNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* Main Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
              alt={medicine.name}
              className="w-full sm:w-44 h-44 object-cover rounded-2xl border border-slate-200 shadow-sm flex-shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-2xl font-black text-slate-900">{medicine.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-emerald-800 border border-slate-200">
                  {medicine.strength}
                </span>
              </div>
              <p className="text-sm text-slate-600 italic">
                Generic Salt: <span className="text-slate-900 font-semibold">{medicine.genericName}</span>
              </p>
              <p className="text-xs text-slate-500">
                Therapeutic Category: <span className="text-slate-800 font-bold">{medicine.category}</span>
              </p>

              {/* Price comparison */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="text-2xl font-black text-emerald-700">
                  ₹{medicine.affordablePrice}
                </span>
                <span className="text-sm text-slate-400 line-through font-medium">
                  MRP ₹{medicine.originalPrice}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Subsidized Access Price
                </span>
              </div>
            </div>
          </div>

          {/* Verification & Safety Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Expiry Date: <strong className="text-slate-900">{formattedExpiry}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Hash className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Batch Number: <strong className="text-slate-900">{medicine.batchNumber}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Package className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Packaging: <strong className="text-slate-900">{medicine.packageCondition}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Thermometer className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Storage: <strong className="text-slate-900">{medicine.storageCondition}</strong></span>
            </div>
          </div>

          {/* Additional Notes */}
          {medicine.additionalNotes && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-900 font-bold">Inspection & Donor Notes: </span>
              {medicine.additionalNotes}
            </div>
          )}

          {/* Prescription Alert */}
          {medicine.prescriptionRequired && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 mb-0.5">Prescription verification required</h4>
                <p className="text-amber-800 leading-relaxed">
                  This medication is classified under regulated Schedule H/X categories. A valid prescription from a registered medical doctor must be verified before dispensing.
                </p>
              </div>
            </div>
          )}

          {/* Regulatory Notice Requirement */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> Availability is subject to verification, prescription requirements, applicable regulations, and controlled approval.
            </span>
          </div>

          {/* Request Form toggle / view */}
          {requestMode ? (
            <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4 border-t border-slate-200">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Submit Medicine Request
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Request Quantity (Max {medicine.quantity})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={medicine.quantity}
                    value={requestQty}
                    onChange={(e) => setRequestQty(Math.min(medicine.quantity, Math.max(1, Number(e.target.value))))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Distribution / Delivery Center Location
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              {/* Affordable Access Fee & MediPoints Redemption Calculation */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-950">
                    <CreditCard className="w-4 h-4 text-teal-700" />
                    <span>Affordable Access & Fulfillment Fee</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    Fixed Non-Profit Cost
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-700 text-xs">
                  <div className="flex justify-between">
                    <span>Per-unit handling & cold-storage fee:</span>
                    <span className="font-semibold text-slate-900">₹{unitFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requested quantity:</span>
                    <span className="font-semibold text-slate-900">× {requestQty} units</span>
                  </div>
                  <div className="flex justify-between border-t border-teal-200/80 pt-1.5">
                    <span>Gross Access Fee:</span>
                    <span className="font-bold text-slate-900">₹{totalFee}</span>
                  </div>

                  {/* MediPoints Checkbox & Tier Selector */}
                  {userPoints >= 1000 && (
                    <div className="pt-2 border-t border-teal-200/80">
                      <label className="flex items-start gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-teal-300">
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-teal-950 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              Apply MediPoints Discount
                            </span>
                            <span className="font-mono font-bold text-emerald-700">-₹{eligiblePointsDiscount}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Redeem {pointsToUse.toLocaleString()} pts (Balance: {userPoints.toLocaleString()} pts)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {usePoints && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>MediPoints Discount ({pointsToUse} pts):</span>
                      <span>-₹{effectiveDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-teal-300 pt-2 text-sm font-black text-slate-950">
                    <span>Final Amount Payable:</span>
                    <span className="text-teal-800 text-base">₹{finalFee}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Prototype Simulation:</strong> No real money is charged. Confirming creates an authorized request with demo payment status marked as paid. Points will be consumed upon confirmation.
                  </span>
                </div>
              </div>

              {medicine.prescriptionRequired && (
                <label className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <input
                    type="checkbox"
                    checked={prescriptionAcknowledged}
                    onChange={(e) => setPrescriptionAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <span>
                    I confirm that I possess a valid medical doctor's prescription for this medication and will present it at the partner dispensing clinic.
                  </span>
                </label>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestMode(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting
                    ? 'Submitting Request...'
                    : `Confirm Request & Pay ₹${finalFee} (Demo)`}
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => setRequestMode(true)}
                className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Request Medicine (Affordable Access)</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Prototype notice: Requests are subject to prescription verification and partner pharmacy oversight.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default MedicineModal;
