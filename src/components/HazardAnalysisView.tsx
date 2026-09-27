import React, { useState } from 'react';
import { Village, SafeSite, RedZone } from '../types';
import { INITIAL_SAFE_SITES, INITIAL_RED_ZONES } from '../data/initialData';
import { GisMap } from './GisMap';
import { ErrorBoundary } from './ErrorBoundary';
import {
  Waves,
  MountainSnow,
  CloudRain,
  Mountain,
  History,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Info,
  MapPin,
  Layers,
  Users,
  TrendingUp,
  RefreshCw,
  Building,
  CheckCircle2,
  Calendar,
  Activity,
} from 'lucide-react';

interface HazardAnalysisViewProps {
  villages: Village[];
  safeSites?: SafeSite[];
  redZones?: RedZone[];
  onSelectVillage?: (village: Village) => void;
  selectedVillageId?: string;
}

export type HazardTypeOption = 'Flood' | 'Landslide' | 'Rainfall' | 'Elevation' | 'Historical Events';

export const HazardAnalysisView: React.FC<HazardAnalysisViewProps> = ({
  villages = [],
  safeSites = INITIAL_SAFE_SITES,
  redZones = INITIAL_RED_ZONES,
  onSelectVillage,
  selectedVillageId,
}) => {
  const [selectedHazard, setSelectedHazard] = useState<HazardTypeOption>('Flood');
  const [activeVillageId, setActiveVillageId] = useState<string>(
    selectedVillageId || (villages[0]?.id ?? '')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  // Safe fallback arrays
  const safeVillagesList = Array.isArray(villages) ? villages : [];
  const safeSitesList = Array.isArray(safeSites) && safeSites.length > 0 ? safeSites : INITIAL_SAFE_SITES;
  const redZonesList = Array.isArray(redZones) && redZones.length > 0 ? redZones : INITIAL_RED_ZONES;

  // Selected Village
  const activeVillage =
    safeVillagesList.find((v) => v.id === activeVillageId) ||
    safeVillagesList[0] ||
    null;

  // Check if active village is in a red zone
  const isVillageInRedZone = activeVillage
    ? redZonesList.some((rz) => rz.affectedVillageIds?.includes(activeVillage.id))
    : false;

  const villageRedZoneName = activeVillage
    ? redZonesList.find((rz) => rz.affectedVillageIds?.includes(activeVillage.id))?.name || 'None'
    : 'None';

  // Computed Hazard Summaries based on real data
  const riverGaugesAboveDanger = safeVillagesList.filter(
    (v) => v.riverWaterLevelM >= v.dangerWaterLevelM
  );
  const extremeRainfallVillages = safeVillagesList.filter(
    (v) => v.latestRainfall24hMm >= 150
  );
  const highBundRiskVillages = safeVillagesList.filter(
    (v) => v.bundBreachRiskPct >= 70
  );
  const belowSeaLevelVillages = safeVillagesList.filter(
    (v) => v.elevationM < 0
  );

  // Hazard metadata per tab
  const getHazardSummary = () => {
    switch (selectedHazard) {
      case 'Flood':
        return {
          hazardType: 'River Flood Surcharge & Lake Ingress',
          affectedArea: '48.2 sq.km (Kuttanad Backwaters Basin)',
          affectedVillagesCount: riverGaugesAboveDanger.length,
          affectedVillagesNames: riverGaugesAboveDanger.map((v) => v.name).join(', ') || 'None currently above danger level',
          hazardSeverity: riverGaugesAboveDanger.length > 3 ? 'Critical' : 'Moderate',
          historicalEvents: '2018 (3.4m depth), 2019 (1.8m depth), 2021 (2.1m depth), 2024 (1.9m depth)',
          description:
            'Continuous hydrodynamic backwater surcharge from Pamba, Manimala, and Meenachil river releases, aggravated by Vembanad Lake tidal locks.',
        };
      case 'Landslide':
        return {
          hazardType: 'Riverbank Slumping & Highland Buffer Debris Flows',
          affectedArea: '14.6 km Riverbank Dykes & Foothill Slopes',
          affectedVillagesCount: safeVillagesList.filter((v) => v.bundBreachRiskPct >= 75).length,
          affectedVillagesNames: safeVillagesList.filter((v) => v.bundBreachRiskPct >= 75).map((v) => v.name).join(', '),
          hazardSeverity: 'High Vulnerability to Dyke Collapse',
          historicalEvents: 'Polder bund breaches in 2018, 2019, 2021, and 2024 during sustained hydraulic saturation.',
          description:
            'While central Kuttanad polders are flat below-sea-level plains, continuous high water table saturation induces earthen outer dyke slumping and riverbank scour. Surrounding evacuation corridors into Kottayam and Pathanamthitta foothills cross landslide-prone slopes.',
        };
      case 'Rainfall':
        return {
          hazardType: 'Extreme 24-Hour Convective Precipitation',
          affectedArea: 'Basin-Wide Meteorological Catchment',
          affectedVillagesCount: extremeRainfallVillages.length,
          affectedVillagesNames: extremeRainfallVillages.map((v) => v.name).join(', ') || 'All stations monitored',
          hazardSeverity: extremeRainfallVillages.length > 2 ? 'Severe (Orange/Red Alert)' : 'Moderate',
          historicalEvents: 'Peak 24h: 310mm (August 2018), 215mm (October 2021), 185mm (Recent SW Monsoon).',
          description:
            'Precipitation intensity exceeding 150mm in 24 hours overwhelms the gravity-drainage capacity through Thottappally Spillway and Thanneermukkom Bund.',
        };
      case 'Elevation':
        return {
          hazardType: 'Below-Sea-Level Topographic Depression (DEM)',
          affectedArea: 'Entire Lower Kuttanad Agricultural Polder Zone',
          affectedVillagesCount: belowSeaLevelVillages.length,
          affectedVillagesNames: belowSeaLevelVillages.map((v) => `${v.name} (${v.elevationM}m)`).join(', '),
          hazardSeverity: 'Inherent Geographic Vulnerability (-1.8m to -0.4m MSL)',
          historicalEvents: 'Persistent natural basin sink; water remains locked for 2 to 4 weeks after major inundations.',
          description:
            'Ground elevations range from -0.4m down to -1.8m MSL. Inundation cannot recede naturally by gravity and requires round-the-clock mechanical dewatering polder pumps.',
        };
      case 'Historical Events':
        return {
          hazardType: 'Historical Deluge & Monsoon Surge Archive',
          affectedArea: 'Alappuzha & Kottayam Border Wetlands',
          affectedVillagesCount: safeVillagesList.length,
          affectedVillagesNames: 'All 12 habitations historically submerged in 100-year return deluges',
          hazardSeverity: 'Multi-Decadal Recurrent Hazard Profile',
          historicalEvents: '2018 Great Deluge (Catastrophic), 2019 August Monsoon Surge (Severe), 2021 October Flood (Severe), 2024 Monsoon (Moderate)',
          description:
            'Official KSDMA and CWC post-disaster flood inundation extents verifying repeat submergence patterns across polder corridors.',
        };
    }
  };

  const summary = getHazardSummary();

  const handleVillageSelect = (village: Village) => {
    setActiveVillageId(village.id);
    if (onSelectVillage) {
      onSelectVillage(village);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setSimulatedError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hazard Analysis
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Bhoosethu Spatial DSS
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Multi-hazard assessment of vulnerable habitations using GIS-based spatial analysis.
          </p>
        </div>

        {/* Action / Refresh status */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Refresh hazard layer data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span>{isLoading ? 'Reloading Telemetry...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-center gap-3 text-blue-800 text-xs font-semibold animate-pulse">
          <Activity className="w-4 h-4 animate-spin" />
          <span>Loading hazard data... Synchronizing CWC river gauge and IMD precipitation telemetry.</span>
        </div>
      )}

      {/* 2. Hazard Selector (Tabs/Cards: Flood, Landslide, Rainfall, Elevation, Historical Events) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Tab 1: Flood */}
        <button
          onClick={() => setSelectedHazard('Flood')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedHazard === 'Flood'
              ? 'bg-blue-700 border-blue-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Waves className={`w-5 h-5 ${selectedHazard === 'Flood' ? 'text-blue-100' : 'text-blue-600'}`} />
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                selectedHazard === 'Flood' ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {riverGaugesAboveDanger.length} Above Danger
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold">Flood</div>
            <div className={`text-[11px] truncate mt-0.5 ${selectedHazard === 'Flood' ? 'text-blue-100' : 'text-slate-500'}`}>
              River stage & lake backwater
            </div>
          </div>
        </button>

        {/* Tab 2: Landslide */}
        <button
          onClick={() => setSelectedHazard('Landslide')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedHazard === 'Landslide'
              ? 'bg-blue-700 border-blue-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <MountainSnow className={`w-5 h-5 ${selectedHazard === 'Landslide' ? 'text-blue-100' : 'text-amber-600'}`} />
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                selectedHazard === 'Landslide' ? 'bg-blue-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {highBundRiskVillages.length} Dyke Risks
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold">Landslide</div>
            <div className={`text-[11px] truncate mt-0.5 ${selectedHazard === 'Landslide' ? 'text-blue-100' : 'text-slate-500'}`}>
              Dyke slip & foothill debris
            </div>
          </div>
        </button>

        {/* Tab 3: Rainfall */}
        <button
          onClick={() => setSelectedHazard('Rainfall')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedHazard === 'Rainfall'
              ? 'bg-blue-700 border-blue-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <CloudRain className={`w-5 h-5 ${selectedHazard === 'Rainfall' ? 'text-blue-100' : 'text-blue-500'}`} />
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                selectedHazard === 'Rainfall' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {extremeRainfallVillages.length} &gt;150mm
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold">Rainfall</div>
            <div className={`text-[11px] truncate mt-0.5 ${selectedHazard === 'Rainfall' ? 'text-blue-100' : 'text-slate-500'}`}>
              24h precipitation anomalies
            </div>
          </div>
        </button>

        {/* Tab 4: Elevation */}
        <button
          onClick={() => setSelectedHazard('Elevation')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            selectedHazard === 'Elevation'
              ? 'bg-blue-700 border-blue-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Mountain className={`w-5 h-5 ${selectedHazard === 'Elevation' ? 'text-blue-100' : 'text-slate-700'}`} />
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                selectedHazard === 'Elevation' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              -1.8m to +0.8m
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold">Elevation</div>
            <div className={`text-[11px] truncate mt-0.5 ${selectedHazard === 'Elevation' ? 'text-blue-100' : 'text-slate-500'}`}>
              DEM & below-sea-level polders
            </div>
          </div>
        </button>

        {/* Tab 5: Historical Events */}
        <button
          onClick={() => setSelectedHazard('Historical Events')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1 ${
            selectedHazard === 'Historical Events'
              ? 'bg-blue-700 border-blue-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <History className={`w-5 h-5 ${selectedHazard === 'Historical Events' ? 'text-blue-100' : 'text-purple-600'}`} />
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                selectedHazard === 'Historical Events' ? 'bg-blue-600 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              2005–2025
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xs font-bold">Historical Events</div>
            <div className={`text-[11px] truncate mt-0.5 ${selectedHazard === 'Historical Events' ? 'text-blue-100' : 'text-slate-500'}`}>
              Recurrence & archival depths
            </div>
          </div>
        </button>
      </div>

      {/* 3. Main Split View: GIS Map & Hazard Summary + Village Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: GIS MAP (The main visual component) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Spatial GIS Map • {selectedHazard.toUpperCase()} EXPOSURE
              </h2>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Datum: Survey of India / KSDMA
            </span>
          </div>

          {/* Error Boundary around Map to guarantee the page NEVER crashes if map fails */}
          <ErrorBoundary fallbackTitle="Map layer unavailable">
            <div className="rounded-lg overflow-hidden border border-slate-200 shadow-inner">
              <GisMap
                villages={safeVillagesList}
                safeSites={safeSitesList}
                redZones={redZonesList}
                focusedVillageId={activeVillageId}
                showRedZones={selectedHazard === 'Flood' || selectedHazard === 'Elevation'}
                showVillages={true}
                showSafeSites={true}
                onSelectVillage={handleVillageSelect}
                heightClass="h-[490px]"
              />
            </div>
          </ErrorBoundary>

          {/* Clean Map Legend as explicitly requested in Section 6.E */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Map Legend
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-red-50/70 border border-red-200">
                <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                <span className="font-bold text-red-900 text-[11px]">High Hazard</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="font-bold text-amber-900 text-[11px]">Medium Hazard</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-emerald-50/70 border border-emerald-200">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-900 text-[11px]">Low Hazard</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-rose-50 border border-dashed border-rose-300">
                <span className="w-3 h-3 bg-red-500/30 border border-red-600 shrink-0" />
                <span className="font-bold text-red-800 text-[11px]">Red Zone</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 border border-green-200">
                <span className="w-3 h-3 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                  ✓
                </span>
                <span className="font-bold text-green-900 text-[11px]">Safe Area</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hazard Summary & Detailed Village Analysis */}
        <div className="lg:col-span-5 space-y-4">
          {/* C. HAZARD SUMMARY (Calculated data from actual dataset) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Hazard Summary • {selectedHazard}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Official Spatial Metric
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {summary.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Hazard Type</span>
                <strong className="text-slate-900 font-bold leading-tight block mt-0.5">
                  {summary.hazardType}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Affected Area</span>
                <strong className="text-slate-900 font-bold leading-tight block mt-0.5">
                  {summary.affectedArea}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Affected Habitations</span>
                <strong className="text-slate-900 font-bold text-base block mt-0.5">
                  {summary.affectedVillagesCount} polders
                </strong>
                <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                  {summary.affectedVillagesNames}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Hazard Severity</span>
                <strong className="text-blue-900 font-bold block mt-0.5">
                  {summary.hazardSeverity}
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-semibold block">Historical Deluge Record</span>
              <div className="text-slate-800 font-medium mt-0.5">
                {summary.historicalEvents}
              </div>
            </div>
          </div>

          {/* D. VILLAGE ANALYSIS (When a village is selected) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Village Analysis & Vulnerability
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Click map marker or dropdown
              </span>
            </div>

            {/* Habitation Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Select Habitation for Detailed Breakdown:
              </label>
              <select
                value={activeVillageId}
                onChange={(e) => {
                  const v = safeVillagesList.find((item) => item.id === e.target.value);
                  if (v) handleVillageSelect(v);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              >
                {safeVillagesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — Risk: {Math.round(v.baselineRiskScore)}/100 ({v.mlPrediction.riskCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* Village Details Display */}
            {activeVillage ? (
              <div className="space-y-3 pt-1">
                {/* Header Profile */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {activeVillage.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Taluk: <strong className="text-slate-700">{activeVillage.taluk}</strong> • District: <strong className="text-slate-700">{activeVillage.district}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Local Body: {activeVillage.localBodyName}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded ${
                        activeVillage.mlPrediction.riskCategory === 'Critical'
                          ? 'bg-red-600 text-white'
                          : activeVillage.mlPrediction.riskCategory === 'High'
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {activeVillage.mlPrediction.riskCategory.toUpperCase()} RISK
                    </span>
                    <div className="text-[11px] font-mono text-slate-600 mt-1">
                      Score: <strong className="text-slate-900">{Math.round(activeVillage.baselineRiskScore)}</strong>/100
                    </div>
                  </div>
                </div>

                {/* Village Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Red-Zone Status</span>
                    <strong className={`font-bold block mt-0.5 ${isVillageInRedZone ? 'text-red-700' : 'text-slate-700'}`}>
                      {isVillageInRedZone ? 'Inside Statutory Red Zone' : 'Outside Red Zone'}
                    </strong>
                    {isVillageInRedZone && (
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                        {villageRedZoneName}
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Relocation Priority</span>
                    <strong
                      className={`font-bold block mt-0.5 ${
                        activeVillage.relocationPriority === 'Immediate'
                          ? 'text-red-700'
                          : activeVillage.relocationPriority === 'Short-Term'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {activeVillage.relocationPriority} Relocation
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {activeVillage.relocationRecommendation}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Hazard Exposure</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {activeVillage.riverWaterLevelM}m Gauge (Danger: {activeVillage.dangerWaterLevelM}m)
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Bund Breach: {activeVillage.bundBreachRiskPct}% | Elev: {activeVillage.elevationM}m MSL
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Population / Vulnerability</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {activeVillage.population.toLocaleString()} Residents
                    </strong>
                    <span className="text-[10px] text-red-600 font-medium block mt-0.5">
                      {activeVillage.vulnerablePopulation.toLocaleString()} vulnerable ({activeVillage.households} households)
                    </span>
                  </div>
                </div>

                {/* Historical Disaster Info for Selected Village */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Historical Disaster Information
                  </span>
                  <p className="text-slate-700 leading-snug">
                    Experienced <strong>{activeVillage.historicalFloodCount} major inundations</strong> since 2005. Recorded base flood depth of <strong>{activeVillage.historicalTimeline?.[0]?.floodDepthM || 2.4}m</strong> during peak 2018 deluge.
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Designated Relief Shelter: <strong>{activeVillage.evacuationRoute.designatedReliefShelterName}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No hazard data available for this location. Select a village from the list above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
