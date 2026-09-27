import React from 'react';
import { Village, SafeSite, RedZone, NavigationPage } from '../types';
import { GisMap } from './GisMap';
import {
  Building,
  ShieldAlert,
  AlertOctagon,
  Users,
  ArrowRight,
  Waves,
  ShieldCheck,
  FileText,
  Activity,
  Compass,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  villages: Village[];
  safeSites: SafeSite[];
  redZones: RedZone[];
  onSelectVillage: (village: Village) => void;
  onSelectSafeSite: (site: SafeSite) => void;
  onNavigateToPage: (page: NavigationPage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  villages,
  safeSites,
  redZones,
  onSelectVillage,
  onSelectSafeSite,
  onNavigateToPage,
}) => {
  // Summary Metrics
  const totalVillages = villages.length;

  const highRiskCount = villages.filter(
    (v) => v.mlPrediction.riskCategory === 'Critical' || v.mlPrediction.riskCategory === 'High'
  ).length;

  const redZoneAreaKm2 = 48.2;

  const peopleInDanger = villages
    .filter((v) => v.mlPrediction.riskCategory === 'Critical' || v.mlPrediction.riskCategory === 'High')
    .reduce((sum, v) => sum + v.population, 0);

  const vulnerableInDanger = villages
    .filter((v) => v.mlPrediction.riskCategory === 'Critical' || v.mlPrediction.riskCategory === 'High')
    .reduce((sum, v) => sum + v.vulnerablePopulation, 0);

  const totalSanctuaryCapacity = safeSites.reduce(
    (sum, s) => sum + (s.maxCapacity - s.currentPopulation),
    0
  );

  const immediateEvacuees = villages
    .filter((v) => v.relocationPriority === 'Immediate')
    .reduce((sum, v) => sum + (v.carryingCapacity?.populationRequiringEvacuation || Math.round(v.population * 0.5)), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bhoosethu Executive Overview
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live DSS Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kuttanad Wetland Basin • High-level operational summary &amp; quick navigation to dedicated modules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Alappuzha DEOC Feed: Operational</span>
        </div>
      </div>

      {/* 4 SUMMARY METRIC BLOCKS (WITH SHORT SUMMARIES + QUICK NAVIGATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Habitations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Total Habitations
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{totalVillages}</span>
              <span className="text-xs text-slate-500 font-medium">monitored</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Across Kuttanad polder basins
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToPage('villages')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>View Vulnerable Habitations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: High-Risk Habitations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-rose-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                High-Risk Habitations
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600 tracking-tight">{highRiskCount}</span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Critical / High
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              ML flood prob &ge;50% &amp; dyke breach
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToPage('red-zones')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>View Risk &amp; Red Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Red-Zone Area */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-amber-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Red-Zone Area
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{redZoneAreaKm2}</span>
              <span className="text-xs text-slate-500 font-medium">sq. km</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              3 backwater inundation polygons
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToPage('red-zones')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>View Red Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: People in Danger */}
        <div className="bg-white rounded-2xl border border-red-200/90 p-5 shadow-2xs hover:border-red-400 bg-gradient-to-br from-white via-white to-red-50/30 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                People in Danger
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-700 tracking-tight">
                {peopleInDanger.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                Immediate Danger
              </span>
            </div>
            <div className="mt-1 text-xs text-red-800/80 font-medium">
              {vulnerableInDanger.toLocaleString()} seniors &amp; infants
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-red-100">
            <button
              onClick={() => onNavigateToPage('planning')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <span>View Relocation Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KEY VISUAL OVERVIEW: GIS BASIN MAP SNAPSHOT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-blue-950 font-bold">Basin Spatial Overview</span>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Visual Snapshot
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Geographic distribution of polders, red inundation buffer polygons, and surrounding highland sanctuaries.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToPage('map')}
              className="text-xs font-bold text-blue-800 hover:text-white hover:bg-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Open Full Interactive GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Spatial Map */}
        <div className="w-full rounded-xl overflow-hidden border border-slate-200">
          <GisMap
            villages={villages}
            safeSites={safeSites}
            redZones={redZones}
            onSelectVillage={onSelectVillage}
            onSelectSafeSite={onSelectSafeSite}
            heightClass="h-[460px] sm:h-[500px]"
          />
        </div>
      </div>

      {/* DOMAIN STATUS SUMMARIES & DIRECT NAVIGATION (ONE FEATURE -> ONE PAGE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Module 1: Vulnerable Habitations Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Vulnerable Habitations</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                12 Monitored
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sub-sea-level elevation profiling down to <strong>-1.8m MSL</strong> (Kainakary). Tracks household densities, infant/geriatric vulnerabilities, and earthen dyke conditions.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Critical Risk</span>
                <strong className="text-base text-red-600 font-bold">
                  {villages.filter((v) => v.mlPrediction.riskCategory === 'Critical').length} Habitations
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Relocation Required</span>
                <strong className="text-base text-amber-700 font-bold">
                  {villages.filter((v) => v.relocationRequired).length} Habitations
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToPage('villages')}
            className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <span>View Vulnerable Habitations Registry &amp; Dossiers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Risk & Red Zones Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Risk &amp; Red Zones</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                3 Zones Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Statutory high-risk containment zones defined under KSDMA protocol covering <strong>48.2 km²</strong>. Identifies submergence limits, outer bund breach corridors, and habitat restrictions.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Peak Deluge Depth</span>
                <strong className="text-base text-rose-700 font-bold">3.4 m MSL</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Statutory Status</span>
                <strong className="text-base text-slate-900 font-bold">Prohibited Buffer</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToPage('red-zones')}
            className="w-full py-2.5 px-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <span>View Red Zone Delineation &amp; Polygons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 3: Relocation Planning & Site Suitability */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Relocation Planning &amp; Sanctuaries</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                5 Safe Sites
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Automated pairing of inundated polders with certified highland sanctuaries. Evaluates Sphere standards, potable water (15L/person/day), and NW-3 waterway evacuation flotillas.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Available Capacity</span>
                <strong className="text-base text-emerald-700 font-bold">
                  {totalSanctuaryCapacity.toLocaleString()} beds
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Immediate Demand</span>
                <strong className="text-base text-slate-900 font-bold">
                  {immediateEvacuees.toLocaleString()} evacuees
                </strong>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateToPage('planning')}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Relocation Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToPage('sites')}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Site Suitability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module 4: Multi-Hazard Telemetry Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <Waves className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Hazard Analysis &amp; Telemetry</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                5 Hazard Modes
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-hazard telemetry spanning river water levels (Pamba, Manimala), 24h convective rainfall alerts, Cartosat DEM depression profiles, and historical deluge archives (2018–2025).
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Dominant Threat</span>
                <strong className="text-base text-slate-900 font-bold">Bund Breach &amp; Ingress</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Monitored Gauges</span>
                <strong className="text-base text-cyan-800 font-bold">CWC / IMD Active</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToPage('hazard-analysis')}
            className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <span>View Complete Hazard Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK EXECUTIVE DIRECTIVES FOOTER */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Official Disaster Directives &amp; Model Audit</div>
            <div className="text-slate-500 mt-0.5">
              Generate gazette-ready evacuation orders or inspect the Random Forest ML model training parameters.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigateToPage('reports')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            Reports
          </button>
          <button
            onClick={() => onNavigateToPage('sources')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            Data Sources
          </button>
        </div>
      </div>
    </div>
  );
};
