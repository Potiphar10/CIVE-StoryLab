/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Image, Camera, Sliders, Play, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { Scene, StoryboardPanel, ShotListEntry, Project } from '../types.js';

interface StoryboardViewerProps {
  project: Project;
  scenes: Scene[];
}

export default function StoryboardViewer({ project, scenes }: StoryboardViewerProps) {
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id || '');
  const [panels, setPanels] = useState<StoryboardPanel[]>([]);
  const [shots, setShots] = useState<ShotListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'visuals' | 'shots'>('visuals');

  useEffect(() => {
    if (activeSceneId) {
      fetchStoryboardDetails();
    }
  }, [activeSceneId]);

  const fetchStoryboardDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch scene storyboard panels & shot list
        const panRes = await fetch(`/api/scenes/${activeSceneId}/storyboard`);
        const panData = await panRes.json();
        setPanels(panData.data || []);

        const shotRes = await fetch(`/api/scenes/${activeSceneId}/shot-list`);
        const shotData = await shotRes.json();
        setShots(shotData.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeScene = scenes.find(s => s.id === activeSceneId);
  const isSceneFinal = activeScene?.status === 'final';

  const generateStoryboard = async () => {
    if (!activeSceneId) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/scenes/${activeSceneId}/storyboard`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Storyboard generation failed');

      const jobId = data.job_id;
      let finished = false;
      let attempts = 0;

      while (!finished && attempts < 25) {
        attempts++;
        await new Promise(r => setTimeout(r, 1500));
        
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        const jobData = await jobRes.json();

        if (jobData.status === 'complete') {
          finished = true;
          fetchStoryboardDetails();
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Illustration mapping failed midway');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error illustrating panels. Check final screenplay text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="storyboard_root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Left side: Scenes roster selection */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Scenes List</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {scenes.map(s => {
            const isSel = s.id === activeSceneId;
            const isFinal = s.status === 'final';

            return (
              <div
                id={`storyboard_scene_btn_${s.id}`}
                key={s.id}
                onClick={() => setActiveSceneId(s.id)}
                className={`p-3 rounded-lg border cursor-pointer text-xs space-y-1.5 transition-all ${isSel ? 'border-[#0984FD] bg-blue-50/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-400">Scene #{s.order_index}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${isFinal ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {s.status}
                  </span>
                </div>
                <h4 className="font-mono font-semibold text-[#0E2A5C] line-clamp-1">{s.slugline}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Active Storyboard Panels & Shot List compiling */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Stage eligibility check */}
        {!isSceneFinal ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Scene Not Finalized</h3>
            <p className="text-xs text-slate-500">
              The storyboard is locked for Scene #{activeScene?.order_index || 1}. You must complete and mark the screenplay dialogue as <strong className="text-slate-700">"Finalize Screenplay"</strong> under the Screenplay Stage to unlock storyboard generation.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            
            {/* Header tab selectors */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Visual Compositions & Shot Breakdown</h3>
                <p className="text-xs text-slate-500">Automatically illustrated camera frames compiled into a standard shooting plan.</p>
              </div>

              {/* Toggle panels vs list */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  id="tab_storyboard_visuals"
                  onClick={() => setActiveTab('visuals')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'visuals' ? 'bg-white text-[#0E2A5C] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Storyboard Panels
                </button>
                <button
                  id="tab_storyboard_shots"
                  onClick={() => setActiveTab('shots')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'shots' ? 'bg-white text-[#0E2A5C] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Compiled Shot List (SCR-13)
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty view triggered */}
            {panels.length === 0 && !loading ? (
              <div className="text-center py-16 space-y-4">
                <Image className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700">No Storyboard Panels Generated</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Marking screenplay active dialogue as final unlocks camera angles. Generate illustrations with Gemini below.
                </p>
                <button
                  id="btn_generate_storyboard"
                  onClick={generateStoryboard}
                  className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-1.5 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Storyboard & Shot List</span>
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-16 space-y-4">
                <RefreshCw className="w-10 h-10 text-[#0984FD] animate-spin mx-auto" />
                <h4 className="font-bold text-slate-700">Drawing Compositions (MOD-07)</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Reading finalized screenplay beats and drawing Wide, Medium, and Close-up camera angles. Please wait.
                </p>
              </div>
            ) : activeTab === 'visuals' ? (
              
              /* GRID OF PANELS WITH ARTISTIC SKETCH PLACEHOLDERS */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {panels.map((p, idx) => (
                  <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50 flex flex-col justify-between">
                    
                    {/* Visual artistic sketch mockup block */}
                    <div className="aspect-[4/3] bg-slate-900 border-b border-slate-200 flex flex-col justify-between p-3 relative text-white">
                      <div className="flex justify-between items-center">
                        <span className="bg-[#0984FD] text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono">PANEL #{p.order_index}</span>
                        <span className="bg-slate-800 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{p.shot_type}</span>
                      </div>
                      
                      {/* Artistic charcoal vector sketch description mockup */}
                      <div className="text-center text-[10px] text-slate-400 italic px-4 font-mono select-none py-6">
                        [Charcoal vector wireframe representing {p.shot_type.toLowerCase()} camera angle]
                      </div>

                      <div className="text-[10px] bg-slate-950/70 p-2 rounded text-slate-300 backdrop-blur-sm truncate">
                        Camera Setup: DSLR prime kit
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-white">
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">"{p.caption}"</p>
                      
                      {/* Prompt details drawer trigger */}
                      <div className="text-[9px] bg-slate-50 text-slate-500 font-mono p-2 rounded border border-slate-100 italic line-clamp-2">
                        <strong>Illustration Prompt:</strong> {p.caption}
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100 text-[10px]">
                        <button
                          onClick={() => alert(`Regenerating card panel #${p.order_index}...`)}
                          className="text-[#0984FD] font-bold flex items-center space-x-1 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate Angle</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              
              /* COMPILED SHOT LIST TABLE (SCR-13) */
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3 w-12 text-center">Shot</th>
                        <th className="p-3">Angle Type</th>
                        <th className="p-3">Camera Movement</th>
                        <th className="p-3">Shot Description / Action</th>
                        <th className="p-3">Equipment Notes</th>
                        <th className="p-3 text-center">Setup (Min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shots.map((s, idx) => (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center font-mono font-extrabold text-slate-400">
                            #{s.shot_number}
                          </td>
                          <td className="p-3">
                            <span className="font-bold bg-blue-50 text-[#0984FD] px-2 py-0.5 rounded text-[10px] uppercase">
                              {panels[idx]?.shot_type || 'Medium'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-[#0E2A5C]">
                            {s.camera_movement}
                          </td>
                          <td className="p-3 text-slate-600">
                            {s.shot_description}
                          </td>
                          <td className="p-3 font-mono text-[10px]">
                            {s.equipment_notes}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">
                            {s.estimated_setup_minutes} min
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
