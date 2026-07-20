/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Users, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { Project, ProductionPlan } from '../types.js';

interface EquipmentCrewLocationProps {
  project: Project;
  plan: ProductionPlan | null;
}

export default function EquipmentCrewLocation({ project, plan }: EquipmentCrewLocationProps) {
  const [activeTab, setActiveTab] = useState<'equipment' | 'crew' | 'locations'>('equipment');

  if (!plan) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-xl mx-auto space-y-3 font-sans">
        <Camera className="w-12 h-12 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-700">Production Plan Not Generated</h4>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You must generate your production breakdown plan inside the Budget Stage first to retrieve equipment, crew, and location clearances.
        </p>
      </div>
    );
  }

  return (
    <div id="equipment_crew_location_root" className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 font-sans">
      
      {/* Top Selector tab bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Logistics & Crew Alignment (MOD-08)</h3>
          <p className="text-xs text-slate-500">Align cameras, staff quotas, and village permits for smooth shooting operations.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${activeTab === 'equipment' ? 'bg-white text-[#0E2A5C] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Camera className="w-4 h-4" />
            <span>Equipment ({plan.equipment_recommendation?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${activeTab === 'crew' ? 'bg-white text-[#0E2A5C] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Users className="w-4 h-4" />
            <span>Crew List ({plan.crew_recommendation?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${activeTab === 'locations' ? 'bg-white text-[#0E2A5C] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <MapPin className="w-4 h-4" />
            <span>Locations ({plan.location_recommendation?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* --- Tab content: Equipment --- */}
      {activeTab === 'equipment' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.equipment_recommendation?.map((equip, idx) => (
              <div key={idx} className="border border-slate-200 bg-slate-50/50 rounded-lg p-4 flex items-start space-x-3 hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded bg-blue-50 text-[#0984FD] flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">EQUIP-{idx + 1}</span>
                  <h4 className="font-bold text-[#0E2A5C] text-sm">{equip}</h4>
                  <p className="text-slate-500 text-[11px]">Matched with {project.budget_tier} budget limits and DSLR setups.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Tab content: Crew --- */}
      {activeTab === 'crew' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plan.crew_recommendation?.map((cr, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                    <span>CREW-ROLE #{idx + 1}</span>
                    <span className="bg-blue-50 text-[#0984FD] px-1.5 py-0.5 rounded uppercase">Quorum: {cr.count}</span>
                  </div>
                  <h4 className="font-extrabold text-[#0E2A5C] text-sm">{cr.role}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {cr.rationale}
                  </p>
                </div>
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>Cost estimate included in budget</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Tab content: Locations --- */}
      {activeTab === 'locations' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.location_recommendation?.map((loc, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#0984FD]" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{loc.sceneName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{loc.type}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Local Permission Protocol</span>
                  <p className="text-slate-600 font-semibold italic text-[11px]">"{loc.permission}"</p>
                </div>

                <div className="bg-amber-50/50 text-amber-800 border border-amber-100 p-2.5 rounded text-[10px] flex items-start space-x-2 font-semibold">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <p>In Tanzania, always clear shooting schedules with the Village Executive Officer (VEO) prior to setting up cameras.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
