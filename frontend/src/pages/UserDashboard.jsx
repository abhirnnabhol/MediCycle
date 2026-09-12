import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Leaf,
  Coins
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MedicineStatusTracker, RequestStatusTracker } from '../components/StatusTracker';

const UserDashboard = () => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions', 'requests', 'impact'

  const [submissions, setSubmissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter within submissions
  const [submissionFilter, setSubmissionFilter] = useState('ALL');

  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [subRes, reqRes] = await Promise.all([
        api.getMySubmissions().catch(() => ({ data: [] })),
        api.getMyRequests().catch(() => ({ data: [] })),
      ]);

      setSubmissions(subRes.data || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full flex-1 bg-slate-50 py-20 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-card">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign In to Access Dashboard</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Track your active donations, pharmacist inspection status, and medicine requests.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => demoLogin('user')}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs"
            >
              Sign in as User (Community Member)
            </button>
            <button
              onClick={() => demoLogin('admin')}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-xs"
            >
              Sign in as Pharmacist (Dr. Anita)
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Calculate personal impact metrics
  const totalSubmitted = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const rejectedCount = submissions.filter((s) => s.status === 'REJECTED').length;

  let personalWastagePrevented = 0;
  let personalSavings = 0;
  submissions
    .filter((s) => s.status === 'APPROVED')
    .forEach((s) => {
      personalWastagePrevented += s.quantity;
      personalSavings += Math.max(0, s.originalPrice - s.affordablePrice) * s.quantity;
    });

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'ALL') return true;
    return s.status === submissionFilter;
  });

  return (
    <div className="w-full flex-1 bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Personal Health Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your submitted surplus medicines, verification timeline, and medicine requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Link
            to="/submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Medicine</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Submitted</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalSubmitted}</div>
          <span className="text-[11px] text-slate-500 font-medium">Donations registered</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Verified & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{approvedCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Eligible for redistribution</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Waste Prevented</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{personalWastagePrevented}</div>
          <span className="text-[11px] text-slate-500 font-medium">Tablets/units diverted</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Subsidized Savings</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">₹{personalSavings.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">Value saved for recipients</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 mb-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'submissions'
              ? 'text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Submissions ({submissions.length})
          {activeTab === 'submissions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'requests'
              ? 'text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Requests ({requests.length})
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'impact'
              ? 'text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Environmental & Health Impact
          {activeTab === 'impact' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      {/* TAB 1: Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Sub-filter pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold">Filter:</span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSubmissionFilter(st)}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  submissionFilter === st
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Submissions' : st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No submissions found</h3>
              <p className="text-xs text-slate-500 mt-1">
                You haven't submitted any medicines in this status filter yet.
              </p>
              <Link
                to="/submit"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Submit Medicine
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubmissions.map((medicine) => (
                <div
                  key={medicine._id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'}
                      alt={medicine.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-base font-black text-slate-900">{medicine.name}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {medicine.strength}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic font-medium">{medicine.genericName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
                        <span>Batch: <strong className="text-slate-900">{medicine.batchNumber}</strong></span>
                        <span>Quantity: <strong className="text-slate-900">{medicine.quantity} units</strong></span>
                        <span>
                          Expiry: <strong className="text-slate-900">
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tracker */}
                  <div className="w-full md:w-80 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <MedicineStatusTracker
                      status={medicine.status}
                      rejectionReason={medicine.rejectionReason}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No active medicine requests</h3>
              <p className="text-xs text-slate-500 mt-1">
                You haven't requested any medicines yet. Explore verified listings to request affordable medicine.
              </p>
              <Link
                to="/browse"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                Browse Medicines
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {req.medicineId?.name || 'Requested Medicine'}
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {req.medicineId?.strength}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Requested Qty: <strong className="text-slate-900">{req.quantity} units</strong> • Subsidized Total: <strong className="text-emerald-700 font-bold">₹{(req.medicineId?.affordablePrice || 0) * req.quantity}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pickup Center: {req.deliveryAddress} • Date: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <RequestStatusTracker status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Impact Analysis */}
      {activeTab === 'impact' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-slate-900">Your Healthcare & Sustainability Contribution</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              By contributing unexpired medicines rather than disposing of them, you prevent soil pharmaceutical contamination and enable affordable healthcare for vulnerable patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Landfill Waste Diverted</span>
              <div className="text-3xl font-black text-emerald-700 mt-1">
                {personalWastagePrevented} Tablets
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Prevented active chemical compounds from leaching into local waterways.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Economic Value Created</span>
              <div className="text-3xl font-black text-amber-700 mt-1">
                ₹{personalSavings.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Calculated retail price difference saved for patients through redistribution.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Verification Rate</span>
              <div className="text-3xl font-black text-sky-700 mt-1">
                {totalSubmitted > 0 ? Math.round((approvedCount / totalSubmitted) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Percentage of your submissions passing pharmaceutical quality standards.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserDashboard;
