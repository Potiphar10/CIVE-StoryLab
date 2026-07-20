/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  Institution,
  User,
  Project,
  ResearchDocument,
  Character,
  StoryConcept,
  Scene,
  ScreenplayVersion,
  StoryboardPanel,
  ShotListEntry,
  ProductionPlan,
  BudgetLineItem,
  ScheduleDay,
  CallSheet,
  RiskAssessmentItem,
  PromptLibraryEntry,
  Notification,
  AsyncJob
} from '../types.js';

interface DatabaseSchema {
  institutions: Institution[];
  users: User[];
  projects: Project[];
  research_documents: ResearchDocument[];
  characters: Character[];
  story_concepts: StoryConcept[];
  scenes: Scene[];
  screenplay_versions: ScreenplayVersion[];
  storyboard_panels: StoryboardPanel[];
  shot_list_entries: ShotListEntry[];
  production_plans: ProductionPlan[];
  budget_line_items: BudgetLineItem[];
  schedule_days: ScheduleDay[];
  call_sheets: CallSheet[];
  risk_assessment_items: RiskAssessmentItem[];
  prompt_library_entries: PromptLibraryEntry[];
  notifications: Notification[];
  async_jobs: Record<string, AsyncJob>;
}

const DB_FILE = path.join(process.cwd(), 'db.json');

function createEmptyDB(): DatabaseSchema {
  return {
    institutions: [],
    users: [],
    projects: [],
    research_documents: [],
    characters: [],
    story_concepts: [],
    scenes: [],
    screenplay_versions: [],
    storyboard_panels: [],
    shot_list_entries: [],
    production_plans: [],
    budget_line_items: [],
    schedule_days: [],
    call_sheets: [],
    risk_assessment_items: [],
    prompt_library_entries: [],
    notifications: [],
    async_jobs: {}
  };
}

export class Database {
  public data: DatabaseSchema;

  constructor() {
    this.data = createEmptyDB();
    this.load();
    if (this.data.institutions.length === 0) {
      this.seed();
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = createEmptyDB();
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database file, resetting to empty', e);
      this.data = createEmptyDB();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  private seed() {
    console.log('Seeding initial data for CIVE StoryLab...');

    // 1. Seed Institution
    const inst: Institution = {
      id: 'inst-dodoma-1',
      name: 'University of Dodoma',
      type: 'university',
      license_tier: 'enterprise',
      country: 'Tanzania',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.institutions.push(inst);

    // 2. Seed Users
    const users: User[] = [
      {
        id: 'usr-student-1',
        institution_id: inst.id,
        email: 'student@udom.ac.tz',
        password_hash: '$2b$10$xyz', // Placeholder for simplicity
        full_name: 'Amina Mrema',
        role: 'student',
        preferred_language: 'sw',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'usr-coord-1',
        institution_id: inst.id,
        email: 'coord@udom.ac.tz',
        password_hash: '$2b$10$xyz',
        full_name: 'Dr. Neema',
        role: 'coordinator',
        preferred_language: 'en',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'usr-creator-1',
        institution_id: null,
        email: 'juma@bongofilm.com',
        password_hash: '$2b$10$xyz',
        full_name: 'Juma Bongo',
        role: 'individual',
        preferred_language: 'sw',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.data.users.push(...users);

    // 3. Seed Prompt Library Entries
    const prompts: PromptLibraryEntry[] = [
      {
        id: 'prompt-1',
        owner_institution_id: inst.id,
        title: 'Authentic Kiswahili Dialogue Guidelines',
        module_id: 'MOD-05',
        template_text: 'Ensure the dialogue code-switches naturally between English and Kiswahili, reflecting urban Dodoma student speak. Use words like "mambo", "shwari", "safi" in casual scenes, but formal Swahili in elder interactions.',
        tags: ['Kiswahili', 'Dialogue', 'Cultural'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'prompt-2',
        owner_institution_id: inst.id,
        title: 'Low Budget Production Constraints',
        module_id: 'MOD-08',
        template_text: 'Restrict recommended equipment to single camera (DSLR or mirrorless), lightweight LED kit, and local clip-on mics. Avoid crane, gimbal, or expensive lighting set-ups.',
        tags: ['Low-Budget', 'Production', 'Dodoma'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.data.prompt_library_entries.push(...prompts);

    // 4. Seed Fully Populated Sample Project (Maternal Healthcare Dodoma - Path A)
    const proj: Project = {
      id: 'prj-sample-dodoma',
      owner_id: 'usr-student-1',
      title: 'Kizazi Salama (Safe Birth)',
      creation_path: 'path_a',
      status: 'complete',
      genre: 'Drama',
      duration_target: '20_minutes',
      target_audience: 'Adults & Community Members',
      language: 'sw',
      budget_tier: 'low',
      storytelling_style: 'Research-Based / African',
      country: 'Tanzania',
      production_deadline: '2026-12-15',
      num_actors_target: 3,
      completion_pct: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.projects.push(proj);

    // Research document
    const doc: ResearchDocument = {
      id: 'doc-sample-1',
      project_id: proj.id,
      file_name: 'dodoma_maternal_health_report.pdf',
      file_url: 'uploads/dodoma_maternal_health_report.pdf',
      file_type: 'pdf',
      file_size_bytes: 1450200,
      summary: 'The report documents barriers rural women face accessing antenatal care in the Dodoma region, including distance to clinics, transport cost, and reliance on traditional birth attendants.',
      themes: [
        { theme: 'distance-to-care', excerpt: 'Pregnant women in Chamwino district must walk over 15 kilometers to reach the nearest health facility, discouraging early antenatal visits.', confidence: 0.95, source_page: 4 },
        { theme: 'trust-in-traditional-practice', excerpt: 'Many maternal unions express greater trust in community traditional birth attendants (TBAs) who speak their local dialect and perform customary birthing rites.', confidence: 0.88, source_page: 11 },
        { theme: 'intergenerational-tension', excerpt: 'There is a stark cultural gap between elder traditional birth attendants who reject hospital setups and younger health nurses trained in modern clinics.', confidence: 0.85, source_page: 18 }
      ],
      entities: [
        { type: 'Location', name: 'Chamwino District' },
        { type: 'Role', name: 'Traditional Birth Attendant (TBA)' },
        { type: 'Organization', name: 'Dodoma Regional Hospital' }
      ],
      processing_status: 'complete',
      uploaded_at: new Date().toISOString()
    };
    this.data.research_documents.push(doc);

    // Characters
    const chars: Character[] = [
      {
        id: 'char-sample-1',
        project_id: proj.id,
        name: 'Mama Halima',
        role_type: 'protagonist',
        background: 'A respected traditional birth attendant in her late 50s. She has delivered over a hundred babies in the village using traditional midwives methods passed down through generations.',
        motivation: 'To protect the women of her village and ensure safe births while honoring ancestral customs.',
        voice_notes: 'Speaks with formal Swahili, occasionally using proverbs and sage tones. Guarded but deeply warm.',
        arc_summary: 'Begins highly resistant to clinical healthcare, but slowly finds common ground with her college-educated nurse daughter to create a unified care plan.',
        source: 'research_extracted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'char-sample-2',
        project_id: proj.id,
        name: 'Amina',
        role_type: 'supporting',
        background: 'Mama Halima\'s 23-year-old daughter. She was funded by the village to study midwifery at the University of Dodoma and has just returned as a certified nurse.',
        motivation: 'To modernise healthcare in her village, reduce maternal mortality rates, and prove her professional skills without disrespecting her mother.',
        voice_notes: 'Speaks energetic urban Swahili-English code-switching, especially when under professional stress. Earnest and scientific.',
        arc_summary: 'Shifts from impatient, text-book lecturing to understanding the deep cultural trust her mother commands, learning to bridge traditional custom with clinic safety.',
        source: 'research_extracted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'char-sample-3',
        project_id: proj.id,
        name: 'Mzee Baraka',
        role_type: 'antagonist',
        background: 'The village elder and practical leader of the local council. He owns several transport vans.',
        motivation: 'To preserve traditional patriarchal structures and profit from local transport fees, resisting any government-led mobile clinic setups.',
        voice_notes: 'Persuasive, deep voice. Uses formal community Swahili, highly traditionalist.',
        arc_summary: 'Actively blocks Amina\'s requests for village emergency transport resources until Mama Halima confronts him publicly.',
        source: 'research_extracted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.data.characters.push(...chars);

    // Story Concept
    const concept: StoryConcept = {
      id: 'concept-sample',
      project_id: proj.id,
      logline: 'When a young certified nurse returns to her rural home village in Dodoma, she must earn back her mother\'s trust—a revered traditional midwife—to bring safe clinic maternal care to women who have only ever trusted custom.',
      synopsis: 'Kizazi Salama is a tense, emotional drama centered in the dry scrublands of Chamwino, Dodoma. Amina, a proud new nursing graduate, returns home eager to implement clinical delivery procedures. She immediately clashes with her mother, Mama Halima, who views clinical interventions as cold, foreign, and disrespectful. When Mzee Baraka refuses to provide a transport vehicle for an expectant mother in obstructed labor, Amina and Halima must combine Halima\'s deep local community trust with Amina\'s scientific knowledge to safely deliver the child and convince the village council to fund a permanent clinic post.',
      three_act_structure: {
        act1: {
          title: 'Mwanzo (Act 1: The Return)',
          description: 'Amina returns to Chamwino village with her clinical kit. She meets her mother Halima delivering a baby traditionally. Amina raises safety concerns, offending Halima. Mzee Baraka warns Amina not to disrupt ancestral village ways.'
        },
        act2: {
          title: 'Mgongano (Act 2: The Confrontation)',
          description: 'Amina attempts to teach village women about sanitisation, but no one attends because Mama Halima silent-boycotts. Tension mounts during a difficult prenatal checkup where Mama Halima identifies a breech position but refuses Amina\'s stethoscope.'
        },
        act3: {
          title: 'Ushindi (Act 3: Reconciliation)',
          description: 'During a massive thunderstorm, a young mother suffers acute obstructed labor. The village is cut off. Halima\'s traditional herbs fail. Amina step in with emergency clinical procedures. Halima assists, combining her warm, calming presence with Amina\'s sterile tools. The baby is safely born. Baraka is forced to pledge transport funding.'
        },
        turning_points: [
          'Amina returns with modern medical kit, sparking immediate household tension.',
          'Chamwino clinic is revealed to be understaffed, and village elder Baraka refuses to allocate fuel money.',
          'An emergency birth occurs during a storm; traditional techniques fail, forcing mother and daughter to unite.'
        ]
      },
      beat_sheet: [
        { beat_name: 'The Arrival', description: 'Amina gets off the bus in Chamwino, carrying her nursing certification and a shiny metal medical box.' },
        { beat_name: 'Traditional Delivery', description: 'Mama Halima delivers Mwanahawa\'s baby by firelight, using traditional cloths. Amina watches from the doorway, horrified by lack of sanitisation.' },
        { beat_name: 'Family Clash', description: 'Over dinner of ugali and mlenda, Amina lectures her mother on maternal mortality rates. Halima tells her university did not teach her respect.' },
        { beat_name: 'The Blockade', description: 'Amina requests Mzee Baraka\'s council van for medical transport. Baraka laughs, saying village vans are for carrying groundnuts, not pregnant women.' },
        { beat_name: 'The breach', description: 'A village mother shows symptoms of pre-eclampsia. Mama Halima tries traditional massage; Amina intervenes with a blood pressure cuff, proving a dangerous spike.' },
        { beat_name: 'The Storm and Obstruction', description: 'Rain batters the village. Mwanahawa\'s sister goes into severe obstructed labor. The roads turn to mud.' },
        { beat_name: 'Midwives Unite', description: 'In the dark hut, Halima acknowledges her limit. She calls Amina. Amina administers clinical care while Halima sings the traditional soothing birthing songs.' },
        { beat_name: 'Safe Birth and Council Pledge', description: 'The baby cries. Healthy. The elders, including Baraka, stand outside in awe. Halima declares Amina\'s science is the future of their custom.' }
      ],
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.story_concepts.push(concept);

    // Scenes
    const scenes: Scene[] = [
      {
        id: 'scene-sample-1',
        project_id: proj.id,
        order_index: 1,
        slugline: 'EXT. CHAMWINO VILLAGE ROAD - DAY',
        purpose: 'Establish Amina\'s return, the dry, remote landscape of Dodoma, and her ambitious, modern outlook.',
        characters_present: [chars[1].id], // Amina
        status: 'final',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'scene-sample-2',
        project_id: proj.id,
        order_index: 2,
        slugline: 'INT. MAMA HALIMA\'S HOUSE - NIGHT',
        purpose: 'Introduce Mama Halima\'s deep traditional authority and the generational conflict with Amina over modern vs traditional methods.',
        characters_present: [chars[0].id, chars[1].id], // Halima, Amina
        status: 'final',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'scene-sample-3',
        project_id: proj.id,
        order_index: 3,
        slugline: 'INT. VILLAGE CLINIC HUT - DAY',
        purpose: 'Amina attempts to set up a sanitised birth area, but Mzee Baraka refuses to allocate resources, showcasing the community barriers.',
        characters_present: [chars[1].id, chars[2].id], // Amina, Baraka
        status: 'final',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.data.scenes.push(...scenes);

    // Screenplay Versions
    const scripts: ScreenplayVersion[] = [
      {
        id: 'script-sample-1',
        scene_id: scenes[0].id,
        version_number: 1,
        content: `EXT. CHAMWINO VILLAGE ROAD - DAY

The Dodoma sun beats down relentlessly on the dry, orange earth. Dust devils dance across the scrublands. 

An old, rattling bus pulls up to a halt, billows of diesel smoke escaping its exhaust. 

AMINA (23) steps out. She wears smart, clinical blue scrubs, her hair braided neatly. In her right hand, she tightly grips a clean stainless steel medical case. She takes a deep breath of the hot air.

AMINA
(whispering to herself)
Nimerudi. Sasa kazi ianze.

She sets off down the dusty path toward the village cluster, her boots kicking up small clouds of red clay.`,
        is_final: true,
        created_by: 'usr-student-1',
        created_at: new Date().toISOString()
      },
      {
        id: 'script-sample-2',
        scene_id: scenes[1].id,
        version_number: 1,
        content: `INT. MAMA HALIMA'S HOUSE - NIGHT

A single kerosene lamp casts long, flickering shadows on the mud-brick walls. Bunches of dried herbs and roots hang from the rafters.

MAMA HALIMA (58) sits on a low wooden stool, sorting fresh neem leaves. She moves with slow, unquestioned grace.

Amina stands near the small medical kit she has unpacked on the wooden table. The contrast is stark: cold steel against warm clay.

AMINA
Mama, lazima unielewe. Hatuwezi kuendelea kuzalisha akina mama hivi. Dunia imebadilika! Sterile gloves pekee zinaweza kuokoa maisha ya wengi.

Halima does not look up from her leaves.

MAMA HALIMA
Mwanangu, uliondoka hapa kwenda kusoma vitabu vya wazungu, ukadhani umepata busara zote. Mimi nimezalisha nusu ya kijiji hiki. Je, kuna mtoto aliyekufa mikononi mwangu?

AMINA
(urgent)
Mama, takwimu zipo wazi! Kuna maambukizi ambayo huyajui... code-switching haisaidii kama mambo yakienda vibaya! Tuna bahati tu, sio sayansi!

Mama Halima finally raises her eyes. They are deep, ancient, and heavy.

MAMA HALIMA
Sisi tuna asili yetu, Amina. Uzazi sio ugonjwa wa kutibiwa na mabati na sindano zako. Uzazi ni baraka ya jamii. Heshimu mila zako!`,
        is_final: true,
        created_by: 'usr-student-1',
        created_at: new Date().toISOString()
      },
      {
        id: 'script-sample-3',
        scene_id: scenes[2].id,
        version_number: 1,
        content: `INT. VILLAGE CLINIC HUT - DAY

The village health post is a sad, crumbling building with an empty medicine shelf and a dusty table. 

Amina is washing the table with disinfectant when MZEE BARAKA (60) enters, leaning heavily on a carved wooden cane.

MZEE BARAKA
(laughing dryly)
Aha, muuguzi wetu mpya! Unasafisha vumbi la Dodoma? Hilo halitaisha kamwe, binti.

AMINA
Mzee Baraka, nahitaji lita ishirini tu za mafuta ya gari lako. Tuna mjamzito Chamwino ana matatizo ya BP. Akipata uchungu usiku, tutasafirije?

MZEE BARAKA
Gari langu linabeba magunia ya karanga, Amina. Biashara yangu ndio inayolisha familia yangu. Gari sio gari la wagonjwa! Kijiji kimeishi miaka mia bila gari la wagonjwa. Mama Halima yupo, yeye atatatua hayo. Sayansi yako isituharibie amani yetu.`,
        is_final: true,
        created_by: 'usr-student-1',
        created_at: new Date().toISOString()
      }
    ];
    this.data.screenplay_versions.push(...scripts);

    // Storyboard panels (SCR-12)
    const panels: StoryboardPanel[] = [
      {
        id: 'pnl-sample-1',
        scene_id: scenes[0].id,
        order_index: 1,
        image_url: 'wide_bus_dodoma',
        caption: 'Wide shot: A dusty bus stopped on a long Dodoma road, Amina stepping off into the bright sunlight.',
        shot_type: 'Wide',
        generation_status: 'complete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'pnl-sample-2',
        scene_id: scenes[1].id,
        order_index: 1,
        image_url: 'medium_halima_herbs',
        caption: 'Medium shot: Mama Halima sorting neem leaves by firelight, her face shadowed and stern.',
        shot_type: 'Medium',
        generation_status: 'complete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'pnl-sample-3',
        scene_id: scenes[1].id,
        order_index: 2,
        image_url: 'close_amina_earnest',
        caption: 'Close-up: Amina speaking earnestly, holding up a pair of sterile surgical gloves.',
        shot_type: 'Close-up',
        generation_status: 'complete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.data.storyboard_panels.push(...panels);

    // Shot List entries (SCR-13)
    const shots: ShotListEntry[] = [
      {
        id: 'shot-sample-1',
        panel_id: panels[0].id,
        shot_number: 1,
        shot_description: 'Ext. remote road. Tracking shot of Amina as she steps off the bus and watches it rattle away.',
        camera_movement: 'Tracking',
        equipment_notes: 'Standard DSLR with 50mm lens, tripod.',
        estimated_setup_minutes: 20
      },
      {
        id: 'shot-sample-2',
        panel_id: panels[1].id,
        shot_number: 2,
        shot_description: 'Int. house. Low-angle static shot of Mama Halima looking down at her neem leaves, flame flickers on her cheeks.',
        camera_movement: 'Static',
        equipment_notes: '3-point LED lighting set to warm orange, 35mm lens.',
        estimated_setup_minutes: 15
      },
      {
        id: 'shot-sample-3',
        panel_id: panels[2].id,
        shot_number: 3,
        shot_description: 'Int. house. Tight over-the-shoulder shot on Amina as she holds up the sterile packaging.',
        camera_movement: 'Pan',
        equipment_notes: '85mm lens for tight depth of field, handheld stability.',
        estimated_setup_minutes: 15
      }
    ];
    this.data.shot_list_entries.push(...shots);

    // Production Plan & Budget
    const plan: ProductionPlan = {
      id: 'plan-sample',
      project_id: proj.id,
      equipment_recommendation: {
        camera: 'Canon DSLR (Mid-tier Package) - 1x Body, 3x Prime Lenses (35mm, 50mm, 85mm)',
        lighting: '3-point LED Panel Kit with warm gel filters',
        sound: 'Rode Lavalier Mic kit + Zoom H4n Recorder',
        grip: 'Lightweight fluid-head tripod, 1x hand reflector'
      },
      crew_recommendation: {
        roles: [
          { role: 'Director', count: 1, rationale: 'Oversee creative vision and dramatic tension' },
          { role: 'Director of Photography', count: 1, rationale: 'Handle camera setups, lighting, and visual tone' },
          { role: 'Sound Recordist', count: 1, rationale: 'Capture crisp Swahili dialogue in noisy rural environments' },
          { role: 'Production Manager', count: 1, rationale: 'Manage transport, meals, and scheduling logistics' }
        ],
        headcount: 4
      },
      location_recommendation: {
        locations: [
          { scene: 'EXT. CHAMWINO VILLAGE ROAD', type: 'Practical Road', permission: 'Obtain village elder verbal clearance' },
          { scene: 'INT. MAMA HALIMA\'S HOUSE', type: 'Actual mud-brick home', permission: 'Rent local villager house for 1 day' },
          { scene: 'INT. VILLAGE CLINIC HUT', type: 'Local classroom or dispensary', permission: 'Clear with district health coordinator' }
        ]
      },
      budget_summary: {
        categories: {
          cast: 180000,
          crew: 480000,
          equipment: 300000,
          locations: 100000,
          wardrobe: 50000,
          transport: 120000,
          meals: 288000,
          accommodation: 150000,
          post_production: 400000,
          contingency: 206800
        },
        total: 2274800,
        contingency_pct: 10,
        currency: 'TZS'
      },
      budget_total: 2274800,
      currency: 'TZS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.production_plans.push(plan);

    // Budget Line Items
    const budgetItems: BudgetLineItem[] = [
      { id: 'item-1', production_plan_id: plan.id, category: 'cast', description: 'Lead Actress (Amina) - 3 days shoot', quantity: 1, unit_cost: 90000, total_cost: 90000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-2', production_plan_id: plan.id, category: 'cast', description: 'Supporting Actress (Mama Halima) - 2 days shoot', quantity: 1, unit_cost: 60000, total_cost: 60000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-3', production_plan_id: plan.id, category: 'cast', description: 'Supporting Actor (Mzee Baraka) - 1 day shoot', quantity: 1, unit_cost: 30000, total_cost: 30000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-4', production_plan_id: plan.id, category: 'crew', description: 'DP & Camera Operator - 3 days rate', quantity: 1, unit_cost: 200000, total_cost: 200000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-5', production_plan_id: plan.id, category: 'crew', description: 'Sound Recordist & Assistant - 3 days rate', quantity: 1, unit_cost: 150000, total_cost: 150000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-6', production_plan_id: plan.id, category: 'crew', description: 'Production Manager - 3 days rate', quantity: 1, unit_cost: 130000, total_cost: 130000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-7', production_plan_id: plan.id, category: 'equipment', description: 'Mid-tier DSLR camera + prime lens kit rental', quantity: 3, unit_cost: 70000, total_cost: 210000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-8', production_plan_id: plan.id, category: 'equipment', description: 'LED Light kit + Sound recorder rental bundle', quantity: 3, unit_cost: 30000, total_cost: 90000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-9', production_plan_id: plan.id, category: 'locations', description: 'Compensation for renting village household location', quantity: 1, unit_cost: 60000, total_cost: 60000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-10', production_plan_id: plan.id, category: 'locations', description: 'Verbal elders clearance & dispensary access fee', quantity: 1, unit_cost: 40000, total_cost: 40000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-11', production_plan_id: plan.id, category: 'wardrobe', description: 'Blue medical scrubs for Amina & traditional khangas', quantity: 1, unit_cost: 50000, total_cost: 50000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-12', production_plan_id: plan.id, category: 'transport', description: 'Transport of crew/kit from Dodoma town to Chamwino', quantity: 3, unit_cost: 40000, total_cost: 120000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-13', production_plan_id: plan.id, category: 'meals', description: 'Catering for 8 cast and crew members - 3 shoot days', quantity: 24, unit_cost: 12000, total_cost: 288000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-14', production_plan_id: plan.id, category: 'accommodation', description: 'Dodoma rural guest house rental for 3 crew members', quantity: 6, unit_cost: 25000, total_cost: 150000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-15', production_plan_id: plan.id, category: 'post_production', description: 'Local editor, Swahili dialogue mixing, color grading', quantity: 1, unit_cost: 400000, total_cost: 400000, is_ai_generated: true, is_user_edited: false },
      { id: 'item-16', production_plan_id: plan.id, category: 'contingency', description: '10% safety cushion on subtotal', quantity: 1, unit_cost: 206800, total_cost: 206800, is_ai_generated: true, is_user_edited: false }
    ];
    this.data.budget_line_items.push(...budgetItems);

    // Schedule days (SCR-16)
    const scheduleDays: ScheduleDay[] = [
      { id: 'day-1', production_plan_id: plan.id, day_number: 1, shoot_date: '2026-10-12', location_id: 'Chamwino Road', scene_ids: [scenes[0].id] },
      { id: 'day-2', production_plan_id: plan.id, day_number: 2, shoot_date: '2026-10-13', location_id: 'Mud house', scene_ids: [scenes[1].id] },
      { id: 'day-3', production_plan_id: plan.id, day_number: 3, shoot_date: '2026-10-14', location_id: 'Clinic dispensary', scene_ids: [scenes[2].id] }
    ];
    this.data.schedule_days.push(...scheduleDays);

    // Call Sheets (SCR-17)
    const callSheets: CallSheet[] = [
      {
        id: 'call-1',
        schedule_day_id: scheduleDays[0].id,
        call_time: '07:00 AM',
        crew_contacts: [
          { name: 'Amina Mrema', role: 'Actress (Amina)', phone: '+255 712 345 678' },
          { name: 'Dr. Neema', role: 'Director / Advisor', phone: '+255 754 987 654' },
          { name: 'John DP', role: 'Camera Operator', phone: '+255 682 111 222' }
        ],
        notes: 'Assemble at UDOM administration gate at 06:15 AM for transport. Wear sun hats and bring bottled drinking water. Ensure all DSLR battery packs are fully charged.',
        generated_at: new Date().toISOString()
      },
      {
        id: 'call-2',
        schedule_day_id: scheduleDays[1].id,
        call_time: '06:30 AM',
        crew_contacts: [
          { name: 'Mama Halima', role: 'Actress (Halima)', phone: '+255 763 222 333' },
          { name: 'Amina Mrema', role: 'Actress (Amina)', phone: '+255 712 345 678' }
        ],
        notes: 'Low-light shooting. Kerosene lamp must be safety checked. Keep fire extinguisher handy inside mud structure.',
        generated_at: new Date().toISOString()
      }
    ];
    this.data.call_sheets.push(...callSheets);

    // Risk assessment items (SCR-15)
    const risks: RiskAssessmentItem[] = [
      { id: 'risk-1', production_plan_id: plan.id, category: 'weather', description: 'High wind and dust can damage DSLR lenses and distort audio capture on Road shots.', severity: 'medium', mitigation: 'Use windscreen mufflers on all shotgun mics and double-bag camera body when not active.' },
      { id: 'risk-2', production_plan_id: plan.id, category: 'location_safety', description: 'Indoor kerosene lamps pose a carbon-monoxide and fire risk inside compact spaces.', severity: 'medium', mitigation: 'Ventilate mud structures after each 15-minute take, replace fuel caps tightly.' },
      { id: 'risk-3', production_plan_id: plan.id, category: 'cast_availability', description: 'Mama Halima is played by a local elder who may have limited stamina.', severity: 'medium', mitigation: 'Schedule her scenes in the cooler morning hours, provide comfortable stool seating.' }
    ];
    this.data.risk_assessment_items.push(...risks);

    this.save();
    console.log('Seeding finished successfully! Pre-production dataset loaded.');
  }

  // General Methods
  public getInstitutions() { return this.data.institutions; }
  public getUsers() { return this.data.users; }
  public getProjects(owner_id?: string) {
    if (owner_id) {
      return this.data.projects.filter(p => p.owner_id === owner_id && !p.deleted_at);
    }
    return this.data.projects.filter(p => !p.deleted_at);
  }

  public getProject(id: string) {
    return this.data.projects.find(p => p.id === id && !p.deleted_at) || null;
  }

  public createProject(proj: Partial<Project> & { owner_id: string; title: string; creation_path: 'path_a' | 'path_b' }) {
    const id = 'prj_' + Math.random().toString(36).substring(2, 9);
    const newProj: Project = {
      id,
      owner_id: proj.owner_id,
      title: proj.title,
      creation_path: proj.creation_path,
      status: 'draft',
      completion_pct: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...proj
    };
    this.data.projects.push(newProj);
    this.save();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<Project>) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = {
        ...this.data.projects[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.projects[idx];
    }
    return null;
  }

  public deleteProject(id: string) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx].deleted_at = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // Research Documents CRUD
  public getResearchDocs(project_id: string) {
    return this.data.research_documents.filter(d => d.project_id === project_id);
  }

  public addResearchDoc(doc: Omit<ResearchDocument, 'id' | 'uploaded_at'>) {
    const id = 'doc_' + Math.random().toString(36).substring(2, 9);
    const newDoc: ResearchDocument = {
      ...doc,
      id,
      uploaded_at: new Date().toISOString()
    };
    this.data.research_documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public updateResearchDoc(id: string, updates: Partial<ResearchDocument>) {
    const idx = this.data.research_documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.research_documents[idx] = {
        ...this.data.research_documents[idx],
        ...updates
      };
      this.save();
      return this.data.research_documents[idx];
    }
    return null;
  }

  // Characters CRUD
  public getCharacters(project_id: string) {
    return this.data.characters.filter(c => c.project_id === project_id && !c.deleted_at);
  }

  public createCharacter(char: Omit<Character, 'id' | 'created_at' | 'updated_at'>) {
    const id = 'char_' + Math.random().toString(36).substring(2, 9);
    const newChar: Character = {
      ...char,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.characters.push(newChar);
    this.save();
    return newChar;
  }

  public updateCharacter(id: string, updates: Partial<Character>) {
    const idx = this.data.characters.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.characters[idx] = {
        ...this.data.characters[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.characters[idx];
    }
    return null;
  }

  public deleteCharacter(id: string) {
    const idx = this.data.characters.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.characters[idx].deleted_at = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // Story Concept CRUD
  public getStoryConcept(project_id: string) {
    return this.data.story_concepts.find(c => c.project_id === project_id) || null;
  }

  public saveStoryConcept(concept: Omit<StoryConcept, 'id' | 'created_at' | 'updated_at'>) {
    const idx = this.data.story_concepts.findIndex(c => c.project_id === concept.project_id);
    const now = new Date().toISOString();
    if (idx !== -1) {
      this.data.story_concepts[idx] = {
        ...this.data.story_concepts[idx],
        ...concept,
        updated_at: now
      };
      this.save();
      return this.data.story_concepts[idx];
    } else {
      const id = 'concept_' + Math.random().toString(36).substring(2, 9);
      const newConcept: StoryConcept = {
        ...concept,
        id,
        created_at: now,
        updated_at: now
      };
      this.data.story_concepts.push(newConcept);
      this.save();
      return newConcept;
    }
  }

  // Scenes CRUD
  public getScenes(project_id: string) {
    return this.data.scenes
      .filter(s => s.project_id === project_id && !s.deleted_at)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public createScene(scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>) {
    const id = 'scene_' + Math.random().toString(36).substring(2, 9);
    const newScene: Scene = {
      ...scene,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.scenes.push(newScene);
    this.save();
    return newScene;
  }

  public updateScene(id: string, updates: Partial<Scene>) {
    const idx = this.data.scenes.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.scenes[idx] = {
        ...this.data.scenes[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.scenes[idx];
    }
    return null;
  }

  public deleteScene(id: string) {
    const idx = this.data.scenes.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.scenes[idx].deleted_at = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  public reorderScenes(project_id: string, ordered_ids: string[]) {
    ordered_ids.forEach((id, idx) => {
      const scene = this.data.scenes.find(s => s.id === id && s.project_id === project_id);
      if (scene) {
        scene.order_index = idx + 1;
      }
    });
    this.save();
    return this.getScenes(project_id);
  }

  // Screenplay Versions CRUD
  public getLatestScreenplay(scene_id: string) {
    return this.data.screenplay_versions
      .filter(v => v.scene_id === scene_id)
      .sort((a, b) => b.version_number - a.version_number)[0] || null;
  }

  public addScreenplayVersion(version: Omit<ScreenplayVersion, 'id' | 'created_at'>) {
    const id = 'scr_' + Math.random().toString(36).substring(2, 9);
    const newVer: ScreenplayVersion = {
      ...version,
      id,
      created_at: new Date().toISOString()
    };
    this.data.screenplay_versions.push(newVer);
    this.save();
    return newVer;
  }

  // Storyboard Panels CRUD
  public getStoryboardPanels(scene_id: string) {
    return this.data.storyboard_panels
      .filter(p => p.scene_id === scene_id)
      .sort((a, b) => a.order_index - b.order_index);
  }

  public addStoryboardPanel(panel: Omit<StoryboardPanel, 'id' | 'created_at' | 'updated_at'>) {
    const id = 'pnl_' + Math.random().toString(36).substring(2, 9);
    const newPanel: StoryboardPanel = {
      ...panel,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.storyboard_panels.push(newPanel);
    this.save();
    return newPanel;
  }

  public updateStoryboardPanel(id: string, updates: Partial<StoryboardPanel>) {
    const idx = this.data.storyboard_panels.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.storyboard_panels[idx] = {
        ...this.data.storyboard_panels[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.storyboard_panels[idx];
    }
    return null;
  }

  public deleteStoryboardPanel(id: string) {
    const idx = this.data.storyboard_panels.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.storyboard_panels.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Shot List Entries CRUD
  public getShotListEntries(scene_id: string) {
    const panels = this.getStoryboardPanels(scene_id);
    const panelIds = panels.map(p => p.id);
    return this.data.shot_list_entries.filter(e => panelIds.includes(e.panel_id));
  }

  public addShotListEntry(entry: Omit<ShotListEntry, 'id'>) {
    const id = 'shot_' + Math.random().toString(36).substring(2, 9);
    const newEntry: ShotListEntry = {
      ...entry,
      id
    };
    this.data.shot_list_entries.push(newEntry);
    this.save();
    return newEntry;
  }

  public updateShotListEntry(id: string, updates: Partial<ShotListEntry>) {
    const idx = this.data.shot_list_entries.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.shot_list_entries[idx] = {
        ...this.data.shot_list_entries[idx],
        ...updates
      };
      this.save();
      return this.data.shot_list_entries[idx];
    }
    return null;
  }

  // Production Plans CRUD
  public getProductionPlan(project_id: string) {
    return this.data.production_plans.find(p => p.project_id === project_id) || null;
  }

  public saveProductionPlan(plan: Omit<ProductionPlan, 'id' | 'created_at' | 'updated_at'>) {
    const idx = this.data.production_plans.findIndex(p => p.project_id === plan.project_id);
    const now = new Date().toISOString();
    if (idx !== -1) {
      this.data.production_plans[idx] = {
        ...this.data.production_plans[idx],
        ...plan,
        updated_at: now
      };
      this.save();
      return this.data.production_plans[idx];
    } else {
      const id = 'plan_' + Math.random().toString(36).substring(2, 9);
      const newPlan: ProductionPlan = {
        ...plan,
        id,
        created_at: now,
        updated_at: now
      };
      this.data.production_plans.push(newPlan);
      this.save();
      return newPlan;
    }
  }

  // Budget Line Items CRUD
  public getBudgetLineItems(production_plan_id: string) {
    return this.data.budget_line_items.filter(item => item.production_plan_id === production_plan_id);
  }

  public addBudgetLineItem(item: Omit<BudgetLineItem, 'id' | 'total_cost'>) {
    const id = 'item_' + Math.random().toString(36).substring(2, 9);
    const newVer: BudgetLineItem = {
      ...item,
      id,
      total_cost: item.quantity * item.unit_cost
    };
    this.data.budget_line_items.push(newVer);
    this.save();
    return newVer;
  }

  public updateBudgetLineItem(id: string, updates: Partial<BudgetLineItem>) {
    const idx = this.data.budget_line_items.findIndex(item => item.id === id);
    if (idx !== -1) {
      const existing = this.data.budget_line_items[idx];
      const updated = {
        ...existing,
        ...updates
      };
      updated.total_cost = updated.quantity * updated.unit_cost;
      this.data.budget_line_items[idx] = updated;
      this.save();
      return updated;
    }
    return null;
  }

  public deleteBudgetLineItem(id: string) {
    const idx = this.data.budget_line_items.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.data.budget_line_items.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Schedule Days CRUD
  public getScheduleDays(production_plan_id: string) {
    return this.data.schedule_days
      .filter(d => d.production_plan_id === production_plan_id)
      .sort((a, b) => a.day_number - b.day_number);
  }

  public saveScheduleDays(production_plan_id: string, days: Omit<ScheduleDay, 'id'>[]) {
    // Delete old schedule days and call sheets
    const oldDays = this.getScheduleDays(production_plan_id);
    const oldDayIds = oldDays.map(d => d.id);
    this.data.schedule_days = this.data.schedule_days.filter(d => d.production_plan_id !== production_plan_id);
    this.data.call_sheets = this.data.call_sheets.filter(c => !oldDayIds.includes(c.schedule_day_id));

    const saved: ScheduleDay[] = [];
    days.forEach(d => {
      const id = 'day_' + Math.random().toString(36).substring(2, 9);
      const newDay: ScheduleDay = { ...d, id };
      this.data.schedule_days.push(newDay);
      saved.push(newDay);
    });
    this.save();
    return saved;
  }

  // Call Sheets CRUD
  public getCallSheet(schedule_day_id: string) {
    return this.data.call_sheets.find(c => c.schedule_day_id === schedule_day_id) || null;
  }

  public saveCallSheet(sheet: Omit<CallSheet, 'id' | 'generated_at'>) {
    const idx = this.data.call_sheets.findIndex(c => c.schedule_day_id === sheet.schedule_day_id);
    const now = new Date().toISOString();
    if (idx !== -1) {
      this.data.call_sheets[idx] = {
        ...this.data.call_sheets[idx],
        ...sheet,
        generated_at: now
      };
      this.save();
      return this.data.call_sheets[idx];
    } else {
      const id = 'call_' + Math.random().toString(36).substring(2, 9);
      const newSheet: CallSheet = {
        ...sheet,
        id,
        generated_at: now
      };
      this.data.call_sheets.push(newSheet);
      this.save();
      return newSheet;
    }
  }

  // Risk Assessment CRUD
  public getRisks(production_plan_id: string) {
    return this.data.risk_assessment_items.filter(r => r.production_plan_id === production_plan_id);
  }

  public saveRisks(production_plan_id: string, items: Omit<RiskAssessmentItem, 'id'>[]) {
    this.data.risk_assessment_items = this.data.risk_assessment_items.filter(r => r.production_plan_id !== production_plan_id);
    const saved: RiskAssessmentItem[] = [];
    items.forEach(item => {
      const id = 'risk_' + Math.random().toString(36).substring(2, 9);
      const newItem: RiskAssessmentItem = { ...item, id };
      this.data.risk_assessment_items.push(newItem);
      saved.push(newItem);
    });
    this.save();
    return saved;
  }

  // Notifications CRUD
  public getNotifications(user_id: string) {
    return this.data.notifications
      .filter(n => n.user_id === user_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  public addNotification(notif: Omit<Notification, 'id' | 'created_at' | 'read_at'>) {
    const id = 'ntf_' + Math.random().toString(36).substring(2, 9);
    const newNotif: Notification = {
      ...notif,
      id,
      read_at: null,
      created_at: new Date().toISOString()
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(id: string) {
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].read_at = new Date().toISOString();
      this.save();
      return this.data.notifications[idx];
    }
    return null;
  }

  public markAllNotificationsRead(user_id: string) {
    this.data.notifications.forEach(n => {
      if (n.user_id === user_id && !n.read_at) {
        n.read_at = new Date().toISOString();
      }
    });
    this.save();
  }

  // Prompt Library CRUD
  public getPrompts(module_id?: string) {
    if (module_id) {
      return this.data.prompt_library_entries.filter(p => p.module_id === module_id);
    }
    return this.data.prompt_library_entries;
  }

  public addPromptEntry(entry: Omit<PromptLibraryEntry, 'id' | 'created_at' | 'updated_at'>) {
    const id = 'prompt_' + Math.random().toString(36).substring(2, 9);
    const newEntry: PromptLibraryEntry = {
      ...entry,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.prompt_library_entries.push(newEntry);
    this.save();
    return newEntry;
  }

  public updatePromptEntry(id: string, updates: Partial<PromptLibraryEntry>) {
    const idx = this.data.prompt_library_entries.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.prompt_library_entries[idx] = {
        ...this.data.prompt_library_entries[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.prompt_library_entries[idx];
    }
    return null;
  }

  public deletePromptEntry(id: string) {
    const idx = this.data.prompt_library_entries.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.prompt_library_entries.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Jobs Manager
  public createJob() {
    const id = 'job_' + Math.random().toString(36).substring(2, 9);
    const newJob: AsyncJob = {
      job_id: id,
      status: 'queued',
      progress_pct: 0
    };
    this.data.async_jobs[id] = newJob;
    this.save();
    return newJob;
  }

  public getJob(id: string) {
    return this.data.async_jobs[id] || null;
  }

  public updateJob(id: string, updates: Partial<AsyncJob>) {
    if (this.data.async_jobs[id]) {
      this.data.async_jobs[id] = {
        ...this.data.async_jobs[id],
        ...updates
      };
      this.save();
      return this.data.async_jobs[id];
    }
    return null;
  }
}

export const db = new Database();
