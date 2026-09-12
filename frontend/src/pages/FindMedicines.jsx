import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Pill, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  MapPin,
  FileText,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';
import MedicineModal from '../components/MedicineModal';
import GoogleMapsPickupLocator from '../components/GoogleMapsPickupLocator';

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

const LOCATIONS = [
  'All Locations',
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Jayanagar, Bengaluru',
  'Whitefield, Bengaluru',
  'HSR Layout, Bengaluru',
  'Malleshwaram, Bengaluru',
];

const FindMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // View Mode: 'catalog' | 'hubs'
  const [viewMode, setViewMode] = useState('catalog');

  // Modal state
  const [activeMedicine, setActiveMedicine] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (prescriptionFilter !== 'all') params.prescription = prescriptionFilter;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy) params.sort = sortBy;

      const res = await api.getApprovedMedicines(params);
      if (res.success) {
        let list = res.data;
        if (selectedLocation !== 'All Locations') {
          list = list.filter((m) => {
            const loc = m.donorInfo?.location || m.location || '';
            return loc.toLowerCase().includes(selectedLocation.toLowerCase().split(',')[0]);
          });
        }
        setMedicines(list);
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
  }, [searchTerm, selectedCategory, statusFilter, prescriptionFilter, selectedLocation, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStatusFilter('all');
    setPrescriptionFilter('all');
    setSelectedLocation('All Locations');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Pharmacist Audited & Verified</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Find the Medicine You Need
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Search by commercial name, active generic salt, or therapy category. All displayed items are currently verified and available for subsidized redistribution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('catalog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'catalog'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Medicine Catalog
              </button>
              <button
                type="button"
                onClick={() => setViewMode('hubs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'hubs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>📍 Clinical Pickup Hubs (Google Maps)</span>
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span><strong className="text-slate-900 font-bold">{medicines.length}</strong> available</span>
            </div>
          </div>
        </div>

        {viewMode === 'hubs' ? (
          <div className="mb-12">
            <GoogleMapsPickupLocator />
          </div>
        ) : (
          <>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search medicine or generic salt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
              />
            </div>

            {/* Availability / Status Filter */}
            <div className="md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="all">All (Available & Dispensed)</option>
                <option value="APPROVED">Available to Request</option>
                <option value="SOLD">Dispensed to Patient</option>
              </select>
            </div>

            {/* Prescription Requirement */}
            <div className="md:col-span-2">
              <select
                value={prescriptionFilter}
                onChange={(e) => setPrescriptionFilter(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="all">Rx: All Types</option>
                <option value="false">No Rx (OTC Only)</option>
                <option value="true">Rx Required</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                <option value="newest">Sort: Newly Listed</option>
                <option value="expiry">Sort: Longest Expiry</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Categories:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(searchTerm || selectedCategory !== 'All' || prescriptionFilter !== 'all' || selectedLocation !== 'All Locations' || maxPrice || sortBy !== 'newest') && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0 ml-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-600">Updating available medicines inventory...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-900">{error}</h3>
            <button
              onClick={fetchMedicines}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center max-w-lg mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No medicines found</h3>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Try searching by generic name, active salt (e.g. <em>Imatinib</em>, <em>Metformin</em>, <em>Telmisartan</em>), or therapeutic category.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 mb-6">
              Expired medicines and unverified batches are automatically excluded from public listings for patient safety.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine._id}
                medicine={medicine}
                onSelect={(med) => setActiveMedicine(med)}
                onRequest={(med) => setActiveMedicine(med)}
              />
            ))}
          </div>
        )}
        </>
        )}

        {/* Medicine Request Modal */}
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

export default FindMedicines;
