/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, Save, CheckCircle, AlertCircle, FileText, ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { Scene, ScreenplayVersion, Project } from '../types.js';

interface ScreenplayEditorProps {
  project: Project;
  sceneId: string;
  onBack: () => void;
  onScreenplayFinalized: () => void;
}

export default function ScreenplayEditor({ project, sceneId, onBack, onScreenplayFinalized }: ScreenplayEditorProps) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [version, setVersion] = useState<ScreenplayVersion | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSceneDetails();
  }, [sceneId]);

  const fetchSceneDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const data = await response.json();
        const foundScene = data.scenes?.find((s: any) => s.id === sceneId);
        setScene(foundScene || null);

        // Fetch latest version
        if (foundScene) {
          const matchedVersion = data.project.latest_screenplays?.[sceneId] || null;
          setVersion(matchedVersion);
          setContent(matchedVersion?.content || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateScreenplayDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/scenes/${sceneId}/screenplay`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Dialogue generation failed');

      const jobId = data.job_id;
      let finished = false;
      let attempts = 0;

      while (!finished && attempts < 25) {
        attempts++;
        await new Promise(r => setTimeout(r, 1500));
        
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();

        if (jobData.status === 'complete') {
          const ver = jobData.result_ref?.version;
          setVersion(ver);
          setContent(ver?.content || '');
          finished = true;
          onScreenplayFinalized(); // Trigger list reload
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Generation failed midway');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error generating dialogue. Please ensure a valid API key is set in secrets.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/screenplay/${sceneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          version_number: version?.version_number || 1
        })
      });

      if (!response.ok) throw new Error('Failed to update screenplay text');
      
      const data = await response.json();
      setVersion(data.version);
      setIsEditing(false);
      onScreenplayFinalized();
    } catch (err: any) {
      setError(err.message || 'Failed to save edits');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeScene = async () => {
    if (!content) return;
    const confirmFinal = confirm('Are you sure you want to finalize this scene screenplay? This locks down the text and enables storyboard illustration features.');
    if (!confirmFinal) return;

    try {
      const response = await fetch(`/api/scenes/${sceneId}/screenplay/finalize`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Scene finalized! Storyboarding and Budgeting features are now unlocked for this scene block.');
        onScreenplayFinalized();
        onBack();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Finalization error');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!scene) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading scene workspace...</div>;
  }

  return (
    <div id="screenplay_workspace" className="space-y-6 font-sans">
      
      {/* Header breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] bg-blue-50 text-[#0984FD] font-bold px-1.5 py-0.5 rounded font-mono uppercase">Scene #{scene.order_index}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${scene.status === 'final' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{scene.status}</span>
            </div>
            <h3 className="font-mono font-bold text-[#0E2A5C] text-sm mt-1">{scene.slugline}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {content && !isEditing && scene.status !== 'final' && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold border border-slate-200 hover:border-[#0E2A5C] text-slate-700 hover:text-[#0E2A5C] bg-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual Edit</span>
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          )}

          {content && scene.status !== 'final' && (
            <button
              id="btn_finalize_screenplay"
              onClick={handleFinalizeScene}
              className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Finalize Screenplay</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start space-x-2 text-xs text-red-700 max-w-2xl mx-auto">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Screenplay Document Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Core Screenplay Script Viewport */}
        <div className="lg:col-span-8 bg-slate-100 rounded-xl border border-slate-200 p-1 sm:p-4 min-h-[500px] flex flex-col justify-between">
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
              <RefreshCw className="w-10 h-10 text-[#0E2A5C] animate-spin" />
              <h4 className="font-bold text-slate-700 text-sm">Drafting Bilingual Dialogue (MOD-05 & MOD-06)</h4>
              <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                Gemini is applying character motivations, formatting headers, and writing scene dialogue in standard screenplay Courier. Please wait.
              </p>
            </div>
          ) : !content ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-400" />
              <h4 className="font-bold text-slate-700">Empty Screenplay Stage</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                This scene beat has no active dialogue draft. Click below to automatically draft standard Swahili-English screenplay text using model intelligence.
              </p>
              <button
                id="btn_draft_screenplay"
                onClick={generateScreenplayDraft}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-semibold px-4 py-2.5 rounded shadow flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Draft Dialogue with Gemini</span>
              </button>
            </div>
          ) : isEditing ? (
            <div className="flex-1 flex flex-col space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-6 font-mono text-xs bg-white text-slate-800 rounded-lg border border-slate-300 focus:outline-none min-h-[400px] leading-relaxed"
                rows={20}
              />
              <div className="text-[10px] text-slate-400">Editing is saved in real-time as a version index.</div>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-8 shadow-inner overflow-y-auto max-h-[600px] text-xs">
              
              {/* Screenplay formatted Courier block */}
              <div className="font-mono text-slate-800 whitespace-pre-wrap leading-loose select-text max-w-lg mx-auto">
                {content}
              </div>
            </div>
          )}

          {version && !isEditing && !loading && (
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 rounded-b-lg font-mono">
              <span>Draft Version: v{version.version_number}</span>
              <span>Author: Student / AI Hybrid</span>
            </div>
          )}
        </div>

        {/* Supporting Context Rail */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <h3 className="text-xs font-bold text-[#0E2A5C] uppercase tracking-wider">Scene Parameters Guide</h3>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Dramatic Purpose</span>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
              {scene.purpose}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Active Cast (MOD-03)</span>
            <div className="space-y-2">
              {scene.characters_present?.map((cName, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[10px] leading-relaxed">
                  <strong className="text-[#0E2A5C] block font-semibold">{cName}</strong>
                  <p className="text-slate-500 mt-0.5">Enforces bilingual Swahili code-switch parameters and local dialetical tone.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50/50 text-[11px] text-slate-600 space-y-2">
            <h4 className="font-bold text-[#0E2A5C] flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-[#0984FD]" />
              <span>Bilingual Code-Switching Rule</span>
            </h4>
            <p className="leading-relaxed">
              East African characters naturally toggle between Kiswahili and English depending on hierarchy and stress levels.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
