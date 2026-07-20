/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Sparkles, AlertCircle, FileText, CheckCircle, ArrowRight, Printer, Share2, RefreshCw } from 'lucide-react';
import { Project } from '../types.js';

interface ExportPageProps {
  project: Project;
}

export default function ExportPage({ project }: ExportPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportFile, setExportFile] = useState<{ name: string; content: string; format: string } | null>(null);

  const handleExport = async (format: 'markdown' | 'html') => {
    setLoading(true);
    setError('');
    setExportFile(null);

    try {
      const response = await fetch(`/api/projects/${project.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Export rendering failed');

      setExportFile({
        name: data.file_name,
        content: data.content,
        format
      });
    } catch (err: any) {
      setError(err.message || 'Error exporting portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    if (!exportFile) return;
    
    const mime = exportFile.format === 'html' ? 'text/html' : 'text/markdown';
    const blob = new Blob([exportFile.content], { type: mime });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="export_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Left side: Selector choices */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
            <Download className="w-5 h-5 text-[#0984FD]" />
            <span>Pre-production Exporter (MOD-11)</span>
          </h2>
          <p className="text-xs text-slate-500">Compile your entire workspace assets into a single print-ready proposal dossier.</p>
        </div>

        <div className="space-y-3.5">
          {/* Markdown Option */}
          <div
            id="export_opt_markdown"
            onClick={() => handleExport('markdown')}
            className="border border-slate-200 rounded-xl p-4 hover:border-[#0984FD] hover:shadow-sm cursor-pointer transition-all space-y-2 bg-slate-50/50"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-[#0E2A5C] text-xs uppercase tracking-wider">Markdown File (.md)</h4>
              <span className="bg-slate-200 text-slate-600 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded">LITE</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Standard, highly portable markdown containing clean table rows, dialogue scripts, and bulleted risk sheets. Perfect for git repos or local text files.
            </p>
          </div>

          {/* HTML Option */}
          <div
            id="export_opt_html"
            onClick={() => handleExport('html')}
            className="border border-slate-200 rounded-xl p-4 hover:border-[#0984FD] hover:shadow-sm cursor-pointer transition-all space-y-2 bg-slate-50/50"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-[#0E2A5C] text-xs uppercase tracking-wider">HTML & CSS Dossier (.html)</h4>
              <span className="bg-blue-100 text-[#0984FD] font-bold font-mono text-[9px] px-1.5 py-0.5 rounded">RECOMMENDED</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Fully compiled, stylized web document with embedded CSS grids, formatted dialogues, print page breaks, and bento-grid characters profiles. Prints beautifully to PDF.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-[#0E2A5C] flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Proposal Inclusions Checklist:</span>
          </h4>
          <ul className="space-y-1 text-[11px] text-slate-500">
            <li>&bull; Executive Research Ingestion Summaries</li>
            <li>&bull; Grounded Cultural Thematic tags & confidence indices</li>
            <li>&bull; Cast Profile Motivations & Voice notes</li>
            <li>&bull; Chronological Scene Sluglines & Script text</li>
            <li>&bull; Camera Equipment Lists & Crew rosters</li>
            <li>&bull; Itemized Category subtotal calculators & Contingency limits</li>
            <li>&bull; Call Sheets & On-Set Risk assessment mitigations</li>
          </ul>
        </div>
      </div>

      {/* Right side: File text downloader / pre-visualizer */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6 flex flex-col justify-between min-h-[450px]">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <RefreshCw className="w-10 h-10 text-[#0E2A5C] animate-spin" />
            <h4 className="font-bold text-slate-700">Compiling Workspace Assets...</h4>
            <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
              Generating formatted HTML layouts, parsing screenplay versions, and computing itemized budget totals. Please wait.
            </p>
          </div>
        ) : !exportFile ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-300" />
            <h4 className="font-bold text-slate-700">No Asset Compiled Yet</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Select one of our proposal export formats in the left panel to trigger automatic compilation.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-center justify-between text-xs text-green-800">
                <span className="font-bold flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dossier successfully rendered!</span>
                </span>
                <span className="font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{exportFile.format}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Generated Filename</span>
                <p className="text-xs font-mono font-bold text-[#0E2A5C] bg-slate-50 p-2 rounded border border-slate-100">{exportFile.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Dossier Code Preview</span>
                <div className="bg-slate-900 text-slate-300 font-mono text-[9px] p-4 rounded-lg border border-slate-800 overflow-y-auto max-h-56 leading-relaxed whitespace-pre">
                  {exportFile.content.substring(0, 1000)}...
                  {"\n\n[Truncated - full content ready for download]"}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 text-xs pt-4 border-t border-slate-100">
              <button
                onClick={triggerDownload}
                className="flex-1 bg-[#0E2A5C] hover:bg-[#0984FD] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Download Compiled Dossier</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
