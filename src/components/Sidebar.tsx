import React, { useState } from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  Home,
  Waves,
  ArrowRightLeft,
  ShieldCheck,
  Scale,
  Map,
  FileText,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  BrainCircuit,
  Activity,
  LogOut,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  criticalCount: number;
  relocationCount: number;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  criticalCount,
  relocationCount,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Exact 11 items requested by the user in order
  const navItems: {
    id: NavigationPage;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'red-zones',
      label: 'Risk & Red Zones',
      icon: AlertOctagon,
      badge: '3 Zones',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'villages',
      label: 'Vulnerable Habitations',
      icon: Home,
      badge: criticalCount > 0 ? `${criticalCount}` : undefined,
      badgeColor: 'bg-red-600 text-white',
    },
    {
      id: 'hazard-analysis',
      label: 'Hazard Analysis',
      icon: Waves,
    },
    {
      id: 'planning',
      label: 'Relocation Planning',
      icon: ArrowRightLeft,
      badge: relocationCount > 0 ? `${relocationCount}` : undefined,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'sites',
      label: 'Site Suitability',
      icon: ShieldCheck,
    },
    {
      id: 'carrying-capacity',
      label: 'Carrying Capacity',
      icon: Scale,
    },
    {
      id: 'map',
      label: 'GIS Map',
      icon: Map,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'sources',
      label: 'Data Sources',
      icon: Database,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  // Secondary tools (Simulation & ML Performance)
  const advancedTools: {
    id: NavigationPage;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'simulation',
      label: 'Scenario Simulator',
      icon: Sliders,
    },
    {
      id: 'analytics',
      label: 'ML Model Metrics',
      icon: BrainCircuit,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0f172a] border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        {/* Sidebar Header: Emblem & Portal Name */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo: Village in Green Shield with Flood Waters */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-900 border border-emerald-400/40 shrink-0 overflow-hidden shadow-xs">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <path
                  d="M18 3L6 7.5V17C6 25 11.2 32 18 33.8C24.8 32 30 25 30 17V7.5L18 3Z"
                  fill="#065f46"
                  stroke="#34d399"
                  strokeWidth="1.2"
                />
                {/* Village Huts */}
                <path d="M9 16L13.5 12L18 16H9Z" fill="#fef08a" />
                <rect x="10.5" y="16" width="6" height="5" fill="#fef3c7" />
                <path d="M16 14.5L21.5 10L27 14.5H16Z" fill="#fed7aa" />
                <rect x="18" y="14.5" width="7" height="6" fill="#ffedd5" />
                {/* Flood Waters */}
                <path
                  d="M6 21.5C9 19.8 12.5 23 17 21C21.5 19 25.5 22.5 30 20.5V25C26.5 28 22 31.5 18 33.5C14 31.5 9.5 28 6 25V21.5Z"
                  fill="#0284c7"
                  opacity="0.9"
                />
                <path d="M6 22C9.5 20.5 13 23.5 17 21.5C21 19.5 25 23 30 21" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="text-base font-black text-white tracking-wide truncate">
                  Bhoosethu
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider truncate">
                  State Disaster DSS
                </div>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {!isCollapsed && isActive && (
                    <span className="text-amber-300 font-black text-[11px] select-none shrink-0 animate-pulse">
                      ▶
                    </span>
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Advanced Tools Section */}
          <div className="pt-2">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800/80 pt-2">
                Predictive Analytics
              </div>
            )}

            {advancedTools.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Collapse Toggle & System Telemetry Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0 space-y-2">
          {!isCollapsed && (
            <div className="px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate">CWC & IMD Feed Live</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">v2.4.1</span>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex items-center justify-between gap-1">
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px]">Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
