/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Film, BookOpen, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle.js';

interface ProjectIntakeProps {
  userId: string;
  onProjectCreated: (projectId: string) => void;
  onCancel: () => void;
}

export default function ProjectIntake({ userId, onProjectCreated, onCancel }: ProjectIntakeProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [creationPath, setCreationPath] = useState<'research_driven' | 'original_idea'>('research_driven');
  const [genre, setGenre] = useState('Drama');
  const [duration, setDuration] = useState('20_minutes');
  const [language, setLanguage] = useState('sw');
  const [budgetTier, setBudgetTier] = useState('low');
  const [actorsCount, setActorsCount] = useState(3);
  const [style, setStyle] = useState('Research-Based');
  const [audience, setAudience] = useState('East African Communities');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && !title) {
      setError('Please provide a working title for your film project.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Step 1: Create the Project base row
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          creation_path: creationPath,
          owner_id: userId
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create base project');

      const projId = createData.project.id;

      // Step 2: Inject the parameters details (which updates project percentiles to 20%)
      const paramRes = await fetch(`/api/projects/${projId}/parameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          duration_target: duration,
          target_audience: audience,
          language,
          budget_tier: budgetTier,
          storytelling_style: style,
          country: 'Tanzania',
          num_actors_target: actorsCount
        })
      });

      if (!paramRes.ok) {
        const paramData = await paramRes.json();
        throw new Error(paramData.error || 'Failed to initialize project parameters');
      }

      onProjectCreated(projId);
    } catch (err: any) {
      setError(err.message || 'Error configuring project. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div id="project_intake_root" className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Step Indicator Header */}
        <div className="bg-[#0E2A5C] text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">New Pre-production Project</h2>
            <p className="text-xs text-slate-300">Set up your creative boundaries to guide our intelligence assistants.</p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle variant="header-dark" />
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div className="bg-[#0984FD] h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Title & Method (Path selection) */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="project_title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Title</label>
                <input
                  id="project_title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kizazi Salama"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0984FD] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Creation Pipeline Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Research-Driven Option */}
                  <div
                    id="path_selection_research"
                    onClick={() => setCreationPath('research_driven')}
                    className={`border p-5 rounded-xl cursor-pointer hover:shadow-md transition-all space-y-3 relative ${creationPath === 'research_driven' ? 'border-[#0984FD] bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${creationPath === 'research_driven' ? 'bg-[#0E2A5C] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-[#0E2A5C]">Path A: Research-Informed</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Upload interview transcript, reports or field studies. Extract core cultural themes, characters, and storylines safely.
                    </p>
                    {creationPath === 'research_driven' && (
                      <div className="absolute top-2 right-4 text-[#0984FD] text-xs font-extrabold">&bull; Selected</div>
                    )}
                  </div>

                  {/* Original Idea Option */}
                  <div
                    id="path_selection_original"
                    onClick={() => setCreationPath('original_idea')}
                    className={`border p-5 rounded-xl cursor-pointer hover:shadow-md transition-all space-y-3 relative ${creationPath === 'original_idea' ? 'border-[#0984FD] bg-blue-50/10 shadow-sm' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${creationPath === 'original_idea' ? 'bg-[#0E2A5C] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Film className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-[#0E2A5C]">Path B: Original Premise</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Start directly from your own premise, logline or prompt notes. Quickly expand into characters and scenes outline.
                    </p>
                    {creationPath === 'original_idea' && (
                      <div className="absolute top-2 right-4 text-[#0984FD] text-xs font-extrabold">&bull; Selected</div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Project Core parameters */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="intake_genre" className="text-xs font-bold text-slate-500 uppercase block">Film Genre</label>
                <select
                  id="intake_genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#0984FD]"
                >
                  <option value="Drama">Drama</option>
                  <option value="Action Drama">Action Drama</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Docu-Drama">Docu-Drama</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Anthology Drama">Anthology Drama</option>
                  <option value="Educational Shorts">Educational / Informational</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="intake_duration" className="text-xs font-bold text-slate-500 uppercase block">Target Duration</label>
                <select
                  id="intake_duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none"
                >
                  <option value="20_minutes">20 Minute Short Film</option>
                  <option value="60_minutes">60 Minute Featureette</option>
                  <option value="120_minutes">120 Minute Feature Film</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="intake_lang" className="text-xs font-bold text-slate-500 uppercase block">Dialogue Language</label>
                <select
                  id="intake_lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none"
                >
                  <option value="sw">Kiswahili (with code-switching cues)</option>
                  <option value="en">English (standard format)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="intake_style" className="text-xs font-bold text-slate-500 uppercase block">Storytelling Style</label>
                <select
                  id="intake_style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none"
                >
                  <option value="Research-Based">Research-Based Realism</option>
                  <option value="African Storytelling">African Traditional Ensemble</option>
                  <option value="Cinematic Melodrama">Cinematic Melodrama</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Budgets & Cast limitations */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label htmlFor="intake_budget" className="text-xs font-bold text-slate-500 uppercase block">Target Budget Tier</label>
                  <select
                    id="intake_budget"
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none"
                  >
                    <option value="low">Low Budget (Indie / Student - TSh 1.5M limit)</option>
                    <option value="medium">Medium Budget (Regional co-op - TSh 5M limit)</option>
                    <option value="high">High Budget (Co-production - TSh 15M limit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="intake_actors" className="text-xs font-bold text-slate-500 uppercase block">Target Cast Count (Actors)</label>
                  <input
                    id="intake_actors"
                    type="number"
                    min={1}
                    max={12}
                    value={actorsCount}
                    onChange={(e) => setActorsCount(parseInt(e.target.value) || 3)}
                    className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="intake_audience" className="text-xs font-bold text-slate-500 uppercase block">Target Audience</label>
                <input
                  id="intake_audience"
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. East African Communities, Film Festivals"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 bg-white focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3 text-xs text-slate-600">
                <Sparkles className="w-5 h-5 text-[#0984FD] shrink-0 mt-0.5" />
                <p>
                  Setting these limits locks in our deterministic budgeting model. Downstream daily allowances, camera rentals, and catering are automatically matched with local Tanzanian rates.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-4">
            <button
              type="button"
              onClick={step === 1 ? onCancel : handleBack}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-2 rounded transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-bold px-4 py-2 rounded flex items-center space-x-1.5 transition-all shadow"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#0984FD] hover:bg-[#0E2A5C] text-white text-xs font-bold px-5 py-2.5 rounded shadow hover:shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>{submitting ? 'Initializing...' : 'Construct Workspace'}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
