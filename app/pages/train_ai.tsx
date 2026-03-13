import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { Upload, FileImage, CheckCircle2, Play, Terminal, Layers, ShieldAlert } from 'lucide-react';

// Giữ nguyên các Interface
interface FileObject {
  id: string;
  name: string;
  status: 'uploading' | 'success';
}

interface MetricRow {
  name: string;
  images: number;
  instances: number;
  p: string;
  r: string;
  mAP50: string;
  mAP95: string;
}

type TrainingState = 'idle' | 'training' | 'done';

const DEFECT_CATEGORIES: string[] = [
  "Exposed framework", "Weatherboard missing", "Firewall unsealed",
  "Change in tile colour", "Downpipe not connected", "Wall crack",
  "Paint peeling", "Mold / Mildew", "Cracked tile floor",
  "Roof leak visible", "Foundation settlement", "Missing insulation",
  "Improper wiring", "Rust on beams"
];





// Đổi tên thành TrainingCenter để khớp với App.tsx của bạn
export const TrainingCenters: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [trainingState, setTrainingState] = useState<TrainingState>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
 

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, metrics]);

  // Logic xử lý (toggleCategory, processFiles, startTraining...) 
  // Bạn giữ nguyên toàn bộ phần logic hàm từ file cũ qua nhé
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === DEFECT_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...DEFECT_CATEGORIES]);
    }
  };

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
    const availableSlots = 50 - files.length;
    const filesToAdd: FileObject[] = validFiles.slice(0, availableSlots).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      status: 'uploading' 
    }));
    if (filesToAdd.length > 0) {
      setFiles(prev => [...prev, ...filesToAdd]);
      filesToAdd.forEach((f, index) => {
        setTimeout(() => {
          setFiles(currentFiles => 
            currentFiles.map(cf => cf.id === f.id ? { ...cf, status: 'success' } : cf)
          );
        }, 300 + (index * 150)); 
      });
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const startTraining = () => {
    if (files.length === 0 || selectedCategories.length === 0) {
        alert("Please select categories and upload images first!");
        return;
    }
    setTrainingState('training');
    setLogs(["Initializing Training...", "Loading YOLOv8 weights..."]);
    // ... logic setInterval logs giữ nguyên ...
    setTimeout(() => {
        setLogs(prev => [...prev, "🚀 Start Epoch 1/100", "GPU Memory: 4.2GB"]);
        // Giả lập hoàn thành sau vài giây để test
        setTimeout(() => {
            setTrainingState('done');
            setMetrics([{ name: "all", images: files.length, instances: 10, p: "0.85", r: "0.82", mAP50: "0.88", mAP95: "0.65" }]);
        }, 3000);
    }, 1000);
  };

  return (
    /* THAY ĐỔI Ở ĐÂY: Bỏ container bọc ngoài cùng có padding/bg vì App.tsx đã có rồi */
    <div className="flex flex-col h-full gap-6">
      
      {/* Sub-Header cho riêng trang Training */}
      <div className="flex items-center justify-between shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <Layers className="text-indigo-600" size={24} />
            <div>
                <h2 className="font-bold text-lg">Model Training Workspace</h2>
                <p className="text-xs text-slate-500">Fine-tune YOLOv8 on your dataset</p>
            </div>
        </div>
        <button 
          onClick={startTraining}
          disabled={trainingState === 'training' || files.length === 0 || selectedCategories.length === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all
            ${trainingState === 'training' 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
        >
          {trainingState === 'training' ? 'Training...' : <><Play size={18} fill="currentColor" /> START</>}
        </button>
      </div>

      {/* Main Grid: Giờ đây nó sẽ chiếm nốt phần diện tích còn lại của Main Content App.tsx */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Cột trái: Config & Upload */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
             <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-sm uppercase text-slate-600">1. Categories</h3>
                <button onClick={selectAllCategories} className="text-xs text-indigo-600 font-bold">All</button>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {DEFECT_CATEGORIES.map(cat => (
                   <label key={cat} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                      <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="rounded text-indigo-600" />
                      <span className="text-sm font-medium">{cat}</span>
                   </label>
                ))}
             </div>
          </section>

          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
             <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-sm uppercase text-slate-600">2. Dataset ({files.length}/50)</h3>
             </div>
             <div 
               onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
               onDragLeave={() => setIsDragging(false)}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer mb-4 ${isDragging ? 'bg-indigo-50 border-indigo-400' : 'border-slate-200'}`}
             >
                <Upload className="mx-auto text-indigo-400 mb-2" size={20} />
                <p className="text-xs font-bold text-slate-500">Drop images or click to upload</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => processFiles(e.target.files)} />
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                   {files.map(f => (
                     <div key={f.id} className="text-[10px] p-2 border rounded flex items-center gap-1 bg-slate-50 truncate">
                        {f.status === 'success' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-2 h-2 border border-t-transparent animate-spin" />}
                        {f.name}
                     </div>
                   ))}
                </div>
             </div>
          </section>
        </div>

        {/* Cột phải: Terminal */}
        <div className="lg:col-span-7 bg-[#0d1117] rounded-2xl shadow-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="bg-[#161b22] px-4 py-2 border-b border-slate-800 flex items-center">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" /></div>
            <span className="mx-auto text-[10px] text-slate-500 font-mono">Terminal Output</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-[#c9d1d9] custom-scrollbar-dark">
            {trainingState === 'idle' ? (
              <div className="text-slate-600 text-center mt-20 italic">Awaiting configuration...</div>
            ) : (
              <div className="space-y-1">
                {logs.map((l, i) => <div key={i}>{l}</div>)}
                {metrics && <div className="mt-4 p-2 bg-slate-800 rounded border border-slate-700 text-blue-300">Training Complete. Metrics generated.</div>}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS Scrollbar vẫn giữ nguyên */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
      `}} />
    </div>
  );
};