/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, BookOpen, Layers, CheckCircle, ArrowRight, ShieldCheck, Globe, Star } from 'lucide-react';
import BrandLogo from './BrandLogo.js';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div id="landing_page_root" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo variant="dark" />
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#0E2A5C] transition-colors">Features</a>
            <a href="#workflow" className="hover:text-[#0E2A5C] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#0E2A5C] transition-colors">Institution Plans</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              id="btn_landing_login"
              onClick={onLogin}
              className="text-sm font-medium text-[#0E2A5C] hover:text-[#0984FD] px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              id="btn_landing_cta_header"
              onClick={onStart}
              className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-24 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold text-[#0984FD]">
              <Star className="w-3.5 h-3.5 fill-[#0984FD]" />
              <span>Affiliated with the University of Dodoma</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Research-Informed <span className="text-[#0E2A5C]">AI Storytelling</span> for African Filmmaking
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              CIVE StoryLab is the first professional pre-production platform engineered to transform academic research, dissertations, and oral histories into industry-standard screenplays, storyboards, and precise production plans.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                id="btn_landing_hero_primary"
                onClick={onStart}
                className="bg-[#0E2A5C] hover:bg-[#0984FD] text-white text-base font-semibold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Start Free Project</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#workflow"
                className="border border-slate-300 hover:border-[#0E2A5C] text-slate-700 hover:text-[#0E2A5C] text-base font-semibold px-6 py-3.5 rounded-lg text-center transition-colors"
              >
                Watch How It Works
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual representation card */}
            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl p-6 text-slate-100 border border-slate-800 relative">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#0984FD] rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="border-b border-slate-800 pb-4 mb-4">
                <p className="text-[10px] tracking-wider uppercase text-slate-400 font-bold">Active pre-production block</p>
                <h3 className="text-lg font-bold text-white mt-1">Kizazi Salama (Safe Birth)</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-[#0984FD] font-bold uppercase block">Extracted Research Excerpt</span>
                  <p className="text-xs text-slate-300 italic mt-1">
                    "Rural women in Chamwino often walk over 15 kilometers to clinic outposts, preferring local traditional birth attendants."
                  </p>
                </div>
                <div className="bg-[#0E2A5C]/40 p-3 rounded-lg border border-[#0E2A5C]/60">
                  <span className="text-[10px] text-green-400 font-bold uppercase block">AI Storyboard Script Output</span>
                  <p className="text-xs font-mono text-slate-200 mt-1">
                    AMINA (clutching steel medical case): "Mama, we must blend sterile gloves with your songs..."
                  </p>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Progress: 95%</span>
                  <span className="text-green-400">Status: Print Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="bg-slate-100 py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">In Collaboration with Innovative Institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
              <span className="bg-[#0E2A5C] text-white p-1 rounded">UDOM</span>
              <span>University of Dodoma</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
              <span className="bg-[#0984FD] text-white p-1 rounded">UCI</span>
              <span>Centre for Innovation</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
              <span className="bg-slate-700 text-white p-1 rounded">CIVE</span>
              <span>Film Entertainment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pre-production Tools For Professional Workflows
            </h2>
            <p className="text-lg text-slate-600">
              Stop fighting with disconnected spreadsheets, word processors, and email threads. Orchestrate everything in one coherent framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-[#0984FD] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#0E2A5C]">1. Research Ingestion</h3>
              <p className="text-slate-600 text-sm">
                Upload interview transcripts, ethnographic studies, or reports. The system extracts summaries, cultural themes, and potential character profiles safely.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-[#0984FD] rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#0E2A5C]">2. Storyboard & Shot Lists</h3>
              <p className="text-slate-600 text-sm">
                Generate descriptive storyboard panels per scene. Auto-compile shots into structured shot lists containing lens types, camera moves, and notes.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-[#0984FD] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#0E2A5C]">3. Budget & Scheduling</h3>
              <p className="text-slate-600 text-sm">
                Estimate crew, meals, transport, and equipment fees deterministically with zero hallucinated mathematics. Produce daily call sheets in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Visualizer */}
      <section id="workflow" className="py-20 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How CIVE StoryLab Empowers Creators</h2>
            <p className="text-slate-600 mt-2">A clean, progressive, non-chatbot workflow guiding you step-by-step.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-[#0E2A5C] text-white rounded-full flex items-center justify-center font-bold mx-auto">1</div>
              <h4 className="font-semibold text-slate-900">Define & Ingest</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">Set genre, target duration, and language. Upload research files or describe your film idea.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-[#0E2A5C] text-white rounded-full flex items-center justify-center font-bold mx-auto">2</div>
              <h4 className="font-semibold text-slate-900">Generate Premise & Cast</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">Select from AI premises grounded in your findings. Extract motivation-aligned character dossiers.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-[#0E2A5C] text-white rounded-full flex items-center justify-center font-bold mx-auto">3</div>
              <h4 className="font-semibold text-slate-900">Write Screenplay & Storyboard</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">Draft scenes inside our screenplay editor. Instantly propose illustrated camera angles.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-[#0E2A5C] text-white rounded-full flex items-center justify-center font-bold mx-auto">4</div>
              <h4 className="font-semibold text-slate-900">Calculate Budget & Print</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">Instantly generate meal, equipment, and travel line items. Export entire pre-production portfolio to PDF/Markdown.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Flexible Licensing for Academic & Indie Filmmakers</h2>
            <p className="text-lg text-slate-600">Built to be highly accessible for universities, NGOs, and independent production groups.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border border-slate-200 bg-white p-8 rounded-xl relative hover:border-[#0984FD] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs uppercase font-bold text-slate-400">For Individuals</span>
                <h3 className="text-2xl font-bold text-[#0E2A5C]">Creator Slate</h3>
                <p className="text-sm text-slate-600">Perfect for independent filmmakers, film students, and screenwriters seeking to pitch their vision.</p>
                <div className="text-3xl font-extrabold text-slate-900 pt-2">Free <span className="text-xs text-slate-500 font-normal">for students & personal projects</span></div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /> <span>Upload up to 5 documents per project</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /> <span>Auto Screenplay Dialogue Generation</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /> <span>Bilingual Swahili-English Translation</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-green-500" /> <span>Print-ready HTML/Markdown Export</span></li>
                </ul>
              </div>
              <button
                id="btn_landing_pricing_creator"
                onClick={onStart}
                className="w-full mt-8 bg-[#0E2A5C] hover:bg-[#0984FD] text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                Get Started for Free
              </button>
            </div>

            <div className="border border-[#0984FD] bg-[#f0f7ff]/40 p-8 rounded-xl relative hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 bg-[#0984FD] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
                UDOM Recommended
              </div>
              <div className="space-y-4">
                <span className="text-xs uppercase font-bold text-[#0984FD]">For Institutions</span>
                <h3 className="text-2xl font-bold text-[#0E2A5C]">Campus / NGO Suite</h3>
                <p className="text-sm text-slate-600">Enterprise dashboard for university program coordinators, team administrators, and research-to-media groups.</p>
                <div className="text-3xl font-extrabold text-slate-900 pt-2">Custom <span className="text-xs text-slate-500 font-normal">annual department licenses</span></div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#0984FD]" /> <span>Coordinator aggregate analytics dashboard</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#0984FD]" /> <span>Unlimited document upload size (up to 50MB)</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#0984FD]" /> <span>Shared institutional Prompt Library templates</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#0984FD]" /> <span>SAML / Moodle LMS plugins integration</span></li>
                </ul>
              </div>
              <button
                id="btn_landing_pricing_inst"
                onClick={onStart}
                className="w-full mt-8 bg-[#0984FD] hover:bg-[#0E2A5C] text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                Inquire Department Code
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Film className="w-5 h-5 text-[#0984FD]" />
              <span>CIVE StoryLab</span>
            </div>
            <p className="text-slate-400 text-xs">
              AI-Orchestrated pre-production platform facilitating research translation for the African cinema landscape.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Academic</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">University of Dodoma</a></li>
              <li><a href="#" className="hover:text-white">UCI Innovation Lab</a></li>
              <li><a href="#" className="hover:text-white">Student Portfolios</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Screenplay Editor</a></li>
              <li><a href="#" className="hover:text-white">Budget Engine</a></li>
              <li><a href="#" className="hover:text-white">Storyboard Viewer</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Compliance & Legal</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Data Privacy Guidelines</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Tanzanian Data Protection</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-10 pt-6 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} CIVE Film Entertainment. Confidential Draft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
