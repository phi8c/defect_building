import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Folder, FileImage, RefreshCw, Play, Save, HardDrive, AlertCircle } from 'lucide-react';
import { TrainingMetric, FolderNode } from '../types';

// Mock Data for Directory Structure
const mockDirectory: FolderNode = {
  name: 'Training_Data',
  count: 3500,
  type: 'folder',
  children: [
    { name: 'Wall_Cracks', count: 1240, type: 'folder' },
    { name: 'Paint_Peeling', count: 850, type: 'folder' },
    { name: 'Water_Leakage', count: 620, type: 'folder' },
    { name: 'Electrical_Exposed', count: 410, type: 'folder' },
    { name: 'Tile_Damage', count: 380, type: 'folder' },
  ]
};

// Mock Data for Charts
const generateMockMetrics = (epochCount: number): TrainingMetric[] => {
  const data: TrainingMetric[] = [];
  for (let i = 1; i <= epochCount; i++) {
    const progress = i / epochCount;
    // Simulate typical learning curve
    data.push({
      epoch: i,
      accuracy: 0.5 + (0.45 * (1 - Math.exp(-3 * progress))) + (Math.random() * 0.02),
      loss: 0.8 * Math.exp(-3 * progress) + (Math.random() * 0.05),
      val_accuracy: 0.48 + (0.42 * (1 - Math.exp(-3 * progress))) + (Math.random() * 0.03),
      val_loss: 0.9 * Math.exp(-2.8 * progress) + (Math.random() * 0.05),
    });
  }
  return data;
};

export const TrainingCenter: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<TrainingMetric[]>(generateMockMetrics(10)); // Initial history
  const [activeEpoch, setActiveEpoch] = useState<number | null>(null);

  const startRetraining = () => {
    setIsTraining(true);
    setProgress(0);
    setMetrics([]); // Reset charts
    let currentEpoch = 0;
    const totalEpochs = 20;

    const interval = setInterval(() => {
      currentEpoch++;
      const pct = (currentEpoch / totalEpochs) * 100;
      setProgress(pct);
      
      // Add new data point
      setMetrics(prev => {
        const epoch = prev.length + 1;
        const progress = epoch / totalEpochs;
        return [...prev, {
            epoch,
            accuracy: 0.5 + (0.45 * (1 - Math.exp(-3 * progress))),
            loss: 0.8 * Math.exp(-3 * progress),
            val_accuracy: 0.48 + (0.42 * (1 - Math.exp(-3 * progress))),
            val_loss: 0.9 * Math.exp(-2.8 * progress),
        }];
      });

      if (currentEpoch >= totalEpochs) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 400); // Fast simulation
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
      {/* Dataset Manager (Left) */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-1/2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                Dataset Management
            </h3>
            
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50">
                <div className="pl-2">
                    <div className="flex items-center gap-2 py-1 text-slate-700 font-medium">
                        <Folder className="w-4 h-4 text-indigo-400" />
                        {mockDirectory.name} 
                        <span className="text-xs text-slate-400">({mockDirectory.count} images)</span>
                    </div>
                    <div className="pl-6 space-y-1 mt-1">
                        {mockDirectory.children?.map((folder, idx) => (
                            <div key={idx} className="flex items-center justify-between group py-1.5 px-2 hover:bg-slate-100 rounded cursor-pointer">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Folder className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                                    {folder.name}
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                                    {folder.count}
                                </span>
                            </div>
                        ))}
                         <div className="flex items-center gap-2 py-1.5 px-2 text-slate-400 italic text-sm mt-2 border-t border-slate-100 pt-2">
                            <AlertCircle className="w-3 h-3" />
                            Auto-detected new labels
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
                 <button className="w-full py-2 bg-white border border-dashed border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Folder className="w-4 h-4" />
                    Open Source Folder
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-1/2 justify-between">
             <div>
                <h3 className="font-semibold text-slate-800 mb-2">One-Click Retrain</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Update the local model with newly labeled images found in the dataset folder.
                </p>

                {isTraining && (
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-700">Fine-tuning in progress...</span>
                            <span className="text-indigo-600 font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between mt-1">
                             <span>Epoch {Math.floor((progress / 100) * 20)}/20</span>
                             <span>Loss: {metrics.length > 0 ? metrics[metrics.length-1].loss.toFixed(3) : '...'}</span>
                        </div>
                    </div>
                )}
             </div>

             <button
                onClick={startRetraining}
                disabled={isTraining}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    isTraining 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                }`}
             >
                {isTraining ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                    <Play className="w-5 h-5 fill-current" />
                )}
                {isTraining ? 'Training Model...' : 'Start Retraining'}
             </button>
        </div>
      </div>

      {/* Metrics (Right - 2 Cols) */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
         {/* Accuracy Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Model Accuracy</h3>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span className="text-slate-600">Training</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        <span className="text-slate-600">Validation</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                        <defs>
                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="epoch" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis domain={[0, 1]} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#6366f1" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAcc)" 
                            isAnimationActive={false}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="val_accuracy" 
                            stroke="#34d399" 
                            strokeWidth={3}
                            fillOpacity={0}
                            fill="transparent"
                            strokeDasharray="5 5"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Loss Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-0 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-4">Loss Function</h3>
            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="epoch" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="loss" 
                            stroke="#f43f5e" 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="val_loss" 
                            stroke="#fb923c" 
                            strokeWidth={2} 
                            dot={false}
                            strokeDasharray="5 5"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};