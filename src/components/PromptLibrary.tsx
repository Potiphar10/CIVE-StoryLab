/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, Bookmark, Tag, Sparkles } from 'lucide-react';
import { PromptLibraryEntry } from '../types.js';

interface PromptLibraryProps {
  onSelectPrompt?: (promptText: string) => void;
  activeModuleId?: string;
}

export default function PromptLibrary({ onSelectPrompt, activeModuleId }: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<PromptLibraryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState(activeModuleId || 'all');
  const [loading, setLoading] = useState(true);

  // Edit/Add fields
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('MOD-05');
  const [templateText, setTemplateText] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompt-library');
      const data = await response.json();
      setPrompts(data.data || []);
    } catch (e) {
      console.error('Failed to load prompts', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !templateText) return;

    try {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      const response = await fetch('/api/prompt-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          module_id: moduleId,
          template_text: templateText,
          tags
        })
      });

      if (response.ok) {
        setIsEditing(false);
        setTitle('');
        setTemplateText('');
        setTagInput('');
        fetchPrompts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt template?')) return;
    try {
      await fetch(`/api/prompt-library/${id}`, { method: 'DELETE' });
      fetchPrompts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.template_text.toLowerCase().includes(search.toLowerCase());
    const matchesModule = filterModule === 'all' || p.module_id === filterModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div id="prompt_library_panel" className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0E2A5C] flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-[#0984FD]" />
            <span>Prompt Library & Creative Guidelines</span>
          </h2>
          <p className="text-xs text-slate-500">Save and reuse effective instructions for characters, dialogue, and schedules.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Guide</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Add New Guideline Template</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Guideline Name / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Swahili Slang Dialogue Rules"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Applies to Pipeline Stage</label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
              >
                <option value="MOD-01">Research Ingestion (MOD-01)</option>
                <option value="MOD-02">Story premises (MOD-02)</option>
                <option value="MOD-03">Characters dossier (MOD-03)</option>
                <option value="MOD-05">Dialogue voice (MOD-05)</option>
                <option value="MOD-07">Storyboard & Angle (MOD-07)</option>
                <option value="MOD-08">Production planning (MOD-08)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase block">Creative Guideline text (Template Instructions)</label>
            <textarea
              required
              rows={4}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              placeholder="e.g. Ensure characters code-switch between Swahili and English under high emotional duress, using words like 'Safi kabisa'..."
              className="w-full text-xs border border-slate-200 rounded p-3 bg-white focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase block">Tags (comma separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. Swahili, Casual, Low-Budget"
              className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0E2A5C] text-white px-4 py-2 rounded font-bold hover:bg-[#0984FD] transition-colors"
            >
              Save to Library
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full text-xs pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
              />
            </div>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none"
            >
              <option value="all">All Modules</option>
              <option value="MOD-01">Research (MOD-01)</option>
              <option value="MOD-02">Story Concept (MOD-02)</option>
              <option value="MOD-03">Characters (MOD-03)</option>
              <option value="MOD-05">Dialogue (MOD-05)</option>
              <option value="MOD-07">Storyboard (MOD-07)</option>
              <option value="MOD-08">Production (MOD-08)</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading prompt guides...</div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
              No prompt templates match your filter. Create a custom one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrompts.map(p => (
                <div key={p.id} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-blue-50 text-[#0984FD] font-bold px-2 py-0.5 rounded-full uppercase">
                        {p.module_id}
                      </span>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-[#0E2A5C]">{p.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 rounded p-2 border border-slate-100 italic">
                      "{p.template_text}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 items-center">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {p.tags?.map((t, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                    {onSelectPrompt && (
                      <button
                        onClick={() => onSelectPrompt(p.template_text)}
                        className="ml-auto text-[10px] bg-[#0E2A5C] hover:bg-[#0984FD] text-white font-bold px-2 py-1 rounded transition-colors flex items-center space-x-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Apply Guide</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
