/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Film, BookOpen, Layers, User, CheckCircle, Sliders, Calendar, ArrowLeft, RefreshCw, BarChart3, PiggyBank, Download, Bookmark, History, FileText, Sparkles, Building, Settings, HelpCircle, LogOut } from 'lucide-react';
import { User as AuthUser, Project, ResearchDocument, Character, StoryConcept, Scene, ProductionPlan, BudgetLineItem } from './types.js';

// Modular Feature sub-components
import BrandLogo from './components/BrandLogo.js';
import LandingPage from './components/LandingPage.js';
import Auth from './components/Auth.js';
import Dashboard from './components/Dashboard.js';
import ProjectIntake from './components/ProjectIntake.js';
import ResearchUpload from './components/ResearchUpload.js';
import StoryGenerator from './components/StoryGenerator.js';
import CharacterGenerator from './components/CharacterGenerator.js';
import SceneGenerator from './components/SceneGenerator.js';
import ScreenplayEditor from './components/ScreenplayEditor.js';
import StoryboardViewer from './components/StoryboardViewer.js';
import BudgetGenerator from './components/BudgetGenerator.js';
import EquipmentCrewLocation from './components/EquipmentCrewLocation.js';
import ScheduleGenerator from './components/ScheduleGenerator.js';
import PromptLibrary from './components/PromptLibrary.js';
import AIHistory from './components/AIHistory.js';
import ExportPage from './components/ExportPage.js';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth' | 'dashboard' | 'intake' | 'workspace'>('landing');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Active Project Container State
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<{
    project: Project;
    research_documents: ResearchDocument[];
    characters: Character[];
    story_concept: StoryConcept | null;
    scenes: Scene[];
    production_plan: ProductionPlan | null;
  } | null>(null);

  // Sub-workspace Panel tab
  const [activeTab, setActiveTab] = useState<string>('research');
  // Secondary screen gate within workspace (e.g. active Screenplay scene writing)
  const [activeScreenplaySceneId, setActiveScreenplaySceneId] = useState<string | null>(null);

  // Lists and budget items
  const [budgetItems, setBudgetItems] = useState<BudgetLineItem[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Sync workspace on project ID selection
  useEffect(() => {
    if (currentProjectId) {
      fetchProjectWorkspace();
    }
  }, [currentProjectId]);

  const fetchProjectWorkspace = async () => {
    if (!currentProjectId) return;
    setLoadingWorkspace(true);
    try {
      const response = await fetch(`/api/projects/${currentProjectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectDetails(data);
        
        if (data.production_plan) {
          // Fetch associated budget items
          const budRes = await fetch(`/api/projects/${currentProjectId}/production-plan`);
          if (budRes.ok) {
            const budData = await budRes.json();
            setBudgetItems(budData.budget_items || []);
          }
        } else {
          setBudgetItems([]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const handleAuthComplete = (user: any) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleProjectCreated = (projId: string) => {
    setCurrentProjectId(projId);
    setCurrentScreen('workspace');
    setActiveTab('research');
    setActiveScreenplaySceneId(null);
  };

  const handleSelectProject = (projId: string) => {
    setCurrentProjectId(projId);
    setCurrentScreen('workspace');
    setActiveTab('research');
    setActiveScreenplaySceneId(null);
  };

  // Triggers the initial deterministic production plans recommendation & budgets
  const handleGenerateProductionPlan = async () => {
    if (!currentProjectId) return;
    setGeneratingPlan(true);
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/production-plan/breakdown`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to trigger logistics pipeline');

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
          fetchProjectWorkspace();
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Logistics calculation failed');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to compute deterministic plan. Ensure screenplay finalized first.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentProjectId(null);
    setProjectDetails(null);
    setCurrentScreen('landing');
  };

  // LANDING PAGE SCREEN
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          if (currentUser) setCurrentScreen('dashboard');
          else setCurrentScreen('auth');
        }}
        onLogin={() => setCurrentScreen('auth')}
      />
    );
  }

  // LOGIN & REGISTER SCREEN
  if (currentScreen === 'auth') {
    return (
      <Auth
        onAuthComplete={handleAuthComplete}
        onBack={() => setCurrentScreen('landing')}
      />
    );
  }

  // INDEX PROJECTS DASHBOARD
  if (currentScreen === 'dashboard' && currentUser) {
    return (
      <Dashboard
        currentUser={currentUser}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setCurrentScreen('intake')}
        onLogout={handleLogout}
      />
    );
  }

  // DIALOG WIZARD INTAKES
  if (currentScreen === 'intake' && currentUser) {
    return (
      <ProjectIntake
        userId={currentUser.id}
        onProjectCreated={handleProjectCreated}
        onCancel={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // --- FULL PRE-PRODUCTION CREATIVE WORKSPACE CONTAINER ---
  if (currentScreen === 'workspace' && currentUser && projectDetails) {
    const { project, research_documents, characters, story_concept, scenes, production_plan } = projectDetails;

    // Workspace main tabs definition
    const workspaceTabs = [
      { id: 'research', title: 'Research Ingestion', icon: BookOpen, progress: research_documents.length > 0 ? 100 : 0 },
      { id: 'story', title: 'Premise & Synopsis', icon: Sparkles, progress: story_concept ? 100 : 0 },
      { id: 'characters', title: 'Cast dossier', icon: User, progress: characters.length > 0 ? 100 : 0 },
      { id: 'scenes', title: 'Scene index', icon: Layers, progress: scenes.length > 0 ? 100 : 0 },
      { id: 'screenplay', title: 'Bilingual screenplay', icon: FileText, progress: scenes.filter(s => s.status === 'final').length > 0 ? 50 : 0 },
      { id: 'storyboard', title: 'Storyboard angles', icon: Film, progress: scenes.filter(s => s.status === 'final').length > 0 ? 100 : 0 },
      { id: 'budget', title: 'Deterministic budgets', icon: PiggyBank, progress: production_plan ? 100 : 0 },
      { id: 'crew', title: 'Logistics recommendations', icon: Settings, progress: production_plan ? 100 : 0 },
      { id: 'schedule', title: 'Daily Shoot schedules', icon: Calendar, progress: production_plan ? 100 : 0 },
      { id: 'prompts', title: 'Creative guidelines', icon: Bookmark, progress: 100 },
      { id: 'history', title: 'AI History audit', icon: History, progress: 100 },
      { id: 'export', title: 'Export Proposal', icon: Download, progress: project.completion_pct }
    ];

    return (
      <div id="workspace_root" className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col md:flex-row">
        
        {/* Left Side Bento Sidebar Navigation (Desktop only) */}
        <aside className="w-72 bg-[#011f7b] border-r border-[#001040] hidden md:flex flex-col py-6 px-4 shrink-0 justify-between">
          <div className="space-y-6">
            {/* Logo area */}
            <div className="px-2">
              <BrandLogo variant="light" />
            </div>

            {/* Return Hub Button */}
            <div className="px-2">
              <button
                id="btn_back_to_dashboard"
                onClick={() => { setCurrentScreen('dashboard'); fetchProjectWorkspace(); }}
                className="w-full p-2.5 bg-[#001550] hover:bg-[#000d3a] border border-[#001040]/50 rounded-lg text-slate-100 hover:text-white transition-all flex items-center justify-center space-x-2 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 text-[#FFBA09]" />
                <span>Return to Hub</span>
              </button>
            </div>

            {/* Sidebar navigation tabs scroll area */}
            <nav className="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-extrabold px-2 mb-2 block">PRE-PRODUCTION</span>
              {workspaceTabs.map(tab => {
                const TabIcon = tab.icon;
                const isAct = tab.id === activeTab;
                return (
                  <button
                    id={`tab_workspace_trigger_${tab.id}`}
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setActiveScreenplaySceneId(null); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all group border ${isAct ? 'bg-[#FFBA09]/15 border-[#FFBA09]/40 text-[#FFBA09] font-bold shadow-[0_0_12px_rgba(255,186,9,0.08)]' : 'border-transparent text-slate-200 hover:bg-[#001550]/60 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TabIcon className={`w-4 h-4 shrink-0 ${isAct ? 'text-[#FFBA09]' : 'text-slate-300 group-hover:text-white'}`} />
                      <span className="text-xs truncate">{tab.title}</span>
                    </div>
                    {tab.progress > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${isAct ? 'bg-[#FFBA09]/20 text-[#FFBA09]' : 'bg-white/10 text-slate-300'}`}>{tab.progress}%</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Bento metrics & completion status */}
          <div className="space-y-4 pt-4 border-t border-slate-700/50 px-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-300 uppercase font-extrabold">
                <span>Workflow Completion</span>
                <span>{project.completion_pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#001550] rounded-full overflow-hidden border border-[#001040]/30">
                <div className="h-full bg-[#FFBA09]" style={{ width: `${project.completion_pct}%` }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] text-slate-300 font-medium">Cloud Synced</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white p-1.5 hover:bg-[#001550] rounded transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Right side workflow area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#011f7b] font-bold tracking-wider uppercase">{project.genre}</span>
                <span className="text-slate-400">/</span>
                <h1 className="text-sm font-bold text-slate-800 max-w-xs sm:max-w-md truncate">{project.title}</h1>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Production ID: {project.id}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                {project.creation_path === 'research_driven' ? 'Research Path' : 'Direct Path'}
              </div>
              {/* Mobile-only log out */}
              <button
                onClick={handleLogout}
                className="md:hidden text-slate-500 hover:text-slate-800 p-2 rounded hover:bg-slate-100 transition-all"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Mobile Tab selection navigation (Top bar on small screens) */}
          <div className="md:hidden bg-[#011f7b] border-b border-[#001040] overflow-x-auto select-none sticky top-0 z-40 scrollbar-none flex gap-4 px-4 h-12 items-center whitespace-nowrap text-xs font-bold text-slate-200">
            {workspaceTabs.map(tab => {
              const TabIcon = tab.icon;
              const isAct = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setActiveScreenplaySceneId(null); }}
                  className={`py-2 px-1 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${isAct ? 'text-[#FFBA09] border-[#FFBA09]' : 'border-transparent text-slate-300'}`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
            {loadingWorkspace ? (
              <div className="text-center py-24 text-slate-400 text-xs">Syncing workspace and state databases...</div>
            ) : (
              <div className="space-y-6">
                
                {/* RESEARCH INGESTION VIEW */}
                {activeTab === 'research' && (
                  <ResearchUpload
                    project={project}
                    documents={research_documents}
                    onUploadSuccess={fetchProjectWorkspace}
                    onNextStep={() => setActiveTab('story')}
                  />
                )}

                {/* STORY CONCEPT PREMISE CHOICES */}
                {activeTab === 'story' && (
                  <StoryGenerator
                    project={project}
                    storyConcept={story_concept}
                    onStoryConfigured={fetchProjectWorkspace}
                  />
                )}

                {/* CAST DOSSIER */}
                {activeTab === 'characters' && (
                  <CharacterGenerator
                    project={project}
                    characters={characters}
                    onCharactersUpdated={fetchProjectWorkspace}
                  />
                )}

                {/* SCENE INDEX TABLES OR ACTIVE SCREENPLAY DIAOUE WRITING */}
                {activeTab === 'scenes' && (
                  <SceneGenerator
                    project={project}
                    scenes={scenes}
                    characters={characters}
                    onScenesUpdated={fetchProjectWorkspace}
                    onSelectSceneForScreenplay={(sId) => {
                      setActiveScreenplaySceneId(sId);
                      setActiveTab('screenplay');
                    }}
                  />
                )}

                {/* BILINGUAL SCREENPLAY DIAOUE COURIER WRITING GATES */}
                {activeTab === 'screenplay' && (
                  activeScreenplaySceneId ? (
                    <ScreenplayEditor
                      project={project}
                      sceneId={activeScreenplaySceneId}
                      onBack={() => setActiveScreenplaySceneId(null)}
                      onScreenplayFinalized={fetchProjectWorkspace}
                    />
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                      <h4 className="font-bold text-slate-700 text-sm">Screenplay Dialogue Board</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Please select a specific scene beat from your Chronological scene index to write or auto-draft dialogue lines.
                      </p>
                      <button
                        onClick={() => setActiveTab('scenes')}
                        className="bg-[#2563eb] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                      >
                        Browse Scenes
                      </button>
                    </div>
                  )
                )}

                {/* STORYBOARD ANGLES AND COMPILED SHOTS TABLE */}
                {activeTab === 'storyboard' && (
                  <StoryboardViewer
                    project={project}
                    scenes={scenes}
                  />
                )}

                {/* DETERMINISTIC ACCORDION BUDGETS AND LIVE GRAND TOTAL CALCULATOR */}
                {activeTab === 'budget' && (
                  <BudgetGenerator
                    project={project}
                    plan={production_plan}
                    budgetItems={budgetItems}
                    onBudgetUpdated={fetchProjectWorkspace}
                    onGeneratePlan={handleGenerateProductionPlan}
                    generatingPlan={generatingPlan}
                  />
                )}

                {/* LOGISTICS EQUIPMENT RECOMMENDATION AND CREW ALIGNMENT */}
                {activeTab === 'crew' && (
                  <EquipmentCrewLocation
                    project={project}
                    plan={production_plan}
                  />
                )}

                {/* DAILY SHOOT SCHEDULE CALENDAR AND RISK MITIGATIONS */}
                {activeTab === 'schedule' && (
                  <ScheduleGenerator
                    project={project}
                    plan={production_plan}
                  />
                )}

                {/* PROMPT LIBRARY SEARCHABLE GUIDE CARD COLLECTIONS */}
                {activeTab === 'prompts' && (
                  <PromptLibrary
                    activeModuleId="MOD-05"
                  />
                )}

                {/* CHRONOLOGICAL AI HISTORY AUDIT TRAILS */}
                {activeTab === 'history' && (
                  <AIHistory
                    projectId={project.id}
                  />
                )}

                {/* MULTI ASSET PROPOSAL DOSSIER EXPORTERS */}
                {activeTab === 'export' && (
                  <ExportPage
                    project={project}
                  />
                )}

              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
