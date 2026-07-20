/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, AlertTriangle, ShieldCheck, Printer, Clock, FileText, ChevronRight } from 'lucide-react';
import { Project, ProductionPlan, ScheduleDay, CallSheet, RiskAssessmentItem } from '../types.js';

interface ScheduleGeneratorProps {
  project: Project;
  plan: ProductionPlan | null;
}

export default function ScheduleGenerator({ project, plan }: ScheduleGeneratorProps) {
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [callSheet, setCallSheet] = useState<CallSheet | null>(null);
  const [risks, setRisks] = useState<RiskAssessmentItem[]>([]);
  const [loadingSheet, setLoadingSheet] = useState(false);

  useEffect(() => {
    if (plan) {
      fetchScheduleAndRisks();
    }
  }, [plan]);

  useEffect(() => {
    if (activeDayId) {
      fetchCallSheet(activeDayId);
    }
  }, [activeDayId]);

  const fetchScheduleAndRisks = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/production-plan`);
      if (response.ok) {
        const data = await response.json();
        setScheduleDays(data.schedule_days || []);
        setRisks(data.risks || []);
        if (data.schedule_days?.length > 0) {
          setActiveDayId(data.schedule_days[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCallSheet = async (dayId: string) => {
    setLoadingSheet(true);
    try {
      const response = await fetch(`/api/schedule-days/${dayId}/call-sheet`);
      if (response.ok) {
        const data = await response.json();
        setCallSheet(data.call_sheet || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSheet(false);
    }
  };

  if (!plan) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-xl mx-auto space-y-3 font-sans">
        <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-700">Shoot Schedule Not Generated</h4>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Generate your production plan in the Budget Stage first to retrieve daily shoot breakdowns.
        </p>
      </div>
    );
  }

  const activeDay = scheduleDays.find(d => d.id === activeDayId);

  return (
    <div id="schedule_root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Left side: Day lists (Calendar view) */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Daily Shoot Schedule</h3>
        <div className="space-y-2">
          {scheduleDays.map(day => {
            const isSel = day.id === activeDayId;
            return (
              <div
                id={`schedule_day_btn_${day.id}`}
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${isSel ? 'border-[#0984FD] bg-blue-50/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] bg-[#0E2A5C] text-white font-bold px-2 py-0.5 rounded uppercase">Day {day.day_number}</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{day.shoot_date}</p>
                  <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{day.location_id}</span>
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSel ? 'text-[#0984FD]' : 'text-slate-400'}`} />
              </div>
            );
          })}
        </div>

        {/* Risk Assessment & Mitigation widget (SCR-15) */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h4 className="text-xs font-extrabold text-[#0E2A5C] uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Risk Assessment & Mitigations</span>
          </h4>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
            {risks.map((risk, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] leading-relaxed space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="uppercase text-[#0E2A5C] tracking-wider">{risk.category} risk</span>
                  <span className={`px-1 rounded uppercase ${risk.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{risk.severity}</span>
                </div>
                <p className="text-slate-700 font-semibold">"{risk.description}"</p>
                <p className="text-slate-500 italic"><strong className="text-slate-600 font-bold">Mitigation:</strong> {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Print-Ready Call Sheet Document View (SCR-17) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        
        {loadingSheet ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading call sheet data...</div>
        ) : !callSheet ? (
          <div className="text-center py-16 text-slate-400 text-xs">Select a schedule day to view its call sheet.</div>
        ) : (
          <div className="space-y-6">
            
            {/* Header / Printer action bar */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0984FD]" />
                  <span>On-Set Call Sheet (Day #{activeDay?.day_number})</span>
                </h3>
                <p className="text-[10px] text-slate-400">Printable call document for cast and technicians.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="text-xs font-semibold border border-slate-200 text-slate-600 hover:text-[#0E2A5C] hover:border-[#0E2A5C] px-3 py-1.5 rounded transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>

            {/* Document body (mimics real physical sheet) */}
            <div className="border border-slate-350 bg-[#fafcfd]/40 rounded-xl p-6 sm:p-8 space-y-6 text-xs text-slate-800 shadow-inner">
              
              {/* Document Header */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-[#0E2A5C] font-extrabold text-sm tracking-tight uppercase">CIVE StoryLab Productions</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Project: {project.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">DATE: {activeDay?.shoot_date}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 uppercase">Location Ref: {activeDay?.location_id}</p>
                </div>
              </div>

              {/* Times block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 rounded-lg border border-blue-50">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-[#0984FD]" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CREW ASSEMBLE TIME</span>
                    <p className="text-sm font-bold text-slate-800">{callSheet.call_time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WEATHER CONDITIONS</span>
                    <p className="text-sm font-bold text-slate-800">Clear / Sunny (Dodoma Region)</p>
                  </div>
                </div>
              </div>

              {/* Shoot Days list */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Scenes to shoot</span>
                <div className="bg-white border border-slate-200 rounded p-3 text-[11px] font-mono font-bold text-slate-700 space-y-1">
                  {activeDay?.scene_ids && activeDay.scene_ids.length > 0 ? (
                    activeDay.scene_ids.map((id, i) => (
                      <div key={i}>&bull; Scene ID Ref: {id}</div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">No scenes mapped. Ensure scene indices exist.</div>
                  )}
                </div>
              </div>

              {/* Crew contacts (SCR-17) */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Key Contact Channels</span>
                <div className="overflow-x-auto rounded border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2">Name</th>
                        <th className="p-2">Staff Role</th>
                        <th className="p-2">Phone / Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callSheet.crew_contacts?.map((contact, idx) => (
                        <tr key={idx} className="border-b border-slate-100 bg-white">
                          <td className="p-2 font-semibold text-slate-800">{contact.name}</td>
                          <td className="p-2 font-medium text-slate-500">{contact.role}</td>
                          <td className="p-2 font-mono text-slate-700">{contact.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* On set notes */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Director & Producer Instructions</span>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded italic">
                  "{callSheet.notes}"
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
