import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Upload, 
  Info, 
  CheckCircle2, 
  Calendar, 
  Package, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  FileCheck,
  Award
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DoctorMedi } from '../components/CartoonCharacters';

const STORAGE_CONDITIONS = [
  'Room Temperature (15-25°C)',
  'Cool & Dry Place (< 20°C)',
  'Refrigerated (2-8°C)',
  'Protect from Direct Light',
];

const PACKAGE_CONDITIONS = [
  'Intact Blister Foil Strip (Unbroken)',
  'Unopened Factory Sealed Box',
  'Sealed Manufacturer Bottle',
  'Partially Opened / Torn Foil (Not Eligible)',
];

const CATEGORIES = [
  'Oncology',
  'Critical Care',
  'Chronic Care',
  'Antibiotics',
  'Pain Relief',
  'Cardiology',
  'Diabetes Care',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'General Health',
];

const SubmitMedicine = () => {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Wizard Step: 1, 2, 3, or 'success'
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    strength: '',
    category: 'Chronic Care',
    quantity: '',
    batchNumber: '',
    expiryDate: '',
    storageCondition: 'Room Temperature (15-25°C)',
    packageCondition: 'Intact Blister Foil Strip (Unbroken)',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    originalPrice: '',
    affordablePrice: '',
    prescriptionRequired: false,
    additionalNotes: '',
    confirmationCheck: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState(null);
  const [expiryError, setExpiryError] = useState(null);
  const [submittedMedicine, setSubmittedMedicine] = useState(null);

  // Expiry date validator
  const handleDateChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, expiryDate: val }));

    if (!val) {
      setExpiryError(null);
      setExpiryWarning(null);
      return;
    }

    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      setExpiryError('Error: This medicine has expired. Expired drugs cannot be accepted for redistribution.');
      setExpiryWarning(null);
    } else {
      setExpiryError(null);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      if (selectedDate < thirtyDays) {
        setExpiryWarning('Warning: Expiry date is within 30 days. Priority inspection will be required.');
      } else {
        setExpiryWarning(null);
      }
    }
  };

  // Demo autofill for rapid testing
  const handleLoadDemoSample = () => {
    const sampleDate = new Date();
    sampleDate.setMonth(sampleDate.getMonth() + 10);
    const isoDate = sampleDate.toISOString().split('T')[0];

    setFormData({
      name: 'Telmisartan Tablets',
      genericName: 'Telmisartan IP',
      strength: '40 mg',
      category: 'Cardiology',
      quantity: '28',
      batchNumber: 'TLM-7492-H',
      expiryDate: isoDate,
      storageCondition: 'Room Temperature (15-25°C)',
      packageCondition: 'Intact Blister Foil Strip (Unbroken)',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      originalPrice: '145',
      affordablePrice: '30',
      prescriptionRequired: true,
      additionalNotes: 'Remaining unspent strips after regimen adjustment. Stored in dry closed cabinet.',
      confirmationCheck: true,
    });
    setExpiryError(null);
    setExpiryWarning(null);
    addToast('Demo medicine details pre-filled!', 'info');
  };

  // Validation before going to next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.genericName.trim() || !formData.strength.trim() || !formData.quantity) {
        addToast('Please fill all medicine information fields before continuing.', 'error');
        return;
      }
      if (Number(formData.quantity) <= 0) {
        addToast('Quantity must be at least 1 unit.', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.batchNumber.trim() || !formData.expiryDate) {
        addToast('Batch number and expiry date are mandatory.', 'error');
        return;
      }
      if (expiryError) {
        addToast(expiryError, 'error');
        return;
      }
      if (formData.packageCondition.includes('Not Eligible')) {
        addToast('Damaged or opened medicine packaging is not eligible.', 'error');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please log in as a User to submit medicines.', 'error');
      return;
    }

    if (!formData.confirmationCheck) {
      addToast('Please check the confirmation box to confirm medicine authenticity.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitMedicine({
        ...formData,
        quantity: Number(formData.quantity),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 200,
        affordablePrice: formData.affordablePrice ? Number(formData.affordablePrice) : 40,
      });

      if (res.success) {
        setSubmittedMedicine(res.data);
        setCurrentStep('success');
        addToast('Medicine submitted successfully! Under Verification.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 bg-[#edf7f6] py-10 min-h-screen relative">
      <div 
        className="absolute inset-0 bg-medical-pattern opacity-[0.14] pointer-events-none z-0" 
        style={{ backgroundSize: '320px auto' }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header with Friendly Doctor Medi Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block shrink-0 bg-white p-2 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <DoctorMedi className="w-16 h-16" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Controlled Medicine Submission</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Submit Unused Medicine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Every submission enters the Pharmacy Verification Queue before potential redistribution.
            </p>
          </div>
        </div>

        {currentStep !== 'success' && (
          <button
            type="button"
            onClick={handleLoadDemoSample}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Autofill Demo Medicine</span>
          </button>
        )}
      </div>

      {/* Demo Sign In Callout if not logged in */}
      {!isAuthenticated && currentStep !== 'success' && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-900 font-medium">
              You must be logged in to submit medicines for pharmacist inspection. Sign in with 1 click:
            </p>
          </div>
          <button
            onClick={() => demoLogin('user')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs flex-shrink-0"
          >
            Sign in as User
          </button>
        </div>
      )}

      {/* MULTI-STEP PROGRESS INDICATOR */}
      {currentStep !== 'success' && (
        <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-100 rounded-full" />
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-300 ${
                currentStep === 1 ? 'w-1/6' : currentStep === 2 ? 'w-1/2' : 'w-full'
              }`}
            />

            {/* Steps */}
            {[
              { num: 1, title: 'Medicine Info' },
              { num: 2, title: 'Batch & Safety' },
              { num: 3, title: 'Verification' },
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-bold ${
                      isCurrent || isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUCCESS SCREEN */}
      {currentStep === 'success' ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-card text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Submission Received
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
              Medicine Submitted for Verification
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your submission for <strong>{submittedMedicine?.name} ({submittedMedicine?.strength})</strong> has been logged in MongoDB and assigned to the Pharmacist Verification Queue.
            </p>
          </div>

          {/* Status Tracker Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending Verification
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch Number:</span>
              <span className="font-bold text-slate-800">{submittedMedicine?.batchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Packaging Integrity:</span>
              <span className="font-bold text-slate-800">{submittedMedicine?.packageCondition}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              Track in User Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmittedMedicine(null);
                setCurrentStep(1);
                setFormData({
                  name: '',
                  genericName: '',
                  strength: '',
                  category: 'Chronic Care',
                  quantity: '',
                  batchNumber: '',
                  expiryDate: '',
                  storageCondition: 'Room Temperature (15-25°C)',
                  packageCondition: 'Intact Blister Foil Strip (Unbroken)',
                  imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
                  originalPrice: '',
                  affordablePrice: '',
                  prescriptionRequired: false,
                  additionalNotes: '',
                  confirmationCheck: false,
                });
              }}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Submit Another Medicine
            </button>
          </div>
        </div>
      ) : (
        /* WIZARD FORM */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
          {/* STEP 1: Medicine Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Step 1 — Medicine Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter brand, chemical generic salt, and dosage strength.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commercial Medicine Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telmisartan 40mg, Augmentin 625"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Generic Active Salt Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telmisartan IP, Amoxicillin + Clavulanate"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Strength / Unit Dosage *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 mg, 10 mg, 650 mg"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Therapeutic Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Quantity (Unused units/tablets) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Next: Batch & Safety</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Medicine Details & Safety */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Step 2 — Batch & Safety Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify pharmaceutical traceability, expiration, and package integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Number (Printed on packaging) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BTH-9942-A"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 uppercase focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleDateChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Inline alerts */}
              {expiryError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{expiryError}</span>
                </div>
              )}
              {expiryWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{expiryWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Storage Condition Followed *
                  </label>
                  <select
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
                    required
                  >
                    {STORAGE_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Package Condition *
                  </label>
                  <select
                    value={formData.packageCondition}
                    onChange={(e) => setFormData({ ...formData, packageCondition: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none font-medium ${
                      formData.packageCondition.includes('Not Eligible')
                        ? 'border-rose-300 bg-rose-50 text-rose-900'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:bg-white'
                    }`}
                    required
                  >
                    {PACKAGE_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!!expiryError}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>Next: Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Verification & Submission */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Step 3 — Verification & Pricing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide sample image, pricing reference, and final safety declaration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine Package Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Retail Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Printed reference MRP on packaging</p>
                </div>

                {/* Non-Commercial Donation & MediPoints Reward Badge */}
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-teal-700" />
                        Donor Reward
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        +100 MediPoints
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800/90 mt-1 leading-relaxed">
                      Donations are strictly non-commercial (₹0 payout to donor). In exchange for verified contributions, you receive <strong>+100 MediPoints</strong> upon pharmacist audit.
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-600 font-semibold mt-1">
                    Redeemable for access fee discounts on future medicine requests.
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.prescriptionRequired}
                    onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold">
                    Schedule H/X Medication (Requires Doctor's Prescription for Redistribution)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Storage history, reason for surplus)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Unopened blister strip kept in cool dry drawer."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* PRIORITY 1: Smart Medicine Eligibility & Safety Engine Checklist */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Automated Pre-Review Eligibility Check
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Decision Support Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Expiry requirement satisfied
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px]">
                      {formData.expiryDate ? `${formData.expiryDate} (Valid)` : 'Pending Date'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Packaging condition confirmed
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px] truncate max-w-[180px]">
                      {formData.packageCondition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Batch number provided
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px]">
                      {formData.batchNumber || 'Required'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Storage information provided
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px]">
                      {formData.storageCondition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Required clinical identification fields
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px]">
                      {formData.name && formData.genericName ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>
                    Note: Automated eligibility does not approve medicines. The licensed pharmacist remains the final verification authority.
                  </span>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={formData.confirmationCheck}
                    onChange={(e) => setFormData({ ...formData, confirmationCheck: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <span>
                    I confirm that this medicine is genuine, unadulterated, has been stored according to label instructions, and has not been tampered with.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.confirmationCheck}
                  className="px-7 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{submitting ? 'Submitting to Pharmacy Queue...' : 'Submit Unused Medicine'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}
      </div>
    </div>
  );
};

export default SubmitMedicine;
