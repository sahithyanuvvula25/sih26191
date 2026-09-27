import React from 'react';
import { Village, SafeSite } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mlEngine } from '../utils/mlEngine';
import { Cpu, BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface AnalyticsViewProps {
  villages: Village[];
  safeSites: SafeSite[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ villages, safeSites }) => {
  // Chart 1: Habitations by ML Risk Category
  const riskCategories = ['Critical', 'High', 'Moderate', 'Low'] as const;
  const dataRiskLevel = riskCategories.map((cat) => ({
    category: cat,
    count: villages.filter((v) => v.mlPrediction.riskCategory === cat).length,
    color:
      cat === 'Critical'
        ? '#DC2626'
        : cat === 'High'
        ? '#D97706'
        : cat === 'Moderate'
        ? '#2563EB'
        : '#16A34A',
  }));

  // Chart 2: Carrying Capacity Deficits vs Local Capacity across Top Polders
  const dataCapacity = [...villages]
    .sort((a, b) => b.carryingCapacity.capacityDeficit - a.carryingCapacity.capacityDeficit)
    .slice(0, 6)
    .map((v) => ({
      name: v.name,
      evacRequired: v.carryingCapacity.populationRequiringEvacuation,
      localCapacity: v.carryingCapacity.availableSafeCapacity,
      deficit: v.carryingCapacity.capacityDeficit,
    }));

  // Chart 3: Elevation Profile (Below Sea Level in Kuttanad)
  const dataElevation = [...villages]
    .sort((a, b) => a.elevationM - b.elevationM)
    .map((v) => ({
      name: v.name,
      elevation: v.elevationM,
      prob: Math.round(v.mlPrediction.predictedProbability * 100),
    }));

  // Chart 4: Random Forest Feature Importances
  const featureImportances = mlEngine.getFeatureImportances();
  const dataFeatures = featureImportances.map((item) => ({
    feature: item.feature,
    pct: Math.round(item.importance * 100),
  }));

  const totalPeopleToEvac = villages.reduce(
    (sum, v) => sum + v.carryingCapacity.populationRequiringEvacuation,
    0
  );
  const totalLocalDeficit = villages.reduce(
    (sum, v) => sum + v.carryingCapacity.capacityDeficit,
    0
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#1565C0]" />
          <span>Kuttanad Inundation Analytics & Demographics</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Consolidated empirical distributions across the 12 evaluated Kuttanad polder habitations and safe sanctuaries.
        </p>
      </div>

      {/* 4 Clean Analytical Charts in 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: ML Flood Inundation Risk Classification */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>1. Habitations by Random Forest Risk Level</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                25 Decision Trees
              </span>
            </h3>
            <p className="text-xs text-slate-500">Distribution across probabilistic hazard categories.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataRiskLevel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} habitations`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#CBD5E1', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {dataRiskLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>Critical: <strong>{villages.filter((v) => v.mlPrediction.riskCategory === 'Critical').length}</strong></span>
            <span>High: <strong>{villages.filter((v) => v.mlPrediction.riskCategory === 'High').length}</strong></span>
            <span>Moderate: <strong>{villages.filter((v) => v.mlPrediction.riskCategory === 'Moderate').length}</strong></span>
            <span>Low: <strong>{villages.filter((v) => v.mlPrediction.riskCategory === 'Low').length}</strong></span>
          </div>
        </div>

        {/* Chart 2: Carrying Capacity Deficits by Polder */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>2. Evacuation Cohort vs Local Shelter Capacity</span>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Deficit Analysis
              </span>
            </h3>
            <p className="text-xs text-slate-500">Comparing required evacuation population vs local polder shelter limits.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCapacity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val.toLocaleString()} persons`,
                    name === 'evacRequired' ? 'Evacuation Needed' : 'Local Shelter Max'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#CBD5E1', fontSize: 12 }}
                />
                <Bar dataKey="evacRequired" fill="#DC2626" radius={[4, 4, 0, 0]} name="evacRequired" />
                <Bar dataKey="localCapacity" fill="#1565C0" radius={[4, 4, 0, 0]} name="localCapacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span className="text-red-700 font-bold">Total Evacuation Need: {totalPeopleToEvac.toLocaleString()}</span>
            <span className="text-slate-600 font-medium">Local Net Deficit: -{totalLocalDeficit.toLocaleString()}</span>
          </div>
        </div>

        {/* Chart 3: Topographic Elevation (Sub-Sea-Level Profile) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">3. Elevation Profile Across Kuttanad Polders</h3>
            <p className="text-xs text-slate-500">Meters relative to Mean Sea Level (Survey of India Datum).</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataElevation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={45} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[-2.5, 0.5]} />
                <Tooltip
                  formatter={(val: any) => [`${val} m MSL`, 'Elevation']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#CBD5E1', fontSize: 12 }}
                />
                <Bar dataKey="elevation" fill="#0D47A1" radius={[2, 2, 2, 2]}>
                  {dataElevation.map((entry, index) => (
                    <Cell key={`elev-${index}`} fill={entry.elevation < -1.0 ? '#DC2626' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Polders below -1.0m MSL (Red) experience immediate submerged backwater pressure during monsoon tides.
          </div>
        </div>

        {/* Chart 4: Random Forest Feature Importance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>4. Random Forest Feature Importance</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Gini Metric
              </span>
            </h3>
            <p className="text-xs text-slate-500">Gini impurity reduction contribution across all decision trees.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFeatures} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" unit="%" tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 30]} />
                <YAxis dataKey="feature" type="category" tick={{ fill: '#475569', fontSize: 10 }} width={80} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderColor: '#CBD5E1', fontSize: 12 }}
                />
                <Bar dataKey="pct" fill="#1565C0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Elevation MSL (24%) and Polder Dyke Breach Risk (22%) represent the primary predictive weights.
          </div>
        </div>
      </div>
    </div>
  );
};
