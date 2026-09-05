import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSearch,
  CheckCircle2,
  Copy,
  Download,
  Code2,
  FileCode2,
  Sparkles,
  User,
  Phone,
  MapPin,
  CreditCard,
  Car,
  RefreshCw,
  Eye,
  ScanText
} from 'lucide-react';

export default function DocumentOcrScanner() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [activeFormat, setActiveFormat] = useState('json'); // 'json' or 'xml'
  const [extractedResult, setExtractedResult] = useState(null);
  const [copyNotification, setCopyNotification] = useState(null);

  const demoDocuments = [
    {
      name: 'FIR_Case_Report_2026.pdf',
      type: 'PDF Document',
      icon: FileText,
      color: 'border-cyan-500/40 text-cyan-300',
      sampleText: `FIRST INFORMATION REPORT (FIR) - CASE #2026-CYBER-09
Incident Date: 2026-08-15 | Location: Jaipur Cyber Cell, Rajasthan
Suspect Name: Vikram Singh (Alias: V-Phantom)
Associated Person: Rahul Sharma
Phone Numbers: +919876543210, +919811223344
Bank Account: HDFC-ACC-982103, ICICI-ACC-449102
Vehicle Plate: RJ-14-CB-9921
Summary: Intercepted transferring funds across shell accounts.`
    },
    {
      name: 'Evidence_Photo_Scan.jpg',
      type: 'JPEG Image (OCR)',
      icon: ImageIcon,
      color: 'border-emerald-500/40 text-emerald-300',
      sampleText: `TRAFFIC CAMERA OCR SCAN - LOCATION: JAIPUR METRO
Captured Timestamp: 2026-08-16T14:22:10Z
Vehicle License Plate Identified: RJ-14-CB-9921
Driver Visual Match: Vikram Singh (Confidence: 94.8%)
Nearby Cell Tower Match: +919876543210`
    },
    {
      name: 'CDR_Call_Detail_Record.csv',
      type: 'CSV Dataset',
      icon: FileCode2,
      color: 'border-purple-500/40 text-purple-300',
      sampleText: `Source_Phone,Target_Phone,Duration_Sec,Timestamp,Tower_Location
+919876543210,+919811223344,420,2026-08-15T18:10:00Z,Jaipur Station
+919876543210,+919822334455,180,2026-08-15T19:40:00Z,Delhi Central`
    }
  ];

  const handleProcessScan = async (uploadedFile, customText = null, filename = 'document.pdf') => {
    setScanning(true);
    setExtractedResult(null);

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else if (customText) {
        formData.append('raw_content', customText);
        formData.append('filename', filename);
      }

      const res = await fetch('http://localhost:8000/api/v1/documents/scan-extract', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Document scanning failed');
      const data = await res.json();
      setExtractedResult(data);
    } catch (err) {
      console.error('Scan Error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      handleProcessScan(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      handleProcessScan(e.target.files[0]);
    }
  };

  const handleCopyCode = (text, format) => {
    navigator.clipboard.writeText(text);
    setCopyNotification(`✓ ${format.toUpperCase()} copied to clipboard!`);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  const handleDownloadCode = (content, filename, extension) => {
    const blob = new Blob([content], { type: extension === 'json' ? 'application/json' : 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.split('.')[0]}_extracted.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-lg">
            <ScanText className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Document OCR & Intelligence Scanner
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase">
                MULTI-FORMAT OCR
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload PDF, JPEG, PNG, WEBP, or TXT documents. Scans & extracts entities formatted as <strong>JSON</strong> and <strong>XML</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ENGINE: FAST-OCR v2.4</span>
        </div>
      </div>

      {/* Main Grid: Upload Dropzone & Extracted Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Upload Dropzone & Sample Document Selector */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* File Drag-and-Drop Card Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="p-6 rounded-2xl bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-cyan-400 transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer group relative overflow-hidden"
          >
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff,.txt,.csv,.json"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7 text-cyan-400" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Drag & Drop Document Files Here
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, JPEG, PNG, WEBP, TIFF, TXT, CSV
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 font-bold text-xs border border-slate-700">
              Browse Local Files
            </span>
          </div>

          {/* Preset Sample Documents */}
          <div className="p-4.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              ⚡ 1-Click Load Sample Case Files:
            </span>

            <div className="space-y-2">
              {demoDocuments.map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFile({ name: doc.name });
                      handleProcessScan(null, doc.sampleText, doc.name);
                    }}
                    className={`w-full p-3 rounded-xl border bg-slate-950/80 hover:bg-slate-900 text-left flex items-center justify-between transition-all cursor-pointer ${doc.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.type}</span>
                      </div>
                    </div>
                    <Sparkles className="w-4 h-4 shrink-0 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: OCR Results, Extracted Summary & Dual JSON/XML Code Viewer */}
        <div className="lg:col-span-7 space-y-4">

          {/* Scanning Progress Loader */}
          {scanning && (
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center space-y-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white">Scanning Document & Performing OCR...</h3>
                <p className="text-xs text-slate-400 mt-1">Extracting suspects, phone numbers, location coordinates, and financial records.</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {extractedResult && !scanning && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Extracted Entity Metric Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">SUSPECTS</span>
                    <strong className="text-xs text-white">{extractedResult.json_data.extracted_entities.persons.length} Found</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">PHONES</span>
                    <strong className="text-xs text-white">{extractedResult.json_data.extracted_entities.phones.length} Numbers</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">LOCATIONS</span>
                    <strong className="text-xs text-white">{extractedResult.json_data.extracted_entities.locations.length} Places</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ACCOUNTS</span>
                    <strong className="text-xs text-white">{extractedResult.json_data.extracted_entities.bank_accounts.length} Bank IDs</strong>
                  </div>
                </div>
              </div>

              {/* Toast Copy Notification */}
              {copyNotification && (
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span>{copyNotification}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              {/* DUAL SYNTAX VIEWER BOX (JSON vs XML) */}
              <div className="rounded-2xl bg-[#080c16] border border-slate-800 overflow-hidden shadow-2xl">
                
                {/* Syntax Viewer Header & Format Switcher */}
                <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
                  
                  {/* Format Toggle Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveFormat('json')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        activeFormat === 'json'
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>JSON Format</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFormat('xml')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        activeFormat === 'xml'
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>XML Format</span>
                    </button>
                  </div>

                  {/* Actions: Copy & Download */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(
                        activeFormat === 'json'
                          ? JSON.stringify(extractedResult.json_data, null, 2)
                          : extractedResult.xml_data,
                        activeFormat
                      )}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCode(
                        activeFormat === 'json'
                          ? JSON.stringify(extractedResult.json_data, null, 2)
                          : extractedResult.xml_data,
                        extractedResult.filename,
                        activeFormat
                      )}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      title="Download Extracted File"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Download .{activeFormat}</span>
                    </button>
                  </div>

                </div>

                {/* Code Window Box */}
                <div className="p-4 max-h-[420px] overflow-y-auto custom-scrollbar font-mono text-xs text-cyan-300 bg-slate-950/90 leading-relaxed select-text">
                  <pre className="whitespace-pre-wrap break-all">
                    {activeFormat === 'json'
                      ? JSON.stringify(extractedResult.json_data, null, 2)
                      : extractedResult.xml_data}
                  </pre>
                </div>

              </div>

            </div>
          )}

          {/* Initial State Helper Box */}
          {!extractedResult && !scanning && (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <FileSearch className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Document Scanned Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a document file on the left or select a sample case file to view extracted JSON & XML intelligence output.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
