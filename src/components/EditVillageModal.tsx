import React, { useState } from 'react';
import { Village, RiskCategory } from '../types';
import { mlEngine, FeatureKey } from '../utils/mlEngine';
import { X, RefreshCw, Cpu, AlertTriangle } from 'lucide-react';

interface EditVillageModalProps {
  village: Village;
  onSave: (updatedVillage: Village) => void;
  onClose: () => void;
}

export const EditVillageModal: React.FC<EditVillageModalProps> = ({
  village,
  onSave,
  onClose,
}) => {
  const [population, setPopulation] = useState(village.population);
  const [latestRainfall24hMm, setLatestRainfall24hMm] = useState(village.latestRainfall24hMm);
  const [riverWaterLevelM, setRiverWaterLevelM] = useState(village.riverWaterLevelM);
  const [bundBreachRiskPct, setBundBreachRiskPct] = useState(village.bundBreachRiskPct);
  const [elevationM, setElevationM] = useState(village.elevationM);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const features: Record<FeatureKey, number> = {
      monsoonRainfallMm: village.latestMonsoonRainfallMm,
      max24hRainfallMm: Number(latestRainfall24hMm),
      rainfallAnomalyPct: village.rainfallAnomalyPct,
      riverWaterLevelM: Number(riverWaterLevelM),
      elevationM: Number(elevationM),
      distanceToWaterbodyM: village.distanceToWaterbodyM,
      drainageDensity: village.drainageDensity,
      bundBreachRiskPct: Number(bundBreachRiskPct),
      historicalFloodCount: village.historicalFloodCount,
    };

    const newPrediction = mlEngine.predictVillage(features);
    const pop = Number(population) || village.population;
    const evacRatio = newPrediction.predictedProbability >= 0.75 ? 0.75 : newPrediction.predictedProbability >= 0.50 ? 0.50 : 0.25;
    const evacPopulation = Math.round(pop * evacRatio);
    const localAvailable = village.carryingCapacity.availableSafeCapacity;
    const deficit = Math.max(0, evacPopulation - localAvailable);

    let relocationPriority: 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Monitor' = 'Monitor';
    let relocationRequired = false;
    if (newPrediction.riskCategory === 'Critical') {
      relocationPriority = 'Immediate';
      relocationRequired = true;
    } else if (newPrediction.riskCategory === 'High') {
      relocationPriority = 'Short-Term';
      relocationRequired = true;
    } else if (newPrediction.riskCategory === 'Moderate') {
      relocationPriority = 'Medium-Term';
    }

    const updated: Village = {
      ...village,
      population: pop,
      latestRainfall24hMm: Number(latestRainfall24hMm),
      riverWaterLevelM: Number(riverWaterLevelM),
      bundBreachRiskPct: Number(bundBreachRiskPct),
      elevationM: Number(elevationM),
      mlPrediction: newPrediction,
      relocationPriority,
      relocationRequired,
      carryingCapacity: {
        ...village.carryingCapacity,
        populationRequiringEvacuation: evacPopulation,
        capacityDeficit: deficit,
        potableWaterLpdRequired: evacPopulation * 15,
        sanitationUnitsRequired: Math.ceil(evacPopulation / 20),
      },
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800 animate-in zoom-in-95">
        <div className="bg-[#0D47A1] text-white px-5 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-200" />
              <span>Update Hydrological & Demographics: {village.name}</span>
            </h3>
            <p className="text-[11px] text-blue-200">
              Polder: {village.polderName} • Run Random Forest inference on update.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Polder Population:
              </label>
              <input
                type="number"
                min="500"
                max="25000"
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#1565C0] font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Elevation (Meters MSL):
              </label>
              <input
                type="number"
                step="0.1"
                min="-3.0"
                max="2.0"
                value={elevationM}
                onChange={(e) => setElevationM(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#1565C0] font-semibold font-mono"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>Hydrological Telemetry Inputs:</span>
              <span className="text-[10px] text-slate-500 font-normal">Real-time CWC/IMD sync</span>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                <span>24-Hour Rainfall (mm):</span>
                <strong className="text-[#1565C0]">{latestRainfall24hMm} mm</strong>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                value={latestRainfall24hMm}
                onChange={(e) => setLatestRainfall24hMm(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#1565C0]"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                <span>Pamba River Gauge (m MSL):</span>
                <strong className="text-[#1565C0]">{riverWaterLevelM} m MSL</strong>
              </div>
              <input
                type="range"
                step="0.05"
                min="1.0"
                max="3.5"
                value={riverWaterLevelM}
                onChange={(e) => setRiverWaterLevelM(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#1565C0]"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                <span>Polder Outer Bund Breach Risk:</span>
                <strong className={bundBreachRiskPct >= 70 ? 'text-red-600' : 'text-[#1565C0]'}>
                  {bundBreachRiskPct}%
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bundBreachRiskPct}
                onChange={(e) => setBundBreachRiskPct(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#1565C0]"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-estimate ML Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
