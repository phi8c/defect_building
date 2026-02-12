import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertTriangle, FileText, Camera } from 'lucide-react';
import { analyzeDefectImage } from '../services/geminiService';
import { DefectResult, Severity } from '../types';

export const AnalysisDashboard: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DefectResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeDefectImage(image);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      case Severity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Severity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Severity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Image Input */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              Input Source
            </h3>
            {image && (
              <button 
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
              >
                Clear Image
              </button>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50/50">
            {!image ? (
              <div 
                className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <p className="text-slate-600 font-medium text-lg">Click to upload or drag & drop</p>
                <p className="text-slate-400 text-sm mt-1">Supports JPG, PNG, WEBP</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden">
                <img src={image} alt="Defect Candidate" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                !image || isAnalyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Image...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Run Defect Recognition
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Analysis Results */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <div className="p-4 border-b border-slate-100">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              AI Assessment Report
            </h3>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {!result && !error && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 opacity-20" />
                </div>
                <p>No analysis data available.</p>
                <p className="text-sm">Upload an image and run recognition to see results.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center">
                 <div className="space-y-4 w-full max-w-xs">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                       <span>Scanning surface...</span>
                       <span>45%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 animate-pulse w-[45%]"></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-600 mt-2">
                       <span>Categorizing defect...</span>
                       <span className="text-slate-300">Pending</span>
                    </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-200 w-0"></div>
                    </div>
                 </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Analysis Failed</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Subject</span>
                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(result.severity)}`}>
                        {result.severity} Severity
                     </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{result.subject}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Category</span>
                    <span className="font-semibold text-slate-800">{result.category}</span>
                  </div>
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">AI Confidence</span>
                    <span className="font-semibold text-slate-800">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                   <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Description</span>
                   <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {result.description}
                   </p>
                </div>

                {result.remedySuggestion && (
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Recommended Action</span>
                     <div className="flex gap-3 bg-green-50 p-4 rounded-lg border border-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <p className="text-green-800 text-sm">{result.remedySuggestion}</p>
                     </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-slate-100">
                    <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Export to PDF Report
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};