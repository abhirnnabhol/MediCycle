import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Award, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

const MediPointsHistoryModal = ({ isOpen, onClose, onRefresh }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getMyMediPoints();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load points history.');
        }
      } catch (err) {
        setError(err.message || 'Error fetching MediPoints history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  const balance = data?.mediPoints ?? 0;
  const transactions = data?.transactions || [];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medipoints-modal-title"
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 id="medipoints-modal-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MediPoints Passbook
                <span className="text-[11px] font-medium uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-teal-100">
                  Prototype Rewards
                </span>
              </h2>
              <p className="text-xs text-teal-100">Verified Donor Loyalty & Access Fee Reductions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Tier Summary Card */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Balance</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-teal-700 tracking-tight">{balance.toLocaleString()}</span>
                <span className="text-sm font-semibold text-emerald-600">MediPoints</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
              <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Redemption Tiers:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className={`p-1.5 rounded-md ${balance >= 1000 ? 'bg-teal-50 border border-teal-200 text-teal-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  1,000 = ₹5
                </div>
                <div className={`p-1.5 rounded-md ${balance >= 2000 ? 'bg-teal-50 border border-teal-200 text-teal-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  2,000 = ₹10
                </div>
                <div className={`p-1.5 rounded-md ${balance >= 5000 ? 'bg-teal-50 border border-teal-200 text-teal-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  5,000 = ₹25
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Guarantee:</strong> Points apply <em>strictly</em> as access fee discounts at checkout. Earning or redeeming points never bypasses clinical review or pharmacist approval.
            </span>
          </div>
        </div>

        {/* Scrollable Transaction Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[220px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Transaction Activity
          </h3>

          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading passbook history...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-4">
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No MediPoints transactions yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Donate medicine batches to receive +100 MediPoints as soon as our licensed pharmacist verifies and approves the listing.
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isEarning = tx.type === 'EARNING';
              return (
                <div
                  key={tx._id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-teal-200 bg-white hover:bg-slate-50/50 transition-all text-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isEarning ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isEarning ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm">{tx.reason}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>Balance after: {tx.balanceAfter?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm sm:text-base ${
                        isEarning ? 'text-emerald-600' : 'text-slate-700'
                      }`}
                    >
                      {isEarning ? `+${tx.points}` : `-${tx.points}`}
                    </span>
                    <div className="text-[10px] uppercase font-bold text-slate-400">PTS</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Earn +100 pts per approved donation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Close Passbook
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MediPointsHistoryModal;
