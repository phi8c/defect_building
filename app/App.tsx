import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Settings, Activity, ShieldCheck, Menu } from "lucide-react";

import { Sidebar } from "./components/Sidebar";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { TrainingCenter } from "./components/TrainingCenter";
import { TrainingCenters } from "./pages/train_ai";
import { TabView } from "./types";
import CrackScanner from "./components/CrackScanner";


const AppContent: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathToTab: Record<string, TabView> = {
    "/": TabView.ANALYSIS,
    "/storage": TabView.STORAGE,
    "/train-ai": TabView.TRAINING,
    "/settings": TabView.SETTINGS,
    "/scan": TabView.SCAN
  };

  const tabToPath: Record<string, string> = {
    [TabView.ANALYSIS]: "/",
    [TabView.STORAGE]: "/storage",
    [TabView.TRAINING]: "/train-ai",
    [TabView.SETTINGS]: "/settings",
    [TabView.SCAN]: "/scan"
  };

  const currentTab = pathToTab[location.pathname] || TabView.ANALYSIS;

  const handleTabChange = (tab: TabView) => {
    navigate(tabToPath[tab]);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">

      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative z-50 w-64 bg-white shadow-xl">
            <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
          </div>

        </div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">

          <div className="flex items-center gap-3">

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">
                AI Defect Recognition Assistant
              </h1>

              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Enterprise Grade Quality Control System
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 md:gap-4">

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
              <Activity className="w-4 h-4" />
              <span>System Online</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              Model v2.5.0 (Local/Hybrid)
            </div>

          </div>

        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">

          <Routes>

            <Route path="/" element={<AnalysisDashboard />} />

            <Route path="/storage" element={<TrainingCenter />} />

            <Route path="/scan" element={<CrackScanner />} />

            <Route path="/train-ai" element={<TrainingCenters />} />

            <Route
              path="/settings"
              element={
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Settings className="w-16 h-16 mb-4 opacity-50" />
                  <h2 className="text-xl font-semibold">
                    Settings Configuration
                  </h2>
                  <p>
                    System parameters and API configurations would go here.
                  </p>
                </div>
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  );
};


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;