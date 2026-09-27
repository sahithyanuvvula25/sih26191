import React, { useState } from 'react';
import { Village, SafeSite, RedZone, HazardType, RiskCategory } from '../types';
import { GisMap } from './GisMap';
import { AlertOctagon, Filter, ArrowRight, Layers, Eye } from 'lucide-react';

interface RiskMapViewProps {
  villages: Village[];
  safeSites: SafeSite[];
  redZones: RedZone[];
  onSelectVillage: (village: Village) => void;
  onSelectSafeSite: (site: SafeSite) => void;
  onNavigateToRedZones?: () => void;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  villages,
  safeSites,
  redZones,
  onSelectVillage,
  onSelectSafeSite,
  onNavigateToRedZones,
}) => {
  const [selectedHazard, setSelectedHazard] = useState<'All' | HazardType>('All');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<'All' | RiskCategory>('All');
  const [showVillages, setShowVillages] = useState(true);
  const [showRedZones, setShowRedZones] = useState(true);
  const [showSafeSites, setShowSafeSites] = useState(true);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Interactive GIS Risk Map</span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Spatial Analysis
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-featured spatial exploration of flood inundation vectors, polder dyke breach zones, and highland sanctuaries.
          </p>
        </div>
      </div>

      {/* Clean Filters & Layer Visibility Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Hazard Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Hazard:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Flood', 'Waterlogging', 'Bund Breach', 'Bank Erosion'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHazard(h)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedHazard === h
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Risk:</span>
          <div className="flex items-center gap-1">
            {(['All', 'Low', 'Moderate', 'High', 'Critical'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRiskCategory(r)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedRiskCategory === r
                    ? r === 'Critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Layers:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showVillages}
              onChange={(e) => setShowVillages(e.target.checked)}
              className="rounded border-slate-300 text-blue-700 focus:ring-0 cursor-pointer"
            />
            Villages
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showRedZones}
              onChange={(e) => setShowRedZones(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-red-700 font-bold">Red Zones</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showSafeSites}
              onChange={(e) => setShowSafeSites(e.target.checked)}
              className="rounded border-slate-300 text-emerald-700 focus:ring-0 cursor-pointer"
            />
            <span className="text-emerald-700 font-semibold">Safe Sites</span>
          </label>
        </div>
      </div>

      {/* Dedicated Interactive GIS Map Viewport */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
        <GisMap
          villages={villages}
          safeSites={safeSites}
          redZones={redZones}
          showVillages={showVillages}
          showRedZones={showRedZones}
          showSafeSites={showSafeSites}
          onSelectVillage={onSelectVillage}
          onSelectSafeSite={onSelectSafeSite}
          heightClass="h-[620px]"
        />
      </div>

      {/* Summary Banner with Navigation to Red Zones Page (Strict Rule: No duplicate full analysis) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              3 Statutory High-Hazard Red Zones Delineated ({redZones.length} Polygons Active • 48.2 km²)
            </div>
            <div className="text-slate-500 mt-0.5">
              Complete submergence limit analysis, buffer restrictions, and polder intersection dossiers belong to the dedicated Risk &amp; Red Zones page.
            </div>
          </div>
        </div>

        {onNavigateToRedZones && (
          <button
            onClick={onNavigateToRedZones}
            className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <span>View Complete Red Zones Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
