import React, { useState } from 'react';
import { Village, SafeSite, SiteSuitabilityResult } from '../types';
import { evaluateRelocationMatch, calculateDistanceKm } from '../utils/riskEngine';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Building,
  Send,
  Navigation,
  Anchor,
  Compass,
  ArrowRight,
  ExternalLink,
  Bus,
  LifeBuoy,
} from 'lucide-react';

interface RelocationPlanningViewProps {
  villages: Village[];
  safeSites: SafeSite[];
  initialVillageId?: string;
  initialSiteId?: string;
  onGenerateReport: (village: Village, site: SafeSite, result: SiteSuitabilityResult) => void;
  onNavigateToSiteSuitability?: (site: SafeSite) => void;
}

export const RelocationPlanningView: React.FC<RelocationPlanningViewProps> = ({
  villages,
  safeSites,
  initialVillageId,
  initialSiteId,
  onGenerateReport,
  onNavigateToSiteSuitability,
}) => {
  // Select critical or high risk villages by default
  const criticalVillages = villages.filter((v) => v.relocationRequired);
  const defaultVillage =
    villages.find((v) => v.id === initialVillageId) ||
    criticalVillages[0] ||
    villages[0];

  const defaultSite =
    safeSites.find((s) => s.id === initialSiteId) ||
    safeSites[0];

  const [selectedVillageId, setSelectedVillageId] = useState<string>(defaultVillage?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(defaultSite?.id || '');
  const [createdPlanMessage, setCreatedPlanMessage] = useState<string | null>(null);

  const selectedVillage = villages.find((v) => v.id === selectedVillageId) || villages[0];
  const selectedSite = safeSites.find((s) => s.id === selectedSiteId) || safeSites[0];

  if (!selectedVillage || !selectedSite) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No habitation or relocation site records available.
      </div>
    );
  }

  // Match evaluation for currently chosen pair
  const currentMatch = evaluateRelocationMatch(selectedVillage, selectedSite);
  const currentAvailableCap = selectedSite.maxCapacity - selectedSite.currentPopulation;
  const currentDistance = calculateDistanceKm(
    selectedVillage.lat,
    selectedVillage.lng,
    selectedSite.lat,
    selectedSite.lng
  );

  const requiredEvacuees =
    selectedVillage.carryingCapacity?.populationRequiringEvacuation ||
    Math.round(selectedVillage.population * 0.5);

  const riskCat = selectedVillage.mlPrediction?.riskCategory || selectedVillage.baselineRiskCategory || 'High';
  const mlProb = selectedVillage.mlPrediction?.predictedProbability
    ? Math.round(selectedVillage.mlPrediction.predictedProbability * 100)
    : selectedVillage.baselineRiskScore || 70;

  // Logistics requirements calculation
  const boatFlotillaCount = Math.ceil(requiredEvacuees / 60);
  const transitBusesCount = Math.ceil(requiredEvacuees / 40);

  const handleCreatePlan = () => {
    const directiveRef = `KSDMA-DIR-${selectedVillage.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedPlanMessage(
      `Directive ${directiveRef} dispatched: Relocation conduit for ${selectedVillage.name} (${requiredEvacuees.toLocaleString()} evacuees) to ${selectedSite.name} registered with District Magistrate / DDMA.`
    );
    setTimeout(() => {
      setCreatedPlanMessage(null);
    }, 7000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Relocation Planning &amp; Directives
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Executive Phasing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulate official evacuation corridors, logistics conduits, and dispatch relocation orders for vulnerable Kuttanad habitations.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Select Vulnerable Habitation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Source Vulnerable Habitation
            </label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer focus:outline-hidden focus:border-blue-600"
            >
              {villages.map((v) => {
                const category = v.mlPrediction?.riskCategory || v.baselineRiskCategory || 'High';
                const evac = v.carryingCapacity?.populationRequiringEvacuation || Math.round(v.population * 0.5);
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.polderName}) — {category.toUpperCase()} RISK • {evac.toLocaleString()} evacuees required
                  </option>
                );
              })}
            </select>
          </div>

          {/* Select Target Safe Sanctuary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Target Highland Sanctuary
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer focus:outline-hidden focus:border-emerald-600"
            >
              {safeSites.map((s) => {
                const avail = s.maxCapacity - s.currentPopulation;
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.locationName}) — {avail.toLocaleString()} seats available (Elev: +{s.elevationM}m MSL)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Plan Created Banner Notification */}
      {createdPlanMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{createdPlanMessage}</span>
          </div>
          <button
            onClick={() => onGenerateReport(selectedVillage, selectedSite, currentMatch)}
            className="px-3 py-1 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 shrink-0 cursor-pointer"
          >
            Open Order
          </button>
        </div>
      )}

      {/* Two Column Layout: Source Habitation Demands vs Target Sanctuary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Source Habitation Evacuation Demand */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Source Habitation Profile
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                riskCat === 'Critical'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {riskCat.toUpperCase()} RISK
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">{selectedVillage.name}</h3>
              <span className="text-xs font-mono text-slate-500">{selectedVillage.localBodyName}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Polder: <strong>{selectedVillage.polderName}</strong> • Taluk: {selectedVillage.taluk}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Total Habitation Population</span>
              <strong className="text-base text-slate-900">{selectedVillage.population.toLocaleString()}</strong> persons
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ({selectedVillage.households} households)
              </span>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <span className="text-red-700 block text-[11px] font-semibold">Immediate Evacuation Demand</span>
              <strong className="text-base text-red-800">{requiredEvacuees.toLocaleString()}</strong> evacuees
              <span className="text-[10px] text-red-600 block mt-0.5">
                Target priority phase
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Sub-Sea-Level Ground</span>
              <strong className="text-base text-slate-900 font-mono">{selectedVillage.elevationM} m MSL</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Submergence hazard zone</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">ML Flood Probability</span>
              <strong className="text-base text-red-600">{mlProb}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Random Forest model</span>
            </div>
          </div>
        </div>

        {/* Right: Target Sanctuary Summary (Strict Rule: Summary + Link, NO full duplicate!) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Target Relocation Sanctuary
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentMatch.isSuitable ? 'SUITABLE DESTINATION' : 'CAPACITY ALERT'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">{selectedSite.name}</h3>
                <span className="text-xs font-mono text-emerald-800 font-bold">+{selectedSite.elevationM}m MSL</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSite.locationName} • Taluk: {selectedSite.taluk}
              </p>
            </div>

            {/* Concise Status & Capacity Highlights */}
            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-950">Relocation Match Status:</span>
                <span className="font-bold text-emerald-800">
                  {currentMatch.isSuitable ? 'Suitable relocation site identified' : 'Capacity deficit warning'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                <span className="text-slate-600">Suitability Score:</span>
                <span className="font-extrabold text-slate-900 text-sm">{currentMatch.suitabilityScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Available Sanctuary Capacity:</span>
                <span className="font-extrabold text-emerald-800 text-sm">{currentAvailableCap.toLocaleString()} beds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Transit Corridor Distance:</span>
                <span className="font-semibold text-slate-800">{currentDistance} km</span>
              </div>
            </div>
          </div>

          {/* Navigation Button to Dedicated Site Suitability Page */}
          <div className="pt-2">
            <button
              onClick={() => onNavigateToSiteSuitability?.(selectedSite)}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <span>View Full Site Suitability &amp; Infrastructure Capacity</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Relocation Logistics & Directive Dispatch */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-700" />
              Evacuation Logistics &amp; Directive Execution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned inland flotilla, transit assembly points, and official DDMA relocation orders.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Priority Phasing:</span>
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
              Phase 1 (Immediate)
            </span>
          </div>
        </div>

        {/* Logistics Conduits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Anchor className="w-4 h-4 text-blue-600" />
              <span>Waterway Flotilla (Inland)</span>
            </div>
            <div className="text-slate-600 text-[11px]">
              Assigned Flotilla: <strong>{boatFlotillaCount} mechanised rescue boats</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              Assembly: {selectedVillage.evacuationRoute?.assemblyPoint || 'Panchayat Boat Jetty'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Bus className="w-4 h-4 text-indigo-600" />
              <span>Highland Transit Conduits</span>
            </div>
            <div className="text-slate-600 text-[11px]">
              KSRTC Relief Fleet: <strong>{transitBusesCount} buses mobilized</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              Route: {selectedVillage.evacuationRoute?.primaryRouteName || 'National Waterway 3 & AC Road'}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <LifeBuoy className="w-4 h-4 text-emerald-600" />
              <span>Medical &amp; Transit Triage</span>
            </div>
            <div className="text-slate-600 text-[11px]">
              Sanctuary Medical Staff: <strong>{selectedSite.medicalStaffPresent ? 'On-site Triage Unit' : 'PHC Linked'}</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              Estimated Transit: {selectedVillage.evacuationRoute?.estimatedTravelTimeMins || 45} minutes
            </div>
          </div>
        </div>

        {/* Executive Action Directives */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Official Relocation Order Formulation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatch formal relocation directive linking {selectedVillage.name} ({requiredEvacuees.toLocaleString()} evacuees) to {selectedSite.name}. This transmits operational instructions to Revenue Officials and NDRF units.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onGenerateReport(selectedVillage, selectedSite, currentMatch)}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" /> Generate Official Order
            </button>

            {currentMatch.isSuitable && (
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Issue Relocation Directive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
