/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Film, Plus, Search, Filter, BookOpen, Layers, CheckCircle, BarChart3, Users, PiggyBank, Sparkles, Sliders, Calendar, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Project, User } from '../types.js';
import BrandLogo from './BrandLogo.js';
import ThemeToggle from './ThemeToggle.js';

interface DashboardProps {
  currentUser: User;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onSelectProject, onCreateProject, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'in_progress' | 'complete'>('all');
  const [loading, setLoading] = useState(true);

  // Coordinator state
  const [studentsCount, setStudentsCount] = useState(24);
  const [totalTokenSpend, setTotalTokenSpend] = useState(14.85);
  const [avgCompletion, setAvgCompletion] = useState(65);

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/projects?owner_id=${currentUser.id}`);
      const data = await response.json();
      setProjects(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.genre && p.genre.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="dashboard_root" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-[#0E2A5C] text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo variant="light" />
          <div className="flex items-center space-x-3">
            <ThemeToggle variant="header-dark" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{currentUser.full_name}</p>
              <p className="text-[10px] text-slate-300 capitalize">{currentUser.role} Account</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0984FD] flex items-center justify-center font-bold text-sm border border-white/20">
              {currentUser.full_name?.charAt(0) || 'U'}
            </div>
            <button
              id="btn_dashboard_logout"
              onClick={onLogout}
              className="text-xs bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-3 py-1.5 rounded transition-all font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E2A5C]">
              Habari, {currentUser.full_name}!
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Welcome back to your pre-production studio. Translate ethnographic research or build original screenplays with rigorous budgetary control.
            </p>
          </div>
          {currentUser.role !== 'coordinator' && (
            <button
              id="btn_dashboard_new_project"
              onClick={onCreateProject}
              className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-sm font-semibold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          )}
        </div>

        {/* --- Coordinator Aggregate Analytics Dashboard (SCR-05) --- */}
        {currentUser.role === 'coordinator' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#0E2A5C] flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#0984FD]" />
              <span>Institutional Department Dashboard</span>
            </h2>
            
            {/* Aggregate Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Students</span>
                  <Users className="w-5 h-5 text-[#0984FD]" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{studentsCount}</div>
                <p className="text-[10px] text-green-600 font-semibold">&bull; +4 registrations this week</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Completion Rate</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{avgCompletion}%</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${avgCompletion}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Aggregated API Spend</span>
                  <PiggyBank className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900">${totalTokenSpend.toFixed(2)}</div>
                <p className="text-[10px] text-slate-500">Budget Limit: $500.00 / Term</p>
              </div>

              <div className="bg-white border border-[#0984FD] bg-blue-50/20 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0984FD]">Institutional Status</span>
                  <ShieldCheck className="w-5 h-5 text-[#0984FD]" />
                </div>
                <div className="text-lg font-bold text-[#0E2A5C]">UDOM-CIVE Campus</div>
                <p className="text-[10px] text-slate-600">Active License: Creator Suite</p>
              </div>
            </div>

            {/* Student Rosters & Projects Tracking */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Student Roster & Project Metrics</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Project Title</th>
                      <th className="p-3">Genre</th>
                      <th className="p-3">Target Budget</th>
                      <th className="p-3">Completion Status</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-center">Department Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">Amina Mrema</td>
                      <td className="p-3 font-medium text-slate-600">Kizazi Salama (Safe Birth)</td>
                      <td className="p-3">Drama</td>
                      <td className="p-3 text-slate-500">TSh 1,250,000</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-[#0984FD] font-bold px-1.5 py-0.5 rounded text-[10px]">In Progress</span>
                          <span className="text-slate-500 font-semibold">90%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">2 mins ago</td>
                      <td className="p-3 text-center">
                        <button onClick={() => onSelectProject('proj_kizazi_salama_1')} className="text-[#0984FD] hover:underline font-semibold">Review File</button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">Baraka Juma</td>
                      <td className="p-3 font-medium text-slate-600">Njia ya Chamwino (The Road)</td>
                      <td className="p-3">Action Drama</td>
                      <td className="p-3 text-slate-500">TSh 3,400,000</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded text-[10px]">Complete</span>
                          <span className="text-slate-500 font-semibold">100%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">1 day ago</td>
                      <td className="p-3 text-center">
                        <button onClick={() => alert('Baraka Juma project review details triggered')} className="text-[#0984FD] hover:underline font-semibold">Review File</button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">Halima Swahili</td>
                      <td className="p-3 font-medium text-slate-600">Voices of the Midwives</td>
                      <td className="p-3">Documentary</td>
                      <td className="p-3 text-slate-500">TSh 850,000</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded text-[10px]">Draft</span>
                          <span className="text-slate-500 font-semibold">15%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">3 days ago</td>
                      <td className="p-3 text-center">
                        <button onClick={() => alert('Halima Swahili project review details triggered')} className="text-[#0984FD] hover:underline font-semibold">Review File</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Student / Individual Dashboard (SCR-03) --- */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0E2A5C] flex items-center space-x-2">
                <Film className="w-5 h-5 text-[#0984FD]" />
                <span>My Creative Portfolios</span>
              </h2>
              <p className="text-xs text-slate-500">Create, manage, and edit your film pre-production files.</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0984FD] bg-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Drafts</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading portfolios...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-[#0984FD] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Projects Found</h3>
              <p className="text-xs text-slate-600">
                You don't have any active pre-production projects. Get started now by uploading medical research reports, ethnographic interview notes, or describing your concept.
              </p>
              <button
                onClick={onCreateProject}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-md hover:shadow-lg transition-all"
              >
                Start Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProjects.map(proj => (
                <div
                  id={`project_card_${proj.id}`}
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#0984FD] transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${proj.status === 'complete' ? 'bg-green-100 text-green-700' : proj.status === 'in_progress' ? 'bg-blue-100 text-[#0984FD]' : 'bg-slate-100 text-slate-500'}`}>
                        {proj.status === 'in_progress' ? 'In Progress' : proj.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {proj.id}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#0E2A5C] hover:text-[#0984FD] transition-colors line-clamp-1">{proj.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {proj.genre ? `${proj.genre} • ` : ''} 
                        {proj.creation_path === 'research_driven' ? 'Research-informed screenplay' : 'Original film idea'}
                      </p>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Workflow Completion</span>
                        <span>{proj.completion_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0E2A5C] h-full" style={{ width: `${proj.completion_pct}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-slate-50 rounded p-2.5 border border-slate-100">
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[8px]">Duration Target</span>
                        <span className="font-semibold">{proj.duration_target ? proj.duration_target.replace('_', ' ') : 'Not defined'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-bold text-[8px]">Budget Tier</span>
                        <span className="font-semibold uppercase">{proj.budget_tier || 'Not defined'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Active: {new Date(proj.updated_at).toLocaleDateString()}</span>
                    </span>
                    <button
                      id={`btn_open_project_${proj.id}`}
                      onClick={() => onSelectProject(proj.id)}
                      className="text-[#0E2A5C] hover:text-[#0984FD] font-bold flex items-center space-x-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
