/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Plus, Edit2, Trash2, Check, User, Heart, Mic, RefreshCw } from 'lucide-react';
import { Character, Project } from '../types.js';

interface CharacterGeneratorProps {
  project: Project;
  characters: Character[];
  onCharactersUpdated: () => void;
}

export default function CharacterGenerator({ project, characters, onCharactersUpdated }: CharacterGeneratorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState<'protagonist' | 'antagonist' | 'supporting' | 'minor'>('supporting');
  const [background, setBackground] = useState('');
  const [motivation, setMotivation] = useState('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [arcSummary, setArcSummary] = useState('');

  const [loading, setLoading] = useState(false);

  const startEdit = (c: Character) => {
    setEditingId(c.id);
    setAddingNew(false);
    setName(c.name);
    setRoleType(c.role_type);
    setBackground(c.background || '');
    setMotivation(c.motivation || '');
    setVoiceNotes(c.voice_notes || '');
    setArcSummary(c.arc_summary || '');
  };

  const startAddNew = () => {
    setAddingNew(true);
    setEditingId(null);
    setName('');
    setRoleType('supporting');
    setBackground('');
    setMotivation('');
    setVoiceNotes('');
    setArcSummary('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      // For local development, we will mock updates directly by manipulating state or issuing a request
      // We can mock backend update requests to sync with the database file
      let url = '/api/budget-items'; // placeholder
      // For character editing, let's execute a direct database mock update through our standard server hooks
      // But we can also make direct rest queries if needed or simulate local state updates in this list
      // Since our express app automatically registers characters inside /api/projects/:id, we can write a dedicated character patch endpoint or simulate successfully
      // Let's call /api/projects/:id with the custom characters payload or add it.
      // For extreme safety, we can simulate characters modifications and trigger onCharactersUpdated
      const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId ? `/api/projects/${project.id}` : `/api/projects/${project.id}`;

      // We've defined Character interface in types.ts.
      // Let's simply write a secure edit/create update. We can simulate local DB saving.
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_override: {
            id: editingId,
            name,
            role_type: roleType,
            background,
            motivation,
            voice_notes: voiceNotes,
            arc_summary: arcSummary
          }
        })
      });

      if (response.ok) {
        setEditingId(null);
        setAddingNew(false);
        onCharactersUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (charId: string) => {
    if (!confirm('Are you sure you want to remove this character?')) return;
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delete_character_id: charId })
      });
      onCharactersUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="characters_panel" className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
            <User className="w-5 h-5 text-[#0984FD]" />
            <span>Cast & Character Dossier (MOD-03)</span>
          </h2>
          <p className="text-xs text-slate-500">Motives, developmental arcs, and dialect cues guiding bilingual dialogues.</p>
        </div>
        {!addingNew && !editingId && (
          <button
            onClick={startAddNew}
            className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Character</span>
          </button>
        )}
      </div>

      {/* Editor/Form Frame */}
      {(editingId || addingNew) && (
        <form onSubmit={handleSave} className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#0E2A5C] uppercase tracking-wider">
            {editingId ? 'Edit Character Profile' : 'Add New Character Persona'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Character Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amina Mrema"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as any)}
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
              >
                <option value="protagonist">Protagonist (Hero/Heroine)</option>
                <option value="antagonist">Antagonist (Opponent)</option>
                <option value="supporting">Supporting Actor</option>
                <option value="minor">Minor / Extras</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>Dramatic Motivation</span>
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="What is their primary driving force in the scene?"
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white focus:outline-none"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center space-x-1">
                <Mic className="w-3.5 h-3.5 text-[#0984FD]" />
                <span>Bilingual Dialect & Voice notes</span>
              </label>
              <textarea
                value={voiceNotes}
                onChange={(e) => setVoiceNotes(e.target.value)}
                placeholder="Swahili style (urban code-switch, rural, slang, elders proverbs...)"
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white focus:outline-none"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Background & Biography</label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Their history, age, education, and relationship to other characters."
              className="w-full text-xs border border-slate-200 rounded p-3 bg-white focus:outline-none"
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Character Arc Trajectory</label>
            <textarea
              value={arcSummary}
              onChange={(e) => setArcSummary(e.target.value)}
              placeholder="How do they change from the opening act to the conclusion?"
              className="w-full text-xs border border-slate-200 rounded p-2 bg-white focus:outline-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => { setEditingId(null); setAddingNew(false); }}
              className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0E2A5C] text-white px-4 py-2 rounded font-bold hover:bg-[#0984FD] transition-colors"
            >
              {loading ? 'Saving Profile...' : 'Save Character Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of character cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {characters.map(c => (
          <div
            id={`character_card_${c.id}`}
            key={c.id}
            className="border border-slate-200 rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${c.role_type === 'protagonist' ? 'bg-red-50 text-red-700 border border-red-100' : c.role_type === 'antagonist' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {c.role_type}
                </span>
                <div className="flex space-x-1.5">
                  <button onClick={() => startEdit(c)} className="text-slate-400 hover:text-[#0984FD] p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-[#0E2A5C]">{c.name}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {c.background || 'No background described.'}
                </p>
              </div>

              {c.motivation && (
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100 text-[10px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[8px] flex items-center space-x-1">
                    <Heart className="w-2.5 h-2.5 text-red-400" />
                    <span>Motivation</span>
                  </span>
                  <p className="italic">"{c.motivation}"</p>
                </div>
              )}

              {c.voice_notes && (
                <div className="bg-blue-50/10 rounded p-2.5 border border-blue-50/50 text-[10px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[8px] flex items-center space-x-1">
                    <Mic className="w-2.5 h-2.5 text-[#0984FD]" />
                    <span>Dialect notes</span>
                  </span>
                  <p className="font-mono text-slate-700">{c.voice_notes}</p>
                </div>
              )}
            </div>

            {c.arc_summary && (
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-[10px] text-slate-500">
                <strong className="text-slate-700">Arc:</strong> {c.arc_summary}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
