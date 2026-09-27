import React from 'react';
import { Village, SafeSite, SiteSuitabilityResult } from '../types';
import { Printer, X, Shield, FileCheck, CheckCircle2 } from 'lucide-react';

interface RelocationReportModalProps {
  village: Village;
  site: SafeSite;
  result: SiteSuitabilityResult;
  onClose: () => void;
}

export const RelocationReportModal: React.FC<RelocationReportModalProps> = ({
  village,
  site,
  result,
  onClose,
}) => {
  const availableCap = site.maxCapacity - site.currentPopulation;
  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const reportRef = `DDMA-ALP/KTD/${village.id.toUpperCase()}-${site.id.toUpperCase()}/${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  const evacDemand = village.carryingCapacity?.populationRequiringEvacuation || Math.round(village.population * 0.5);
  const mlProb = village.mlPrediction ? Math.round(village.mlPrediction.predictedProbability * 100) : village.baselineRiskScore;
  const riskCategory = village.mlPrediction?.riskCategory || village.baselineRiskCategory || 'High';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95">
        {/* Modal Top Actions (Non-printable toolbar) */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileCheck className="w-4 h-4 text-[#1565C0]" />
            District Disaster Management Authority • Executive Order Directive
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-md bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Government of Kerala • District Disaster Management Authority (DDMA), Alappuzha
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              EXECUTIVE EVACUATION & RELOCATION DIRECTIVE
            </h1>
            <div className="text-xs font-semibold text-slate-600">
              Issued under Sections 30 & 34 of the Disaster Management Act, 2005
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2">
              <span>Order Dispatch Ref: <strong>{reportRef}</strong></span>
              <span>Assessment Date: <strong>{reportDate}</strong></span>
            </div>
          </div>

          {/* Habitation Profile */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              1. Vulnerable Habitation Demographics & Hydro-Telemetry
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs p-2">
              <div>
                <span className="text-slate-500 block">Habitation / Panchayat:</span>
                <strong className="text-slate-900 text-sm">{village.name}</strong>
                <span className="text-[10px] text-slate-500 block">{village.localBodyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Population:</span>
                <strong className="text-slate-900 text-sm">{village.population.toLocaleString()} persons</strong>
                <span className="text-[10px] text-slate-500 block">({village.households} households)</span>
              </div>
              <div>
                <span className="text-slate-500 block">ML Inundation Risk:</span>
                <strong
                  className={`text-sm ${
                    riskCategory === 'Critical' ? 'text-red-700 font-bold' : 'text-slate-900'
                  }`}
                >
                  {mlProb}% ({riskCategory.toUpperCase()})
                </strong>
                <span className="text-[10px] text-slate-500 block">Baseline Score: {village.baselineRiskScore}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block">Polder / Padasekharam:</span>
                <strong className="text-slate-900">{village.polderName}</strong>
                <span className="text-[10px] text-slate-500 block">{village.elevationM}m MSL elevation</span>
              </div>
              <div>
                <span className="text-slate-500 block">Immediate Evacuation Demand:</span>
                <strong className="text-red-700 uppercase font-bold">{evacDemand.toLocaleString()} persons</strong>
                <span className="text-[10px] text-slate-500 block">Relocation Priority: {village.relocationPriority}</span>
              </div>
              <div>
                <span className="text-slate-500 block">River Gauge Reading:</span>
                <span className="font-mono text-slate-700">
                  {village.riverWaterLevelM}m MSL (Danger: {village.dangerWaterLevelM}m)
                </span>
                <span className="text-[10px] text-slate-500 block">24h Rain: {village.latestRainfall24hMm}mm</span>
              </div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              2. Scientific Inundation & Carrying Capacity Parameters
            </h2>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-2">Hydrological / Topographic Factor</th>
                  <th className="p-2">Observed Telemetry</th>
                  <th className="p-2">Evaluation Benchmark</th>
                  <th className="p-2">Status Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium">Ground Elevation relative to MSL</td>
                  <td className="p-2 font-mono font-bold text-slate-900">{village.elevationM} m MSL</td>
                  <td className="p-2 text-slate-500">&lt; 0.0 m MSL (Below Sea Level)</td>
                  <td className="p-2 text-red-700 font-semibold">Severe Depressive Polder</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">24-Hour Precipitation (IMD Station)</td>
                  <td className="p-2 font-mono font-bold text-slate-900">{village.latestRainfall24hMm} mm</td>
                  <td className="p-2 text-slate-500">&gt; 100 mm warning / 150 mm danger</td>
                  <td className="p-2 text-amber-700 font-semibold">{village.latestRainfall24hMm >= 150 ? 'Extremely Heavy' : 'Heavy'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Pamba River Gauge Stage (CWC)</td>
                  <td className="p-2 font-mono font-bold text-slate-900">{village.riverWaterLevelM} m MSL</td>
                  <td className="p-2 text-slate-500">Danger Mark: {village.dangerWaterLevelM} m MSL</td>
                  <td className="p-2 text-red-700 font-semibold">{village.riverWaterLevelM >= village.dangerWaterLevelM ? 'Above Danger Mark' : 'Approaching Warning'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Earthen Outer Bund Breach Probability</td>
                  <td className="p-2 font-mono font-bold text-slate-900">{village.bundBreachRiskPct}%</td>
                  <td className="p-2 text-slate-500">&gt; 50% structural risk</td>
                  <td className="p-2 text-red-700 font-semibold">{village.bundBreachRiskPct >= 70 ? 'High Hydraulic Failure Risk' : 'Moderate Stress'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Historical Inundation Frequency</td>
                  <td className="p-2 font-mono font-bold text-slate-900">{village.historicalFloodCount} flood deluges</td>
                  <td className="p-2 text-slate-500">Official KSDMA flood logs 2005–2025</td>
                  <td className="p-2 text-slate-700">Chronological Recurrence Confirmed</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Relocation Destination Details */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              3. Designated Safe Sanctuary & Carrying Capacity Allocation
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs p-2">
              <div>
                <span className="text-slate-500 block">Designated Safe Site:</span>
                <strong className="text-slate-900 text-sm">{site.name}</strong>
                <span className="text-[10px] text-slate-500 block">Elev: +{site.elevationM}m MSL (Highland)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location & Taluk:</span>
                <span className="text-slate-800 font-medium">{site.locationName}</span>
                <span className="text-[10px] text-slate-500 block">Taluk: {site.taluk}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Available Carrying Capacity:</span>
                <strong className="text-emerald-700 text-sm font-bold">{availableCap.toLocaleString()} persons</strong>
                <span className="text-[10px] text-slate-500 block">(Max: {site.maxCapacity.toLocaleString()} | Occupied: {site.currentPopulation.toLocaleString()})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Road Connectivity:</span>
                <strong className="text-slate-900">{site.roadAccess} Road</strong>
                <span className="text-[10px] text-slate-500 block">{site.shelterStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Potable Water Reserve:</span>
                <strong className="text-slate-900">{site.drinkingWaterLpd.toLocaleString()} L/day</strong>
                <span className="text-[10px] text-slate-500 block">Sphere Standard (15L/person/day)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sanitation & Medical:</span>
                <strong className="text-slate-900">{site.sanitationToilets} Bio-Toilets</strong>
                <span className="text-[10px] text-slate-500 block">
                  {site.medicalStaffPresent ? 'Medical Staff on Duty' : 'PHC Linkage'}
                </span>
              </div>
            </div>
          </div>

          {/* Evacuation Route & Transit Instructions */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              4. Operational Transit Logistics & Route Conduit
            </h2>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs text-slate-800">
              <div>
                <strong>Assembly Staging Post:</strong> {village.evacuationRoute?.assemblyPoint || 'Panchayat Jetty'}
              </div>
              <div>
                <strong>Transit Flotilla:</strong> {village.evacuationRoute?.transitMode || 'Waterway Inland Transit'} (SWTD Steel Passenger Craft & NDRF IRBs)
              </div>
              <div>
                <strong>Primary Backwater Corridor:</strong> {village.evacuationRoute?.primaryRouteName || 'National Waterway 3 / Pamba Canal Channel'}
              </div>
              <div>
                <strong>Corridor Warning / Notes:</strong> {village.evacuationRoute?.routeStatus || 'Clear inland transit route'}
              </div>
            </div>
          </div>

          {/* Algorithmic Suitability Verdict */}
          <div className="p-4 rounded-lg border border-slate-300 bg-slate-50/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Evaluation Verdict:{' '}
                <span className={result.isSuitable ? 'text-emerald-700' : 'text-red-700'}>
                  {result.verdict}
                </span>
              </span>
              <span className="font-bold">Suitability Score: {result.suitabilityScore}/100</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{result.verdictSummary}</p>
          </div>

          {/* Signatures & Execution block */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
            <div className="border-t border-slate-400 pt-2 text-center space-y-1">
              <div className="font-bold text-slate-900">Disaster Assessment Officer</div>
              <div className="text-slate-500">Kuttanad Taluk Emergency Operations Centre (TEOC)</div>
            </div>
            <div className="border-t border-slate-400 pt-2 text-center space-y-1">
              <div className="font-bold text-slate-900">District Collector & Chairperson, DDMA</div>
              <div className="text-slate-500">District Emergency Operations Centre (DEOC), Alappuzha</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
