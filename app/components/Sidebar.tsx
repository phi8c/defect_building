import React from 'react';
import { LayoutDashboard, Database, Settings, Box } from 'lucide-react';
import { TabView } from '../types';

interface SidebarProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: TabView.ANALYSIS, label: 'Defect Analysis', icon: LayoutDashboard },
    { id: TabView.TRAINING, label: 'Training Center', icon: Database },
    { id: TabView.SETTINGS, label: 'Configuration', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Box className="w-5 h-5" />
        </div>
        <span className="font-bold text-white tracking-wide">IMGAI</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-2">System Status</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">GPU Usage</span>
            <span className="text-xs font-mono text-green-400">12%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[12%]"></div>
          </div>
          
          <div className="flex justify-between items-center mt-3 mb-1">
            <span className="text-sm">Memory</span>
            <span className="text-xs font-mono text-yellow-400">4.2GB</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
             <div className="bg-yellow-500 h-full w-[45%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};