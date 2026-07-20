/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, Edit3, ArrowRight, Layers, Sliders, ChevronDown, RefreshCw } from 'lucide-react';
import { Project, StoryConcept } from '../types.js';

interface StoryGeneratorProps {
  project: Project;
  storyConcept: StoryConcept | null;
  onStoryConfigured: () => void;
}

export default function StoryGenerator({ project, storyConcept, onStoryConfigured }: StoryGeneratorProps) {
  const [concepts, setConcepts] = useState<Array<{ title: string; logline: string; synopsis: string }>>([]);
  const [generatingOptions, setGeneratingOptions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  // Custom manual edit inputs
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLogline, setEditLogline] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');

  // Pipeline execution state
  const [executingPipeline, setExecutingPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStatusText, setPipelineStatusText] = useState('');
  const [error, setError] = useState('');

  const generatePremiseOptions = async () => {
    setGeneratingOptions(true);
    setError('');
    setSelectedIdx(null);

    try {
      const response = await fetch(`/api/projects/${project.id}/story-concept`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to trigger options generator');

      const jobId = data.job_id;
      let finished = false;
      let attempts = 0;

      while (!finished && attempts < 25) {
        attempts++;
        await new Promise(r => setTimeout(r, 1200));
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();

        if (jobData.status === 'complete') {
          setConcepts(jobData.result_ref?.concepts || []);
          finished = true;
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Options generation failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error generating premise options. Please check API key logs.');
    } finally {
      setGeneratingOptions(false);
    }
  };

  const startManualEdit = (idx: number) => {
    const c = concepts[idx];
    setEditingIndex(idx);
    setEditTitle(c.title);
    setEditLogline(c.logline);
    setEditSynopsis(c.synopsis);
  };

  const saveManualEdit = () => {
    if (editingIndex === null) return;
    const updated = [...concepts];
    updated[editingIndex] = {
      title: editTitle,
      logline: editLogline,
      synopsis: editSynopsis
    };
    setConcepts(updated);
    setEditingIndex(null);
  };

  // Triggers the entire automatic pre-production pipeline! (MOD-02 & MOD-03 & MOD-04 automation)
  const handleSelectAndInitializePipeline = async () => {
    if (selectedIdx === null) return;
    const chosen = concepts[selectedIdx];

    setExecutingPipeline(true);
    setPipelineProgress(10);
    setPipelineStatusText('Initiating pre-production compilation pipeline...');
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}/story-concept/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: chosen.title,
          logline: chosen.logline,
          synopsis: chosen.synopsis
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to initiate pipeline');

      const jobId = data.job_id;
      let finished = false;
      let attempts = 0;

      while (!finished && attempts < 30) {
        attempts++;
        await new Promise(r => setTimeout(r, 1500));
        
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();

        if (jobData.status === 'complete') {
          setPipelineProgress(100);
          setPipelineStatusText('Completed safely! Characters, Plot and Scene sheets compiled.');
          finished = true;
          onStoryConfigured();
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Pipeline execution failed midway');
        } else {
          const currentProgress = jobData.progress_pct || 20;
          setPipelineProgress(currentProgress);
          if (currentProgress < 40) {
            setPipelineStatusText(`Step 1/3: Extracting Swahili character personas... (${currentProgress}%)`);
          } else if (currentProgress < 75) {
            setPipelineStatusText(`Step 2/3: Structuring Three-Act plots & beat sheet... (${currentProgress}%)`);
          } else {
            setPipelineStatusText(`Step 3/3: Drafting Scene and order tables... (${currentProgress}%)`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Pipeline automation crashed. Check local console logs.');
      setExecutingPipeline(false);
    }
  };

  return (
    <div id="story_generator_root" className="space-y-8 font-sans">
      
      {/* Introduction */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#0984FD]" />
            <span>Story Premise & Plot Structuring</span>
          </h2>
          <p className="text-xs text-slate-500">Translate grounded themes into distinct premise paths. Select one to auto-trigger complete storyboards.</p>
        </div>
        {!storyConcept && concepts.length === 0 && !generatingOptions && (
          <button
            id="btn_trigger_concepts"
            onClick={generatePremiseOptions}
            className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Premise Options</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start space-x-2.5 text-xs text-red-700 max-w-2xl mx-auto">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading States */}
      {generatingOptions && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <RefreshCw className="w-10 h-10 text-[#0984FD] animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Orchestrating Narrative Premises...</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            MOD-02 is combining your parameters, genres, and selected research themes to write 3 distinct Swahili-English loglines. Please wait.
          </p>
        </div>
      )}

      {executingPipeline && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-6 max-w-xl mx-auto shadow-md">
          <RefreshCw className="w-12 h-12 text-[#0E2A5C] animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#0E2A5C]">Auto-triggering Pre-production Compilation</h3>
            <p className="text-xs text-[#0984FD] font-semibold">{pipelineStatusText}</p>
          </div>
          
          <div className="space-y-1 max-w-xs mx-auto">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
              <div className="bg-[#0E2A5C] h-full transition-all duration-300" style={{ width: `${pipelineProgress}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Progress: {pipelineProgress}%</span>
          </div>

          <div className="bg-blue-50/20 p-3 rounded-lg border border-blue-50/50 text-[10px] text-slate-600 max-w-sm mx-auto">
            This automatically registers character motivations, calculates act boundaries, writes narrative beats, and establishes the initial scene listing in parallel.
          </div>
        </div>
      )}

      {/* CONFIRMED STORY CONCEPT OVERVIEW */}
      {storyConcept && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Confirmed Premise Details */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Confirmed Active Story</span>
              <h3 className="text-lg font-bold text-[#0E2A5C] mt-2">{project.title}</h3>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logline</span>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded border border-slate-100">
                {storyConcept.logline}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Narrative Synopsis</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-line">
                {storyConcept.synopsis}
              </p>
            </div>
          </div>

          {/* Structured Outlines Viewer (Acts & Beats) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Act structure */}
            {storyConcept.three_act_structure && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4.5 h-4.5 text-[#0984FD]" />
                  <span>Three-Act Structure Breakdown</span>
                </h3>
                <div className="space-y-3 font-sans text-xs">
                  <div className="border-l-2 border-blue-400 pl-3">
                    <strong className="text-[#0E2A5C] block font-semibold">{storyConcept.three_act_structure.act1?.title || 'Act 1'}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{storyConcept.three_act_structure.act1?.description}</p>
                  </div>
                  <div className="border-l-2 border-[#0984FD] pl-3">
                    <strong className="text-[#0E2A5C] block font-semibold">{storyConcept.three_act_structure.act2?.title || 'Act 2'}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{storyConcept.three_act_structure.act2?.description}</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-3">
                    <strong className="text-[#0E2A5C] block font-semibold">{storyConcept.three_act_structure.act3?.title || 'Act 3'}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{storyConcept.three_act_structure.act3?.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Beat sheet */}
            {storyConcept.beat_sheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider flex items-center space-x-1.5">
                  <Sliders className="w-4.5 h-4.5 text-[#0984FD]" />
                  <span>Narrative Beat Sheet (Timeline)</span>
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {storyConcept.beat_sheet.map((beat: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="font-mono font-bold text-[#0984FD] shrink-0 mt-0.5">#{idx + 1}</span>
                      <div>
                        <strong className="text-slate-800 block font-semibold">{beat.beat_name}</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">{beat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CONCEPT LIST SELECTION GRID */}
      {!storyConcept && concepts.length > 0 && !generatingOptions && !executingPipeline && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Select A Structural Path</h3>
            <button onClick={generatePremiseOptions} className="text-xs text-[#0984FD] hover:underline flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Alternatives</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {concepts.map((c, idx) => {
              const isSelected = selectedIdx === idx;
              const isEditing = editingIndex === idx;

              return (
                <div
                  id={`story_option_card_${idx}`}
                  key={idx}
                  onClick={() => !isEditing && setSelectedIdx(idx)}
                  className={`border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between hover:shadow-md ${isSelected ? 'border-[#0984FD] bg-blue-50/10 ring-1 ring-[#0984FD]' : 'border-slate-200 bg-white'}`}
                >
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Option {idx + 1}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); startManualEdit(idx); }}
                        className="text-slate-400 hover:text-[#0984FD]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 text-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Working Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Logline</label>
                          <textarea
                            value={editLogline}
                            onChange={(e) => setEditLogline(e.target.value)}
                            className="w-full border border-slate-200 rounded p-2 text-xs"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Synopsis</label>
                          <textarea
                            value={editSynopsis}
                            onChange={(e) => setEditSynopsis(e.target.value)}
                            className="w-full border border-slate-200 rounded p-2 text-xs"
                            rows={4}
                          />
                        </div>
                        <button
                          onClick={saveManualEdit}
                          className="bg-[#0E2A5C] text-white text-[10px] font-bold px-3 py-1.5 rounded"
                        >
                          Apply Custom Changes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-[#0E2A5C] text-sm">{c.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">"{c.logline}"</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-4">{c.synopsis}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    {isSelected ? (
                      <span className="text-green-600 flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Selected Path</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Click card to select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedIdx !== null && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                id="btn_confirm_concept_pipeline"
                onClick={handleSelectAndInitializePipeline}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-5 py-3 rounded-lg shadow hover:shadow-md transition-all flex items-center space-x-2 animate-bounce"
              >
                <span>Confirm Selected Premise & compile Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
