import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ShieldCheck, 
  ExternalLink, 
  Building2,
  Lock,
  ThermometerSnowflake,
  CheckCircle2
} from 'lucide-react';
import { VERIFIED_CLINICAL_HUBS } from '../constants/appConstants';

const GoogleMapsPickupLocator = ({ selectedHubId = null, onSelectHub = null }) => {
  const [activeHub, setActiveHub] = useState(
    VERIFIED_CLINICAL_HUBS.find((h) => h.id === selectedHubId) || VERIFIED_CLINICAL_HUBS[0]
  );

  const handleSelect = (hub) => {
    setActiveHub(hub);
    if (onSelectHub) {
      onSelectHub(hub);
    }
  };

  // Google Maps Embed URL centered on current active hub
  const embedMapUrl = `https://maps.google.com/maps?q=${activeHub.coordinates.lat},${activeHub.coordinates.lng}&hl=en&z=15&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
      {/* Header with Privacy Guarantee */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Verified Clinical Collection & Pickup Hubs
              </h3>
              <p className="text-[11px] text-slate-300">
                Powered by Google Maps Platform • Controlled Healthcare Distribution
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Zero Donor Address Exposure
          </span>
        </div>

        {/* Privacy Notice Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-emerald-100 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Strict Privacy & Clinical Safety Policy:</strong> Donor residences are never published. All medicine drop-offs, pharmacist audits, and patient handovers take place strictly at approved clinical health centers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Hub Selector Cards */}
        <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-3 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Distribution Hub ({VERIFIED_CLINICAL_HUBS.length})
            </span>
            <span className="text-[10px] text-slate-400">Bengaluru Region</span>
          </div>

          {VERIFIED_CLINICAL_HUBS.map((hub) => {
            const isSelected = activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelect(hub)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-200'
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {hub.name}
                    </h4>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
                  {hub.address}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {hub.hours.split(':')[0]}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100/60 px-1.5 py-0.5 rounded">
                    {hub.type.split('&')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Google Maps Embed & Hub Details */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Embedded Google Map */}
          <div className="relative w-full h-64 sm:h-72 bg-slate-100 border-b border-slate-200">
            <iframe
              title={`Google Map showing ${activeHub.name}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={embedMapUrl}
              className="w-full h-full"
              loading="lazy"
              allowFullScreen
            />
            
            <a
              href={activeHub.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 hover:text-emerald-700 text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Active Hub Deep Details */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {activeHub.name}
                  </h4>
                  <span className="text-xs text-emerald-700 font-bold">
                    {activeHub.type}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {activeHub.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {activeHub.address}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 mb-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px]">{activeHub.hours}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px] font-mono">{activeHub.phone}</span>
                </div>
              </div>

              {/* Hub Clinical Capabilities */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Clinical & Storage Capabilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHub.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                    >
                      {cap.includes('Cold-Chain') ? (
                        <ThermometerSnowflake className="w-3 h-3 text-sky-600" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Supervised by: <strong className="text-slate-700">{activeHub.pharmacistInCharge}</strong></span>
              <span className="text-emerald-700 font-bold">Verified Cold-Chain Facility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsPickupLocator;
