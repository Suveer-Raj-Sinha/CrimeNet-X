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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Onboarding Guide */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/30 flex items-center space-x-3 text-xs shadow-lg">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-slate-300">
          <strong className="text-cyan-300">How to Ingest Data:</strong> Select 1 of 23 intelligence categories below, paste raw document text or load sample data, and click <span className="text-cyan-300 font-bold">"Scan Payload & Extract Entities"</span> to process entities into the Knowledge Graph!
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Ingestion Form */}
        <div className="glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Multi-Modal Intelligence Ingestion Scanner
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Auto MIME Detector
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              Step 1: Select Category or Quick Sample Feed:
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.keys(sampleDatasets).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSourceTypeChange(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedSourceType === st
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{st.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <select
              value={selectedSourceType}
              onChange={(e) => handleSourceTypeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Step 2: File Name / Reference Identifier:
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Step 3: Document Content / CSV Log Payload:
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none custom-scrollbar"
              placeholder="Paste raw document text, call logs, or financial transactions..."
            />
          </div>

          <button
            onClick={handleScanAndIngest}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <Cpu className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-950" />
            )}
            <span>{isProcessing ? 'Executing Extraction Pipeline...' : 'Scan Payload & Extract Entities'}</span>
          </button>
        </div>

        {/* Output Extraction & Canonical Evidence Preview */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Canonical Evidence Object & Extraction Preview
              </h3>
            </div>
            {resultData && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {resultData.extracted_entities_count} Entities Extracted
              </span>
            )}
          </div>

          {resultData?.pipeline_stages && (
            <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono">
              {resultData.pipeline_stages.map((st, sIdx) => (
                <div key={sIdx} className="p-1 rounded bg-slate-900 text-center text-cyan-400 border border-slate-800">
                  ✓ {st.stage}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
            {resultData ? (
              <pre className="text-cyan-300 whitespace-pre-wrap">
                {resultData.json_preview}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
                <Database className="w-8 h-8 text-slate-600 animate-pulse" />
                <span className="text-center text-xs">
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
