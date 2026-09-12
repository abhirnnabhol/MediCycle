import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  FileText, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  Users,
  Eye,
  Check,
  Calendar,
  Thermometer,
  FileCheck,
  Activity
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MedicineJourneyModal from '../components/MedicineJourneyModal';
import GeminiDecisionSupport from '../components/GeminiDecisionSupport';

const REJECTION_REASONS = [
  'Expired batch / Shelf-life elapsed',
  'Damaged, unsealed, or compromised packaging',
  'Missing or illegible manufacturer batch number',
  'Improper temperature/storage condition history',
  'Schedule X narcotic / Not eligible for redistribution',
  'Counterfeit risk or unidentifiable pill imprint',
];

const AdminDashboard = ({ defaultTab }) => {
  const { user, isAdmin, isPharmacist, demoLogin } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(defaultTab || urlTab || 'verification'); // 'verification', 'requests', 'all-medicines', 'impact'

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [defaultTab, urlTab]);

  // Admin stats
  const [stats, setStats] = useState(null);

  // Queues
  const [pendingMedicines, setPendingMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [requests, setRequests] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal inspection & rejection states
  const [inspectingMed, setInspectingMed] = useState(null);
  const [rejectingMed, setRejectingMed] = useState(null);
  const [selectedJourneyMedId, setSelectedJourneyMedId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, allMedsRes, reqRes, alertsRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ data: null })),
        api.getPendingMedicines().catch(() => ({ data: [] })),
        api.getAllMedicines().catch(() => ({ data: [] })),
        api.getAdminRequests().catch(() => ({ data: [] })),
        api.getExpiryAlerts().catch(() => ({ data: null })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      setPendingMedicines(pendingRes.data || []);
      setAllMedicines(allMedsRes.data || []);
      setRequests(reqRes.data || []);
      if (alertsRes.data) setExpiryAlerts(alertsRes.data);
    } catch (err) {
      addToast('Error fetching admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPharmacist || isAdmin) {
      fetchAdminData();
    }
  }, [isPharmacist, isAdmin]);

  if (!isPharmacist && !isAdmin) {
    return (
      <div className="w-full flex-1 bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-200 shadow-card">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Pharmacist Access Required</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Clinical medicine verification and prescription matching are exclusively reserved for licensed pharmacists.
            </p>
            <button
              onClick={() => demoLogin('pharmacist')}
              className="mt-6 w-full py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm cursor-pointer"
            >
              Sign in as Pharmacist (Dr. Anita Sharma)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Approve
  const handleApprove = async (medicine) => {
    setActionLoading(true);
    try {
      const res = await api.approveMedicine(medicine._id);
      if (res.success) {
        addToast(`Approved "${medicine.name}"! Published to public catalog.`, 'success');
        setInspectingMed(null);
        await fetchAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingMed) return;

    const finalReason = customReason.trim() ? customReason.trim() : rejectionReason;

    setActionLoading(true);
    try {
      const res = await api.rejectMedicine(rejectingMed._id, finalReason);
      if (res.success) {
        addToast(`Rejected "${rejectingMed.name}". Reason recorded.`, 'info');
        setRejectingMed(null);
        setInspectingMed(null);
        setCustomReason('');
        await fetchAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Request Status Update
  const handleRequestStatusChange = async (requestId, nextStatus) => {
    try {
      const res = await api.updateRequestStatus(requestId, nextStatus);
      if (res.success) {
        addToast(`Request marked as ${nextStatus}.`, 'success');
        await fetchAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Error updating request.', 'error');
    }
  };

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Pharmacy Verification & Regulatory Control</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Pharmacy Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
            <span>Logged in as: <strong className="text-slate-800">{user.name}</strong></span>
            <span>•</span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              Prototype Pharmacist Persona
            </span>
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors self-start md:self-auto shadow-xs"
          title="Refresh All Queues"
          aria-label="Refresh All Queues"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Top Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Pending Audit</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingVerification}</div>
            <span className="text-[10px] text-slate-400 font-medium">Awaiting inspection</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Approved</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedMedicines}</div>
            <span className="text-[10px] text-slate-400 font-medium">Publicly accessible</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Rejected</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.rejectedMedicines}</div>
            <span className="text-[10px] text-slate-400 font-medium">Safety filtered</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Total Requests</span>
            <div className="text-2xl font-black text-sky-600 mt-1">{stats.totalRequests}</div>
            <span className="text-[10px] text-slate-400 font-medium">Patient orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Units Saved</span>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.totalUnitsSaved}</div>
            <span className="text-[10px] text-slate-400 font-medium">Prevented waste</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[11px] font-bold text-slate-500 block">Subsidized Value</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{stats.totalPotentialSavings.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-medium">Patient savings</span>
          </div>
        </div>
      )}


      {/* TAB 1: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">Loading verification queue...</div>
          ) : pendingMedicines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Verification Queue Clear!</h3>
              <p className="text-xs text-slate-500 mt-1">
                All submitted medicines have been reviewed. New submissions will populate here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:border-amber-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                      alt={medicine.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0 shadow-xs"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="text-lg font-extrabold text-slate-900">{medicine.name}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {medicine.strength}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                          Pending Verification
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 italic font-medium">
                        Generic: {medicine.genericName} • Category: {medicine.category}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Batch No.</span>
                          <strong>{medicine.batchNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Quantity</span>
                          <strong>{medicine.quantity} units</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Expiry Date</span>
                          <strong className="text-amber-800">
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Packaging</span>
                          <strong className="truncate block max-w-[140px]" title={medicine.packageCondition}>
                            {medicine.packageCondition}
                          </strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        <span>Submitted by: <strong className="text-slate-800">{medicine.donorId?.name || 'Anonymous Donor'}</strong></span>
                        <span className="mx-2">•</span>
                        <span>Date: {new Date(medicine.createdAt).toLocaleDateString()}</span>
                        {medicine.additionalNotes && (
                          <p className="text-slate-500 mt-1 italic font-medium">Notes: "{medicine.additionalNotes}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col lg:flex-row items-center gap-2 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      onClick={() => setInspectingMed(medicine)}
                      className="flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => setSelectedJourneyMedId(medicine._id)}
                      className="flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Journey</span>
                    </button>

                    <button
                      onClick={() => handleApprove(medicine)}
                      disabled={actionLoading}
                      className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setRejectingMed(medicine)}
                      disabled={actionLoading}
                      className="flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject...</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Patient Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Patient Requests</h3>
              <p className="text-xs text-slate-500 mt-1">
                Patient medicine requests will populate this queue for fulfillment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => {
                const med = req.medicineId;
                const isMatch = med ? true : false;
                const qtyAvailable = med ? med.quantity : 0;
                const isQtySufficient = qtyAvailable >= req.quantity;

                return (
                  <div
                    key={req._id}
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft flex flex-col gap-4"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {med?.name || 'Requested Medicine'}
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {med?.strength}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Completed' || req.status === 'Dispensed'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Patient: <strong className="text-slate-900">{req.userId?.name}</strong> ({req.userId?.email})
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Requested: <strong className="text-slate-800">{req.quantity} units</strong></span>
                          <span>Available in Stock: <strong className="text-emerald-700">{qtyAvailable} units</strong></span>
                          <span>Dispense Center: {req.deliveryAddress}</span>
                          <span>Phone: {req.contactPhone}</span>
                        </div>
                      </div>

                      {/* Status Progression Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                        {(med?._id || med) && (
                          <button
                            onClick={() => setSelectedJourneyMedId(med?._id || med)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Journey</span>
                          </button>
                        )}

                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleRequestStatusChange(req._id, 'Approved')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
                            >
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleRequestStatusChange(req._id, 'Rejected')}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status === 'Approved' && (
                          <button
                            onClick={() => handleRequestStatusChange(req._id, 'Completed')}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-sm cursor-pointer"
                          >
                            Mark Dispensed (Completed)
                          </button>
                        )}
                        {(req.status === 'Completed' || req.status === 'Dispensed') && (
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                            ✓ Dispensed & Closed
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                            ✕ Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRIORITY 7: Decision Support Prescription Match Summary */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Medicine:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {med?.name || 'Item Available'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Strength:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {med?.strength || 'Verified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Inventory:</span>
                        <span className={`font-bold flex items-center gap-1 ${isQtySufficient ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isQtySufficient ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> {qtyAvailable} Available
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Shortage
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Prescription:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Submitted for Review
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: All Inventory */}
      {activeTab === 'all-medicines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {allMedicines.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      m.status === 'APPROVED'
                        ? 'bg-emerald-600'
                        : m.status === 'REJECTED'
                        ? 'bg-rose-600'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{m.name} ({m.strength})</h5>
                    <p className="text-slate-500">{m.genericName} • Batch: {m.batchNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Qty: {m.quantity} • Exp: {new Date(m.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Expiry Alerts */}
      {activeTab === 'expiry-alerts' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold">
              Loading expiry alerts and shelf-life analysis...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">Expired (Quarantined)</span>
                  <span className="text-2xl font-black text-rose-700 mt-1 block">
                    {expiryAlerts?.summary?.expiredCount || 0}
                  </span>
                  <span className="text-[10px] text-rose-600">Never requestable or public</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">Expiring Soon (≤90 days)</span>
                  <span className="text-2xl font-black text-amber-700 mt-1 block">
                    {expiryAlerts?.summary?.expiringSoonCount || 0}
                  </span>
                  <span className="text-[10px] text-amber-600">Priority review required</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Safe Shelf-Life (&gt;90 days)</span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">
                    {expiryAlerts?.summary?.safeCount || 0}
                  </span>
                  <span className="text-[10px] text-emerald-600">Active distribution</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Priority Expiry & Shelf-Life Watchlist</span>
                </h3>

                {(!expiryAlerts?.expiringSoon || expiryAlerts.expiringSoon.length === 0) && (!expiryAlerts?.expired || expiryAlerts.expired.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No urgent expiry alerts. All stored inventory is within safe shelf-life limits.</p>
                ) : (
                  <div className="space-y-3">
                    {expiryAlerts?.expired?.map((m) => (
                      <div key={m._id} className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-black text-[10px]">EXPIRED</span>
                            <strong className="text-slate-900">{m.name} ({m.strength})</strong>
                          </div>
                          <p className="text-slate-500 mt-0.5">Batch: {m.batchNumber} • Expired {Math.abs(m.remainingDays)} days ago</p>
                        </div>
                        <span className="text-[11px] font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                          Disposal Queue per CPCB Rules
                        </span>
                      </div>
                    ))}

                    {expiryAlerts?.expiringSoon?.map((m) => (
                      <div key={m._id} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px]">EXPIRING SOON</span>
                            <strong className="text-slate-900">{m.name} ({m.strength})</strong>
                          </div>
                          <p className="text-slate-500 mt-0.5">Batch: {m.batchNumber} • Remaining: <strong>{m.remainingDays} days</strong> ({m.quantity} units)</p>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                          Review Priority
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: Impact & Audit Activity */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Closed-Loop Compliance</span>
              <span className="text-3xl font-black text-emerald-700 mt-2 block">100%</span>
              <p className="text-xs text-slate-500 mt-1">Every redistributed medicine is authenticated with registered batch numbers and expiry certificates.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Treatment Units Safeguarded</span>
              <span className="text-3xl font-black text-teal-700 mt-2 block">{stats?.totalUnitsSaved || 0} units</span>
              <p className="text-xs text-slate-500 mt-1">Prevented landfill incineration and redirected to verified low-income patient regimens.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Community Subsidy Value</span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">₹{(stats?.totalPotentialSavings || 0).toLocaleString('en-IN')}</span>
              <p className="text-xs text-slate-500 mt-1">Direct healthcare financial burden relieved through certified redistribution.</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-3">
            <h4 className="text-base font-extrabold text-slate-900">Pharmacist Verification Protocol Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <strong className="text-emerald-950 font-bold block mb-1">1. Primary Blister Foil Check</strong>
                <span>Inspect for puncture, moisture condensation, thermal exposure, and intact aluminum foil.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <strong className="text-emerald-950 font-bold block mb-1">2. Minimum 30-Day Expiry</strong>
                <span>Batch shelf-life is calculated from current date to guarantee safe patient consumption.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <strong className="text-emerald-950 font-bold block mb-1">3. Schedule Classification</strong>
                <span>Prescription verification required for Schedule H/X items before clinical release.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectingMed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-audit-title"
        >
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 id="inspect-audit-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Pharmacist Inspection Audit
            </h3>

            {/* Google Gemini Assisted Clinical Decision Support */}
            <GeminiDecisionSupport medicine={inspectingMed} />

            <img
              src={inspectingMed.imageUrl}
              alt={inspectingMed.name}
              className="w-full h-44 object-cover rounded-2xl border border-slate-200"
            />
            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p><strong className="text-slate-900">Medicine:</strong> {inspectingMed.name} ({inspectingMed.strength})</p>
              <p><strong className="text-slate-900">Generic:</strong> {inspectingMed.genericName}</p>
              <p><strong className="text-slate-900">Batch Number:</strong> {inspectingMed.batchNumber}</p>
              <p><strong className="text-slate-900">Expiry Date:</strong> {new Date(inspectingMed.expiryDate).toLocaleDateString()}</p>
              <p><strong className="text-slate-900">Packaging Integrity:</strong> {inspectingMed.packageCondition}</p>
              <p><strong className="text-slate-900">Storage Condition:</strong> {inspectingMed.storageCondition}</p>
              <p><strong className="text-slate-900">Quantity:</strong> {inspectingMed.quantity} units</p>
              <p><strong className="text-slate-900">Prescription:</strong> {inspectingMed.prescriptionRequired ? 'Yes (Schedule H/X)' : 'No (OTC)'}</p>
            </div>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectingMed(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setRejectingMed(inspectingMed)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              >
                Reject...
              </button>
              <button
                onClick={() => handleApprove(inspectingMed)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {rejectingMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Confirm Medicine Rejection</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              You are rejecting <strong>"{rejectingMed.name}"</strong>. Please select or write a mandatory rejection reason to provide transparent clinical feedback to the donor.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standard Safety Reasons
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Specify Custom Rejection Reason:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Broken seal observed on blister pack."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingMed(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Journey Modal */}
      {selectedJourneyMedId && (
        <MedicineJourneyModal
          medicineId={selectedJourneyMedId}
          onClose={() => setSelectedJourneyMedId(null)}
        />
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
