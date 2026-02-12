import React, { useState } from 'react';
import { LayoutDashboard, Database, Settings, Activity, ShieldCheck } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { TrainingCenter } from './components/TrainingCenter';
import { TabView } from './types';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.ANALYSIS);

  const renderContent = () => {
    switch (currentTab) {
      case TabView.ANALYSIS:
        return <AnalysisDashboard />;
      case TabView.TRAINING:
        return <TrainingCenter />;
      case TabView.SETTINGS:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Settings className="w-16 h-16 mb-4 opacity-50" />
            <h2 className="text-xl font-semibold">Settings Configuration</h2>
            <p>System parameters and API configurations would go here.</p>
          </div>
        );
      default:
        return <AnalysisDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">AI Defect Recognition Assistant</h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise Grade Quality Control System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                <Activity className="w-4 h-4" />
                <span>System Online</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Model v2.5.0 (Local/Hybrid)
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;