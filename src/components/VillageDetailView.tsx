import React from 'react';
import { Village, SafeSite } from '../types';
import { calculateDistanceKm, evaluateRelocationMatch } from '../utils/riskEngine';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Droplets,
  Waves,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Building2,
  Anchor,
  Compass,
  Database,
  Calendar,
} from 'lucide-react';

interface VillageDetailViewProps {
  village: Village;
  safeSites: SafeSite[];
  onBack: () => void;
  onOpenRelocationPlan: (village: Village, site: SafeSite) => void;
  onNavigateToSimulation?: () => void;
  onNavigateToSites?: () => void;
}

export const VillageDetailView: React.FC<VillageDetailViewProps> = ({
  village,
  safeSites,
  onBack,
  onOpenRelocationPlan,
  onNavigateToSimulation,
  onNavigateToSites,
}) => {
  const isCritical = village.mlPrediction.riskCategory === 'Critical';
  const probPct = Math.round(village.mlPrediction.predictedProbability * 100);

  // Evaluate candidate safe sites
  const evaluatedSites = safeSites.map((site) => {
    const match = evaluateRelocationMatch(village, site);
    const distanceKm = calculateDistanceKm(village.lat, village.lng, site.lat, site.lng);
    return { site, match, distanceKm };
  });

  evaluatedSites.sort((a, b) => {
    if (a.match.isSuitable && !b.match.isSuitable) return -1;
    if (!a.match.isSuitable && b.match.isSuitable) return 1;
    return b.match.suitabilityScore - a.match.suitabilityScore;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Habitations Overview
        </button>

        {onNavigateToSimulation && (
          <button
            onClick={onNavigateToSimulation}
            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Simulate +20% Rain / Bund Breach on {village.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </button>
        )}
      </div>

      {/* Top Banner: Village Name, Polder, Coordinates, and ML Risk Score */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-2xl font-black text-slate-900">{village.name}</h2>
            {village.name === 'Kainakary' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-[#0D47A1] border border-blue-200">
                Primary Kuttanad Study Area
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isCritical
                  ? 'bg-red-50 text-[#DC2626] border border-red-200'
                  : village.mlPrediction.riskCategory === 'High'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-[#1565C0] border border-blue-200'
              }`}
            >
              ML Risk: {village.mlPrediction.riskCategory.toUpperCase()}
            </span>
          </div>

          <div className="text-xs text-slate-500 mt-1.5 space-x-2">
            <span>{village.localBodyName}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{village.polderName}</span>
            <span>•</span>
            <span>Taluk: {village.taluk}, {village.district}</span>
            <span>•</span>
            <span className="font-mono text-slate-600">{village.lat.toFixed(4)}°N, {village.lng.toFixed(4)}°E</span>
          </div>
        </div>

        {/* Dual Scores: ML Inundation Probability & Baseline Index */}
        <div className="flex items-center gap-3">
          <div className="bg-red-50/70 border border-red-200 p-3 rounded-xl text-center sm:text-right min-w-[130px]">
            <div className="text-[10px] text-red-700 uppercase tracking-wider font-extrabold flex items-center justify-end gap-1">
              <Cpu className="w-3 h-3 text-red-600" />
              <span>ML Inundation Prob</span>
            </div>
            <div className="text-3xl font-black text-red-600 leading-tight mt-0.5">
              {probPct}%
            </div>
            <div className="text-[10px] text-red-800 font-semibold">
              Random Forest Ensemble
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center sm:text-right min-w-[120px]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Baseline Index
            </div>
            <div className="text-3xl font-black text-slate-800 leading-tight mt-0.5">
              {village.baselineRiskScore}
            </div>
            <div className="text-[10px] text-slate-500">
              Weighted Formula /100
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Geography & ML Factors, Right: Carrying Capacity & Route) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Geography, River Status & Explainable AI (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Hydrological & Topographic Observations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Hydrological & Elevation Baseline</span>
              <span className="text-[11px] text-slate-400 font-normal">IMD AWS & CWC Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-red-50/60 border border-red-100">
                <span className="text-[10px] text-red-700 font-bold uppercase">Ground Elevation</span>
                <div className="text-lg font-black text-red-600 mt-0.5">{village.elevationM} m MSL</div>
                <div className="text-[10px] text-slate-500">Below Sea Level</div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-blue-700 font-bold uppercase">24h Rainfall</span>
                <div className="text-lg font-black text-blue-700 mt-0.5">{village.latestRainfall24hMm} mm</div>
                <div className="text-[10px] text-slate-500">Anomaly: +{village.rainfallAnomalyPct}%</div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Pamba River Gauge</span>
                <div className="text-lg font-black text-amber-700 mt-0.5">{village.riverWaterLevelM} m MSL</div>
                <div className="text-[10px] text-slate-500">Danger: {village.dangerWaterLevelM}m</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-600 font-bold uppercase">Outer Bund Breach</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{village.bundBreachRiskPct}%</div>
                <div className="text-[10px] text-slate-500">Dyke Failure Risk</div>
              </div>
            </div>
          </div>

          {/* Explainable AI: "Why is this village at risk?" */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#1565C0]" />
                <span>Explainable AI: Contributing Risk Factors</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Feature Contributions
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Random Forest feature importance and local contribution breakdown for {village.name}:
            </p>

            <div className="space-y-2.5">
              {village.mlPrediction.primaryContributingFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <span>{factor.label}</span>
                    </span>
                    <span className="font-mono text-red-600 font-bold">
                      {factor.contribution > 0 ? `+${factor.contribution}` : factor.contribution}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Current observed value: <strong className="text-slate-800">{factor.value}</strong></span>
                    <span>{factor.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Disaster Timeline (2018 - 2025) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1565C0]" />
              <span>Historical Inundation Record (KSDMA Archive)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2">Year</th>
                    <th className="py-2">Peak 24h Rain</th>
                    <th className="py-2">Flood Depth</th>
                    <th className="py-2">Severity</th>
                    <th className="py-2">Polder Impact Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {village.historicalTimeline.map((item) => (
                    <tr key={item.year} className="hover:bg-slate-50/70">
                      <td className="py-2 font-bold text-slate-900">{item.year}</td>
                      <td className="py-2">{item.peak24hMm} mm</td>
                      <td className="py-2 font-semibold text-red-600">{item.floodDepthM} m</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.severity === 'Catastrophic'
                              ? 'bg-red-100 text-red-800'
                              : item.severity === 'Severe'
                              ? 'bg-amber-100 text-amber-900'
                              : item.severity === 'Moderate'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-2 text-[11px] text-slate-500 max-w-xs truncate" title={item.notes}>
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Multi-Dimensional Carrying Capacity & Evacuation Blueprint (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Carrying Capacity & Shelter Deficit Audit */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Carrying Capacity Audit</span>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Deficit Detected
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-slate-500 font-semibold">Population in Hazard Polder</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{village.population.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 font-semibold">Vulnerable Demographics</div>
                  <div className="text-base font-black text-amber-700 mt-0.5">{village.vulnerablePopulation.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-2">
                <div className="flex justify-between font-bold text-red-900">
                  <span>Population Requiring Evacuation:</span>
                  <span>{village.carryingCapacity.populationRequiringEvacuation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Available Local Polder Shelter:</span>
                  <span>{village.carryingCapacity.availableSafeCapacity.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-red-200 flex justify-between font-black text-sm text-red-600">
                  <span>Local Capacity Deficit:</span>
                  <span>-{village.carryingCapacity.capacityDeficit.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-red-800 leading-tight mt-1">
                  Local community refuge is inadequate for the entire polder population. Evacuation to elevated highland centers is mandatory.
                </p>
              </div>

              {/* Sphere Humanitarian Standards Check */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Potable Water Requirement (15L/person/day):</span>
                  <strong className="text-slate-900">{village.carryingCapacity.potableWaterLpdRequired.toLocaleString()} L/day</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sanitation / Bio-Toilets Needed (1 per 20):</span>
                  <strong className="text-slate-900">{village.carryingCapacity.sanitationUnitsRequired} units</strong>
                </div>
                <div className="flex justify-between">
                  <span>Healthcare / PHC Readiness:</span>
                  <strong className="text-red-600">{village.carryingCapacity.healthcareReadiness}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Road Transit Feasibility:</span>
                  <strong className="text-amber-700">{village.carryingCapacity.roadAccessibilityStatus}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Evacuation Route Blueprint */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1565C0]" />
              <span>Evacuation Route Blueprint</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">1. Assembly Point</span>
                <div className="font-bold text-slate-900 mt-0.5">{village.evacuationRoute.assemblyPoint}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">2. Transit Mode</span>
                <div className="font-bold text-[#1565C0] mt-0.5 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5" />
                  <span>{village.evacuationRoute.transitMode}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">3. Primary Evacuation Corridor</span>
                <div className="font-semibold text-slate-900 mt-0.5">{village.evacuationRoute.primaryRouteName}</div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  Status: {village.evacuationRoute.routeStatus}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">4. Designated Sanctuary</span>
                <div className="font-bold text-emerald-900 mt-0.5">{village.evacuationRoute.designatedReliefShelterName}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Distance: {village.evacuationRoute.distanceKm} km • Est. Transit: {village.evacuationRoute.estimatedTravelTimeMins} mins
                </div>
              </div>
            </div>
          </div>

          {/* Data Provenance Badge */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Data Provenance: <strong>Official ({village.dataQuality.officialPct}%)</strong></span>
            </div>
            <span>Updated: {village.dataQuality.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* DESIGNATED HIGHLAND SANCTUARY SUMMARY & NAVIGATION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Designated Highland Relocation Sanctuary
            </h3>
            <p className="text-xs text-slate-500">
              Safe site evaluation status for {village.name}. Detailed capacity, water audits, and infrastructure are housed on the Site Suitability page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToSites && (
              <button
                onClick={onNavigateToSites}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
              >
                View Site Suitability
              </button>
            )}
            {evaluatedSites[0] && (
              <button
                onClick={() => onOpenRelocationPlan(village, evaluatedSites[0].site)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Open Relocation Plan
              </button>
            )}
          </div>
        </div>

        {evaluatedSites[0] && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{evaluatedSites[0].site.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {evaluatedSites[0].match.verdict}
                </span>
                <span className="text-emerald-700 font-bold font-mono">+{evaluatedSites[0].site.elevationM}m MSL</span>
              </div>
              <div className="text-slate-600 mt-1">
                Suitable relocation site identified • Suitability Score: <strong>{evaluatedSites[0].match.suitabilityScore}/100</strong> • Transit Distance: <strong>{evaluatedSites[0].distanceKm} km</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500">
                Available: <strong className="text-emerald-800">{evaluatedSites[0].site.availableCapacity.toLocaleString()} seats</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
