import React from 'react';
import { SafeSite, Village } from '../types';
import { CheckCircle2, Users, ArrowRight, ShieldCheck, Droplet, Truck, HeartPulse, Mountain } from 'lucide-react';

interface SafeSitesViewProps {
  safeSites: SafeSite[];
  villages: Village[];
  onSelectSite: (site: SafeSite) => void;
  onSelectVillageForPlanning: (village: Village, site: SafeSite) => void;
}

export const SafeSitesView: React.FC<SafeSitesViewProps> = ({
  safeSites,
  villages,
  onSelectSite,
  onSelectVillageForPlanning,
}) => {
  const totalAvailableCapacity = safeSites.reduce(
    (sum, s) => sum + (s.maxCapacity - s.currentPopulation),
    0
  );

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Safe Relocation Sanctuaries & Carrying Capacity</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Identify certified high-elevation highland destinations with verified carrying capacity, potable water, sanitation, and transport connectivity.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          Total Available Regional Highland Capacity: {totalAvailableCapacity.toLocaleString()} persons
        </div>
      </div>

      {/* Carrying Capacity Formula Explainer Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Carrying Capacity Operational Principle</div>
            <div className="text-slate-500 mt-0.5">
              Available Capacity = Maximum Certified Shelter Capacity − Current Resident Inhabitants
            </div>
          </div>
        </div>
        <div className="text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md font-mono text-[11px]">
          Rule: If Village Evacuation Volume &gt; Available Capacity → Hard Capacity Deficit
        </div>
      </div>

      {/* Grid of Safe Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {safeSites.map((site) => {
          const availableCap = site.maxCapacity - site.currentPopulation;
          // Find villages this site can accommodate
          const compatibleVillages = villages.filter(
            (v) => v.relocationRequired && availableCap >= (v.carryingCapacity?.populationRequiringEvacuation || v.population)
          );

          return (
            <div
              key={site.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4 hover:border-emerald-300 transition-all cursor-pointer"
              onClick={() => onSelectSite(site)}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Highland Sanctuary • +{site.elevationM}m MSL
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{site.name}</h3>
                    <p className="text-xs text-slate-500">{site.locationName} • Taluk: {site.taluk}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      Score: {site.suitabilityScore}/100
                    </span>
                  </div>
                </div>

                {/* Capacity Meter */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Available Capacity</span>
                    <span className="font-bold text-emerald-700 text-sm">{availableCap.toLocaleString()} persons</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((site.currentPopulation / site.maxCapacity) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Current: {site.currentPopulation.toLocaleString()}</span>
                    <span>Max Sustainable: {site.maxCapacity.toLocaleString()}</span>
                  </div>
                </div>

                {/* Infrastructure Tags */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Road: <strong>{site.roadAccess}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Water: <strong>{site.drinkingWaterLpd.toLocaleString()} L/d</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                    <span>Health: <strong>{site.medicalStaffPresent ? 'Medical Staff' : 'PHC Linked'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-slate-400" />
                    <span>Elevation: <strong>+{site.elevationM}m MSL</strong></span>
                  </div>
                </div>

                {/* Compatible Villages */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">
                    Accommodates High-Risk Habitations:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {compatibleVillages.length > 0 ? (
                      compatibleVillages.map((cv) => (
                        <span
                          key={cv.id}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                        >
                          {cv.name} ({cv.population.toLocaleString()} pop)
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">
                        Available capacity insufficient for remaining critical habitations
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSite(site);
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  View Sanctuary Infrastructure Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
