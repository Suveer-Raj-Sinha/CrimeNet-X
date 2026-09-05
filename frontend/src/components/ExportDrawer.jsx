import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, ShieldCheck } from 'lucide-react';

export default function ExportDrawer() {
  const [activeFormat, setActiveFormat] = useState('JSON');
  const [exportContent, setExportContent] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchExport = async (fmt) => {
    setActiveFormat(fmt);
    try {
      const endpoint = fmt === 'JSON' ? 'http://localhost:8000/api/v1/export/json' : 'http://localhost:8000/api/v1/export/xml';
      const res = await fetch(endpoint, {
        headers: { 'Investigator': 'OFFICER-771' }
      });
      const text = await res.text();
      setExportContent(text);
    } catch (err) {
      console.error('Export fetch error:', err);
    }
  };

  React.useEffect(() => {
    fetchExport('JSON');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: activeFormat === 'JSON' ? 'application/json' : 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRIMENET_X_Case_Export.${activeFormat.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full px-6 py-6 space-y-5 max-w-[1800px] mx-auto">
      <div className="glass-panel p-6 space-y-5">
        <div className="panel-header">
          <span className="panel-header-title">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Case Export
          </span>
          <span className="badge badge-cyan">CCTNS / NCRB Format</span>
        </div>

        {/* Format Toggle & Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => fetchExport('JSON')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                activeFormat === 'JSON'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              JSON Schema Export
            </button>
            <button
              onClick={() => fetchExport('XML')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                activeFormat === 'XML'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              XML Schema Export
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content Box */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto max-h-[500px] custom-scrollbar text-cyan-300">
          <pre>{exportContent}</pre>
        </div>
      </div>
    </div>
  );
}
