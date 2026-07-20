/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';
import { ResearchDocument, Project } from '../types.js';

interface ResearchUploadProps {
  project: Project;
  documents: ResearchDocument[];
  onUploadSuccess: () => void;
  onNextStep: () => void;
}

export default function ResearchUpload({ project, documents, onUploadSuccess, onNextStep }: ResearchUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Manual Overrides state
  const [customNotes, setCustomNotes] = useState('');
  const [overridingThemes, setOverridingThemes] = useState<string[]>([]);
  const [themeInput, setThemeInput] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError('');
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setFileContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    if (!fileContent) {
      setError('Please select or drop a valid file first.');
      return;
    }

    setLoading(true);
    setProgress(20);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: fileName,
          file_type: 'txt',
          text_content: fileContent
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to ingest file');

      // Poll background Async Job (Part 2, Section 2.8)
      const jobId = data.job_id;
      let finished = false;
      let attempts = 0;

      while (!finished && attempts < 20) {
        attempts++;
        await new Promise(r => setTimeout(r, 1500));
        
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();
        
        if (jobData.status === 'complete') {
          setProgress(100);
          finished = true;
          onUploadSuccess();
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'AI parsing failed');
        } else {
          // Increment progress smoothly
          setProgress(p => Math.min(p + 15, 90));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Parsing error. Ensure text files are formatted clearly.');
    } finally {
      setLoading(false);
    }
  };

  const addThemeOverride = () => {
    if (!themeInput) return;
    setOverridingThemes([...overridingThemes, themeInput.trim().toLowerCase()]);
    setThemeInput('');
  };

  const removeThemeOverride = (idx: number) => {
    setOverridingThemes(overridingThemes.filter((_, i) => i !== idx));
  };

  return (
    <div id="research_upload_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Upload/Selector panel */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-[#0984FD]" />
            <span>Research Ingestion</span>
          </h2>
          <p className="text-xs text-slate-500">Ingest sociological studies, health findings, or elder interview transcripts.</p>
        </div>

        {/* Drag & Drop Frame */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${dragActive ? 'border-[#0984FD] bg-blue-50/20' : 'border-slate-200'}`}
        >
          <FileText className="w-10 h-10 text-slate-400" />
          <div>
            <label htmlFor="file_upload_input" className="text-xs font-bold text-[#0984FD] hover:underline cursor-pointer block">
              Click to select file
            </label>
            <p className="text-[10px] text-slate-400 mt-1">Supports TXT, DOCX, and PDF studies (up to 50MB)</p>
          </div>
          <input
            id="file_upload_input"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.doc,.docx,.pdf"
          />
        </div>

        {fileName && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 line-clamp-1">{fileName}</span>
            <button onClick={() => { setFileName(''); setFileContent(''); }} className="text-red-500 hover:underline">Clear</button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          id="btn_submit_ingest"
          onClick={handleUploadSubmit}
          disabled={loading || !fileContent}
          className="w-full bg-[#0E2A5C] hover:bg-[#0984FD] disabled:bg-slate-200 text-white text-xs font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Parsing Research ({progress}%)</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Ingest & Analyze Document</span>
            </>
          )}
        </button>

        {/* Local instructions */}
        <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-[#0E2A5C]">Why Ingest?</p>
          <p className="text-[11px] leading-relaxed">
            StoryLab enforces thematic grounding. Once analyzed, our system isolates core cultural themes (e.g. maternal health access) to align story Synopses, Character Motivations, and Screenplay Dialects.
          </p>
        </div>
      </div>

      {/* Results & Overrides Panel */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Processed Research Context</h3>

        {documents.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No research documents uploaded yet. Add a study to view automatic summaries, entities, and extracted themes.
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map(doc => (
              <div key={doc.id} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-[#0E2A5C]">{doc.file_name}</h4>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Processed</span>
                </div>

                {/* Executive Summary */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Executive Summary (MOD-01)</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                    {doc.summary || 'Summary processing...'}
                  </p>
                </div>

                {/* Extracted Themes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grounded Cultural Themes</span>
                  <div className="flex flex-wrap gap-2">
                    {doc.themes?.map((t, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center space-x-4">
                          <span className="font-bold text-[#0E2A5C] uppercase tracking-wider font-mono text-[9px]">{t.theme}</span>
                          <span className="text-[9px] font-extrabold text-blue-500">{(t.confidence * 100).toFixed(0)}% Match</span>
                        </div>
                        <p className="text-[10px] text-slate-600 italic">"{t.excerpt}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entities extracted */}
                {doc.entities && doc.entities.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extracted Entities & Actors</span>
                    <div className="flex flex-wrap gap-2">
                      {doc.entities.map((ent, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs">
                          <strong className="text-slate-400 font-bold uppercase text-[9px] mr-1">{ent.type}:</strong> {ent.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Manual Override Inputs (AC-T03) */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thematic Manual Overrides (AC-T03)</span>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">Inject Custom Story Notes / Constraints</label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Include specific sub-themes regarding local traditional song melodies sung during delivery."
                  className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">Override / Add custom thematic tag</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    placeholder="e.g. elder-mistrust"
                    className="flex-1 text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
                  />
                  <button
                    onClick={addThemeOverride}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tag</span>
                  </button>
                </div>

                {overridingThemes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {overridingThemes.map((tag, idx) => (
                      <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 uppercase">
                        <span>{tag}</span>
                        <button onClick={() => removeThemeOverride(idx)} className="text-amber-500 hover:text-amber-700 font-extrabold">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step trigger */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                id="btn_to_story_generation"
                onClick={onNextStep}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-4 py-2.5 rounded shadow hover:shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>Select & Generate Story Premise</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
