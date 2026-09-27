import React from 'react';
import { SafeSite, Village } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Droplet, HeartPulse, Truck, Mountain } from 'lucide-react';

interface SiteDetailViewProps {
  site: SafeSite;
  villages: Village[];
  onBack: () => void;
  onOpenRelocationPlan: (village: Village, site: SafeSite) => void;
}

export const SiteDetailView: React.FC<SiteDetailViewProps> = ({
  site,
  villages,
  onBack,
  onOpenRelocationPlan,
}) => {
  const availableCap = site.maxCapacity - site.currentPopulation;

  // Filter compatible villages (carrying capacity >= evacuation demand or village population)
  const compatibleVillages = villages.filter((v) => {
    const demand = v.carryingCapacity?.populationRequiringEvacuation || v.population;
    return availableCap >= demand;
  });
  const incompatibleVillages = villages.filter((v) => {
    const demand = v.carryingCapacity?.populationRequiringEvacuation || v.population;
    return availableCap < demand;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-[#1565C0] hover:text-[#0D47A1] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Safe Relocation Sanctuaries
        </button>
      </div>

      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{site.name}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Highland Certified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {site.locationName} • Taluk: {site.taluk} • Lat: {site.lat.toFixed(4)}°N, Lng: {site.lng.toFixed(4)}°E
          </p>
        </div>

        <div className="text-left sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-emerald-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Suitability Rating
          </div>
          <div className="flex items-baseline gap-1 sm:justify-end">
            <span className="text-3xl font-extrabold text-emerald-700">{site.suitabilityScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500">Infrastructure & hazard clearance score</div>
        </div>
      </div>

      {/* 2-Column: Capacity Breakdown & Infrastructure & Hazard Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capacity Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Carrying Capacity Ledger
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Maximum Sustainable Capacity:</span>
              <strong className="text-slate-900 text-sm">{site.maxCapacity.toLocaleString()} persons</strong>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Current Resident Inhabitants:</span>
              <strong className="text-slate-700 text-sm">{site.currentPopulation.toLocaleString()} persons</strong>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold">Net Available Relocation Capacity:</span>
              <strong className="text-emerald-800 text-base font-black">{availableCap.toLocaleString()} persons</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Capacity is strictly audited under district disaster management norms. Any proposed habitation transfer exceeding {availableCap.toLocaleString()} evacuees triggers an automatic deficit alert.
          </p>
        </div>

        {/* Infrastructure & Hazard Assessment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Infrastructure & Hazard Assessment
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-medium">Road Accessibility</div>
              <div className="font-bold text-slate-900 mt-0.5">{site.roadAccess} Road</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-medium">Potable Water Supply</div>
              <div className="font-bold text-slate-900 mt-0.5">{site.drinkingWaterLpd.toLocaleString()} L/day</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-medium">Healthcare Readiness</div>
              <div className="font-bold text-slate-900 mt-0.5">{site.medicalStaffPresent ? 'Medical Staff on Site' : 'PHC Linkage'}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 font-medium">Ground Elevation</div>
              <div className="font-bold text-emerald-800 mt-0.5">+{site.elevationM} m MSL</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
              <div className="text-slate-500 font-medium">Shelter & Plot Preparedness</div>
              <div className="font-bold text-slate-900 mt-0.5">{site.shelterStatus} • {site.sanitationToilets} Bio-Toilets</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
            <strong>Highland Safety Audit:</strong> Zero river floodplain exposure, elevated +{site.elevationM}m MSL above 2018 deluge high-water marks, and certified outside flood red zones.
          </div>
        </div>
      </div>

      {/* Villages that can be accommodated */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Habitations That Can Be Accommodated (Capacity Eligible)
          </h3>
          <p className="text-xs text-slate-500">
            Habitations whose immediate evacuation demand does not exceed {availableCap.toLocaleString()} available seats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {compatibleVillages.map((v) => {
            const category = v.mlPrediction?.riskCategory || v.baselineRiskCategory || 'High';
            const demand = v.carryingCapacity?.populationRequiringEvacuation || Math.round(v.population * 0.5);
            return (
              <div
                key={v.id}
                className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{v.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {category} Risk
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Evacuees: <strong>{demand.toLocaleString()}</strong> • Buffer remaining: +{(availableCap - demand).toLocaleString()} seats
                  </div>
                </div>

                <button
                  onClick={() => onOpenRelocationPlan(v, site)}
                  className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer flex items-center gap-1"
                >
                  Plan Match <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {incompatibleVillages.length > 0 && (
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 block mb-1">
              Incompatible Habitations (Exceeds Single-Site Available Capacity):
            </span>
            <div className="flex flex-wrap gap-2">
              {incompatibleVillages.map((iv) => {
                const demand = iv.carryingCapacity?.populationRequiringEvacuation || iv.population;
                return (
                  <span
                    key={iv.id}
                    className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[11px]"
                  >
                    {iv.name} ({demand.toLocaleString()} evacuees vs {availableCap.toLocaleString()} cap) — Deficit
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
