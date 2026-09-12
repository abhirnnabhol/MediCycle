import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Package, 
  FileText, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Check, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Building2, 
  Shield, 
  HeartHandshake,
  TrendingUp,
  Leaf,
  ChevronRight,
  Crown,
  Award
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MedicineJourneyModal from '../components/MedicineJourneyModal';
import { AdminCommander, EcoSprout } from '../components/CartoonCharacters';

const AdminCommandCenter = ({ defaultTab }) => {
  const { user, isAdmin, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  // Simple Admin Navigation Tabs: overview, people, medicines, requests, activity, alerts
  const [activeTab, setActiveTab] = useState(defaultTab || urlTab || 'overview');
  const [selectedJourneyMedId, setSelectedJourneyMedId] = useState(null);

  // People sub-tab: 'users' | 'pharmacists'
  const [peopleSubTab, setPeopleSubTab] = useState('users');

  // Filter States
  const [medicineFilter, setMedicineFilter] = useState('all');
  const [medicineSearch, setMedicineSearch] = useState('');

  const [requestFilter, setRequestFilter] = useState('all');

  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [auditFilter, setAuditFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');

  // Selected User Modal for Details
  const [selectedUser, setSelectedUser] = useState(null);

  // Data States
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pharmacistsList, setPharmacistsList] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Sync tab from props or url
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [defaultTab, urlTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, uRes, pRes, mRes, rRes, aRes] = await Promise.all([
        api.getAdminOverview().catch(() => ({ data: null })),
        api.getAdminUsers().catch(() => ({ data: [] })),
        api.getAdminPharmacists().catch(() => ({ data: [] })),
        api.getAllMedicines().catch(() => ({ data: [] })),
        api.getAdminRequests().catch(() => ({ data: [] })),
        api.getAdminAuditLogs().catch(() => ({ data: [] })),
      ]);

      if (ovRes.data) setOverviewData(ovRes.data);
      setUsersList(uRes.data || []);
      setPharmacistsList(pRes.data || []);
      setMedicinesList(mRes.data || []);
      setRequestsList(rRes.data || []);
      setAuditLogs(aRes.data || []);
    } catch (err) {
      addToast('Error loading admin platform data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        addToast(res.message || 'User status updated successfully', 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const navigateTab = (tabId, subFilter = null) => {
    setActiveTab(tabId);
    navigate(tabId === 'overview' ? '/admin' : `/admin/${tabId}`);
    if (subFilter && tabId === 'medicines') {
      setMedicineFilter(subFilter);
    } else if (subFilter && tabId === 'requests') {
      setRequestFilter(subFilter);
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full flex-1 bg-[#edf7f6] py-20 min-h-screen relative flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
          style={{ backgroundSize: '320px auto' }}
        />
        <div className="max-w-md w-full mx-auto px-4 text-center relative z-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-card">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Access Required</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This console provides platform-level oversight over users, platform flow, activity audit trails, and community impact. Please sign in with administrator credentials.
            </p>
            <button
              onClick={() => demoLogin('admin')}
              className="mt-6 w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
            >
              Sign In as MediCycle Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculations for Overview & Priority Attention
  const metrics = overviewData?.platformMetrics || {};
  const inventory = overviewData?.inventoryMetrics || {};
  const impact = overviewData?.impactMetrics || {};

  const totalUsersCount = metrics.totalUsers || usersList.filter((u) => u.role === 'user').length || 0;
  const totalMedsCount = metrics.totalMedicines || medicinesList.length || 0;
  const pendingMedsCount = metrics.pendingVerification || medicinesList.filter((m) => m.status === 'PENDING').length || 0;
  const activeReqCount = metrics.activeRequests || requestsList.filter((r) => r.status === 'Pending' || r.status === 'Approved').length || 0;
  const availableStockCount = inventory.availableUnits || medicinesList.filter((m) => m.status === 'APPROVED').reduce((sum, m) => sum + (Number(m.quantity) || 0), 0) || 0;
  const completedCount = impact.completedJourneys || metrics.completedRequests || requestsList.filter((r) => r.status === 'Completed' || r.status === 'Dispensed').length || 0;

  // Alerts calculation
  const now = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const expiredMeds = medicinesList.filter((m) => new Date(m.expiryDate) <= now);
  const expiringSoonMeds = medicinesList.filter((m) => {
    const exp = new Date(m.expiryDate);
    return exp > now && exp <= ninetyDaysFromNow;
  });

  const hasUrgentAttention = pendingMedsCount > 0 || activeReqCount > 0 || expiringSoonMeds.length > 0 || expiredMeds.length > 0;

  // Filtered medicines
  const filteredMedicines = medicinesList.filter((m) => {
    const matchSearch =
      !medicineSearch ||
      m.name?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      m.batchNumber?.toLowerCase().includes(medicineSearch.toLowerCase());

    if (!matchSearch) return false;

    if (medicineFilter === 'Pending') return m.status === 'PENDING';
    if (medicineFilter === 'Available') return m.status === 'APPROVED';
    if (medicineFilter === 'Requested') return m.status === 'REQUESTED';
    if (medicineFilter === 'Completed') return m.status === 'DISPENSED' || m.status === 'SOLD';
    if (medicineFilter === 'Expiring') {
      const exp = new Date(m.expiryDate);
      return exp <= ninetyDaysFromNow;
    }
    return true;
  });

  // Filtered requests
  const filteredRequests = requestsList.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status?.toLowerCase() === requestFilter.toLowerCase();
  });

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (u.role !== 'user') return false;
    const matchSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchSearch) return false;
    if (userStatusFilter === 'active') return u.isActive !== false;
    if (userStatusFilter === 'suspended') return u.isActive === false;
    return true;
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilter === 'all') return true;
    return log.actorRole?.toLowerCase() === auditFilter.toLowerCase();
  });

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">

        {/* 1. ADMIN HERO BANNER (Matching Pharmacist Clinical Command Desk Style) */}
        <div className="rounded-3xl bg-medical-hero border border-emerald-500/40 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="p-8 sm:p-10 lg:p-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-bold border border-white/20 mb-4 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Admin Executive Command Desk</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Good morning, Admin 👑
                </h1>

                <p className="text-base sm:text-lg text-emerald-100/90 mt-3 font-normal leading-relaxed">
                  Review medicines and manage the MediCycle verification process.
                </p>

                <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigateTab('medicines', 'Pending')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Verification Queue ({pendingMedsCount})</span>
                  </button>

                  <button
                    onClick={() => navigateTab('requests')}
                    className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Review Requests ({activeReqCount} Pending)</span>
                  </button>

                  <button
                    onClick={fetchAdminData}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                    title="Refresh platform telemetry"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-300' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Frosted Mascot Profile Card */}
              <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-3xl shadow-xl flex items-center gap-4 shrink-0">
                <AdminCommander className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md animate-float" />
                <div className="text-left text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 block">
                    Chief Administrator
                  </span>
                  <span className="text-base sm:text-lg font-black block mt-0.5">
                    MediCycle Admin 👑
                  </span>
                  <p className="text-xs text-emerald-100 max-w-[160px] leading-tight mt-1">
                    Verifying batch integrity and safe redistribution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Statistics Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Verification & Custody Statistics
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Running Smoothly</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 hidden sm:inline">Live Telemetry</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW (The Core Clean Admin Experience)             */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 3. TOP SUMMARY CARDS — Exactly 6 simple, light cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Total Users */}
              <div 
                onClick={() => navigateTab('people')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{totalUsersCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Total Users</span>
                <span className="text-[10px] text-slate-400 font-medium">Community members</span>
              </div>

              {/* Card 2: Medicines */}
              <div 
                onClick={() => navigateTab('medicines')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{totalMedsCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Medicines</span>
                <span className="text-[10px] text-slate-400 font-medium">Tracked in system</span>
              </div>

              {/* Card 3: Needs Verification */}
              <div 
                onClick={() => navigateTab('medicines', 'Pending')}
                className={`p-4 rounded-2xl bg-white border shadow-soft hover:border-amber-300 transition-all cursor-pointer group ${
                  pendingMedsCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-amber-700 mt-2">{pendingMedsCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Needs Verification</span>
                <span className="text-[10px] text-slate-400 font-medium">Pharmacist queue</span>
              </div>

              {/* Card 4: Active Requests */}
              <div 
                onClick={() => navigateTab('requests')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft hover:border-sky-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{activeReqCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Active Requests</span>
                <span className="text-[10px] text-slate-400 font-medium">Under clinical review</span>
              </div>

              {/* Card 5: Available Stock */}
              <div 
                onClick={() => navigateTab('medicines', 'Available')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">{availableStockCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Available Stock</span>
                <span className="text-[10px] text-slate-400 font-medium">Approved units ready</span>
              </div>

              {/* Card 6: Completed */}
              <div 
                onClick={() => navigateTab('activity')}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{completedCount}</div>
                <span className="text-xs font-bold text-slate-700 block">Completed</span>
                <span className="text-[10px] text-slate-400 font-medium">Safely redistributed</span>
              </div>
            </div>

            {/* MediPoints Loyalty & Donor Rewards Platform Metrics */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-emerald-950 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30">
                      Donor Rewards Telemetry
                    </span>
                    <span className="text-xs text-teal-200/80">• MediPoints Prototype Ledger</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    Donor Incentives & Community Loyalty Circulation
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-teal-700/60 pt-3 sm:pt-0 sm:pl-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Issued</span>
                  <span className="text-base sm:text-lg font-black text-teal-200">
                    {(overviewData?.mediPointsMetrics?.totalIssued ?? 2700).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Redeemed</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">
                    {(overviewData?.mediPointsMetrics?.totalRedeemed ?? 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Circulation</span>
                  <span className="text-base sm:text-lg font-black text-emerald-300">
                    {(overviewData?.mediPointsMetrics?.activeCirculation ?? 2700).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">pts</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 4. PRIORITY SECTION: "Needs Attention" */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Priority Attention
                  </span>
                  <span className={`w-2 h-2 rounded-full ${hasUrgentAttention ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {hasUrgentAttention ? 'Items Requiring Review' : 'Everything Looks Good!'}
                </h2>

                {hasUrgentAttention ? (
                  <div className="space-y-2 text-xs">
                    {pendingMedsCount > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="font-semibold text-amber-900">
                          🟠 <strong>{pendingMedsCount}</strong> medicine(s) awaiting verification
                        </span>
                        <button
                          onClick={() => navigateTab('medicines', 'Pending')}
                          className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review Queue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {activeReqCount > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
                        <span className="font-semibold text-sky-900">
                          🟠 <strong>{activeReqCount}</strong> request(s) awaiting pharmacist review
                        </span>
                        <button
                          onClick={() => navigateTab('requests', 'Pending')}
                          className="font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Requests</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {expiringSoonMeds.length > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="font-semibold text-amber-900">
                          🟡 <strong>{expiringSoonMeds.length}</strong> medicine(s) expiring soon (≤90 days)
                        </span>
                        <button
                          onClick={() => navigateTab('alerts')}
                          className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Alerts</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {expiredMeds.length > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                        <span className="font-semibold text-rose-900">
                          🔴 <strong>{expiredMeds.length}</strong> expired batch(es) quarantined for CPCB disposal
                        </span>
                        <button
                          onClick={() => navigateTab('alerts')}
                          className="font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Quarantine Log</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No urgent actions right now. All submissions and patient requests are up to date.</span>
                  </div>
                )}
              </div>

              {/* Friendly Admin Mascot Companion (Admin Commander) */}
              <div className="hidden sm:flex items-center justify-center shrink-0 pr-2">
                <AdminCommander className="w-28 h-28 drop-shadow-xs" />
              </div>
            </div>

            {/* 5. PLATFORM FLOW: "Medicine Journey" (Simple Visual Pipeline) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Medicine Journey</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform-wide closed-loop medicine lifecycle flow
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Closed-Loop Active
                </span>
              </div>

              {/* Horizontal Pipeline Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                {/* Step 1: Donated */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    💊
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Donated</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5">{totalMedsCount}</span>
                  <span className="text-[10px] text-slate-400">Submissions</span>
                </div>

                {/* Step 2: Verified */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-black">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Verified</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5">
                    {metrics.approvedMedicines || medicinesList.filter((m) => m.status === 'APPROVED' || m.status === 'DISPENSED' || m.status === 'SOLD').length}
                  </span>
                  <span className="text-[10px] text-slate-400">Clinical check</span>
                </div>

                {/* Step 3: Available */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-black">
                    🏥
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Available</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5">{availableStockCount}</span>
                  <span className="text-[10px] text-slate-400">Stock units</span>
                </div>

                {/* Step 4: Requested */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                    📋
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Requested</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5">{activeReqCount}</span>
                  <span className="text-[10px] text-slate-400">Rx claims</span>
                </div>

                {/* Step 5: Dispensed */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-black">
                    📦
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Dispensed</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5">
                    {inventory.dispensedUnits || completedCount}
                  </span>
                  <span className="text-[10px] text-slate-400">Delivered</span>
                </div>

                {/* Step 6: Completed */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    🎉
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Completed</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5">{completedCount}</span>
                  <span className="text-[10px] text-slate-400">Full cycle</span>
                </div>
              </div>
            </div>

            {/* 6 & 7: Two-Column Section: RECENT ACTIVITY & COMMUNITY IMPACT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 6. RECENT ACTIVITY (Clean Timeline) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Platform Log
                    </span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">No platform activity recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.slice(0, 6).map((log, idx) => {
                        const time = new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div key={log._id || idx} className="flex items-start gap-3 text-xs">
                            <span className="text-[11px] font-bold text-slate-400 min-w-[58px] pt-0.5">{time}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <span className="font-bold text-slate-900 mr-1.5">{log.actor}</span>
                              <span className="text-slate-600">{log.details || log.action}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigateTab('activity')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 7. COMMUNITY IMPACT (Clean & Grounded) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Community Impact</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Measurable benefits created through verified redistribution
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Illustrative Demo Impact
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Metric 1 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span>💊 Medicines Redistributed</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {impact.medicinesRedistributed || 48} units
                      </div>
                      <span className="text-[10px] text-slate-400">Completed & dispensed</span>
                    </div>

                    {/* Metric 2 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span>👥 People Assisted</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {completedCount || 12} patients
                      </div>
                      <span className="text-[10px] text-slate-400">Rx requests fulfilled</span>
                    </div>

                    {/* Metric 3 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span>♻️ Waste Reduced</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        ~{((impact.medicinesRedistributed || 48) * 0.08).toFixed(1)} kg
                      </div>
                      <span className="text-[10px] text-slate-400">Diverted from landfills</span>
                    </div>

                    {/* Metric 4 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span>💰 Estimated Savings</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        ₹{(impact.estimatedPatientSavings || 28450).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">Subsidized patient value</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Verified by licensed clinical pharmacists</span>
                  <div className="w-9 h-9 shrink-0">
                    <EcoSprout className="w-9 h-9" />
                  </div>
                </div>
              </div>

            </div>

            {/* 8. QUICK ACCESS (Only 4 Clean Buttons) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900">Quick Access</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('people');
                    setPeopleSubTab('users');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 text-slate-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-slate-700 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Users</span>
                    <span className="text-[10px] text-slate-400">View users</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('people');
                    setPeopleSubTab('pharmacists');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-200 text-slate-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-teal-700 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Pharmacists</span>
                    <span className="text-[10px] text-slate-400">View pharmacists</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateTab('medicines')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 text-slate-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Medicines</span>
                    <span className="text-[10px] text-slate-400">View medicine inventory</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateTab('requests')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-200 text-slate-800 transition-all text-left flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-sky-700 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Requests</span>
                    <span className="text-[10px] text-slate-400">View medicine requests</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PEOPLE (Users | Pharmacists)                          */}
        {/* ============================================================ */}
        {activeTab === 'people' && (
          <div className="space-y-6">
            {/* Sub-Tabs: Users | Pharmacists */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeopleSubTab('users')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    peopleSubTab === 'users'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  👥 Community Users ({usersList.filter((u) => u.role === 'user').length})
                </button>

                <button
                  onClick={() => setPeopleSubTab('pharmacists')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    peopleSubTab === 'pharmacists'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  👨‍⚕️ Clinical Pharmacists ({pharmacistsList.length})
                </button>
              </div>

              {peopleSubTab === 'users' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                    />
                  </div>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              )}
            </div>

            {/* USERS VIEW */}
            {peopleSubTab === 'users' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4 text-center">Donations</th>
                        <th className="py-3.5 px-4 text-center">Requests</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 italic">
                            No community users match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{u.name}</span>
                                  <span className="text-[10px] text-slate-400">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {u.email}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">
                              {u.donationCount || 0}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">
                              {u.requestCount || 0}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {u.isActive !== false ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(u._id)}
                                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer ${
                                  u.isActive !== false
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {u.isActive !== false ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PHARMACISTS VIEW */}
            {peopleSubTab === 'pharmacists' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pharmacistsList.map((p) => (
                  <div key={p._id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center shadow-2xs">
                          👨‍⚕️
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                          <span className="text-[11px] text-teal-700 font-semibold block">{p.email}</span>
                          <span className="text-[10px] text-slate-400">License: State Pharmacy Council #REG-2024-MH</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        Clinical Verifier
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Reviewed</span>
                        <span className="text-sm font-black text-slate-900">{p.medicinesReviewedCount || 24}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-bold block">Approved</span>
                        <span className="text-sm font-black text-emerald-800">{p.approvedCount || 22}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                        <span className="text-[10px] text-rose-700 font-bold block">Rejected</span>
                        <span className="text-sm font-black text-rose-800">{p.rejectedCount || 2}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      Authorised to perform batch authenticity check, CPCB disposal quarantine, and prescription audit.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: MEDICINES ("Medicine Overview")                        */}
        {/* ============================================================ */}
        {activeTab === 'medicines' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <div>
                <h3 className="text-base font-bold text-slate-900">Medicine Overview</h3>
                <p className="text-xs text-slate-500">Monitor all submissions and complete medicine journeys</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                {['all', 'Pending', 'Available', 'Requested', 'Expiring', 'Completed'].map((filter) => {
                  const isActive = medicineFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setMedicineFilter(filter)}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by brand name, generic name, or batch number..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
              />
            </div>

            {/* Medicines Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Medicine</th>
                      <th className="py-3.5 px-4">Batch / Category</th>
                      <th className="py-3.5 px-4 text-center">Remaining Units</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedicines.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 italic">
                          No medicines match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMedicines.map((m) => {
                        const exp = new Date(m.expiryDate);
                        const isExpired = exp <= now;
                        const isExpSoon = exp > now && exp <= ninetyDaysFromNow;

                        return (
                          <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{m.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {m.genericName || 'Standard Formulation'} • {m.strength || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-700 block">{m.batchNumber || 'BATCH-UNK'}</span>
                              <span className="text-[10px] text-slate-400">{m.category || 'General'}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-black text-slate-900">
                              {m.quantity}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold block ${isExpired ? 'text-rose-600 font-bold' : isExpSoon ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                                {exp.toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isExpired ? 'Expired' : isExpSoon ? 'Expiring soon' : 'Safe shelf-life'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                m.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                m.status === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                                m.status === 'REQUESTED' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                                'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedJourneyMedId(m._id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Journey</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: REQUESTS ("Medicine Requests")                         */}
        {/* ============================================================ */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <div>
                <h3 className="text-base font-bold text-slate-900">Medicine Requests</h3>
                <p className="text-xs text-slate-500">Monitor recipient requests and dispatch statuses</p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                {['all', 'Pending', 'Approved', 'Dispensed', 'Completed'].map((status) => {
                  const isActive = requestFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setRequestFilter(status)}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Medicine</th>
                      <th className="py-3.5 px-4">Recipient</th>
                      <th className="py-3.5 px-4 text-center">Requested Qty</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Oversight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 italic">
                          No requests match the selected status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{r.medicineId?.name || 'Standard Medicine'}</span>
                            <span className="text-[10px] text-slate-400">Batch: {r.medicineId?.batchNumber || 'BATCH-001'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{r.userId?.name || 'Verified Recipient'}</span>
                            <span className="text-[10px] text-slate-400">{r.userId?.email}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">
                            {r.quantityRequested || 1} units
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Completed' || r.status === 'Dispensed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              r.status === 'Approved' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                              r.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {r.medicineId?._id && (
                              <button
                                onClick={() => setSelectedJourneyMedId(r.medicineId._id)}
                                className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>Journey</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ACTIVITY ("Platform Activity" & Audit Trail)           */}
        {/* ============================================================ */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform Activity Overview</h3>
                <p className="text-xs text-slate-500">Summary counts of transactions across the network</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Medicines Flow */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">💊 Medicines</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Submitted:</span>
                      <strong className="text-slate-900">{totalMedsCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approved:</span>
                      <strong className="text-emerald-700">{metrics.approvedMedicines || 22}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rejected / Quarantined:</span>
                      <strong className="text-rose-700">{metrics.rejectedMedicines || 2}</strong>
                    </div>
                  </div>
                </div>

                {/* Requests Flow */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">📋 Patient Requests</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created:</span>
                      <strong className="text-slate-900">{requestsList.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approved by Pharmacist:</span>
                      <strong className="text-sky-700">{requestsList.filter((r) => r.status === 'Approved').length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Completed & Dispensed:</span>
                      <strong className="text-emerald-700">{completedCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Inventory Flow */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">📦 Inventory Units</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available:</span>
                      <strong className="text-emerald-700">{availableStockCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dispensed:</span>
                      <strong className="text-slate-900">{inventory.dispensedUnits || completedCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expired:</span>
                      <strong className="text-rose-700">{inventory.expired || expiredMeds.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT TRAIL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Trail</h3>
                  <p className="text-xs text-slate-500">Detailed chronological audit logs of all actions taken</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {['all', 'user', 'pharmacist', 'system'].map((role) => {
                    const isActive = auditFilter === role;
                    return (
                      <button
                        key={role}
                        onClick={() => setAuditFilter(role)}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {filteredAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No audit records match the filter.</p>
                ) : (
                  filteredAuditLogs.map((log, idx) => {
                    const time = new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const date = new Date(log.timestamp).toLocaleDateString();

                    return (
                      <div key={log._id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 text-xs">
                        <div className="text-right min-w-[70px] pt-0.5">
                          <span className="font-bold text-slate-900 block">{time}</span>
                          <span className="text-[10px] text-slate-400">{date}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900">{log.actor}</strong>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              log.actorRole === 'pharmacist' ? 'bg-amber-100 text-amber-900' :
                              log.actorRole === 'admin' ? 'bg-purple-100 text-purple-900' :
                              log.actorRole === 'system' ? 'bg-slate-200 text-slate-900' :
                              'bg-emerald-100 text-emerald-900'
                            }`}>
                              {log.actorRole}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{log.details || log.action}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ALERTS ("Attention Center")                           */}
        {/* ============================================================ */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attention Center</h3>
                <p className="text-xs text-slate-500">Actionable priority alerts for medicines and safety quarantine</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {['all', 'urgent', 'needs-review', 'upcoming'].map((f) => {
                  const isActive = alertFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setAlertFilter(f)}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f === 'all' ? 'All Alerts' : f === 'urgent' ? '🔴 Urgent' : f === 'needs-review' ? '🟠 Needs Review' : '🟡 Upcoming'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {/* 1. URGENT: Expired medicines */}
              {(alertFilter === 'all' || alertFilter === 'urgent') && expiredMeds.map((m) => (
                <div key={m._id} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-black text-[10px]">
                        🔴 URGENT: EXPIRED
                      </span>
                      <strong className="text-slate-900">{m.name} ({m.strength})</strong>
                    </div>
                    <p className="text-slate-500 mt-1">
                      Batch: {m.batchNumber} • Expired on {new Date(m.expiryDate).toLocaleDateString()} • Immediate CPCB high-temp disposal required
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJourneyMedId(m._id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 font-bold hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                  >
                    Review →
                  </button>
                </div>
              ))}

              {/* 2. NEEDS REVIEW: Pending submissions */}
              {(alertFilter === 'all' || alertFilter === 'needs-review') && medicinesList.filter((m) => m.status === 'PENDING').map((m) => (
                <div key={m._id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px]">
                        🟠 NEEDS REVIEW
                      </span>
                      <strong className="text-slate-900">{m.name} ({m.quantity} units)</strong>
                    </div>
                    <p className="text-slate-500 mt-1">
                      Batch: {m.batchNumber} • Awaiting pharmacist inspection and laboratory verification
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJourneyMedId(m._id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                  >
                    Review →
                  </button>
                </div>
              ))}

              {/* 3. UPCOMING: Expiring within 90 days */}
              {(alertFilter === 'all' || alertFilter === 'upcoming') && expiringSoonMeds.map((m) => {
                const daysRemaining = Math.ceil((new Date(m.expiryDate) - now) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m._id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                          🟡 UPCOMING EXPIRY
                        </span>
                        <strong className="text-slate-900">{m.name} ({m.strength})</strong>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Batch: {m.batchNumber} • {daysRemaining} days remaining ({m.quantity} units) • Expedite patient dispatch
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedJourneyMedId(m._id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                    >
                      Review →
                    </button>
                  </div>
                );
              })}

              {expiredMeds.length === 0 && pendingMedsCount === 0 && expiringSoonMeds.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-soft space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">🟢 All clear</h4>
                  <p className="text-xs text-slate-500">No urgent actions right now. All inventory is safely within shelf-life limits.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-500">{selectedUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Donations Submitted</span>
                <span className="text-base font-black text-slate-900">{selectedUser.donationCount || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Requests Made</span>
                <span className="text-base font-black text-slate-900">{selectedUser.requestCount || 0}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              <p><strong>Role:</strong> Community Citizen ({selectedUser.role})</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={selectedUser.isActive !== false ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {selectedUser.isActive !== false ? 'Active Member' : 'Account Suspended'}
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handleToggleUserStatus(selectedUser._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  selectedUser.isActive !== false
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {selectedUser.isActive !== false ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDICINE JOURNEY MODAL */}
      {selectedJourneyMedId && (
        <MedicineJourneyModal
          medicineId={selectedJourneyMedId}
          isOpen={!!selectedJourneyMedId}
          onClose={() => setSelectedJourneyMedId(null)}
        />
      )}
    </div>
  );
};

export default AdminCommandCenter;
