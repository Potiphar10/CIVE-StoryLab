/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Split, Merge, Users, CheckCircle, Tag } from 'lucide-react';
import { Scene, Character, Project } from '../types.js';

interface SceneGeneratorProps {
  project: Project;
  scenes: Scene[];
  characters: Character[];
  onScenesUpdated: () => void;
  onSelectSceneForScreenplay: (sceneId: string) => void;
}

export default function SceneGenerator({ project, scenes, characters, onScenesUpdated, onSelectSceneForScreenplay }: SceneGeneratorProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [slugline, setSlugline] = useState('INT. MAMA HALIMA\'S HOUSE - DAY');
  const [purpose, setPurpose] = useState('');
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === scenes.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const s1 = scenes[idx];
    const s2 = scenes[swapIdx];

    try {
      // Direct post to sync the order swap on the backend database
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_swap: {
            id1: s1.id,
            index1: s2.order_index,
            id2: s2.id,
            index2: s1.order_index
          }
        })
      });
      onScenesUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSplit = async (sceneId: string) => {
    const confirmSplit = confirm('Do you want to split this scene into two segments? This creates a new sub-scene immediately following the current one.');
    if (!confirmSplit) return;

    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ split_scene_id: sceneId })
      });
      onScenesUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMerge = async (idx: number) => {
    if (idx === scenes.length - 1) {
      alert('Cannot merge. There is no following scene to merge with.');
      return;
    }
    const s1 = scenes[idx];
    const s2 = scenes[idx + 1];
    const confirmMerge = confirm(`Do you want to merge Scene #${s1.order_index} with Scene #${s2.order_index}? The following scene will be absorbed into the current one.`);
    if (!confirmMerge) return;

    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merge_scene: {
            source_id: s1.id,
            target_id: s2.id
          }
        })
      });
      onScenesUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose) return;

    setLoading(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_scene: {
            slugline,
            purpose,
            characters_present: selectedChars,
            order_index: scenes.length + 1
          }
        })
      });
      setAddingNew(false);
      setPurpose('');
      setSelectedChars([]);
      onScenesUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCharSelection = (cName: string) => {
    if (selectedChars.includes(cName)) {
      setSelectedChars(selectedChars.filter(n => n !== cName));
    } else {
      setSelectedChars([...selectedChars, cName]);
    }
  };

  return (
    <div id="scene_generator_root" className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#0984FD]" />
            <span>Ordered Scene Index & Timeline (MOD-04)</span>
          </h2>
          <p className="text-xs text-slate-500">Chronological list of dramatic beats. Track scene locations, splitting, and character pacing tags.</p>
        </div>
        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Scene</span>
          </button>
        )}
      </div>

      {addingNew && (
        <form onSubmit={handleAddNewScene} className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#0E2A5C] uppercase tracking-wider">Add New Scene Card</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Scene Slugline</label>
              <input
                type="text"
                required
                value={slugline}
                onChange={(e) => setSlugline(e.target.value)}
                placeholder="e.g. EXT. ROAD - NIGHT"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Dramatic Purpose</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What occurs in this scene?"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase block">Characters Present</label>
            <div className="flex flex-wrap gap-2">
              {characters.map(c => {
                const isSel = selectedChars.includes(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCharSelection(c.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${isSel ? 'bg-[#0E2A5C] text-white border-[#0E2A5C]' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setAddingNew(false)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0E2A5C] text-white px-4 py-2 rounded font-bold hover:bg-[#0984FD] transition-colors"
            >
              {loading ? 'Adding...' : 'Add Scene to Index'}
            </button>
          </div>
        </form>
      )}

      {/* List / Table of Scenes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-12 text-center">Order</th>
                <th className="p-4">Slugline</th>
                <th className="p-4">Dramatic Purpose</th>
                <th className="p-4">Characters Present</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenes.map((s, idx) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-center font-mono font-extrabold text-slate-400">
                    #{s.order_index}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0E2A5C] whitespace-nowrap">
                    {s.slugline}
                  </td>
                  <td className="p-4 text-slate-700 leading-relaxed max-w-sm">
                    {s.purpose}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 items-center">
                      <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {s.characters_present && s.characters_present.length > 0 ? (
                        s.characters_present.map((cName, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            {cName}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">None casted</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${s.status === 'final' ? 'bg-green-100 text-green-700' : s.status === 'drafted' ? 'bg-blue-100 text-[#0984FD]' : 'bg-slate-100 text-slate-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      
                      {/* Movement buttons */}
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === scenes.length - 1}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-px h-4 bg-slate-200 mx-1"></div>

                      {/* Split / Merge operations */}
                      <button
                        onClick={() => handleSplit(s.id)}
                        className="text-slate-500 hover:text-[#0984FD] p-1 border border-slate-200 rounded hover:bg-blue-50/20"
                        title="Split Scene (MOD-04)"
                      >
                        <Split className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMerge(idx)}
                        disabled={idx === scenes.length - 1}
                        className="text-slate-500 hover:text-[#0984FD] p-1 border border-slate-200 rounded hover:bg-blue-50/20 disabled:opacity-30"
                        title="Merge with Next Scene (MOD-04)"
                      >
                        <Merge className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-px h-4 bg-slate-200 mx-1"></div>

                      <button
                        id={`btn_draft_screenplay_scene_${s.id}`}
                        onClick={() => onSelectSceneForScreenplay(s.id)}
                        className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors"
                      >
                        Write Screenplay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
