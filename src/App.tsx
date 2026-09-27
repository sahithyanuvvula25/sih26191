import React, { useState } from 'react';
import { NavigationPage, Village, SafeSite, RedZone, SiteSuitabilityResult } from './types';
import { INITIAL_VILLAGES, INITIAL_SAFE_SITES, INITIAL_RED_ZONES } from './data/initialData';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardView } from './components/DashboardView';
import { RiskMapView } from './components/RiskMapView';
import { RedZonesView } from './components/RedZonesView';
import { VillagesView } from './components/VillagesView';
import { VillageDetailView } from './components/VillageDetailView';
import { HazardAnalysisView } from './components/HazardAnalysisView';
import { SafeSitesView } from './components/SafeSitesView';
import { SiteDetailView } from './components/SiteDetailView';
import { CarryingCapacityView } from './components/CarryingCapacityView';
import { RelocationPlanningView } from './components/RelocationPlanningView';
import { SimulationView } from './components/SimulationView';
import { ReportGenerationView } from './components/ReportGenerationView';
import { AnalyticsView } from './components/AnalyticsView';
import { DataModelView } from './components/DataModelView';
import { SettingsView } from './components/SettingsView';
import { EditVillageModal } from './components/EditVillageModal';
import { RelocationReportModal } from './components/RelocationReportModal';

export const App: React.FC = () => {
  // Authentication session - default to true so navigation loads immediately on boot
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dss_auth_session') !== 'false';
    } catch {
      return true;
    }
  });

  const [villages, setVillages] = useState<Village[]>(INITIAL_VILLAGES);
  const [safeSites, setSafeSites] = useState<SafeSite[]>(INITIAL_SAFE_SITES);
  const [redZones, setRedZones] = useState<RedZone[]>(INITIAL_RED_ZONES);

  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(INITIAL_VILLAGES[0]);
  const [selectedSafeSite, setSelectedSafeSite] = useState<SafeSite | null>(INITIAL_SAFE_SITES[0]);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals state
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [reportData, setReportData] = useState<{
    village: Village;
    site: SafeSite;
    result: SiteSuitabilityResult;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Quick helper counts for sidebar indicators
  const criticalCount = villages.filter(
    (v) => v.mlPrediction.riskCategory === 'Critical' || v.bundBreachRiskPct >= 75
  ).length;
  const relocationCount = villages.filter((v) => v.relocationPriority === 'Immediate').length;

  // Handlers
  const handleLoginSuccess = () => {
    try {
      localStorage.setItem('dss_auth_session', 'true');
    } catch {
      // ignore
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('dss_auth_session');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
    setCurrentPage('village-detail');
  };

  const handleSelectSafeSite = (site: SafeSite) => {
    setSelectedSafeSite(site);
    setCurrentPage('site-detail');
  };

  const handleOpenRelocationPlan = (village: Village, site: SafeSite) => {
    setSelectedVillage(village);
    setSelectedSafeSite(site);
    setCurrentPage('planning');
  };

  const handleSaveVillage = (updated: Village) => {
    setVillages((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    if (selectedVillage?.id === updated.id) {
      setSelectedVillage(updated);
    }
    setEditingVillage(null);
  };

  // If not authenticated, render official government login screen
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans antialiased">
      {/* 11-Item Collapsible Government Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        criticalCount={criticalCount}
        relocationCount={relocationCount}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main App Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Government Administrative Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentPage={currentPage}
          villages={villages}
          onSelectVillage={handleSelectVillage}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Routing */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          <ErrorBoundary
            fallbackTitle="Module encountered an error"
            onReset={() => setCurrentPage('dashboard')}
          >
            {/* 1. Dashboard View */}
            {currentPage === 'dashboard' && (
              <DashboardView
                villages={villages}
                safeSites={safeSites}
                redZones={redZones}
                onSelectVillage={handleSelectVillage}
                onSelectSafeSite={handleSelectSafeSite}
                onNavigateToPage={(p) => setCurrentPage(p)}
              />
            )}

            {/* 2. Red Zones View */}
            {currentPage === 'red-zones' && (
              <RedZonesView
                redZones={redZones}
                villages={villages}
                safeSites={safeSites}
                onSelectVillage={handleSelectVillage}
                onNavigateToPlanning={() => {
                  setCurrentPage('planning');
                }}
              />
            )}

            {/* 3. Vulnerable Habitations View */}
            {currentPage === 'villages' && (
              <VillagesView
                villages={villages}
                onSelectVillage={handleSelectVillage}
                onNavigateToSimulation={() => {
                  setCurrentPage('simulation');
                }}
              />
            )}

            {/* Habitation Detail View */}
            {currentPage === 'village-detail' && selectedVillage && (
              <VillageDetailView
                village={selectedVillage}
                safeSites={safeSites}
                onBack={() => setCurrentPage('villages')}
                onOpenRelocationPlan={handleOpenRelocationPlan}
                onNavigateToSimulation={() => setCurrentPage('simulation')}
                onNavigateToSites={() => setCurrentPage('sites')}
              />
            )}

            {/* 4. Hazard Analysis View */}
            {currentPage === 'hazard-analysis' && (
              <HazardAnalysisView
                villages={villages}
                safeSites={safeSites}
                redZones={redZones}
                selectedVillageId={selectedVillage?.id}
                onSelectVillage={handleSelectVillage}
              />
            )}

          {/* 5. Relocation Directives Planning */}
          {currentPage === 'planning' && (
            <RelocationPlanningView
              villages={villages}
              safeSites={safeSites}
              initialVillageId={selectedVillage?.id}
              initialSiteId={selectedSafeSite?.id}
              onGenerateReport={(village, site, result) => {
                setReportData({ village, site, result });
              }}
              onNavigateToSiteSuitability={(site) => {
                setSelectedSafeSite(site);
                setCurrentPage('site-detail');
              }}
            />
          )}

          {/* 6. Safe Sites View */}
          {currentPage === 'sites' && (
            <SafeSitesView
              safeSites={safeSites}
              villages={villages}
              onSelectSite={handleSelectSafeSite}
              onSelectVillageForPlanning={handleOpenRelocationPlan}
            />
          )}

          {/* Safe Site Detail View */}
          {currentPage === 'site-detail' && selectedSafeSite && (
            <SiteDetailView
              site={selectedSafeSite}
              villages={villages}
              onBack={() => setCurrentPage('sites')}
              onOpenRelocationPlan={handleOpenRelocationPlan}
            />
          )}

          {/* 7. Carrying Capacity Assessment View */}
          {currentPage === 'carrying-capacity' && (
            <CarryingCapacityView
              safeSites={safeSites}
              villages={villages}
              onSelectSafeSite={handleSelectSafeSite}
              onNavigateToPlanning={() => setCurrentPage('planning')}
            />
          )}

          {/* 8. GIS Risk Map View */}
          {currentPage === 'map' && (
            <RiskMapView
              villages={villages}
              safeSites={safeSites}
              redZones={redZones}
              onSelectVillage={handleSelectVillage}
              onSelectSafeSite={handleSelectSafeSite}
              onNavigateToRedZones={() => setCurrentPage('red-zones')}
            />
          )}

          {/* 9. Disaster Reports Generator */}
          {currentPage === 'reports' && (
            <ReportGenerationView
              villages={villages}
              safeSites={safeSites}
            />
          )}

          {/* 10. Data Model & Telemetry Sources */}
          {currentPage === 'sources' && <DataModelView />}

          {/* 11. System Settings */}
          {currentPage === 'settings' && <SettingsView />}

          {/* Analytics & Simulation sub-views */}
          {currentPage === 'analytics' && (
            <AnalyticsView villages={villages} safeSites={safeSites} />
          )}

          {currentPage === 'simulation' && (
            <SimulationView
              villages={villages}
              safeSites={safeSites}
              onSelectVillage={handleSelectVillage}
              onNavigateToPlanning={() => setCurrentPage('planning')}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Edit Village Modal */}
      {editingVillage && (
        <EditVillageModal
          village={editingVillage}
          onSave={handleSaveVillage}
          onClose={() => setEditingVillage(null)}
        />
      )}

      {/* Official Printable Report Modal */}
      {reportData && (
        <RelocationReportModal
          village={reportData.village}
          site={reportData.site}
          result={reportData.result}
          onClose={() => setReportData(null)}
        />
      )}
    </div>
  );
};

export default App;
