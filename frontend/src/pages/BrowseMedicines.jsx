import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Pill, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';
import MedicineModal from '../components/MedicineModal';

const CATEGORIES = [
  'All',
  'Oncology',
  'Critical Care',
  'Cardiology',
  'Diabetes Care',
  'Antibiotics',
  'Chronic Care',
  'Pain Relief',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'General Health',
];

const BrowseMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [prescriptionFilter, setPrescriptionFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected for modal
  const [activeMedicine, setActiveMedicine] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (prescriptionFilter !== 'all') params.prescription = prescriptionFilter;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sort = sortBy;

      const res = await api.getApprovedMedicines(params);
      if (res.success) {
        setMedicines(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load medicines catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, prescriptionFilter, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPrescriptionFilter('all');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="w-full flex-1 bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Pharmacist Audited & Certified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Browse Verified Medicines
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access surplus medicines at heavily subsidized rates through authorized healthcare redistribution centers.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Showing <strong className="text-slate-900 font-bold">{medicines.length}</strong> verified items</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-soft mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by medicine name or generic salt (e.g. Amoxicillin, Metformin)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Prescription Requirement */}
          <div className="md:col-span-3">
            <select
              value={prescriptionFilter}
              onChange={(e) => setPrescriptionFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
            >
              <option value="all">All Requirements (OTC + Rx)</option>
              <option value="false">OTC / No Prescription</option>
              <option value="true">Prescription (Rx) Required</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="md:col-span-2">
            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="expiry">Expiry: Earliest First</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
          <span className="text-slate-500 font-bold flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
          {(searchTerm || selectedCategory !== 'All' || prescriptionFilter !== 'all' || maxPrice) && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-1 ml-auto text-xs font-bold transition-colors flex-shrink-0"
              title="Clear all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Catalog Grid / States */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading verified inventory...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Error Loading Catalog</h3>
          <p className="text-xs text-rose-800 mt-1">{error}</p>
          <button
            onClick={fetchMedicines}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : medicines.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Pill className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Approved Medicines Found</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            No verified listings match your active filters. Try expanding your search terms or clearing filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine._id}
              medicine={medicine}
              onSelect={(med) => setActiveMedicine(med)}
            />
          ))}
        </div>
      )}

      {/* Medicine Modal */}
      {activeMedicine && (
        <MedicineModal
          medicine={activeMedicine}
          onClose={() => setActiveMedicine(null)}
          onRequestSuccess={() => {
            fetchMedicines();
          }}
        />
      )}
      </div>
    </div>
  );
};

export default BrowseMedicines;
