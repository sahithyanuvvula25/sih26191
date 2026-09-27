import React, { useState } from 'react';
import { SafeSite, Village } from '../types';
import {
  Scale,
  Users,
  Droplets,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Bus,
  Zap,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface CarryingCapacityViewProps {
  safeSites: SafeSite[];
  villages: Village[];
  onSelectSafeSite?: (site: SafeSite) => void;
  onNavigateToPlanning?: () => void;
}

export const CarryingCapacityView: React.FC<CarryingCapacityViewProps> = ({
  safeSites,
  villages,
  onSelectSafeSite,
  onNavigateToPlanning,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(safeSites[0]?.id || '');

  // Aggregate metrics
  const totalSanctuaryCapacity = safeSites.reduce((sum, s) => sum + s.maxCapacity, 0);
  const currentSanctuaryOccupancy = safeSites.reduce((sum, s) => sum + s.currentPopulation, 0);
  const totalAvailableCapacity = safeSites.reduce((sum, s) => sum + s.availableCapacity, 0);

  // Basin evacuation requirements
  const totalEvacReq = villages.reduce(
    (sum, v) => sum + v.carryingCapacity.populationRequiringEvacuation,
    0
  );
  const totalLocalDeficit = villages.reduce(
    (sum, v) => sum + v.carryingCapacity.capacityDeficit,
    0
  );

  const selectedSite = safeSites.find((s) => s.id === selectedSiteId) || safeSites[0];

  // Capacity utilization percentage
  const siteOccupancyPct = Math.round(
    (selectedSite.currentPopulation / selectedSite.maxCapacity) * 100
  );

  // Sphere standard benchmarks (15L potable water/person/day, 1 toilet per 20 persons)
  const sphereWaterNeededForMax = selectedSite.maxCapacity * 15;
  const sphereToiletsNeededForMax = Math.ceil(selectedSite.maxCapacity / 20);

  const waterAdequacy = selectedSite.drinkingWaterLpd >= sphereWaterNeededForMax;
  const sanitationAdequacy = selectedSite.sanitationToilets >= sphereToiletsNeededForMax;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Relocation Sanctuary Carrying Capacity & Infrastructure Audit
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              SPHERE Standards & Disaster Relief Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance assessment of designated highland evacuation shelters, potable water lifelines, sanitation units, and medical logistical capacity.
          </p>
        </div>

        {onNavigateToPlanning && (
          <button
            onClick={onNavigateToPlanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <span>Directives & Matching</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sanctuary Capacity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Certified Capacity
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {totalSanctuaryCapacity.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">certified berths</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across 5 designated highland facilities
          </div>
        </div>

        {/* Card 2: Current Occupancy */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Occupancy
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {currentSanctuaryOccupancy.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {Math.round((currentSanctuaryOccupancy / totalSanctuaryCapacity) * 100)}% utilized
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Pre-monsoon staged evacuees
          </div>
        </div>

        {/* Card 3: Spare Available Capacity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Spare Capacity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">
              {totalAvailableCapacity.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-800 font-medium">free slots</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Ready for immediate intake
          </div>
        </div>

        {/* Card 4: Basin Evacuation Requirement */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Basin Net Deficit
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600">
              -{totalLocalDeficit.toLocaleString()}
            </span>
            <span className="text-xs text-red-700 font-semibold">persons</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Local polder shelter gap
          </div>
        </div>
      </div>

      {/* Main Grid: Comparison Table/Cards on Left, Detailed Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sanctuary List with Progress Meters */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Designated Evacuation Sanctuaries & Carrying Capacity Meters
              </h2>
              <p className="text-xs text-slate-500">
                Click any sanctuary to audit its lifelines, utilities, and potable water headroom.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {safeSites.length} Facilities
            </span>
          </div>

          <div className="space-y-3">
            {safeSites.map((site) => {
              const isSelected = site.id === selectedSite.id;
              const usagePct = Math.round((site.currentPopulation / site.maxCapacity) * 100);

              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{site.name}</strong>
                        {site.isOfficialKsdmaCamp && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                            OFFICIAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{site.locationName}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">+{site.elevationM}m MSL Elevation</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">
                          {site.availableCapacity.toLocaleString()} spare
                        </div>
                        <div className="text-[10px] text-slate-500">
                          of {site.maxCapacity.toLocaleString()} max
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        Score: {site.suitabilityScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Carrying Capacity */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Occupancy: {site.currentPopulation} residents ({usagePct}%)</span>
                      <span className="font-medium text-emerald-700">
                        {site.availableCapacity} remaining
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePct > 85
                            ? 'bg-red-500'
                            : usagePct > 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usagePct, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Infrastructure & SPHERE Audit for Selected Site */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Infrastructure & Lifeline Audit
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  Suitability: {selectedSite.suitabilityScore}/100
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">{selectedSite.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedSite.locationName} • {selectedSite.taluk}</p>
            </div>

            {/* Capacity Breakdown */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Carrying Capacity Status:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Maximum</span>
                  <strong className="text-slate-900 font-bold">{selectedSite.maxCapacity}</strong>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Current</span>
                  <strong className="text-amber-700 font-bold">{selectedSite.currentPopulation}</strong>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Available</span>
                  <strong className="text-emerald-700 font-bold">{selectedSite.availableCapacity}</strong>
                </div>
              </div>
            </div>

            {/* SPHERE Lifeline Standards Evaluation */}
            <div className="space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-800 block">
                SPHERE Humanitarian Standards Audit:
              </span>

              {/* Potable Water Supply */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Drinking Water Provision:</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      waterAdequacy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {waterAdequacy ? 'ADEQUATE' : 'DEFICIT'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                  <span>Current Supply: {selectedSite.drinkingWaterLpd.toLocaleString()} L/day</span>
                  <span>Required (15L/head): {sphereWaterNeededForMax.toLocaleString()} L/day</span>
                </div>
              </div>

              {/* Sanitation & Bio-Toilets */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Building className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sanitation & Bio-Toilets:</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      sanitationAdequacy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {sanitationAdequacy ? 'COMPLIANT' : 'DEFICIT'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                  <span>Installed Units: {selectedSite.sanitationToilets} bio-toilets</span>
                  <span>Required (1:20): {sphereToiletsNeededForMax} units</span>
                </div>
              </div>

              {/* Medical & Logistics */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Medical Station</span>
                  <strong className="text-slate-900 font-bold">
                    {selectedSite.medicalStaffPresent ? 'Medical Staff Deployed' : 'On-Call Nurse Only'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Road & Boat Ingress</span>
                  <strong className="text-slate-900 font-bold">
                    Road: {selectedSite.roadAccess} | Boat: {selectedSite.boatAccess ? 'Yes' : 'No'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            {onSelectSafeSite && (
              <button
                onClick={() => onSelectSafeSite(selectedSite)}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>View Full Facility Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
