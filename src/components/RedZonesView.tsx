import React, { useState } from 'react';
import { RedZone, Village, SafeSite } from '../types';
import { GisMap } from './GisMap';
import {
  AlertOctagon,
  ShieldAlert,
  Users,
  MapPin,
  Waves,
  ArrowRight,
  Info,
  Maximize2,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface RedZonesViewProps {
  redZones: RedZone[];
  villages: Village[];
  safeSites: SafeSite[];
  onSelectVillage?: (village: Village) => void;
  onSelectSafeSite?: (site: SafeSite) => void;
  onNavigateToPlanning?: () => void;
}

export const RedZonesView: React.FC<RedZonesViewProps> = ({
  redZones,
  villages,
  safeSites,
  onSelectVillage,
  onSelectSafeSite,
  onNavigateToPlanning,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(redZones[0]?.id || '');

  const selectedZone = redZones.find((z) => z.id === selectedZoneId) || redZones[0];

  // Intersecting habitations for selected zone
  const intersectingVillages = villages.filter((v) =>
    selectedZone.affectedVillageIds.includes(v.id)
  );

  // Total exposed population in selected zone
  const totalZonePopulation = intersectingVillages.reduce((sum, v) => sum + v.population, 0);
  const totalZoneVulnerable = intersectingVillages.reduce(
    (sum, v) => sum + v.vulnerablePopulation,
    0
  );

  // Approximate area of all red zones in km² (based on Kuttanad polder GIS polygons)
  const totalRedZoneAreaKm2 = 48.2;

  // Total exposed across all red zones
  const allAffectedVillageIds = new Set(redZones.flatMap((z) => z.affectedVillageIds));
  const allAffectedVillages = villages.filter((v) => allAffectedVillageIds.has(v.id));
  const totalAllRedZonePop = allAffectedVillages.reduce((sum, v) => sum + v.population, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hazard-Based Red Zone Delineation
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              Disaster Inundation Limits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory high-risk containment zones defined under KSDMA protocol • Outer bund breach & backwater deluge boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Study Basin:</span>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Kuttanad Depression Basin (Alappuzha)
          </span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Delineated Red Zone Area */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Red-Zone Area
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalRedZoneAreaKm2}</span>
            <span className="text-xs text-slate-500 font-medium">sq. kilometers</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            3 primary high-hazard polder clusters
          </div>
        </div>

        {/* Card 2: Intersecting Habitations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Intersecting Habitations
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{allAffectedVillages.length}</span>
            <span className="text-xs text-slate-500 font-medium">villages/polders</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Kainakary, Kavalam, Pulinkunnu & fringes
          </div>
        </div>

        {/* Card 3: Exposed Population */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exposed Population
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {totalAllRedZonePop.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">residents</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Census 2011 / Panchayat Registry
          </div>
        </div>

        {/* Card 4: Dominant Hazard */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dominant Hazard
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-red-700">Bund Breach & Deluge</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Peak depth: up to 3.4m MSL
          </div>
        </div>
      </div>

      {/* Main Content: Map on Left + Red Zone Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">Spatial Red Zone Extent & Habitation Intersections</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Red polygons indicate high-hazard inundation buffers
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-200">
            <GisMap
              villages={villages}
              safeSites={safeSites}
              redZones={redZones}
              showRedZones={true}
              showVillages={true}
              showSafeSites={true}
              onSelectVillage={onSelectVillage}
              onSelectSafeSite={onSelectSafeSite}
              heightClass="h-[460px]"
            />
          </div>

          {/* Map Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <span className="font-semibold text-slate-700">Map Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-500/30 border border-red-600 border-dashed"></span>
              <span className="text-slate-600">Red Zone Polygon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-slate-600">Critical Habitation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">High Risk Habitation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-600">Safe Highland Sanctuary</span>
            </div>
          </div>
        </div>

        {/* Red Zone Selection & Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Red Zone Selector List */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Delineated Red Zones (Kuttanad)
            </h3>

            <div className="space-y-2">
              {redZones.map((zone) => {
                const isSelected = zone.id === selectedZone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className={`font-bold ${isSelected ? 'text-red-900' : 'text-slate-900'}`}>
                        {zone.name}
                      </strong>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 shrink-0">
                        {zone.riskLevel}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1 flex items-center justify-between">
                      <span>Primary: {zone.primaryHazard}</span>
                      <span>Peak depth: {zone.peakFloodDepthRecordedM}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Red Zone Dossier
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedZone.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">{selectedZone.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedZone.description}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Peak Recorded Depth</span>
                <strong className="text-base text-red-700 font-bold">
                  {selectedZone.peakFloodDepthRecordedM} m
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">2018 Deluge level</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Exposed Habitations</span>
                <strong className="text-base text-slate-900 font-bold">
                  {intersectingVillages.length} polders
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {totalZonePopulation.toLocaleString()} people
                </span>
              </div>
            </div>

            {/* Statutory Action Recommendation */}
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Statutory Authority Directive:</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {selectedZone.recommendedAction}
              </p>
            </div>

            {/* Intersecting Habitations Chips */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Intersecting Habitations ({intersectingVillages.length}):
              </span>
              <div className="space-y-1.5">
                {intersectingVillages.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{v.name}</span>
                      <span className="text-slate-500 text-[11px] ml-1">({v.population.toLocaleString()} pop)</span>
                    </div>
                    {onSelectVillage && (
                      <button
                        onClick={() => onSelectVillage(v)}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        Inspect &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Relocation Action Button */}
            {onNavigateToPlanning && (
              <button
                onClick={onNavigateToPlanning}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>Open Relocation Planning For Zone</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
