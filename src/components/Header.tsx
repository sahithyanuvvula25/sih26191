import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  MapPin,
  ChevronDown,
  User,
  X,
  AlertTriangle,
  Info,
  ShieldCheck,
  Compass,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Village, NavigationPage } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  currentPage?: NavigationPage;
  villages?: Village[];
  onSelectVillage?: (village: Village) => void;
  onLogout?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard Overview',
  'red-zones': 'Risk & Statutory Red Zones',
  'villages': 'Vulnerable Habitations',
  'village-detail': 'Habitation Risk Profile',
  'hazard-analysis': 'Hazard Analysis',
  'planning': 'Relocation Planning',
  'sites': 'Site Suitability',
  'site-detail': 'Sanctuary Assessment',
  'carrying-capacity': 'Carrying Capacity',
  'map': 'GIS Interactive Map',
  'reports': 'Official Directives & Reports',
  'sources': 'Spatial Data Sources',
  'simulation': 'Scenario Simulator',
  'analytics': 'ML Model Performance',
  'settings': 'System Settings',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  currentPage = 'dashboard',
  villages = [],
  onSelectVillage,
  onLogout,
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Critical alerts from villages data
  const criticalVillages = villages.filter(
    (v) => v.mlPrediction.riskCategory === 'Critical' || v.bundBreachRiskPct >= 75
  );

  const currentTitle = PAGE_TITLES[currentPage] || 'Disaster DSS';

  const handleVillageChange = (id: string) => {
    setSelectedVillageId(id);
    if (id !== 'all' && onSelectVillage) {
      const v = villages.find((item) => item.id === id);
      if (v) onSelectVillage(v);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = villages.find((v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match && onSelectVillage) {
      onSelectVillage(match);
      setSelectedVillageId(match.id);
    }
  };

  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-3 sm:px-6 py-2.5">
        <div className="relative flex items-center justify-between min-h-[44px]">
          {/* Left: Official Emblem / Logo */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              {/* Official Government GIS Crest Emblem */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex items-center justify-center shadow-xs border border-blue-900/30 relative shrink-0">
                <svg
                  className="w-5 h-5 text-blue-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"
                  title="Telemetry Live & Operational"
                />
              </div>

              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-none">
                  Govt. of Kerala
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <span>KSDMA</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-600 font-semibold">DDMA Alappuzha</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Logo with Village in Green Shield & Flood Coming + Big Size Bhoosethu */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-auto px-2 flex items-center justify-center gap-2.5">
            {/* Custom SVG Logo: Village in Green Shield with Flood Coming */}
            <div
              className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-emerald-600 via-green-700 to-emerald-900 text-white shadow-md shadow-emerald-950/20 border border-emerald-400/50 shrink-0 overflow-hidden"
              title="Bhoosethu - Village Flood Protection & Relocation Decision System"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="shieldFillGrad" x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="0.6" stopColor="#047857" />
                    <stop offset="1" stopColor="#064e3b" />
                  </linearGradient>
                  <linearGradient id="floodWaveGrad" x1="6" y1="20" x2="30" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.5" stopColor="#0284c7" />
                    <stop offset="1" stopColor="#075985" />
                  </linearGradient>
                </defs>

                {/* Green Protective Shield Base */}
                <path
                  d="M18 3L6 7.5V17C6 25 11.2 32 18 33.8C24.8 32 30 25 30 17V7.5L18 3Z"
                  fill="url(#shieldFillGrad)"
                  stroke="#34d399"
                  strokeWidth="1.2"
                />

                {/* Village: Thatched/Gabled Rural Habitations */}
                {/* Habitation 1 (Left Hut) */}
                <path d="M8.5 16.5L13 12.5L17.5 16.5H8.5Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
                <rect x="10" y="16.5" width="6" height="5" fill="#fef3c7" />
                <rect x="12" y="18.5" width="2" height="3" fill="#78350f" />

                {/* Habitation 2 (Center / Elevated Village House) */}
                <path d="M15.5 14.5L21 10L26.5 14.5H15.5Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.7" />
                <rect x="17.5" y="14.5" width="7" height="6" fill="#ffedd5" />
                <rect x="20" y="17" width="2.2" height="3.5" fill="#9a3412" />

                {/* Village Trees / Palm Fronds on the bank */}
                <path
                  d="M26 12C26 10.5 27 9.5 28.5 9.5C30 9.5 31 10.5 31 12C31 13 30.2 13.8 29.2 14V17H27.8V14C26.8 13.8 26 13 26 12Z"
                  fill="#86efac"
                />

                {/* Surging Flood Water Waves Inundating the Village */}
                <path
                  d="M6 21.5C9 19.8 12.5 23 17 21C21.5 19 25.5 22.5 30 20.5V25C26.5 28 22 31.5 18 33.5C14 31.5 9.5 28 6 25V21.5Z"
                  fill="url(#floodWaveGrad)"
                  opacity="0.92"
                />
                {/* Crest 1 White Water Foam */}
                <path
                  d="M6 22C9.5 20.5 13 23.5 17 21.5C21 19.5 25 23 30 21"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Crest 2 Lower Wave */}
                <path
                  d="M7 25C10.5 23.8 14 26.2 18 24.5C22 22.8 26 25.5 29.5 24"
                  stroke="#bae6fd"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Prominent Large Wordmark */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                Bhoosethu
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90 tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live DSS
              </span>
            </div>
          </div>

          {/* Right: Clean, Streamlined Administrative Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10 ml-auto">
            {/* Active Module Indicator Badge on Desktop */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-[11px] font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">{currentTitle}</span>
            </div>

            {/* Habitation Quick Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search Habitation or Polder"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Live Critical Alerts Bell Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Operational Notifications & Alerts"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {criticalVillages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    {criticalVillages.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Live Hydrological Alerts ({criticalVillages.length})</span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto">
                    {criticalVillages.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onSelectVillage) onSelectVillage(v);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-50 text-xs space-y-1 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between font-bold text-red-950">
                          <span>{v.name} (Bund Breach: {v.bundBreachRiskPct}%)</span>
                          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                            {v.mlPrediction.riskCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Pamba River gauge at {v.riverWaterLevelM}m MSL (&gt;Danger {v.dangerWaterLevelM}m). Priority evacuation to highland sanctuary.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help / Guidance Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Decision Support User Guide & Methodology"
              aria-label="Help and Methodology"
            >
              <HelpCircle className="w-4 h-4 text-blue-700" />
            </button>

            {/* User / Officer Profile Badge */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                  SN
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="font-bold text-slate-900 text-[11px]">Sahithya Nuvvula</div>
                  <div className="text-[10px] text-slate-500 font-medium">Authorized Officer</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">Sahithya Nuvvula</div>
                    <div className="text-[11px] text-slate-500 font-mono">sahithyanuvvula25@gmail.com</div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Certified Decision Authority
                    </div>
                  </div>

                  <div className="pt-1">
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-red-50 text-red-700 font-semibold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span>Sign Out of DSS</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Clean Quick Habitation Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Search Vulnerable Habitations &amp; Polders
                </h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              handleSearchSubmit(e);
              setShowSearchModal(false);
            }}>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter village, panchayat, or polder name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 px-1">
                Suggested Habitations
              </div>
              {villages
                .filter(
                  (v) =>
                    !searchQuery.trim() ||
                    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.localBodyName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 5)
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (onSelectVillage) onSelectVillage(v);
                      setShowSearchModal(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{v.name}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5">
                        ({v.localBodyName}, {v.taluk})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        v.mlPrediction.riskCategory === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : v.mlPrediction.riskCategory === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {v.mlPrediction.riskCategory}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Decision Support Guidance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Government Disaster GIS Decision Support Guide
                  </h3>
                  <p className="text-xs text-slate-500">
                    SIH-26191 Core Framework & Methodology Overview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Sections */}
            <div className="space-y-4 text-xs text-slate-700">
              {/* 1. Objective */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                <strong className="text-blue-900 block text-xs">
                  1. Operational Scope & Mandate
                </strong>
                <p className="leading-relaxed text-slate-600">
                  This GIS Decision Support System identifies hazard-based <strong>Red Zones</strong>, computes multi-hazard risk across below-sea-level wetland habitations in Kuttanad, audits carrying capacities of candidate highland relocation sanctuaries, and prioritizes habitations for immediate, short-term, and medium-term evacuation.
                </p>
              </div>

              {/* 2. Red Zone Criteria */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-1">
                <strong className="text-red-900 block text-xs">
                  2. Red Zone Delineation Rules
                </strong>
                <p className="leading-relaxed text-slate-600">
                  A geographic polder sector is designated as a statutory <strong>Red Zone</strong> if:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600 mt-1">
                  <li>Ground elevation is ≤ -1.5m below Mean Sea Level (MSL).</li>
                  <li>Outer agricultural earthen bund breach probability exceeds 75%.</li>
                  <li>River gauge water level exceeds official CWC Danger Stage (2.2m MSL).</li>
                  <li>Historical deluge inundation duration exceeds 14 continuous days.</li>
                </ul>
              </div>

              {/* 3. Carrying Capacity Standards */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <strong className="text-emerald-900 block text-xs">
                  3. Carrying Capacity & SPHERE Humanitarian Lifelines
                </strong>
                <p className="leading-relaxed text-slate-600">
                  Safe highland relocation sanctuaries (such as St. Berchmans Changanassery and SD College Alappuzha) are audited against:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600 mt-1">
                  <li><strong>Shelter Space:</strong> Minimum 3.5 m² covered living area per person.</li>
                  <li><strong>Potable Water:</strong> 15 Liters per person per day (SPHERE Standard).</li>
                  <li><strong>Sanitation:</strong> Minimum 1 bio-toilet unit per 20–25 evacuees.</li>
                  <li><strong>Transit Access:</strong> Multi-modal inland waterway barge & elevated arterial road connectivity.</li>
                </ul>
              </div>

              {/* 4. Relocation Priority Hierarchy */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block text-xs">
                  4. Phased Relocation Priority Hierarchy
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div className="p-2 rounded bg-red-100 text-red-900 border border-red-200">
                    <strong className="block text-[11px]">IMMEDIATE (&lt;24 Hours)</strong>
                    <span className="text-[10px] text-red-700">Polders under active submergence & bund collapse risk.</span>
                  </div>
                  <div className="p-2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    <strong className="block text-[11px]">SHORT-TERM (&lt;72 Hours)</strong>
                    <span className="text-[10px] text-amber-800">Rising peripheral backwaters, impending road cutoff.</span>
                  </div>
                  <div className="p-2 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    <strong className="block text-[11px]">MEDIUM-TERM (Pre-Monsoon)</strong>
                    <span className="text-[10px] text-blue-800">Permanent planned resettlement out of repetitive red zones.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Close Guidance Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
