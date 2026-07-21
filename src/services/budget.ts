/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetLineItem, ProductionPlan } from '../types.js';

interface RateCard {
  currency: string;
  roleRates: Record<string, number>;
  castRate: number;
  equipmentDailyRate: Record<string, number>;
  locationDailyRate: Record<string, number>;
  baseWardrobeRate: number;
  genreMultipliers: Record<string, number>;
  transportRatePerPerson: number;
  mealRatePerPerson: number;
  nightlyRate: number;
  vfxStuntRate: number;
  basePostRate: number;
}

// Configurable, versioned Rate Cards per Budget Tier
const RATE_CARDS: Record<'low' | 'medium' | 'high', RateCard> = {
  low: {
    currency: 'TZS',
    roleRates: {
      Director: 150000,
      'Director of Photography': 120000,
      'Sound Recordist': 80000,
      'Production Manager': 80000,
      Gaffer: 60000,
      Grip: 40000,
      'Production Assistant': 30000
    },
    castRate: 45000, // per actor per day
    equipmentDailyRate: {
      Camera: 60000, // Basic DSLR Package
      Lighting: 30000, // Minimal LED Panel
      Sound: 20000, // Recorder + Lav
      Grip: 10000 // Tripod
    },
    locationDailyRate: {
      Practical: 50000,
      Studio: 100000,
      Exterior: 20000
    },
    baseWardrobeRate: 15000,
    genreMultipliers: {
      Drama: 1.0,
      Romance: 1.0,
      Comedy: 1.1,
      'Sci-Fi': 1.5,
      Fantasy: 1.5,
      Action: 1.6,
      Adventure: 1.3,
      Animation: 1.2,
      Thriller: 1.2,
      Mystery: 1.1,
      Crime: 1.2,
      Documentary: 0.8,
      'Docu-Drama': 0.9,
      Biography: 0.9,
      Historical: 1.4,
      Educational: 0.7,
      Experimental: 0.9,
      Horror: 1.3,
      Family: 1.0
    },
    transportRatePerPerson: 10000, // per shoot day
    mealRatePerPerson: 8000, // per day (breakfast + lunch)
    nightlyRate: 20000, // for out of town
    vfxStuntRate: 50000, // flat allowance per scene
    basePostRate: 15000 // per final minute
  },
  medium: {
    currency: 'TZS',
    roleRates: {
      Director: 350000,
      'Director of Photography': 300000,
      'Sound Recordist': 200000,
      'Production Manager': 200000,
      Gaffer: 150000,
      Grip: 100000,
      'Production Assistant': 60000
    },
    castRate: 100000,
    equipmentDailyRate: {
      Camera: 200000, // Mirrorless/Cinema package
      Lighting: 100000, // 3-point light pack
      Sound: 60000, // Booms, lavs, field mixer
      Grip: 40000 // Jib, slider, heavy tripods
    },
    locationDailyRate: {
      Practical: 150000,
      Studio: 300000,
      Exterior: 50000
    },
    baseWardrobeRate: 40000,
    genreMultipliers: {
      Drama: 1.0,
      Romance: 1.1,
      Comedy: 1.2,
      'Sci-Fi': 1.8,
      Fantasy: 1.7,
      Action: 2.0,
      Adventure: 1.5,
      Animation: 1.5,
      Thriller: 1.3,
      Mystery: 1.2,
      Crime: 1.3,
      Documentary: 0.8,
      'Docu-Drama': 0.9,
      Biography: 1.0,
      Historical: 1.6,
      Educational: 0.7,
      Experimental: 1.0,
      Horror: 1.4,
      Family: 1.1
    },
    transportRatePerPerson: 25000,
    mealRatePerPerson: 15000,
    nightlyRate: 50000,
    vfxStuntRate: 150000,
    basePostRate: 40000
  },
  high: {
    currency: 'TZS',
    roleRates: {
      Director: 800000,
      'Director of Photography': 650000,
      'Sound Recordist': 500000,
      'Production Manager': 500000,
      Gaffer: 350000,
      Grip: 250000,
      'Production Assistant': 120000
    },
    castRate: 250000,
    equipmentDailyRate: {
      Camera: 500000, // High-end RED/Arri package
      Lighting: 250000, // Full HMI / LED van pack
      Sound: 120000, // Complete multi-channel rig
      Grip: 100000 // Gimbal, dollies
    },
    locationDailyRate: {
      Practical: 400000,
      Studio: 800000,
      Exterior: 150000
    },
    baseWardrobeRate: 80000,
    genreMultipliers: {
      Drama: 1.0,
      Romance: 1.2,
      Comedy: 1.3,
      'Sci-Fi': 2.2,
      Fantasy: 2.0,
      Action: 2.5,
      Adventure: 1.8,
      Animation: 2.0,
      Thriller: 1.5,
      Mystery: 1.3,
      Crime: 1.5,
      Documentary: 0.9,
      'Docu-Drama': 1.0,
      Biography: 1.2,
      Historical: 2.0,
      Educational: 0.8,
      Experimental: 1.1,
      Horror: 1.6,
      Family: 1.2
    },
    transportRatePerPerson: 50000,
    mealRatePerPerson: 30000,
    nightlyRate: 100000,
    vfxStuntRate: 400000,
    basePostRate: 100000
  }
};

export function estimateShootDays(durationTarget: string, numScenes: number): number {
  // Convert duration to minutes
  let minutes = 10;
  if (durationTarget.includes('5')) minutes = 5;
  else if (durationTarget.includes('10')) minutes = 10;
  else if (durationTarget.includes('20')) minutes = 20;
  else if (durationTarget.includes('30')) minutes = 30;
  else if (durationTarget.includes('45')) minutes = 45;
  else if (durationTarget.includes('60')) minutes = 60;
  else if (durationTarget.includes('90')) minutes = 90;
  else if (durationTarget.includes('feature')) minutes = 110;

  // Typically we shoot 3 to 5 scenes per day on a budget-aware schedule
  const scenesPerDay = minutes > 60 ? 4 : 3;
  let estimatedDays = Math.ceil(numScenes / scenesPerDay);
  if (estimatedDays < 1) estimatedDays = 1;
  return estimatedDays;
}

export function computeBudgetDeterministic(params: {
  productionPlanId: string;
  genre: string;
  durationTarget: string;
  numScenes: number;
  numActors: number;
  locationsCount: number;
  budgetTier: 'low' | 'medium' | 'high' | 'custom';
  vfxStuntScenesCount: number;
  outOfTownNights: number;
}): {
  lineItems: Omit<BudgetLineItem, 'id'>[];
  summary: {
    categories: Record<string, number>;
    total: number;
    contingency_pct: number;
    currency: string;
  };
} {
  const tier = params.budgetTier === 'custom' ? 'low' : params.budgetTier;
  const rates = RATE_CARDS[tier];
  const shootDays = estimateShootDays(params.durationTarget, params.numScenes);

  const numActors = params.numActors || 2;
  const numScenes = params.numScenes || 5;
  const locationsCount = params.locationsCount || 2;

  // Convert duration Target to minutes for post calculation
  let minutes = 10;
  if (params.durationTarget.includes('5')) minutes = 5;
  else if (params.durationTarget.includes('10')) minutes = 10;
  else if (params.durationTarget.includes('20')) minutes = 20;
  else if (params.durationTarget.includes('30')) minutes = 30;
  else if (params.durationTarget.includes('45')) minutes = 45;
  else if (params.durationTarget.includes('60')) minutes = 60;
  else if (params.durationTarget.includes('90')) minutes = 90;
  else if (params.durationTarget.includes('feature')) minutes = 90;

  const genreMultiplier = rates.genreMultipliers[params.genre] || 1.0;

  const lineItems: any[] = [];

  // 1. Cast Cost
  const castUnitCost = rates.castRate;
  const castTotal = numActors * castUnitCost * shootDays;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'cast',
    description: `Actors / Cast: ${numActors} performers for ${shootDays} shoot-days`,
    quantity: numActors * shootDays,
    unit_cost: castUnitCost,
    is_ai_generated: true,
    is_user_edited: false
  });

  // 2. Crew Cost
  // Low budget gets 3 core roles, medium gets 5, high gets 7
  let crewRoles = ['Director', 'Director of Photography', 'Sound Recordist', 'Production Manager'];
  if (tier === 'low') {
    crewRoles = ['Director', 'Director of Photography', 'Sound Recordist'];
  } else if (tier === 'high') {
    crewRoles = ['Director', 'Director of Photography', 'Sound Recordist', 'Production Manager', 'Gaffer', 'Grip', 'Production Assistant'];
  }

  let crewSubtotal = 0;
  crewRoles.forEach(role => {
    const rate = rates.roleRates[role] || 50000;
    crewSubtotal += rate * shootDays;
    lineItems.push({
      production_plan_id: params.productionPlanId,
      category: 'crew',
      description: `Crew: ${role} rate for ${shootDays} shoot-days`,
      quantity: shootDays,
      unit_cost: rate,
      is_ai_generated: true,
      is_user_edited: false
    });
  });

  const crewHeadcount = crewRoles.length;
  const totalHeadcount = numActors + crewHeadcount;

  // 3. Equipment Cost
  let equipSubtotal = 0;
  const equipCategories: Array<'Camera' | 'Lighting' | 'Sound' | 'Grip'> = ['Camera', 'Lighting', 'Sound', 'Grip'];
  equipCategories.forEach(cat => {
    const rate = rates.equipmentDailyRate[cat] || 10000;
    equipSubtotal += rate * shootDays;
    lineItems.push({
      production_plan_id: params.productionPlanId,
      category: 'equipment',
      description: `Equipment Rental: ${cat} tier package for ${shootDays} days`,
      quantity: shootDays,
      unit_cost: rate,
      is_ai_generated: true,
      is_user_edited: false
    });
  });

  // 4. Locations Cost
  const locDaily = rates.locationDailyRate.Practical;
  const locTotal = locationsCount * locDaily;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'locations',
    description: `Locations: Venue hire and community fee for ${locationsCount} practical sites`,
    quantity: locationsCount,
    unit_cost: locDaily,
    is_ai_generated: true,
    is_user_edited: false
  });

  // 5. Wardrobe & Costumes (Scaled by genre multiplier)
  const wardrobeUnit = Math.round(rates.baseWardrobeRate * genreMultiplier);
  const wardrobeTotal = wardrobeUnit * numActors;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'wardrobe',
    description: `Wardrobe & Makeup: Costume allocation for ${numActors} main roles`,
    quantity: numActors,
    unit_cost: wardrobeUnit,
    is_ai_generated: true,
    is_user_edited: false
  });

  // 6. Transport Cost
  const transportUnit = rates.transportRatePerPerson;
  const transportTotal = totalHeadcount * transportUnit * shootDays;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'transport',
    description: `Transport: Transit logistics for ${totalHeadcount} cast/crew members over ${shootDays} days`,
    quantity: totalHeadcount * shootDays,
    unit_cost: transportUnit,
    is_ai_generated: true,
    is_user_edited: false
  });

  // 7. Meals Cost
  const mealUnit = rates.mealRatePerPerson;
  const mealTotal = totalHeadcount * mealUnit * shootDays;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'meals',
    description: `Catering: Hot meals and water for ${totalHeadcount} persons daily`,
    quantity: totalHeadcount * shootDays,
    unit_cost: mealUnit,
    is_ai_generated: true,
    is_user_edited: false
  });

  // 8. Accommodation Cost (if out of town nights)
  if (params.outOfTownNights > 0) {
    const accomUnit = rates.nightlyRate;
    const accomTotal = totalHeadcount * accomUnit * params.outOfTownNights;
    lineItems.push({
      production_plan_id: params.productionPlanId,
      category: 'accommodation',
      description: `Accommodation: Local lodging for ${totalHeadcount} out-of-town members for ${params.outOfTownNights} nights`,
      quantity: totalHeadcount * params.outOfTownNights,
      unit_cost: accomUnit,
      is_ai_generated: true,
      is_user_edited: false
    });
  }

  // 9. Special Effects / Stunts
  if (params.vfxStuntScenesCount > 0) {
    const vfxUnit = rates.vfxStuntRate;
    const vfxTotal = params.vfxStuntScenesCount * vfxUnit;
    lineItems.push({
      production_plan_id: params.productionPlanId,
      category: 'post_production', // maps to category or special effects
      description: `Special Effects: Allowance for ${params.vfxStuntScenesCount} VFX/stunt-tagged action scenes`,
      quantity: params.vfxStuntScenesCount,
      unit_cost: vfxUnit,
      is_ai_generated: true,
      is_user_edited: false
    });
  }

  // 10. Post-Production
  const postUnit = rates.basePostRate;
  const postTotal = postUnit * minutes;
  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'post_production',
    description: `Post-Production: Editing, Swahili dialogue balancing, and rendering for ${minutes} minutes final runtime`,
    quantity: minutes,
    unit_cost: postUnit,
    is_ai_generated: true,
    is_user_edited: false
  });

  // Calculate Subtotal & Contingency
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  const contingencyPct = 10;
  const contingencyAmount = Math.round(subtotal * (contingencyPct / 100));

  lineItems.push({
    production_plan_id: params.productionPlanId,
    category: 'contingency',
    description: `Contingency: ${contingencyPct}% emergency safety cushion for unforeseen on-set costs`,
    quantity: 1,
    unit_cost: contingencyAmount,
    is_ai_generated: true,
    is_user_edited: false
  });

  // Category Summaries mapping
  const categories: Record<string, number> = {};
  lineItems.forEach(item => {
    const cat = item.category;
    const itemTotal = item.quantity * item.unit_cost;
    categories[cat] = (categories[cat] || 0) + itemTotal;
  });

  const total = subtotal + contingencyAmount;

  return {
    lineItems: lineItems.map(item => ({
      ...item,
      total_cost: item.quantity * item.unit_cost
    })),
    summary: {
      categories,
      total,
      contingency_pct: contingencyPct,
      currency: rates.currency
    }
  };
}
