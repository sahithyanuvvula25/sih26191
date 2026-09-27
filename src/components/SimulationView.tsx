import React, { useState } from 'react';
import { Village, SafeSite, SimulationParams } from '../types';
import { mlEngine } from '../utils/mlEngine';
import { Sliders, RefreshCw, AlertTriangle, ArrowRight, ShieldAlert, Users, Droplets, Waves, CheckCircle2 } from 'lucide-react';

interface SimulationViewProps {
  villages: Village[];
  safeSites: SafeSite[];
  onSelectVillage: (village: Village) => void;
  onNavigateToPlanning: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  villages,
  safeSites,
  onSelectVillage,
  onNavigateToPlanning,
}) => {
  // Scenario simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    rainfallIncreasePct: 20, // +20% rainfall scenario default as requested
    riverWaterLevelIncreaseM: 0.4, // +0.4m Pamba water level rise
    polderBundBreachSimulated: false,
    shelterCapacityChangePct: 0,
    acRoadBlocked: false,
  });

  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    villages.find(v => v.name === 'Kainakary')?.id || villages[0].id
  );

  const selectedVillage = villages.find(v => v.id === selectedVillageId) || villages[0];

  // Run simulation through the Random Forest Classifier
  const baseFeatures = {
    monsoonRainfallMm: selectedVillage.latestMonsoonRainfallMm,
    max24hRainfallMm: selectedVillage.latestRainfall24hMm,
    rainfallAnomalyPct: selectedVillage.rainfallAnomalyPct,
    riverWaterLevelM: selectedVillage.riverWaterLevelM,
    elevationM: selectedVillage.elevationM,
    distanceToWaterbodyM: selectedVillage.distanceToWaterbodyM,
    drainageDensity: selectedVillage.drainageDensity,
    bundBreachRiskPct: selectedVillage.bundBreachRiskPct,
    historicalFloodCount: selectedVillage.historicalFloodCount,
  };

  const simulationResult = mlEngine.simulateScenario(baseFeatures, params);
  const basePrediction = selectedVillage.mlPrediction;
  const simPrediction = simulationResult.prediction;

  // Recalculate Carrying Capacity under simulated scenario
  const simPopRequiringEvac = simPrediction.riskCategory === 'Critical'
    ? Math.round(selectedVillage.population * 0.65 + selectedVillage.vulnerablePopulation * 0.35)
    : simPrediction.riskCategory === 'High'
    ? Math.round(selectedVillage.population * 0.45 + selectedVillage.vulnerablePopulation * 0.35)
    : Math.round(selectedVillage.vulnerablePopulation * 0.30);

  const localCapacity = selectedVillage.carryingCapacity.availableSafeCapacity;
  const simCapacityDeficit = Math.max(0, simPopRequiringEvac - localCapacity);

  const handleReset = () => {
    setParams({
      rainfallIncreasePct: 0,
      riverWaterLevelIncreaseM: 0,
      polderBundBreachSimulated: false,
      shelterCapacityChangePct: 0,
      acRoadBlocked: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1565C0]" />
            <span>Kuttanad Flood What-If Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate extreme monsoon surges, polder bund breaches, and infrastructure blockages through the Random Forest engine.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Main Simulation Layout: Controls (left) vs Impact Assessment (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parameter Controls (5 of 12 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Simulation Parameters
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Live Re-Inference
            </span>
          </div>

          {/* Select Village to Simulate */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Select Habitation / Polder Unit
            </label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#1565C0]"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.elevationM}m MSL • {v.polderName})
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Rainfall Anomaly Increase */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Rainfall Intensity Surge</span>
              </span>
              <span className="text-blue-700 font-extrabold">
                {params.rainfallIncreasePct > 0 ? `+${params.rainfallIncreasePct}%` : 'Baseline'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={params.rainfallIncreasePct}
              onChange={(e) => setParams({ ...params, rainfallIncreasePct: Number(e.target.value) })}
              className="w-full accent-[#1565C0] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Current)</span>
              <span>+20% (IMD Heavy Alert)</span>
              <span>+50% (2018 Deluge Level)</span>
            </div>
          </div>

          {/* Slider 2: River Water Level Rise */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                <span>Pamba River Gauge Rise</span>
              </span>
              <span className="text-blue-700 font-extrabold">
                {params.riverWaterLevelIncreaseM > 0 ? `+${params.riverWaterLevelIncreaseM.toFixed(1)}m` : 'Current'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.1}
              value={params.riverWaterLevelIncreaseM}
              onChange={(e) => setParams({ ...params, riverWaterLevelIncreaseM: Number(e.target.value) })}
              className="w-full accent-[#1565C0] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.0m (2.75m MSL)</span>
              <span>+0.5m (Flood Spill)</span>
              <span>+1.5m (Overtopping)</span>
            </div>
          </div>

          {/* Toggle 1: Polder Outer Bund Breach */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={params.polderBundBreachSimulated}
                onChange={(e) => setParams({ ...params, polderBundBreachSimulated: e.target.checked })}
                className="mt-0.5 accent-red-600 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span>Simulate Polder Outer Bund Breach</span>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                    High Impact
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Simulates catastrophic collapse of outer earthen dykes ({selectedVillage.polderName}), causing immediate inflow of lake waters.
                </div>
              </div>
            </label>
          </div>

          {/* Toggle 2: AC Road Blocked */}
          <div>
            <label className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={params.acRoadBlocked}
                onChange={(e) => setParams({ ...params, acRoadBlocked: e.target.checked })}
                className="mt-0.5 accent-amber-600 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  Simulate AC Road Waterlogging / Inaccessibility
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Simulates complete submergence of Alappuzha-Changanassery Highway, disabling land vehicular transit and requiring SWTD water rescue.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Before vs After Impact Assessment (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Comparison Card: Baseline vs Simulated */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Scenario Impact: {selectedVillage.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Polder: {selectedVillage.polderName} • Elevation: {selectedVillage.elevationM}m MSL
                </p>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Random Forest Re-Evaluated
              </span>
            </div>

            {/* Before vs After Metric Comparison Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Baseline Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Current Baseline
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">
                    {Math.round(basePrediction.predictedProbability * 100)}%
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {basePrediction.riskCategory}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <div>24h Rain: <strong>{selectedVillage.latestRainfall24hMm} mm</strong></div>
                  <div>River Gauge: <strong>{selectedVillage.riverWaterLevelM} m MSL</strong></div>
                  <div>Evac Required: <strong>{selectedVillage.carryingCapacity.populationRequiringEvacuation.toLocaleString()}</strong></div>
                  <div>Shelter Deficit: <strong className="text-red-600">-{selectedVillage.carryingCapacity.capacityDeficit.toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Simulated Scenario Box */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center justify-between">
                  <span>Simulated Scenario</span>
                  <span className="text-[9px] font-bold bg-red-200/70 text-red-900 px-1.5 py-0.2 rounded">
                    +Scenario
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-600">
                    {Math.round(simPrediction.predictedProbability * 100)}%
                  </span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                    {simPrediction.riskCategory}
                  </span>
                </div>
                <div className="text-[11px] text-red-900 space-y-1 pt-2 border-t border-red-200">
                  <div>Simulated 24h Rain: <strong>{simulationResult.simulatedFeatures.max24hRainfallMm} mm</strong></div>
                  <div>Simulated River: <strong>{simulationResult.simulatedFeatures.riverWaterLevelM} m MSL</strong></div>
                  <div>Evac Required: <strong>{simPopRequiringEvac.toLocaleString()}</strong></div>
                  <div>Shelter Deficit: <strong className="text-red-700">-{simCapacityDeficit.toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            {/* Carrying Capacity Deficit Alert */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Carrying Capacity Deficit Under This Scenario: -{simCapacityDeficit.toLocaleString()} Persons</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Local polder community shelters can only sustain {localCapacity} persons before emergency failure. The simulated scenario creates a net deficit of <strong>{simCapacityDeficit.toLocaleString()} residents</strong> who must be immediately evacuated to elevated relief centers on higher terrain.
              </p>
            </div>

            {/* Recommended Action Directives under Scenario */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Triggered Administrative Directives
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-bold text-slate-900">
                      {params.acRoadBlocked ? 'Waterborne Inland Evacuation Protocol' : 'Combined Waterway & Highway Convoy'}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {params.acRoadBlocked
                        ? 'AC Road disabled. Requisition 18 State Water Transport Dept (SWTD) double-decker passenger launches at Pallathuruthy and Kuppappuram.'
                        : 'Deploy KSRTC high-axle emergency buses along AC Road corridor towards Changanassery Highland.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-bold text-slate-900">
                      Sanctuary Allocation Target: Changanassery & Alappuzha Town
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Direct {Math.min(2850, simCapacityDeficit)} evacuees to Changanassery St. Berchmans Campus (+11.5m MSL) and the remainder to Alappuzha SDV Centenary Center (+2.8m MSL).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onSelectVillage(selectedVillage)}
                className="flex-1 py-2 rounded-lg bg-[#0D47A1] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
              >
                Inspect Full Habitation Profile
              </button>
              <button
                onClick={onNavigateToPlanning}
                className="px-4 py-2 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Relocation Directives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
