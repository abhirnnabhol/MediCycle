import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Pill, 
  HeartHandshake, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  Lock, 
  Activity, 
  Filter, 
  X, 
  Calendar, 
  Clock, 
  RotateCcw, 
  Eye, 
  FileCheck, 
  Check, 
  XCircle,
  Bell,
  UserCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';
import MedicineModal from '../components/MedicineModal';
import MedicineJourneyModal from '../components/MedicineJourneyModal';
import MediPointsHistoryModal from '../components/MediPointsHistoryModal';
import { DoctorMedi, PipThePill, EcoSprout } from '../components/CartoonCharacters';

const AuthenticatedHome = () => {
  const { user, isAdmin, isPharmacist, isPersonA, isPersonB } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Data states
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [pendingMeds, setPendingMeds] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [activeMedicine, setActiveMedicine] = useState(null);
  const [selectedJourneyMedId, setSelectedJourneyMedId] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available medicines (used by all roles)
      const approvedRes = await api.getApprovedMedicines().catch(() => ({ data: [] }));
      if (approvedRes.data) {
        setAvailableMedicines(approvedRes.data);
      }

      // 2. Fetch role-specific data
      if (isPharmacist) {
        const [statsRes, pendingRes, reqsRes] = await Promise.allSettled([
          api.getAdminStats(),
          api.getPendingMedicines(),
          api.getAdminRequests()
        ]);
        if (statsRes.status === 'fulfilled' && statsRes.value.data) setAdminStats(statsRes.value.data);
        if (pendingRes.status === 'fulfilled' && pendingRes.value.data) setPendingMeds(pendingRes.value.data);
        if (reqsRes.status === 'fulfilled' && reqsRes.value.data) setAdminRequests(reqsRes.value.data);
      } else {
        // Unified User (Aarav, Priya, or any registered citizen):
        // Can BOTH donate unused medicines AND request eligible medicines!
        const [subsRes, reqsRes, notifsRes] = await Promise.allSettled([
          api.getMySubmissions(),
          api.getMyRequests(),
          api.getMyNotifications()
        ]);
        if (subsRes.status === 'fulfilled' && subsRes.value?.data) setMySubmissions(subsRes.value.data);
        if (reqsRes.status === 'fulfilled' && reqsRes.value?.data) setMyRequests(reqsRes.value.data);
        if (notifsRes.status === 'fulfilled' && notifsRes.value?.data) setNotifications(notifsRes.value.data);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.email, user?.role]);

  // Pharmacist Quick Actions
  const handleQuickApprove = async (id, name) => {
    setActionLoading(true);
    try {
      const res = await api.approveMedicine(id);
      if (res.success) {
        addToast(`Approved "${name}"! Published to public catalog.`, 'success');
        await loadData();
      }
    } catch (err) {
      addToast(err.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickDispense = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await api.updateRequestStatus(requestId, 'Dispensed', 'Dispensed to recipient during clinic hours.');
      if (res.success) {
        addToast('Request marked as Dispensed to patient!', 'success');
        await loadData();
      }
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter available medicines
  const filteredMedicines = useMemo(() => {
    return availableMedicines.filter((med) => {
      const matchesSearch =
        !searchQuery.trim() ||
        med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        med.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'AVAILABLE' && med.status === 'APPROVED') ||
        (statusFilter === 'SOLD' && (med.status === 'SOLD' || med.status === 'DISPENSED' || med.status === 'COMPLETED'));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [availableMedicines, searchQuery, selectedCategory, statusFilter]);

  const availableCount = useMemo(
    () => availableMedicines.filter((m) => m.status === 'APPROVED').length,
    [availableMedicines]
  );
  const dispensedCount = useMemo(
    () => availableMedicines.filter((m) => ['SOLD', 'DISPENSED', 'COMPLETED'].includes(m.status)).length,
    [availableMedicines]
  );

  // Person A Statistics
  const personAStats = useMemo(() => {
    const totalDonated = mySubmissions.length;
    const pendingVerification = mySubmissions.filter((s) => s.status === 'PENDING').length;
    const approvedDonations = mySubmissions.filter((s) => s.status === 'APPROVED' || s.status === 'REQUESTED').length;
    const currentlyAvailable = mySubmissions.filter((s) => s.status === 'APPROVED').length;
    const completedDonated = mySubmissions.filter((s) => ['DISPENSED', 'COMPLETED', 'SOLD'].includes(s.status)).length;
    return { totalDonated, pendingVerification, approvedDonations, currentlyAvailable, completedDonated };
  }, [mySubmissions]);

  // Person B Statistics
  const personBStats = useMemo(() => {
    const totalRequests = myRequests.length;
    const pendingRequests = myRequests.filter((r) => r.status === 'Pending').length;
    const approvedRequests = myRequests.filter((r) => r.status === 'Approved').length;
    const completedRequests = myRequests.filter((r) => ['Completed', 'Dispensed'].includes(r.status)).length;
    return { totalRequests, pendingRequests, approvedRequests, completedRequests };
  }, [myRequests]);

  const categories = [
    'All',
    'Oncology',
    'Critical Care',
    'Cardiology',
    'Diabetes Care',
    'Antibiotics',
    'Pain Relief',
    'Vitamins & Supplements'
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Requested
          </span>
        );
      case 'DISPENSED':
      case 'COMPLETED':
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <HeartHandshake className="w-3 h-3 text-purple-600" />
            Completed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-8 sm:py-10 min-h-screen relative">
      {/* Background Texture Pattern */}
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            ROLE 1: PHARMACIST (DR. ANITA) COMMAND CENTER
           ========================================================================= */}
        {isPharmacist ? (
          <div className="space-y-10">
            {/* Pharmacist Top Hero Banner */}
            <div className="rounded-3xl bg-medical-hero border border-amber-500/40 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="p-8 sm:p-10 lg:p-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-bold border border-white/20 mb-4 shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Pharmacist Clinical Command Desk</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      Good morning, Dr. Anita 👩‍⚕️
                    </h1>

                    <p className="text-base sm:text-lg text-emerald-100/90 mt-3 font-normal leading-relaxed">
                      Review medicines and manage the MediCycle verification process.
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap gap-4">
                      <Link
                        to="/pharmacist/verification"
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Open Verification Queue ({pendingMeds.length})</span>
                      </Link>
                      <Link
                        to="/pharmacist/requests"
                        className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Review Requests ({adminRequests.filter(r => r.status === 'Pending').length} Pending)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-3xl shadow-xl flex items-center gap-4 shrink-0">
                    <DoctorMedi className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md animate-float" />
                    <div className="text-left text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 block">
                        Chief Pharmacist
                      </span>
                      <span className="text-base sm:text-lg font-black block mt-0.5">
                        Dr. Anita Sharma
                      </span>
                      <span className="text-[9px] font-bold text-amber-950 bg-amber-300/90 px-2 py-0.5 rounded-full inline-block mt-1">
                        Prototype Pharmacist Persona
                      </span>
                      <p className="text-xs text-emerald-100 max-w-[170px] leading-tight mt-1.5">
                        Verifying batch integrity and safe redistribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacist Live Metrics */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Verification & Custody Statistics
                </h2>
                <span className="text-xs font-bold text-amber-700">Live Telemetry</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Pending Verification</span>
                  <span className="text-3xl font-black text-amber-600 mt-1 block">{pendingMeds.length}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Awaiting physical audit</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Approved</span>
                  <span className="text-3xl font-black text-emerald-600 mt-1 block">{availableCount}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Active in catalog</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Rejected</span>
                  <span className="text-3xl font-black text-rose-600 mt-1 block">{adminStats?.rejectedMedicines || 1}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Safety filtered</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Pending Requests</span>
                  <span className="text-3xl font-black text-sky-600 mt-1 block">{adminRequests.filter(r => r.status === 'Pending').length}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Patient orders</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Completed / Dispensed</span>
                  <span className="text-3xl font-black text-purple-600 mt-1 block">{dispensedCount || 1}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Successfully fulfilled</span>
                </div>
              </div>
            </div>

            {/* Two Quick Review Queues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Queue 1: Pending Verification Queue */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Verification Queue</h3>
                      <span className="text-xs text-slate-400">Batches needing inspection</span>
                    </div>
                  </div>
                  <Link to="/pharmacist/verification" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                    <span>View All ({pendingMeds.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {pendingMeds.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>No pending submissions! Verification queue is all clear.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingMeds.slice(0, 3).map((med) => (
                      <div key={med._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="font-extrabold text-slate-900 block text-sm">{med.name} ({med.strength})</strong>
                          <span className="text-slate-500">Batch: <code>{med.batchNumber}</code> • Qty: {med.quantity} units</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJourneyMedId(med._id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                            title="Inspect Journey"
                          >
                            Journey
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleQuickApprove(med._id, med.name)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Queue 2: Pending Requests Queue */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Medicine Requests</h3>
                      <span className="text-xs text-slate-400">Patient claim authorization</span>
                    </div>
                  </div>
                  <Link to="/pharmacist/requests" className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {adminRequests.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <HeartHandshake className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                    <span>No active patient requests pending right now.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminRequests.slice(0, 3).map((req) => (
                      <div key={req._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="font-extrabold text-slate-900 block text-sm">
                            {req.medicineId?.name || 'Prescription Medicine'} ({req.quantity} units)
                          </strong>
                          <span className="text-slate-500">
                            Requested by: <strong className="text-slate-700">Verified Recipient</strong> • Status: <strong className="text-sky-700">{req.status}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJourneyMedId(req.medicineId?._id || req.medicineId)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                          >
                            Journey
                          </button>
                          {req.status === 'Approved' ? (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleQuickDispense(req._id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-xs cursor-pointer"
                            >
                              Dispense
                            </button>
                          ) : (
                            <Link
                              to="/pharmacist/requests"
                              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-xs"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              ROLE 2: UNIFIED MEDICYCLE USER (ALL NORMAL USERS: AARAV, PRIYA, ETC.)
              Supports BOTH activities: Donating unused medicines AND Requesting medicines
             ========================================================================= */
          <div className="space-y-10">
            {/* Unified User Top Hero Banner */}
            <div className="rounded-3xl bg-medical-hero border border-emerald-500/40 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="p-8 sm:p-10 lg:p-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/20 shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Verified Community Medicine Network</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-xs font-extrabold">
                        👤 Role: User • Donate & Request Medicines
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                      Welcome, {user?.name?.split(' ')[0] || 'MediCycle Member'} 👋
                    </h1>

                    <p className="text-base sm:text-lg text-emerald-100/90 mt-3 font-normal leading-relaxed">
                      "Give your unused medicines a responsible second chance, or request verified therapies safely."
                    </p>

                    {/* Fast Hero Metrics */}
                    <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
                      <div>
                        <span className="block text-xl sm:text-2xl font-black text-white">{personAStats.totalDonated}</span>
                        <span className="text-[11px] sm:text-xs text-emerald-200 font-medium">Medicines Donated</span>
                      </div>
                      <div className="border-l border-white/15 pl-4">
                        <span className="block text-xl sm:text-2xl font-black text-white">{personBStats.totalRequests}</span>
                        <span className="text-[11px] sm:text-xs text-emerald-200 font-medium">Requests Logged</span>
                      </div>
                      <div className="border-l border-white/15 pl-4">
                        <span className="block text-xl sm:text-2xl font-black text-white">{availableCount}</span>
                        <span className="text-[11px] sm:text-xs text-emerald-200 font-medium">Available in Stock</span>
                      </div>
                      <div className="border-l border-white/15 pl-4">
                        <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
                        <span className="text-[11px] sm:text-xs text-emerald-200 font-medium">Pharmacist Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-3xl shadow-xl flex items-center gap-4 shrink-0">
                    <EcoSprout className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md animate-float" />
                    <div className="text-left text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">
                        Full Medicine Lifecycle
                      </span>
                      <span className="text-base sm:text-lg font-black block mt-0.5">
                        Donate & Receive
                      </span>
                      <p className="text-xs text-emerald-100 max-w-[160px] leading-tight mt-1">
                        One unified account to share surplus and access essential care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MEDIPOINTS REWARD & LOYALTY CARD */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white shadow-soft border border-teal-600/30 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 border border-white/20">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-teal-100">
                      Donor Rewards
                    </span>
                    <span className="text-xs text-teal-200">• +100 pts per approved donation</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-baseline gap-2">
                    <span>{(user?.mediPoints || 0).toLocaleString()} MediPoints</span>
                    <span className="text-xs font-semibold text-emerald-200">
                      {user?.mediPoints >= 5000
                        ? '(Tier 3: ₹25 off fee)'
                        : user?.mediPoints >= 2000
                        ? '(Tier 2: ₹10 off fee)'
                        : user?.mediPoints >= 1000
                        ? '(Tier 1: ₹5 off fee)'
                        : `(${1000 - (user?.mediPoints || 0)} pts to next tier)`}
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
                    Redeem your points for instant discounts on medicine fulfillment fees. Points strictly lower checkout fees and never bypass pharmacist prescription verification.
                  </p>
                </div>
              </div>

              <div className="relative z-10 shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setPointsModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>View Points Passbook</span>
                </button>
              </div>
            </div>

            {/* TWO PROMINENT ACTIONS (Side-by-Side) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Primary User Actions
                </h2>
                <span className="text-xs font-bold text-emerald-700">Dual Capability</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Action 1: Donate Medicine (Give Back) */}
                <Link
                  to="/donate-medicine"
                  className="p-6 rounded-3xl bg-white hover:bg-teal-50/60 border border-slate-200/90 hover:border-teal-400 transition-all shadow-soft hover:shadow-card hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                        <PlusCircle className="w-6 h-6 text-teal-600" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {personAStats.totalDonated} Donated
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                        Donate Medicine
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Give Back
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      → Have unused unexpired medicines? Submit sealed packs for physical pharmacist verification and batch testing before redistribution.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                    <span>Submit Medicine for Review</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </Link>

                {/* Action 2: Find Medicines (Request Aid) */}
                <Link
                  to="/find-medicines"
                  className="p-6 rounded-3xl bg-white hover:bg-sky-50/60 border border-slate-200/90 hover:border-sky-400 transition-all shadow-soft hover:shadow-card hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                        <Search className="w-6 h-6 text-sky-600" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        {availableCount} Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                        Find Medicines
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        Get Aid
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      → Looking for an eligible medicine? Browse approved surplus stock and submit prescription requests for subsidized or free dispensing.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                    <span>Browse Approved Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </Link>
              </div>
            </div>

            {/* MY COMBINED ACTIVITY SUMMARY */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    My Activity Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your combined donation and medicine request progress</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/my-donations" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                    <span>My Donations ({personAStats.totalDonated})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/my-requests" className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1">
                    <span>My Requests ({personBStats.totalRequests})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/track-activity" className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
                    <span>Full Tracker</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Donated</span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">{personAStats.totalDonated}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Medicines submitted</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Total Requests</span>
                  <span className="text-3xl font-black text-sky-700 mt-1 block">{personBStats.totalRequests}</span>
                  <span className="text-[11px] text-sky-600 mt-1 block">Prescription claims</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-3xl font-black text-amber-700 mt-1 block">
                    {personAStats.pendingVerification + personBStats.pendingRequests}
                  </span>
                  <span className="text-[11px] text-amber-600 mt-1 block">In pharmacist queue</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Approved</span>
                  <span className="text-3xl font-black text-emerald-700 mt-1 block">
                    {personAStats.approvedDonations + personBStats.approvedRequests}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">Passed verification</span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Completed</span>
                  <span className="text-3xl font-black text-purple-700 mt-1 block">
                    {personAStats.completedDonated + personBStats.completedRequests}
                  </span>
                  <span className="text-[11px] text-purple-600 mt-1 block">Dispensed / Reached</span>
                </div>
              </div>
            </div>

            {/* YOUR SOCIAL IMPACT & VISUAL FLOWCHART */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Social Impact Dashboard</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Your Community Impact</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    By submitting unspent medicines and receiving verified therapies through MediCycle, you divert usable stock away from environmental waste and sustain life-saving healthcare.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center">
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <span className="text-2xl font-black text-white block">{personAStats.totalDonated}</span>
                    <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Medicines Donated</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <span className="text-2xl font-black text-white block">{personBStats.totalRequests}</span>
                    <span className="text-[10px] text-sky-300 uppercase font-bold tracking-wider">Requests Logged</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <span className="text-2xl font-black text-white block">₹18,450</span>
                    <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Illustrative Value</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <span className="text-2xl font-black text-white block">
                      {personAStats.completedDonated + personBStats.completedRequests || 1}
                    </span>
                    <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Journeys Closed</span>
                  </div>
                </div>
              </div>

              {/* Visual Flowchart */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-[11px] border border-emerald-400/40">1</span>
                  <span>Donor Submits</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex items-center gap-2 text-teal-300 font-bold">
                  <span className="w-6 h-6 rounded-full bg-teal-500/30 text-teal-200 flex items-center justify-center text-[11px] border border-teal-400/40">2</span>
                  <span>Pharmacist Verifies</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-200 flex items-center justify-center text-[11px] border border-cyan-400/40">3</span>
                  <span>Catalog Available</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex items-center gap-2 text-sky-300 font-bold">
                  <span className="w-6 h-6 rounded-full bg-sky-500/30 text-sky-200 flex items-center justify-center text-[11px] border border-sky-400/40">4</span>
                  <span>Patient Requests</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-200 flex items-center justify-center text-[11px] border border-purple-400/40">5</span>
                  <span>Dispensed & Completed</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic text-right mt-3">
                * Note: Financial numbers are labeled as Illustrative Demo Impact based on prototype seed metrics.
              </p>
            </div>

            {/* TWO-COLUMN SECTION: RECENT DONATIONS & RECENT REQUESTS / ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Cols: Recent Donations */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-extrabold text-slate-900">My Recent Donations</h3>
                  </div>
                  <Link to="/my-donations" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                    View All ({mySubmissions.length}) →
                  </Link>
                </div>

                {mySubmissions.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No donations submitted yet</p>
                    <p className="text-slate-400 mt-1 mb-4">Have unused medicines? Put them to good use.</p>
                    <Link
                      to="/donate-medicine"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Donate Medicine Now</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySubmissions.slice(0, 4).map((med) => {
                      const formattedExpiry = new Date(med.expiryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <div
                          key={med._id}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                              alt={med.name}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{med.name}</h4>
                                <span className="text-[11px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                                  {med.strength}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                {med.category} • Qty: <strong className="text-slate-800">{med.quantity} units</strong> • Exp: <strong className="text-slate-800">{formattedExpiry}</strong>
                              </p>
                              {med.requestInfo && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1 border border-blue-200">
                                  <UserCheck className="w-3 h-3 text-blue-600" />
                                  <span>Requested by: <strong>Verified Recipient</strong></span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {getStatusBadge(med.status)}
                            <button
                              type="button"
                              onClick={() => setSelectedJourneyMedId(med._id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Track Journey</span>
                              <ArrowRight className="w-3 h-3 text-emerald-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right 5 Cols: My Recent Requests & Live Activity Notifications */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-sky-600" />
                    <h3 className="text-base font-extrabold text-slate-900">My Requests & Activity</h3>
                  </div>
                  <Link to="/my-requests" className="text-xs font-bold text-sky-700 hover:text-sky-800">
                    View All ({myRequests.length}) →
                  </Link>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-3.5">
                  {/* Recent Medicine Requests */}
                  {myRequests.length > 0 && (
                    <div className="space-y-2 pb-3 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Recent Medicine Requests
                      </span>
                      {myRequests.slice(0, 2).map((req) => (
                        <div key={req._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-slate-900 block font-bold">{req.medicine?.name || 'Medicine Request'}</strong>
                            <span className="text-[11px] text-slate-500">Qty: {req.quantityRequested || 1} units</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            req.status === 'Completed' || req.status === 'Dispensed' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activity Timeline / Notifications */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                      Recent System Notifications
                    </span>
                    {notifications.length === 0 ? (
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block">Medicine verification active</strong>
                            <span className="text-[11px] text-slate-400">Dr. Anita reviews all incoming donations</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      notifications.slice(0, 3).map((n) => (
                        <div
                          key={n._id}
                          className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs mb-2"
                        >
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <strong className="font-extrabold text-slate-900 block text-xs">{n.title}</strong>
                            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    to="/track-activity"
                    className="block text-center py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    Open Combined Activity Tracker →
                  </Link>
                </div>
              </div>
            </div>

            {/* BROWSE AVAILABLE MEDICINES (CATALOG PREVIEW) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse Available Medicines</h2>
                  <p className="text-xs text-slate-600 mt-1">Verified safe surplus medicines currently available for subsidized redistribution.</p>
                </div>
                <Link to="/find-medicines" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto">
                  <span>Explore Full Catalog ({availableMedicines.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableMedicines.slice(0, 6).map((med) => (
                  <MedicineCard
                    key={med._id}
                    medicine={med}
                    onSelect={(m) => setActiveMedicine(m)}
                    onRequest={(m) => setActiveMedicine(m)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Modals */}
      {activeMedicine && (
        <MedicineModal
          medicine={activeMedicine}
          onClose={() => setActiveMedicine(null)}
          onRequestSuccess={() => {
            setActiveMedicine(null);
            loadData();
          }}
        />
      )}

      {selectedJourneyMedId && (
        <MedicineJourneyModal
          medicineId={selectedJourneyMedId}
          isOpen={!!selectedJourneyMedId}
          onClose={() => setSelectedJourneyMedId(null)}
        />
      )}

      {/* MediPoints Passbook Modal */}
      <MediPointsHistoryModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
      />
    </div>
  );
};

export default AuthenticatedHome;
