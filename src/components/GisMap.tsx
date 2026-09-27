import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Village, SafeSite, RedZone, RiskCategory } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  Layers,
  Ruler,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Eye,
  EyeOff,
} from 'lucide-react';

interface GisMapProps {
  villages: Village[];
  safeSites: SafeSite[];
  redZones: RedZone[];
  selectedRiskCategory?: 'All' | RiskCategory;
  showVillages?: boolean;
  showRedZones?: boolean;
  showSafeSites?: boolean;
  onSelectVillage?: (village: Village) => void;
  onSelectSafeSite?: (site: SafeSite) => void;
  heightClass?: string;
  focusedVillageId?: string | null;
  interactive?: boolean;
}

export const GisMap: React.FC<GisMapProps> = ({
  villages = [],
  safeSites = [],
  redZones = [],
  selectedRiskCategory = 'All',
  showVillages = true,
  showRedZones = true,
  showSafeSites = true,
  onSelectVillage,
  onSelectSafeSite,
  heightClass = 'h-[480px]',
  focusedVillageId,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const measureLineRef = useRef<L.Polyline | null>(null);

  // Toolbar & layer panel states
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measuredDistanceKm, setMeasuredDistanceKm] = useState<number | null>(null);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Expandable layer category toggles
  const [openCategory, setOpenCategory] = useState<'hazard' | 'admin' | 'risk'>('risk');

  // Layer visibility toggles
  const [layerState, setLayerState] = useState({
    // Hazard layers
    floodHazard: true,
    bundBreachRisk: true,
    rainfallHeat: false,
    demElevation: false,
    waterways: true,
    // Administrative layers
    stateBoundary: true,
    districtBoundary: true,
    talukBoundary: true,
    // Risk layers
    redZones: showRedZones,
    highRisk: true,
    mediumRisk: true,
    lowRisk: true,
    safeSites: showSafeSites,
  });

  // Center coordinate for Kuttanad Basin
  const KUTTANAD_CENTER: [number, number] = [9.475, 76.435];

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KUTTANAD_CENTER,
      zoom: 11,
      zoomControl: false, // We supply custom toolbar buttons
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | KSDMA / Survey of India Datum',
      maxZoom: 18,
      minZoom: 8,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [interactive]);

  // 2. Render Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Render Red Zones
    if (layerState.redZones && Array.isArray(redZones)) {
      redZones.forEach((zone) => {
        if (!zone || !Array.isArray(zone.coordinates)) return;
        const polygon = L.polygon(zone.coordinates, {
          color: '#DC2626',
          weight: 2,
          opacity: 0.9,
          fillColor: '#EF4444',
          fillOpacity: 0.2,
          dashArray: '5, 6',
        });

        const affectedCount = (zone.affectedVillageIds || []).length;
        const popupContent = `
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: #DC2626; text-transform: uppercase; background: #FEE2E2; padding: 2px 6px; border-radius: 4px; border: 1px solid #FECACA;">
                STATUTORY RED ZONE
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #475569;">${zone.primaryHazard}</span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">${zone.name}</div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 6px; line-height: 1.4;">
              <strong>Historical Peak Depth:</strong> ${zone.peakFloodDepthRecordedM}m<br/>
              <strong>Vulnerable Habitations:</strong> ${affectedCount} polders<br/>
              <strong>Action:</strong> ${zone.recommendedAction}
            </div>
          </div>
        `;
        polygon.bindPopup(popupContent);
        layerGroup.addLayer(polygon);
      });
    }

    // Render Safe Sites
    if (layerState.safeSites && Array.isArray(safeSites)) {
      safeSites.forEach((site) => {
        if (!site) return;
        const iconHtml = `
          <div style="
            background: #16A34A;
            color: #FFFFFF;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
          " title="Safe Site: ${site.name}">
            &#10003;
          </div>
        `;

        const siteIcon = L.divIcon({
          className: 'custom-safe-site-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([site.lat, site.lng], { icon: siteIcon });
        const popupId = `popup-site-${site.id}`;

        const popupHtml = `
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 230px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: #166534; background: #DCFCE7; padding: 2px 6px; border-radius: 4px; border: 1px solid #BBF7D0;">
                SAFE RELOCATION SANCTUARY
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #15803D;">+${site.elevationM}m MSL</span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">${site.name}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
              <strong>Available Capacity:</strong> <span style="color: #15803D; font-weight: 700;">${site.availableCapacity.toLocaleString()} seats</span><br/>
              <strong>Total Capacity:</strong> ${site.maxCapacity.toLocaleString()} | <strong>Water:</strong> ${site.drinkingWaterLpd.toLocaleString()} L/day<br/>
              <strong>Road Access:</strong> ${site.roadAccess} | <strong>Boat Access:</strong> ${site.boatAccess ? 'Yes' : 'No'}
            </div>
            <button id="${popupId}" style="
              width: 100%;
              background: #16A34A;
              color: white;
              border: none;
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              View Sanctuary Details
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('popupopen', () => {
          const btn = document.getElementById(popupId);
          if (btn && onSelectSafeSite) {
            btn.onclick = () => onSelectSafeSite(site);
          }
        });

        layerGroup.addLayer(marker);
      });
    }

    // Render Villages
    villages.forEach((v) => {
      // Filter by search
      if (searchFilter && !v.name.toLowerCase().includes(searchFilter.toLowerCase())) {
        return;
      }

      // Filter by risk category
      if (selectedRiskCategory !== 'All' && v.mlPrediction.riskCategory !== selectedRiskCategory) {
        return;
      }

      const cat = v.mlPrediction.riskCategory;
      if (cat === 'Critical' && !layerState.highRisk) return;
      if (cat === 'High' && !layerState.highRisk) return;
      if (cat === 'Moderate' && !layerState.mediumRisk) return;
      if (cat === 'Low' && !layerState.lowRisk) return;

      let bgColor = '#16A34A';
      let ringColor = 'rgba(22, 163, 74, 0.4)';
      if (cat === 'Critical') {
        bgColor = '#DC2626';
        ringColor = 'rgba(220, 38, 38, 0.5)';
      } else if (cat === 'High') {
        bgColor = '#EA580C';
        ringColor = 'rgba(234, 88, 12, 0.4)';
      } else if (cat === 'Moderate') {
        bgColor = '#D97706';
        ringColor = 'rgba(217, 119, 6, 0.4)';
      }

      const isFocused = focusedVillageId === v.id;
      const markerSize = isFocused ? 36 : 28;

      const markerHtml = `
        <div style="
          background-color: ${bgColor};
          width: ${markerSize}px;
          height: ${markerSize}px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 0 ${isFocused ? '6px' : '3px'} ${ringColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 800;
          font-size: 11px;
          cursor: pointer;
        ">
          ${Math.round(v.baselineRiskScore)}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-village-marker',
        html: markerHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
        popupAnchor: [0, -markerSize / 2],
      });

      const marker = L.marker([v.lat, v.lng], { icon });
      const popupId = `popup-v-${v.id}`;

      const popupHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 230px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: ${bgColor}; text-transform: uppercase;">
              ${cat} Risk • ${v.relocationPriority} Priority
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #1E293B;">${v.elevationM}m MSL</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">${v.name}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
            <strong>Population:</strong> ${v.population.toLocaleString()} residents<br/>
            <strong>Bund Breach Risk:</strong> ${v.bundBreachRiskPct}% | <strong>Pamba Gauge:</strong> ${v.riverWaterLevelM}m<br/>
            <strong>Relocation Deficit:</strong> <span style="color: #DC2626; font-weight: 700;">-${v.carryingCapacity.capacityDeficit.toLocaleString()}</span>
          </div>
          <button id="${popupId}" style="
            width: 100%;
            background: #0F172A;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            Inspect Village Risk Profile
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(popupId);
        if (btn && onSelectVillage) {
          btn.onclick = () => onSelectVillage(v);
        }
      });

      layerGroup.addLayer(marker);
    });
  }, [
    villages,
    safeSites,
    redZones,
    selectedRiskCategory,
    layerState,
    focusedVillageId,
    searchFilter,
  ]);

  // Handle measurement mode click on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (!measurementMode) return;

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      const updated = [...measurePoints, newPoint];

      if (updated.length === 1) {
        setMeasurePoints(updated);
        setMeasuredDistanceKm(null);
      } else if (updated.length === 2) {
        setMeasurePoints(updated);
        const p1 = L.latLng(updated[0][0], updated[0][1]);
        const p2 = L.latLng(updated[1][0], updated[1][1]);
        const distKm = p1.distanceTo(p2) / 1000;
        setMeasuredDistanceKm(Math.round(distKm * 100) / 100);

        // Draw polyline
        if (measureLineRef.current) {
          measureLineRef.current.remove();
        }
        measureLineRef.current = L.polyline([updated[0], updated[1]], {
          color: '#2563EB',
          weight: 3,
          dashArray: '6, 6',
        }).addTo(map);
      } else {
        // Reset and start new
        setMeasurePoints([newPoint]);
        setMeasuredDistanceKm(null);
        if (measureLineRef.current) {
          measureLineRef.current.remove();
          measureLineRef.current = null;
        }
      }
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [measurementMode, measurePoints]);

  // Clean measurement line on mode exit
  useEffect(() => {
    if (!measurementMode && measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
      setMeasurePoints([]);
      setMeasuredDistanceKm(null);
    }
  }, [measurementMode]);

  // Focus on specific village if prop provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedVillageId) return;

    const v = villages.find((item) => item.id === focusedVillageId);
    if (v) {
      map.setView([v.lat, v.lng], 13, { animate: true });
    }
  }, [focusedVillageId, villages]);

  // Toolbar Actions
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleLocate = () => {
    mapInstanceRef.current?.setView(KUTTANAD_CENTER, 11, { animate: true });
  };
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : heightClass
      }`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP-LEFT: Professional GIS Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-md">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleLocate}
          className="p-2 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Reset to Kuttanad Basin Extent"
        >
          <Navigation className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <div className="h-px bg-slate-200 mx-1" />
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={`p-2 rounded transition-colors cursor-pointer ${
            showLayerPanel ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Organized Layer Controls"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMeasurementMode(!measurementMode)}
          className={`p-2 rounded transition-colors cursor-pointer ${
            measurementMode ? 'bg-amber-500 text-white' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Measure Haul Distance"
        >
          <Ruler className="w-4 h-4" />
        </button>
      </div>

      {/* TOP-RIGHT: In-Map Search & Filter Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter map habitations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-48 sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MEASUREMENT TOOL TIP OVERLAY */}
      {measurementMode && (
        <div className="absolute top-14 left-14 z-10 bg-slate-900/90 text-white px-3 py-2 rounded-lg text-xs shadow-lg flex items-center gap-3">
          <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-[11px] text-amber-300">MEASUREMENT TOOL ACTIVE</div>
            <div className="text-[10px] text-slate-300">
              {measurePoints.length === 0 && 'Click map to place Point A (Origin)'}
              {measurePoints.length === 1 && 'Click map to place Point B (Destination)'}
              {measurePoints.length === 2 && (
                <span className="font-bold text-white">
                  Calculated Haul Distance: {measuredDistanceKm} km
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setMeasurementMode(false)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* EXPANDABLE LAYER CONTROL PANEL (Never Congested, Categorized) */}
      {showLayerPanel && (
        <div className="absolute top-14 left-14 z-20 w-72 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl p-3 text-xs space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>GIS Layer Hierarchy</span>
            </span>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Accordion */}
          <div className="space-y-2">
            {/* Category 1: Risk & Relocation Layers */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === 'risk' ? 'hazard' : 'risk')}
                className="w-full flex items-center justify-between p-2 bg-slate-50 font-bold text-slate-800 text-[11px] hover:bg-slate-100"
              >
                <span>Risk & Relocation Layers</span>
                {openCategory === 'risk' ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              {openCategory === 'risk' && (
                <div className="p-2 space-y-1.5 bg-white text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.redZones}
                      onChange={(e) =>
                        setLayerState({ ...layerState, redZones: e.target.checked })
                      }
                      className="accent-red-600"
                    />
                    <span>Statutory Red Zones</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.highRisk}
                      onChange={(e) =>
                        setLayerState({ ...layerState, highRisk: e.target.checked })
                      }
                      className="accent-red-600"
                    />
                    <span>Critical / High Risk Habitations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.mediumRisk}
                      onChange={(e) =>
                        setLayerState({ ...layerState, mediumRisk: e.target.checked })
                      }
                      className="accent-amber-600"
                    />
                    <span>Moderate Risk Habitations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.safeSites}
                      onChange={(e) =>
                        setLayerState({ ...layerState, safeSites: e.target.checked })
                      }
                      className="accent-emerald-600"
                    />
                    <span>Safe Highland Sanctuaries</span>
                  </label>
                </div>
              )}
            </div>

            {/* Category 2: Hazard Layers */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === 'hazard' ? 'admin' : 'hazard')}
                className="w-full flex items-center justify-between p-2 bg-slate-50 font-bold text-slate-800 text-[11px] hover:bg-slate-100"
              >
                <span>Hazard Layers</span>
                {openCategory === 'hazard' ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              {openCategory === 'hazard' && (
                <div className="p-2 space-y-1.5 bg-white text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.floodHazard}
                      onChange={(e) =>
                        setLayerState({ ...layerState, floodHazard: e.target.checked })
                      }
                      className="accent-blue-600"
                    />
                    <span>Flood Inundation & River Water</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.bundBreachRisk}
                      onChange={(e) =>
                        setLayerState({ ...layerState, bundBreachRisk: e.target.checked })
                      }
                      className="accent-amber-600"
                    />
                    <span>Polder Bund Breach Susceptibility</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={layerState.waterways}
                      onChange={(e) =>
                        setLayerState({ ...layerState, waterways: e.target.checked })
                      }
                      className="accent-blue-600"
                    />
                    <span>Vembanad Backwaters & Canals</span>
                  </label>
                </div>
              )}
            </div>

            {/* Category 3: Administrative Layers */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === 'admin' ? 'risk' : 'admin')}
                className="w-full flex items-center justify-between p-2 bg-slate-50 font-bold text-slate-800 text-[11px] hover:bg-slate-100"
              >
                <span>Administrative Boundaries</span>
                {openCategory === 'admin' ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              {openCategory === 'admin' && (
                <div className="p-2 space-y-1.5 bg-white text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>District Boundary</span>
                    <span className="font-semibold text-slate-900">Alappuzha</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Taluk Boundary</span>
                    <span className="font-semibold text-slate-900">Kuttanad</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Survey Datum</span>
                    <span className="font-semibold text-slate-900">WGS84 / SOI</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT: Collapsible GIS Legend */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-slate-200 shadow-md p-2.5 text-[11px] space-y-2 max-w-[210px]">
          <div className="flex items-center justify-between gap-3 font-bold text-slate-800 pb-1 border-b border-slate-100">
            <span>Map Legend</span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showLegend ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showLegend && (
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-red-500/30 border border-red-600 border-dashed shrink-0"></span>
                <span className="truncate">Red Submergence Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 shrink-0"></span>
                <span>Critical Risk Habitation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span>High/Mod Risk Habitation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
                <span>Safe Highland Sanctuary</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
