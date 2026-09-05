import React, { useState } from 'react';
import { 
  UploadCloud, 
  CheckCircle, 
  FileCode, 
  Cpu, 
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function IngestionScanner({ sourceTypes, onIngestSuccess }) {
  const [selectedSourceType, setSelectedSourceType] = useState('FIR / Police Reports');
  const [fileName, setFileName] = useState('New_FIR_Document.txt');
  const [rawText, setRawText] = useState(`FIR No: 404/2026
Jaipur Police Station
Date: 25 August 2026

Suspect Amit Kumar was spotted near Jaipur Toll Plaza driving white Hyundai Creta plate RJ14AB1234.
Contacted suspect Rahul Sharma on mobile number +91-9876543210 and transferred ₹1,50,000 from account AC-998877.`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState(null);

  const sampleDatasets = {
    'FIR / Police Reports': `FIR No: 505/2026 Jaipur Police Station. Suspect Rahul Sharma seen near Jaipur Station with vehicle RJ14AB1234. Phone: +919876543210.`,
    'CDR (Call Detail Records)': `caller_number,receiver_number,timestamp,duration_seconds,cell_tower
+919876543210,+919811223344,2026-08-25T21:20:00,180,Jaipur Railway Station Tower
+919876543210,+919855443322,2026-08-25T21:26:00,45,Jaipur Railway Station Tower`,
    'CCTV / ANPR Metadata': `license_plate,camera_location,timestamp,confidence
RJ14AB1234,Jaipur Toll Plaza Gate 2,2026-08-25T21:10:00,0.98
RJ14AB1234,Jaipur Railway Station North,2026-08-25T21:32:00,0.96`,
    'Financial Transactions / UPI': `sender_account,receiver_account,amount_inr,timestamp
AC-998877,AC-112233,150000,2026-08-25T20:15:00
AC-112233,AC-445566,120000,2026-08-25T20:45:00`
  };

  const handleSourceTypeChange = (type) => {
    setSelectedSourceType(type);
    if (sampleDatasets[type]) {
      setRawText(sampleDatasets[type]);
      setFileName(`${type.replace(/[^a-zA-Z0-9]/g, '_')}_Sample.txt`);
    }
  };

  const handleScanAndIngest = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file_name', fileName);
      formData.append('raw_content', rawText);
      formData.append('source_type', selectedSourceType);

      const res = await fetch('http://localhost:8000/api/v1/evidence/ingest', {
        method: 'POST',
        headers: { 'Investigator': 'OFFICER-771' },
        body: formData
      });
      const data = await res.json();
      setResultData(data);
      if (onIngestSuccess) onIngestSuccess();
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-5 max-w-[1800px] mx-auto">
      {/* Onboarding Guide */}
      <div className="px-6 py-4.5 sm:px-7 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/30 flex items-center gap-3.5 text-xs shadow-lg">
        <Info className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
        <span className="text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">How to Ingest Data:</strong> Select 1 of 23 intelligence categories below, paste raw document text or load sample data, and click <span className="text-cyan-300 font-bold">"Scan Payload & Extract Entities"</span> to process entities into the Knowledge Graph!
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Ingestion Form */}
        <div className="glass-panel p-6 sm:p-7 space-y-6">
          <div className="panel-header pb-3 border-b border-slate-800/80">
            <span className="panel-header-title text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Intelligence Ingestion
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Step 1: Select Category or Quick Sample Feed:
            </label>
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {Object.keys(sampleDatasets).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSourceTypeChange(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedSourceType === st
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{st.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <select
              value={selectedSourceType}
              onChange={(e) => handleSourceTypeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
            >
              {(sourceTypes || [
                'FIR / Police Reports',
                'Case Diaries / Investigation Notes',
                'Witness Statements',
                'CDR (Call Detail Records)',
                'Financial Transactions / UPI',
                'CCTV / ANPR Metadata',
                'Location / GPS Data',
                'Vehicle Records'
              ]).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Step 2: File Name / Reference Identifier:
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Step 3: Document Content / CSV Log Payload:
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-4 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none custom-scrollbar leading-relaxed"
              placeholder="Paste raw document text, call logs, or financial transactions..."
            />
          </div>

          <button
            onClick={handleScanAndIngest}
            disabled={isProcessing}
            className="w-full text-slate-950 font-bold py-3.5 px-5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer active:scale-98 hover:brightness-110"
            style={{
              background: 'linear-gradient(90deg, #06B6D4 0%, #2563EB 100%)',
              color: '#020617'
            }}
          >
            {isProcessing ? (
              <Cpu className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-950" />
            )}
            <span className="font-bold text-slate-950">
              {isProcessing ? 'Executing Extraction Pipeline...' : 'Scan Payload & Extract Entities'}
            </span>
          </button>
        </div>

        {/* Output Extraction & Canonical Evidence Preview */}
        <div className="glass-panel p-6 sm:p-7 space-y-6 flex flex-col">
          <div className="panel-header pb-3 border-b border-slate-800/80">
            <span className="panel-header-title text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-emerald-400" />
              Extraction Preview
            </span>
            {resultData && (
              <span className="badge badge-green flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {resultData.extracted_entities_count} entities
              </span>
            )}
          </div>

          {resultData?.pipeline_stages && (
            <div className="grid grid-cols-4 gap-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono">
              {resultData.pipeline_stages.map((st, sIdx) => (
                <div key={sIdx} className="p-1.5 rounded bg-slate-900 text-center text-cyan-400 border border-slate-800">
                  ✓ {st.stage}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-xs overflow-y-auto custom-scrollbar min-h-[360px]">
            {resultData ? (
              <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed">
                {resultData.json_preview}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-16 px-6">
                <Database className="w-9 h-9 text-slate-600 animate-pulse" />
                <span className="text-center text-xs text-slate-400 max-w-sm leading-relaxed">
                  Submit payload to inspect canonical evidence object and extracted JSON/XML schema.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
