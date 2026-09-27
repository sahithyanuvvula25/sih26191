import React, { useState } from 'react';
import { Village, RiskCategory } from '../types';
import { Search, Filter, ArrowUpDown, Cpu, AlertTriangle, ArrowRight } from 'lucide-react';

interface VillagesViewProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
  onNavigateToSimulation?: (village: Village) => void;
}

export const VillagesView: React.FC<VillagesViewProps> = ({
  villages,
  onSelectVillage,
  onNavigateToSimulation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskCategory>('All');
  const [sortBy, setSortBy] = useState<'mlRisk' | 'population' | 'name' | 'elevation'>('mlRisk');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredVillages = villages.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        v.name.toLowerCase().includes(q) ||
        v.polderName.toLowerCase().includes(q) ||
        v.localBodyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (riskFilter !== 'All' && v.mlPrediction.riskCategory !== riskFilter) {
      return false;
    }
    return true;
  });

  filteredVillages.sort((a, b) => {
    if (sortBy === 'mlRisk') {
      return sortOrder === 'desc'
        ? b.mlPrediction.predictedProbability - a.mlPrediction.predictedProbability
        : a.mlPrediction.predictedProbability - b.mlPrediction.predictedProbability;
    }
    if (sortBy === 'elevation') {
      // Lower elevation is more dangerous (more negative)
      return sortOrder === 'desc'
        ? a.elevationM - b.elevationM
        : b.elevationM - a.elevationM;
    }
    if (sortBy === 'population') {
      return sortOrder === 'desc'
        ? b.population - a.population
        : a.population - b.population;
    }
    return sortOrder === 'desc'
      ? b.name.localeCompare(a.name)
      : a.name.localeCompare(b.name);
  });

  const toggleSort = (col: 'mlRisk' | 'population' | 'name' | 'elevation') => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Kuttanad Habitations & Polder Units</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0D47A1] font-bold border border-blue-200">
              12 Habitations Assessed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate inundation probability, sub-sea-level elevation, carrying capacity deficits, and designated evacuation corridors.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Showing {filteredVillages.length} of {villages.length} local bodies
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search village, polder (e.g. Kainakary, Kuttamangalam)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">ML Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical (&ge;75% ML Risk)</option>
              <option value="High">High (50–74%)</option>
              <option value="Moderate">Moderate (25–49%)</option>
              <option value="Low">Low (&lt;25%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Habitations Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Habitation & Polder</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('elevation')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Elevation (MSL)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('population')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Population</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('mlRisk')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ML Inundation Prob</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Evacuation Needed</th>
                <th className="py-3 px-4">Local Capacity Deficit</th>
                <th className="py-3 px-4">Designated Sanctuary</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVillages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No habitations match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVillages.map((v) => {
                  const isCritical = v.mlPrediction.riskCategory === 'Critical';
                  const isHigh = v.mlPrediction.riskCategory === 'High';
                  const probPct = Math.round(v.mlPrediction.predictedProbability * 100);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => onSelectVillage(v)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {v.name === 'Kainakary' && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-[#0D47A1]">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{v.polderName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-red-600 font-mono">
                          {v.elevationM}m MSL
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {v.population.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black ${
                              isCritical ? 'text-[#DC2626]' : isHigh ? 'text-amber-700' : 'text-slate-800'
                            }`}
                          >
                            {probPct}%
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isCritical
                                ? 'bg-red-50 text-[#DC2626] border border-red-200'
                                : isHigh
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-[#1565C0] border border-blue-200'
                            }`}
                          >
                            {v.mlPrediction.riskCategory.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {v.carryingCapacity.populationRequiringEvacuation.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                          -{v.carryingCapacity.capacityDeficit.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate" title={v.evacuationRoute.designatedReliefShelterName}>
                        {v.evacuationRoute.designatedReliefShelterName}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVillage(v);
                          }}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-[#0D47A1] text-white hover:bg-[#1565C0] transition-colors cursor-pointer shadow-xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
