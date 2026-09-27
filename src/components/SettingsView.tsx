import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Bell,
  MapPin,
  Layers,
  Database,
  CheckCircle2,
  Save,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  Radio,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [rainfallThreshold, setRainfallThreshold] = useState<number>(150);
  const [gaugeAlertOffset, setGaugeAlertOffset] = useState<number>(0.2);
  const [bundBreachThreshold, setBundBreachThreshold] = useState<number>(70);
  const [baseMapProvider, setBaseMapProvider] = useState<string>('osm');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(60);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Government GIS Decision Support System Settings
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              KSDMA Administration Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure hydrological telemetry warning limits, spatial basemap providers, and disaster protocol automation.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Preferences</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated successfully for Alappuzha District Disaster Emergency Operation Center (DEOC).</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Hydrological Warning Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">Hazard & Disaster Alert Thresholds</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                24-Hour Rainfall Extreme Warning Level: <span className="font-bold text-blue-700">{rainfallThreshold} mm</span>
              </label>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={rainfallThreshold}
                onChange={(e) => setRainfallThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Triggers immediate orange alert flag across Kuttanad rain gauges.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                River Gauge Warning Margin Above Danger Level: <span className="font-bold text-red-700">+{gaugeAlertOffset} m MSL</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={gaugeAlertOffset}
                onChange={(e) => setGaugeAlertOffset(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Distance to danger level at Pamba / Manimala river stations before sounding public sirens.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Polder Bund Breach Hydraulic Stress Cutoff: <span className="font-bold text-amber-700">{bundBreachThreshold}%</span>
              </label>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={bundBreachThreshold}
                onChange={(e) => setBundBreachThreshold(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Habitations exceeding this threshold are automatically categorized as Relocation Priority "Immediate".
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Spatial GIS & Basemap Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Spatial GIS & Basemap Configuration</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1.5">
                Default Web GIS Basemap Provider:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'osm', name: 'OpenStreetMap Carto (Survey of India datum)' },
                  { id: 'carto', name: 'CartoDB Positron High-Contrast Light' },
                  { id: 'hybrid', name: 'Bhuvan ISRO / Topographic Contour Layer' },
                ].map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="basemap"
                      checked={baseMapProvider === p.id}
                      onChange={() => setBaseMapProvider(p.id)}
                      className="accent-blue-600"
                    />
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Sensor Telemetry Polling Cycle:
              </label>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value={30}>Every 30 seconds (High Water Inflow Mode)</option>
                <option value={60}>Every 1 minute (Standard Monsoon Protocol)</option>
                <option value={300}>Every 5 minutes (Off-Monsoon Normal Mode)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Study Area & Jurisdictional Boundaries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Study Area & Jurisdiction Defaults</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[11px] block">State</span>
                <input
                  type="text"
                  readOnly
                  value="Kerala"
                  className="w-full mt-0.5 p-2 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">District</span>
                <input
                  type="text"
                  readOnly
                  value="Alappuzha"
                  className="w-full mt-0.5 p-2 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Taluk Focus Basin</span>
              <input
                type="text"
                readOnly
                value="Kuttanad (12 Wetland Habitations & Polders)"
                className="w-full mt-0.5 p-2 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
              Spatial extent is fixed to Kuttanad Wetland Basin coordinates (8.5°N - 10.0°N, 76.0°E - 77.0°E) in accordance with Kerala State Land Use Board datum.
            </div>
          </div>
        </div>

        {/* Section 4: Telemetry Feed Status & Verification */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Radio className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">External Sensor & API Telemetry Status</h2>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                source: 'India Meteorological Department (IMD)',
                channel: 'Alappuzha AWS 24h Rainfall Feed',
                status: 'ONLINE',
                latency: '42ms',
              },
              {
                source: 'Central Water Commission (CWC)',
                channel: 'Pamba & Manimala River Stage Gauges',
                status: 'ONLINE',
                latency: '68ms',
              },
              {
                source: 'KSDMA State GIS Repository',
                channel: 'Cadastral Polder Polygon Boundaries',
                status: 'ONLINE',
                latency: '15ms',
              },
              {
                source: 'Census of India (Office of RGI)',
                channel: '2011 Primary Census Abstract & Panchayat Wards',
                status: 'VERIFIED',
                latency: 'Static',
              },
            ].map((feed, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <strong className="text-slate-900 block">{feed.source}</strong>
                  <span className="text-[11px] text-slate-500">{feed.channel}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {feed.status}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{feed.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
