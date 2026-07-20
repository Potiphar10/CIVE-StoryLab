/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PiggyBank, Plus, Trash2, Edit2, Check, Sliders, ChevronDown, ChevronUp, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import { Project, ProductionPlan, BudgetLineItem } from '../types.js';

interface BudgetGeneratorProps {
  project: Project;
  plan: ProductionPlan | null;
  budgetItems: BudgetLineItem[];
  onBudgetUpdated: () => void;
  onGeneratePlan: () => void;
  generatingPlan: boolean;
}

export default function BudgetGenerator({ project, plan, budgetItems, onBudgetUpdated, onGeneratePlan, generatingPlan }: BudgetGeneratorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('cast');
  const [loading, setLoading] = useState(false);

  // Form Fields for new item
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newCost, setNewCost] = useState(0);

  // Editing Row fields
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [editCost, setEditCost] = useState(0);

  const categories = [
    { key: 'cast', title: 'Cast / Actors Performance Fees' },
    { key: 'crew', title: 'Crew & Technical Assistants' },
    { key: 'equipment', title: 'Camera & Lighting Rentals' },
    { key: 'locations', title: 'Location Permits & Set Dressing' },
    { key: 'wardrobe', title: 'Wardrobe, Props & Makeup' },
    { key: 'transport', title: 'Fuel & Driver Logistics' },
    { key: 'meals', title: 'Meals & Water (On-set catering)' },
    { key: 'post_production', title: 'Post-production (Editing & Sound)' },
    { key: 'contingency', title: 'Contingency / Safety reserves' }
  ];

  const handleAddLineItem = async (cat: string) => {
    if (!newDesc || !plan) return;
    try {
      const response = await fetch('/api/budget-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          production_plan_id: plan.id,
          category: cat,
          description: newDesc,
          quantity: newQty,
          unit_cost: newCost
        })
      });

      if (response.ok) {
        setNewDesc('');
        setNewQty(1);
        setNewCost(0);
        setShowAddForm(null);
        onBudgetUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEdit = (item: BudgetLineItem) => {
    setEditingItemId(item.id);
    setEditQty(item.quantity);
    setEditCost(item.unit_cost);
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      const response = await fetch(`/api/budget-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: editQty,
          unit_cost: editCost
        })
      });

      if (response.ok) {
        setEditingItemId(null);
        onBudgetUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this line item?')) return;
    try {
      await fetch(`/api/budget-items/${itemId}`, { method: 'DELETE' });
      onBudgetUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCategory = (catKey: string) => {
    setExpandedCategory(expandedCategory === catKey ? null : catKey);
  };

  return (
    <div id="budget_container" className="space-y-8 font-sans">
      
      {/* Dynamic Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#0E2A5C] flex items-center space-x-2">
            <PiggyBank className="w-5.5 h-5.5 text-[#0984FD]" />
            <span>Deterministic Budget Intelligence (MOD-09)</span>
          </h2>
          <p className="text-xs text-slate-500">Calculate meals, travel allowances, and gear rentals with local rates. No mock mathematics.</p>
        </div>

        {!plan && (
          <button
            id="btn_trigger_budget_plan"
            onClick={onGeneratePlan}
            disabled={generatingPlan}
            className="bg-[#0E2A5C] hover:bg-[#0984FD] disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 shrink-0"
          >
            {generatingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recalculating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Initialize Budget Plan</span>
              </>
            )}
          </button>
        )}
      </div>

      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Budget Category Accordion Tree (SCR-15 & SCR-18) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0E2A5C] uppercase tracking-wider">Itemized Line Items</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Tanzanian Shilling (TZS / TSh)</span>
            </div>

            <div className="space-y-3">
              {categories.map(cat => {
                const isExpanded = expandedCategory === cat.key;
                const items = budgetItems.filter(i => i.category === cat.key);
                const categoryTotal = items.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0);

                return (
                  <div key={cat.key} className="border border-slate-200 rounded-lg overflow-hidden transition-all bg-white shadow-sm">
                    
                    {/* Accordion trigger header */}
                    <div
                      onClick={() => toggleCategory(cat.key)}
                      className={`p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors select-none ${isExpanded ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0E2A5C]"></span>
                        <span className="text-xs font-bold text-slate-800">{cat.title}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-mono font-bold text-xs text-[#0E2A5C]">
                          TSh {categoryTotal.toLocaleString()}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Accordion Body contents */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-4 bg-white space-y-4">
                        <div className="overflow-x-auto rounded border border-slate-150">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold font-sans text-[10px] uppercase">
                                <th className="p-2.5">Description</th>
                                <th className="p-2.5 text-center">Qty</th>
                                <th className="p-2.5 text-right">Unit cost (TSh)</th>
                                <th className="p-2.5 text-right">Total (TSh)</th>
                                <th className="p-2.5 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map(item => {
                                const isEditing = editingItemId === item.id;
                                return (
                                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/20">
                                    <td className="p-2.5 text-slate-800 font-medium">{item.description}</td>
                                    
                                    <td className="p-2.5 text-center">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editQty}
                                          onChange={(e) => setEditQty(parseFloat(e.target.value) || 1)}
                                          className="w-12 text-center text-xs border rounded py-0.5 bg-white"
                                        />
                                      ) : (
                                        <span className="font-semibold text-slate-600">{item.quantity}</span>
                                      )}
                                    </td>

                                    <td className="p-2.5 text-right font-mono text-slate-600">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editCost}
                                          onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                                          className="w-20 text-right text-xs border rounded py-0.5 bg-white mr-1"
                                        />
                                      ) : (
                                        `TSh ${item.unit_cost.toLocaleString()}`
                                      )}
                                    </td>

                                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                                      TSh {(item.quantity * item.unit_cost).toLocaleString()}
                                    </td>

                                    <td className="p-2.5 text-center whitespace-nowrap">
                                      {isEditing ? (
                                        <button
                                          onClick={() => handleSaveEdit(item.id)}
                                          className="text-green-600 hover:text-green-800 p-1 font-semibold"
                                        >
                                          Save
                                        </button>
                                      ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                          <button onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-[#0984FD]"><Edit2 className="w-3.5 h-3.5" /></button>
                                          {item.category !== 'contingency' && (
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Manual Item addition form (AC-T05) */}
                        {showAddForm === cat.key ? (
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[9px] font-bold uppercase text-slate-500">Item description</label>
                              <input
                                type="text"
                                required
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="e.g. Extra local village generator hire"
                                className="w-full text-xs border rounded px-2.5 py-1.5 bg-white focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-slate-500">Qty</label>
                              <input
                                type="number"
                                required
                                value={newQty}
                                onChange={(e) => setNewQty(parseFloat(e.target.value) || 1)}
                                className="w-full text-xs border rounded px-2.5 py-1.5 bg-white focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-slate-500">Unit cost (TSh)</label>
                              <div className="flex space-x-1.5">
                                <input
                                  type="number"
                                  required
                                  value={newCost}
                                  onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                                  className="flex-1 text-xs border rounded px-2.5 py-1.5 bg-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddLineItem(cat.key)}
                                  className="bg-[#0E2A5C] text-white px-3.5 py-1.5 rounded font-semibold text-xs"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          cat.key !== 'contingency' && (
                            <button
                              onClick={() => setShowAddForm(cat.key)}
                              className="text-[#0984FD] hover:text-[#0E2A5C] font-semibold text-[11px] flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add custom line item (AC-T05)</span>
                            </button>
                          )
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side: Grand Summary and Budget Tier Comparison Slider (SCR-16 / SCR-19) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Grand Summary card */}
            <div className="bg-[#0E2A5C] text-white rounded-xl p-6 shadow-md border border-white/10 space-y-4">
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider border border-white/20">CIVE Cumulative Grand Summary</span>
              <div className="space-y-1">
                <span className="text-slate-300 text-xs font-semibold block">Total Estimated Cost (TSh)</span>
                <div className="text-3xl font-extrabold tracking-tight">
                  TSh {plan.budget_total?.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 text-xs space-y-3 font-semibold text-slate-200">
                <div className="flex justify-between">
                  <span>Non-Contingency Subtotal:</span>
                  <span className="font-mono">TSh {((plan.budget_summary?.total || 0) - ((plan.budget_summary?.categories?.contingency) || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contingency Reserve ({plan.budget_summary?.contingency_pct || 10}%):</span>
                  <span className="font-mono">TSh {(plan.budget_summary?.categories?.contingency || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Budget Tier Comparison Widget (SCR-19) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-[#0E2A5C] uppercase tracking-wider flex items-center space-x-1">
                <Sliders className="w-4 h-4 text-[#0984FD]" />
                <span>Budget Tier Comparison Widget</span>
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Toggle tiers on the fly to see how selecting high-end equipment or expanded cast plans changes the predicted bottom line.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded border border-slate-100 bg-slate-50/50">
                  <div>
                    <strong className="text-slate-800">Student Slate (Low)</strong>
                    <span className="text-[9px] text-slate-400 block">DSLR Camera • 3 Actors</span>
                  </div>
                  <span className="font-mono font-bold text-slate-600">TSh 1.2M - 1.5M</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded border border-slate-100">
                  <div>
                    <strong className="text-slate-800">Regional Indie (Medium)</strong>
                    <span className="text-[9px] text-slate-400 block">Cinema Rig • 5 Actors</span>
                  </div>
                  <span className="font-mono font-bold text-slate-600">TSh 3.5M - 5M</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded border border-slate-100">
                  <div>
                    <strong className="text-slate-800">Co-production (High)</strong>
                    <span className="text-[9px] text-slate-400 block">ARRI Package • 8 Actors</span>
                  </div>
                  <span className="font-mono font-bold text-slate-600">TSh 10M - 15M</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
