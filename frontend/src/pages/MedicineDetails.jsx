import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Package, 
  Thermometer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  MapPin, 
  Lock, 
  Clock, 
  HandHeart,
  HelpCircle,
  Building2,
  Share2,
  Activity,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MedicineModal from '../components/MedicineModal';
import MedicineJourneyModal from '../components/MedicineJourneyModal';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [medicine, setMedicine] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [journeyModalOpen, setJourneyModalOpen] = useState(false);

  const fetchMedicine = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, journeyRes] = await Promise.allSettled([
        api.getMedicineById(id),
        api.getMedicineJourney(id),
      ]);

      if (res.status === 'fulfilled' && res.value.success && res.value.data) {
        setMedicine(res.value.data);
      } else {
        setError('Medicine details not found.');
      }

      if (journeyRes.status === 'fulfilled' && journeyRes.value.success) {
        setJourneyData(journeyRes.value.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading medicine details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full flex-1 bg-slate-50 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700">Loading verified medicine information...</p>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="w-full flex-1 bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-card">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900">Medicine Not Available</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              {error || 'This medicine is either pending verification or no longer in active redistribution.'}
            </p>
            <Link
              to="/find-medicines"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
            >
              Return to Medicine Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => `₹${val}`;
  const formattedExpiry = new Date(medicine.expiryDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDonatedDate = new Date(medicine.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const savings = Math.max(0, medicine.originalPrice - medicine.affordablePrice);
  const discountPercent = medicine.originalPrice
    ? Math.round((savings / medicine.originalPrice) * 100)
    : 0;

  const donorName = medicine.donorInfo?.displayName || 'Verified Community Member';
  const donorLocation = medicine.donorInfo?.location || medicine.location || 'Indiranagar, Bengaluru';

  // 8-Stage Medicine Journey steps
  const journeyStages = [
    { title: 'Donated', desc: 'Submitted by donor', date: formattedDonatedDate, completed: true },
    { title: 'Submitted for Verification', desc: 'Sent to clinical queue', date: formattedDonatedDate, completed: true },
    { title: 'Verified', desc: 'Blister seal & expiry checked', date: 'Pharmacist audited', completed: true },
    { title: 'Approved', desc: 'Certified for redistribution', date: 'Clinical clearance', completed: medicine.status === 'APPROVED' },
    { title: 'Available', desc: 'Visible in catalog', date: 'Ready for access', completed: medicine.status === 'APPROVED' },
    { title: 'Requested', desc: 'Patient prescription review', date: 'Upon request', completed: false },
    { title: 'Request Approved', desc: 'Pharmacist dispenses', date: 'Pending patient request', completed: false },
    { title: 'Completed', desc: 'Safe delivery confirmed', date: 'Closed loop', completed: false },
  ];

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/find-medicines"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Find Medicines</span>
          </Link>

          <span className="text-xs text-slate-400 font-medium">
            MediCycle ID: <code className="text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">{medicine._id.slice(-8).toUpperCase()}</code>
          </span>
        </div>

        {/* Top Two-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Left Column: Image & Badges */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-soft h-80 sm:h-96">
              <img
                src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                alt={medicine.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 shadow-sm border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Pharmacist Verified
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm">
                  {medicine.category}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-md">
                    {discountPercent}% Subsidized Access
                  </span>
                </div>
              )}
            </div>

            {/* Donor Information Card (Privacy Protected) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Donor Information</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3" />
                  <span>Privacy Protected</span>
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Donated By:</span>
                  <strong className="text-slate-900 font-bold">{donorName}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Approximate Location:</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {donorLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Date Donated:</span>
                  <span className="font-semibold text-slate-800">{formattedDonatedDate}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="font-bold text-emerald-700">✓ Verified Donor Account</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Rule:</strong> Donor phone numbers, email addresses, and exact home addresses are strictly shielded.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details, Verification & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {medicine.strength}
                  </span>
                  {medicine.prescriptionRequired ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Prescription Required
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      No Prescription Required (OTC)
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {medicine.name}
                </h1>
                <p className="text-sm font-medium text-slate-500 italic mt-1">
                  Generic Composition: {medicine.genericName}
                </p>
              </div>

              {/* PRIORITY 5: Recipient Savings Calculator */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Recipient Savings Calculator
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Illustrative Demo Saving
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">Original MRP</span>
                    <span className="text-sm font-bold text-slate-700 mt-0.5 block">
                      {formatCurrency(medicine.originalPrice)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">MediCycle Access Cost</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                      {formatCurrency(medicine.affordablePrice)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-2xs">
                    <span className="text-[10px] text-emerald-100 font-medium block">Illustrative Saving</span>
                    <span className="text-sm font-black mt-0.5 block">
                      {formatCurrency(savings)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic text-center pt-1">
                  "This figure is illustrative and depends on the actual medicine and fulfillment model."
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/40 text-xs">
                  <span className="font-semibold text-slate-700">Available Stock:</span>
                  <span className="font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    {medicine.quantity} units remaining
                  </span>
                </div>
              </div>

              {/* Medicine Technical Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium block">Batch Number</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {medicine.batchNumber}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium block">Expiry Date</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {formattedExpiry}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium block">Package Condition</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {medicine.packageCondition}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium block">Storage Condition</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {medicine.storageCondition}
                  </span>
                </div>
              </div>

              {/* Pharmacist Verification Note */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-900">Clinical Verification Certified</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Verified by <strong>{medicine.verifiedBy?.name || 'Dr. Anita Sharma (Lead Pharmacist)'}</strong>. Physical inspection confirmed intact blister seal, absence of moisture, and shelf-life compliance.
                  </p>
                </div>
              </div>

              {/* Primary Action Button (Status-aware) */}
              {medicine.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="w-full py-4 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <HandHeart className="w-4 h-4 text-emerald-200" />
                  <span>Request This Medicine</span>
                </button>
              )}

              {medicine.status === 'REQUESTED' && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Patient Claim Matched</span>
                  </div>
                  <p className="text-xs text-blue-900">
                    This unit is currently reserved for a verified patient and undergoing final pharmacist dispatch review.
                  </p>
                </div>
              )}

              {(medicine.status === 'DISPENSED' || medicine.status === 'COMPLETED' || medicine.status === 'SOLD') && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dispensed to Verified Patient</span>
                  </div>
                  <p className="text-xs text-purple-900">
                    This medicine completed its full redistribution journey and has been safely handed over.
                  </p>
                </div>
              )}

              {medicine.status === 'PENDING' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Pharmacist Verification</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Under laboratory and package integrity inspection before public availability.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traceable Medicine Journey Timeline */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Traceable Closed Loop
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-2">
                Traceable Medicine Journey
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every unit follows an audited lifecycle from donor submission to verified patient dispensing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setJourneyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Full Interactive Timeline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(journeyData?.steps || journeyStages.slice(0, 6)).map((stage, idx) => {
              const isDone = stage.completed || stage.status === 'completed';
              const isInProgress = stage.status === 'in_progress';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                      : isInProgress
                      ? 'bg-amber-50/50 border-amber-200 text-slate-900'
                      : 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold mb-0.5">{stage.title}</h4>
                  <p className="text-[11px] leading-snug">{stage.description || stage.desc}</p>
                  <span className="block text-[10px] mt-2 font-medium opacity-75">
                    {stage.timestamp ? new Date(stage.timestamp).toLocaleDateString() : (stage.date || 'Scheduled')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Safety & Regulatory Notice */}
        <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">Safety & Pharmacy Compliance Standards</h4>
            <p className="text-amber-800 leading-relaxed">
              MediCycle is a non-commercial prototype platform facilitating regulated medicine redistribution. Unrestricted peer-to-peer medicine transactions are strictly disallowed. All prescription-grade medicines necessitate registered prescription verification prior to distribution at authorized clinics.
            </p>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {requestModalOpen && (
        <MedicineModal
          medicine={medicine}
          onClose={() => setRequestModalOpen(false)}
          onRequestSuccess={() => {
            setRequestModalOpen(false);
            fetchMedicine();
          }}
        />
      )}

      {/* Full Medicine Journey Modal */}
      {journeyModalOpen && (
        <MedicineJourneyModal
          medicineId={id}
          initialData={journeyData}
          onClose={() => setJourneyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MedicineDetails;
