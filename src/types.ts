/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Institution {
  id: string;
  name: string;
  type: 'university' | 'ngo' | 'government' | 'agency' | 'production_company';
  license_tier: 'free' | 'standard' | 'enterprise';
  country?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface User {
  id: string;
  institution_id?: string | null;
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'student' | 'individual' | 'team_member' | 'coordinator' | 'admin' | 'super_admin';
  preferred_language: 'en' | 'sw';
  status: 'active' | 'suspended' | 'deactivated';
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  creation_path: 'path_a' | 'path_b'; // path_a = Research-Driven, path_b = Idea-Driven
  status: 'draft' | 'in_progress' | 'complete' | 'archived';
  genre?: string | null;
  duration_target?: string | null; // e.g. "5m", "10m", "20m", "30m", "45m", "60m", "90m", "feature"
  target_audience?: string | null;
  language?: string | null; // "en" or "sw"
  budget_tier?: 'low' | 'medium' | 'high' | 'custom' | null;
  storytelling_style?: string | null;
  country?: string | null;
  production_deadline?: string | null;
  num_actors_target?: number | null;
  completion_pct: number; // 0 to 100
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ResearchDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: 'pdf' | 'docx' | 'txt';
  file_size_bytes: number;
  summary?: string | null;
  themes?: Array<{
    theme: string;
    excerpt: string;
    confidence: number;
    source_page?: number;
  }> | null;
  entities?: Array<{
    type: string;
    name: string;
  }> | null;
  processing_status: 'pending' | 'processing' | 'complete' | 'failed';
  uploaded_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role_type: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  background?: string;
  motivation?: string;
  voice_notes?: string;
  arc_summary?: string;
  source: 'research_extracted' | 'ai_generated' | 'user_authored';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface StoryConcept {
  id: string;
  project_id: string;
  logline?: string;
  synopsis?: string;
  three_act_structure?: {
    act1: { title: string; description: string };
    act2: { title: string; description: string };
    act3: { title: string; description: string };
    turning_points: string[];
  };
  beat_sheet?: Array<{
    beat_name: string;
    description: string;
  }>;
  status: 'draft' | 'confirmed';
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  order_index: number;
  slugline?: string; // e.g. "INT. VILLAGE HOUSE - DAY"
  purpose?: string;
  characters_present?: string[]; // Array of character.id
  status: 'planned' | 'drafted' | 'final';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ScreenplayVersion {
  id: string;
  scene_id: string;
  version_number: number;
  content: string; // screenplay-formatted text
  is_final: boolean;
  created_by: string; // user.id
  created_at: string;
}

export interface StoryboardPanel {
  id: string;
  scene_id: string;
  order_index: number;
  image_url?: string;
  caption?: string;
  shot_type?: string; // e.g. "Wide", "Medium", "Close-up"
  generation_status: 'pending' | 'complete' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ShotListEntry {
  id: string;
  panel_id: string;
  shot_number: number;
  shot_description: string;
  camera_movement?: string;
  equipment_notes?: string;
  estimated_setup_minutes?: number;
}

export interface ProductionPlan {
  id: string;
  project_id: string;
  equipment_recommendation?: any; // JSONB
  crew_recommendation?: any; // JSONB
  location_recommendation?: any; // JSONB
  budget_summary?: {
    categories: Record<string, number>;
    total: number;
    contingency_pct: number;
    currency: string;
  };
  budget_total?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetLineItem {
  id: string;
  production_plan_id: string;
  category: 'cast' | 'crew' | 'equipment' | 'locations' | 'wardrobe' | 'transport' | 'meals' | 'accommodation' | 'post_production' | 'contingency' | 'other';
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  is_ai_generated: boolean;
  is_user_edited: boolean;
}

export interface ScheduleDay {
  id: string;
  production_plan_id: string;
  day_number: number;
  shoot_date?: string;
  location_id?: string;
  scene_ids: string[]; // references scene.id
}

export interface CallSheet {
  id: string;
  schedule_day_id: string;
  call_time?: string;
  crew_contacts?: Array<{ name: string; role: string; phone: string }>;
  notes?: string;
  generated_at: string;
}

export interface RiskAssessmentItem {
  id: string;
  production_plan_id: string;
  category: 'weather' | 'location_safety' | 'cast_availability' | 'equipment' | 'budget_overrun' | 'schedule_slip' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface AIGenerationLog {
  id: string;
  project_id: string;
  module_id: string;
  prompt_template_ref: string;
  model_provider: string;
  model_name: string;
  input_context: any; // JSONB
  output_ref?: string;
  status: 'succeeded' | 'failed' | 'timed_out';
  latency_ms?: number;
  token_usage?: {
    input_tokens: number;
    output_tokens: number;
    cost_usd?: number;
  };
  created_at: string;
}

export interface PromptLibraryEntry {
  id: string;
  owner_user_id?: string | null;
  owner_institution_id?: string | null;
  title: string;
  module_id: string;
  template_text: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'generation_complete' | 'generation_failed' | 'export_ready' | 'collaboration_update' | 'institutional_announcement' | 'account_security';
  title: string;
  body?: string;
  read_at?: string | null;
  created_at: string;
}

export interface AsyncJob {
  job_id: string;
  status: 'queued' | 'processing' | 'complete' | 'failed' | 'partial';
  progress_pct: number;
  result_ref?: any;
  error?: string | null;
}
