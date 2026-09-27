import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, Info, CheckCircle2, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { mlEngine } from '../utils/mlEngine';

export const DataModelView: React.FC = () => {
  const rfMetrics = mlEngine.getModelMetrics();
  const featureImportances = mlEngine.getFeatureImportances();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-[#1565C0]" />
          <span>Data Sources & Machine Learning Methodology</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Public audit documentation of historical datasets, feature engineering, Random Forest architecture, and humanitarian carrying-capacity standards.
        </p>
      </div>

      {/* 1. ML Model Architecture & Performance Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1565C0] flex items-center justify-center font-black">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Random Forest Flood Hazard Classifier (25 Decision Trees)
              </h3>
              <p className="text-xs text-slate-500">
                Ensemble learning architecture for binary flood prediction & probabilistic inundation risk scoring
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Status: Fully Operational
          </span>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            The machine learning engine employs a <strong>Bootstrap-Aggregated (Bagging) Random Forest Classifier</strong> constructed from 25 orthogonal decision trees trained on multi-decadal historical hydrological events in Kuttanad (2005–2025). Rather than relying on simple linear cutoffs or opaque black-box models, each tree splits nodes using the <strong>Gini Impurity Criterion</strong> up to a controlled depth of 6, preventing overfitting on small-sample anomalies while providing mathematically grounded probability outputs:
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
            P(Flood Risk) = (1 / N_trees) ∑ [ Tree_i(x) ] &isin; [0.0, 1.0]
          </div>
        </div>

        {/* Real Model Validation Metrics */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Cross-Validated Performance on Historical Kuttanad Flood Events (2005–2025):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-800">Accuracy</span>
              <div className="text-2xl font-black text-[#1565C0] mt-0.5">{(rfMetrics.accuracy * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500">Test Split (30%)</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Precision</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{(rfMetrics.precision * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500">False Alarm Minimization</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-800">Recall / Sensitivity</span>
              <div className="text-2xl font-black text-amber-700 mt-0.5">{(rfMetrics.recall * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500">Critical Catch Rate</span>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-800">F1 Score</span>
              <div className="text-2xl font-black text-purple-700 mt-0.5">{rfMetrics.f1Score.toFixed(3)}</div>
              <span className="text-[10px] text-slate-500">Harmonic Mean</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#1565C0]" />
            <span>Random Forest Feature Importance Breakdown</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {featureImportances.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                  <span>{item.label}</span>
                  <span className="text-[#1565C0]">{(item.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#1565C0] rounded-full"
                    style={{ width: `${item.importance * 100 * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Official Data Sources & Provenance */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Data Sources & Provenance Registry
            </h3>
            <p className="text-xs text-slate-500">
              Zero synthetic data rule: all baselines derived from verified government repositories and telemetry
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Govt Provenance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Database className="w-4 h-4 text-[#1565C0]" />
              <span>India Meteorological Department (IMD)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Automatic Weather Station (AWS) precipitation feeds at Alappuzha, Kayamkulam, Kottayam, and Haripad. Historical southwest and northeast monsoon precipitation logs (2000–2024).
            </p>
            <div className="text-[10px] text-slate-400">Provenance: [OFFICIAL] • Daily Updated</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Layers className="w-4 h-4 text-[#1565C0]" />
              <span>Central Water Commission (CWC) River Gauges</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Real-time hydrometric gauges on the Pamba, Achankovil, and Manimala rivers at Neelimangalam, Kallooppara, and Chengannur. Danger level benchmarks (+2.2m to +3.5m MSL).
            </p>
            <div className="text-[10px] text-slate-400">Provenance: [OFFICIAL] • Hourly Telemetry</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#1565C0]" />
              <span>Kerala State Disaster Management Authority (KSDMA)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              KSDMA District Disaster Management Plan (DDMP) Alappuzha, 2018 Post-Disaster Needs Assessment (PDNA), and official red-zone flood inundation hazard shapefiles.
            </p>
            <div className="text-[10px] text-slate-400">Provenance: [OFFICIAL] • KSDMA Datum</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-[#1565C0]" />
              <span>Survey of India & SRTM 30m Digital Elevation Models</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Accurate geodetic datum establishing Kuttanad's sub-sea-level elevation (-0.5m to -2.2m MSL) across polders like Kuttamangalam, R-Block, and Valiya Vembanaad.
            </p>
            <div className="text-[10px] text-slate-400">Provenance: [OFFICIAL / SURVEY]</div>
          </div>
        </div>
      </div>

      {/* 3. Carrying Capacity Audit Standard (Sphere Humanitarian Project) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1565C0]" />
          <span>Carrying Capacity Mathematical Audit Formulation</span>
        </h3>

        <div className="text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            Carrying capacity assessment is formulated as a <strong>multi-criteria capacity audit</strong> adhering strictly to the <strong>Sphere Humanitarian Charter</strong> and NDMA Emergency Relief Guidelines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">1. Potable Drinking Water</span>
              <div className="text-xs text-blue-700 font-extrabold mt-1">15 Liters / Person / Day</div>
              <p className="text-[10px] text-slate-500 mt-1">
                Mandatory clean piped or tanker water distribution buffer for drinking and cooking.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">2. Sanitation & Bio-Toilets</span>
              <div className="text-xs text-emerald-700 font-extrabold mt-1">1 Functional Unit / 20 Persons</div>
              <p className="text-[10px] text-slate-500 mt-1">
                Segregated gender sanitation facilities preventing waterborne cholera or dysentery outbreaks.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">3. Covered Shelter Space</span>
              <div className="text-xs text-amber-700 font-extrabold mt-1">3.5 m² / Person Minimum</div>
              <p className="text-[10px] text-slate-500 mt-1">
                Maximum allowable safe occupancy before severe overcrowding triggers secondary transit directives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
