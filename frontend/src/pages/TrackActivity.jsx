import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  HeartHandshake, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  UserCheck,
  Activity,
  Layers,
  Award,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MedicineJourneyModal from '../components/MedicineJourneyModal';

const TrackActivity = ({ defaultTab = 'donations', pageTitle }) => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab); // 'donations' | 'requests'
  const [submissions, setSubmissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDonationId, setExpandedDonationId] = useState(null);
  const [selectedJourneyMedId, setSelectedJourneyMedId] = useState(null);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const loadActivityData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [subsRes, reqsRes] = await Promise.allSettled([
        api.getMySubmissions(),
        api.getMyRequests(),
      ]);

      if (subsRes.status === 'fulfilled' && subsRes.value.success) {
        setSubmissions(subsRes.value.data);
      }
      if (reqsRes.status === 'fulfilled' && reqsRes.value.success) {
        setRequests(reqsRes.value.data);
      }
    } catch (err) {
      addToast('Error loading activity records: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full flex-1 bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-card">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sign In to Track Activity</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed mb-6">
              Track your donations through the clinical verification pipeline, or check medicine request fulfillment.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => demoLogin('user')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
              >
                Sign In as User (Community Member)
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs"
              >
                Sign In as Pharmacist (Dr. Anita)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Donations statistics
  const totalDonations = submissions.length;
  const approvedDonations = submissions.filter((s) => s.status === 'APPROVED').length;
  const pendingDonations = submissions.filter((s) => s.status === 'PENDING').length;
  const completedDonations = submissions.filter((s) => ['DISPENSED', 'COMPLETED', 'SOLD'].includes(s.status)).length;
  const rejectedDonations = submissions.filter((s) => s.status === 'REJECTED').length;

  // Requests statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'Approved').length;
  const completedRequests = requests.filter((r) => ['Completed', 'Dispensed'].includes(r.status)).length;

  const toggleExpand = (id) => {
    setExpandedDonationId((prev) => (prev === id ? null : id));
  };

  const getDonationBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ✓ Approved & Available
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Patient Claimed
          </span>
        );
      case 'DISPENSED':
      case 'COMPLETED':
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
            Dispensed to Patient
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ✕ Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            🟡 Under Verification
          </span>
        );
    }
  };

  const getRequestStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'dispensed') return 3;
    if (s === 'approved') return 2;
    return 1; // pending
  };

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Status & Lifecycle Tracking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {pageTitle || 'Track Personal Activity'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {pageTitle 
                ? (activeTab === 'donations'
                    ? 'Track your donated medicines from submission through physical pharmacist verification and patient dispensing.'
                    : 'Monitor the verification and dispensing progress of medicines you have requested through MediCycle.')
                : 'Follow all your medicine donations and medicine requests in one unified lifecycle tracker.'}
            </p>
          </div>

          <button
            onClick={loadActivityData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs self-start md:self-auto flex items-center gap-2 text-xs font-bold"
            title="Refresh records"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Unified Activity Summary Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Activity:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <strong>{totalDonations}</strong> Donated
            </span>
            <span className="flex items-center gap-1.5 text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              <HeartHandshake className="w-3.5 h-3.5 text-sky-600" />
              <strong>{totalRequests}</strong> Requested
            </span>
            <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <strong>{pendingDonations + pendingRequests}</strong> Pending
            </span>
            <span className="flex items-center gap-1.5 text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              <strong>{completedDonations + completedRequests}</strong> Completed
            </span>
          </div>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex items-center gap-3 p-1.5 bg-slate-200/80 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>My Donations ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-sky-600" />
            <span>My Medicine Requests ({requests.length})</span>
          </button>
        </div>

        {/* TAB 1: MY DONATIONS */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            {/* Donation Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Total Donated
                </span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">
                  {totalDonations}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Medicines Donated
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Verification
                </span>
                <span className="text-3xl font-black text-amber-700 mt-1 block">
                  {pendingDonations}
                </span>
                <span className="text-[11px] text-amber-600 mt-1 block">
                  Under inspection
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Approved / Available
                </span>
                <span className="text-3xl font-black text-emerald-700 mt-1 block">
                  {approvedDonations}
                </span>
                <span className="text-[11px] text-emerald-600 mt-1 block">
                  Verified in catalog
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                  Completed / Dispensed
                </span>
                <span className="text-3xl font-black text-purple-700 mt-1 block">
                  {completedDonations}
                </span>
                <span className="text-[11px] text-purple-600 mt-1 block">
                  Reached patients in need
                </span>
              </div>
            </div>

            {/* Donations List */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-600">Loading donation activity records...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-card max-w-md mx-auto">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Donations Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  You haven't submitted any medicines for redistribution yet.
                </p>
                <Link
                  to="/donate-medicine"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Donate Unused Medicine</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((med) => {
                  const isExpanded = expandedDonationId === med._id;
                  const formattedDate = new Date(med.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={med._id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden transition-all"
                    >
                      {/* Top Summary Bar */}
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                            alt={med.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-950">
                                {med.name}
                              </h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {med.strength}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              Generic: {med.genericName} • Original: <strong className="text-slate-800 font-bold">{med.originalQuantity || med.quantity} units</strong> • Available: <strong className="text-emerald-700 font-bold">{med.quantity} units</strong> • Batch: <code>{med.batchNumber}</code>
                            </p>

                            <span className="text-[11px] text-slate-400 mt-1 block">
                              Donated on: {formattedDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                          {getDonationBadge(med.status)}

                          <button
                            type="button"
                            onClick={() => setSelectedJourneyMedId(med._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Medicine Journey</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleExpand(med._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Quick Steps'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Connected Patient Request Alert if medicine was claimed */}
                      {med.requestInfo && (
                        <div className="mx-5 sm:mx-6 mb-4 p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="font-bold text-blue-950">Patient Claim Active</strong>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900 uppercase">
                                  {med.requestInfo.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-800/90 mt-0.5">
                                {med.requestInfo.recipientLabel} requested <strong className="text-blue-950">{med.requestInfo.requestedQuantity} units</strong>. Pharmacist review is connected.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedJourneyMedId(med._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>View Linked Journey</span>
                          </button>
                        </div>
                      )}

                      {/* Rejection notice if rejected */}
                      {med.status === 'REJECTED' && (
                        <div className="mx-6 mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold block">Rejection Reason Recorded:</strong>
                            <p className="mt-0.5 text-rose-800 leading-relaxed">
                              {med.rejectionReason || 'Packaging or shelf-life criteria did not satisfy pharmaceutical inspection guidelines.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Complete Interactive Tracking Timeline */}
                      {isExpanded && (
                        <div className="p-6 bg-slate-50/80 border-t border-slate-100 animate-in fade-in duration-200">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                            Donation Lifecycle Timeline
                          </h4>

                          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {/* Stage 1 */}
                            <div className="relative">
                              <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {formattedDate} — Medicine Submitted
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Donor registered batch details and confirmed unsealed blister foil.
                              </p>
                            </div>

                            {/* Stage 2 */}
                            <div className="relative">
                              <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">
                                Verification Queue Assigned
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Routed to authorized licensed pharmacist Dr. Anita Sharma for clinical inspection.
                              </p>
                            </div>

                            {/* Stage 3 */}
                            <div className="relative">
                              <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                med.status === 'APPROVED'
                                  ? 'bg-emerald-600 text-white'
                                  : med.status === 'REJECTED'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-400 text-slate-900'
                              }`}>
                                {med.status === 'APPROVED' ? '✓' : med.status === 'REJECTED' ? '✕' : '•'}
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {med.status === 'APPROVED' 
                                  ? 'Medicine Approved by Pharmacist' 
                                  : med.status === 'REJECTED' 
                                  ? 'Rejected during Inspection' 
                                  : 'Under Review in Laboratory Queue'}
                              </h5>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {med.status === 'APPROVED'
                                  ? 'Physical blister foil integrity, absence of contamination, and 30+ days expiry verified.'
                                  : med.status === 'REJECTED'
                                  ? med.rejectionReason
                                  : 'Awaiting completion of clinical safety checks.'}
                              </p>
                            </div>

                            {/* Stage 4 */}
                            {med.status === 'APPROVED' && (
                              <div className="relative">
                                <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </div>
                                <h5 className="text-xs font-bold text-slate-900">
                                  Published to MediCycle Redistribution Catalog
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Eligible patients can now discover and request this medicine with prescription verification.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY MEDICINE REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Request Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Total Requests
                </span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">
                  {totalRequests}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Prescription applications
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Approval
                </span>
                <span className="text-3xl font-black text-amber-700 mt-1 block">
                  {pendingRequests}
                </span>
                <span className="text-[11px] text-amber-600 mt-1 block">
                  Awaiting pharmacist review
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Approved Requests
                </span>
                <span className="text-3xl font-black text-emerald-700 mt-1 block">
                  {approvedRequests}
                </span>
                <span className="text-[11px] text-emerald-600 mt-1 block">
                  Ready for collection
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                  Completed / Dispensed
                </span>
                <span className="text-3xl font-black text-purple-700 mt-1 block">
                  {completedRequests}
                </span>
                <span className="text-[11px] text-purple-600 mt-1 block">
                  Fulfilled successfully
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-600">Loading your medicine requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-card max-w-md mx-auto">
                <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Medicine Requests</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  You have not submitted any medicine requests yet. Explore the verified catalog to request affordable care.
                </p>
                <Link
                  to="/find-medicines"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm inline-flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Available Medicines</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const stepIndex = getRequestStepIndex(req.status);
                  const med = req.medicineId || {};
                  const formattedDate = new Date(req.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={req._id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-950">
                              {med.name || 'Prescription Medicine'}
                            </h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {med.strength || 'Standard'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Requested: <strong className="text-slate-800">{req.quantity} units</strong> • Requested on: {formattedDate}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            req.status === 'Completed' || req.status === 'Dispensed'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Status: {req.status}
                          </span>

                          {(med._id || req.medicineId) && (
                            <button
                              onClick={() => setSelectedJourneyMedId(med._id || req.medicineId)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>View Medicine Journey</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 4-Stage Visual Progress Tracker */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                          Request Progress Tracker:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className={`p-3 rounded-2xl border ${
                            stepIndex >= 1
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <span className="text-[10px] font-bold block opacity-75">Step 1</span>
                            <span className="text-xs font-bold block mt-0.5">Request Submitted</span>
                            <span className="text-[10px] block opacity-75">Logged in database</span>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            stepIndex >= 1
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <span className="text-[10px] font-bold block opacity-75">Step 2</span>
                            <span className="text-xs font-bold block mt-0.5">Verification</span>
                            <span className="text-[10px] block opacity-75">Prescription audit</span>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            stepIndex >= 2
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <span className="text-[10px] font-bold block opacity-75">Step 3</span>
                            <span className="text-xs font-bold block mt-0.5">Approved</span>
                            <span className="text-[10px] block opacity-75">Ready for pickup</span>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            stepIndex >= 3
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <span className="text-[10px] font-bold block opacity-75">Step 4</span>
                            <span className="text-xs font-bold block mt-0.5">Completed</span>
                            <span className="text-[10px] block opacity-75">Dispensed safely</span>
                          </div>
                        </div>
                      </div>

                      {/* Access Fee & MediPoints Breakdown */}
                      <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-teal-950">
                            <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                            <span>Affordable Fulfillment Fee:</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span>✓ Demo Paid</span>
                            <span className="text-slate-400 font-normal">({req.paymentMode || 'SIMULATED'})</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-slate-600 pt-1">
                          <span>
                            Gross Fee: <strong>₹{req.totalAccessFee || (req.quantity * (req.unitAccessFee || 45))}</strong> ({req.quantity} × ₹{req.unitAccessFee || 45})
                          </span>

                          {req.pointsUsed > 0 ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              Redeemed {req.pointsUsed.toLocaleString()} pts (-₹{req.pointsDiscount})
                            </span>
                          ) : (
                            <span className="text-slate-400">No points used</span>
                          )}

                          <span className="font-extrabold text-teal-900 text-sm">
                            Total Paid: ₹{req.finalAccessFee !== undefined ? req.finalAccessFee : (req.totalAccessFee || (req.quantity * 45))}
                          </span>
                        </div>
                      </div>

                      {/* Delivery and Notes */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-400">Pickup Location: </span>
                          <strong className="text-slate-800">{req.deliveryAddress}</strong>
                        </div>
                        {req.adminNotes && (
                          <div className="text-emerald-700 font-medium">
                            <span>Pharmacist Note: </span>
                            <span>{req.adminNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Full Lifecycle Journey Modal */}
      {selectedJourneyMedId && (
        <MedicineJourneyModal
          medicineId={selectedJourneyMedId}
          onClose={() => setSelectedJourneyMedId(null)}
        />
      )}
    </div>
  );
};

export default TrackActivity;
