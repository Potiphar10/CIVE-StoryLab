/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('WARNING: GEMINI_API_KEY environment variable is not defined. Falling back to local offline generation simulation.');
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export class GeminiService {
  /**
   * MOD-01: Research Ingestion & Intelligence
   */
  public static async analyzeResearch(fileName: string, textContent: string): Promise<{
    summary: string;
    themes: Array<{ theme: string; excerpt: string; confidence: number; source_page: number }>;
    entities: Array<{ type: string; name: string }>;
  }> {
    const client = getAIClient();
    if (!client) {
      // Return authentic mock response
      return {
        summary: `The uploaded report "${fileName}" documents systemic barriers rural Tanzanian women experience when seeking maternal healthcare, specifically focusing on transportation difficulties, financial limits, and traditional birthing practices.`,
        themes: [
          { theme: 'distance-to-care', excerpt: 'Pregnant mothers must walk long distances (often over 12km) through rough paths, leading to delayed clinic admissions.', confidence: 0.94, source_page: 5 },
          { theme: 'trust-in-traditional-practice', excerpt: 'Midwives and traditional birth attendants (TBAs) command deep cultural trust because they are familiar with local customs and dialects.', confidence: 0.91, source_page: 12 },
          { theme: 'transportation-deficit', excerpt: 'Rural councils lack dedicated emergency vehicles, making villagers dependent on expensive commercial groundnut vans.', confidence: 0.89, source_page: 8 }
        ],
        entities: [
          { type: 'Location', name: 'Chamwino District, Dodoma' },
          { type: 'Role', name: 'Traditional Midwife / TBA' },
          { type: 'Facility', name: 'Chamwino Dispensary' }
        ]
      };
    }

    try {
      const prompt = `You are the Research Ingestion module (MOD-01) of CIVE StoryLab.
Your task is to analyze the following research text and extract key findings, a summary, themes (with supporting excerpts), and entities.

RESEARCH TEXT:
---
${textContent.substring(0, 15000)}
---

Respond strictly with a JSON object following this schema:
{
  "summary": "String summarizing the document in under 3 paragraphs",
  "themes": [
    {
      "theme": "thematic-tag-slug",
      "excerpt": "exact sentence or short passage from the research text supporting this theme",
      "confidence": 0.95,
      "source_page": 1
    }
  ],
  "entities": [
    {
      "type": "Location|Role|Organization|Facility",
      "name": "extracted name"
    }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    theme: { type: Type.STRING },
                    excerpt: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    source_page: { type: Type.INTEGER }
                  },
                  required: ['theme', 'excerpt', 'confidence']
                }
              },
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    name: { type: Type.STRING }
                  },
                  required: ['type', 'name']
                }
              }
            },
            required: ['summary', 'themes', 'entities']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return parsed;
    } catch (error) {
      console.error('Gemini research analysis failed', error);
      throw error;
    }
  }

  /**
   * MOD-02: Story Premise, Logline & Synopsis Options
   */
  public static async generateStoryConcepts(params: {
    creationPath: string;
    idea?: string;
    themes?: any[];
    genre: string;
    duration: string;
    style: string;
    language: string;
  }): Promise<Array<{ logline: string; synopsis: string; title: string }>> {
    const client = getAIClient();
    if (!client) {
      // Mock concepts with default African-cultural styling
      return [
        {
          title: 'Kizazi Salama (Safe Birth)',
          logline: 'When an ambitious young nursing graduate returns to her remote home village, she must earn the trust of her mother—the legendary traditional birth attendant—to combine sterilised modern healthcare with respected tribal custom.',
          synopsis: `Set in the dry, dust-swept plains of Dodoma, Kizazi Salama explores the clash between sterile clinical science and ancestral midwifery. Amina, armed with her university scrubs, returns to help her community but faces instant rejection from her mother, Mama Halima, who has successfully delivered babies for forty years by firelight. The clash reaches a peak during a storm when an obstructed breech birth forces mother and daughter to combine their skills to save both mother and child.`
        },
        {
          title: 'Njia ya Chamwino (The Road to Chamwino)',
          logline: 'An independent medical transport driver is forced to choose between lucrative groundnut shipping and rescuing pregnant mothers in labor, testing his allegiance to the village council.',
          synopsis: `Baraka runs the only reliable van in the village. He charges high rates, keeping the clinic isolated. When his own daughter suffers a severe pre-eclampsia emergency, he is forced to transform his cargo van into an active village ambulance, sparking a rebellion against traditional council regulations.`
        },
        {
          title: 'Sauti za Wakunga (Voices of the Midwives)',
          logline: 'Three generations of Dodoma women unite to form an underground emergency bicycle-stretcher network, defying a conservative village elder\'s ban on modern medicine.',
          synopsis: `A heartwarming, ensemble drama following a cohort of young mothers and old traditional midwives. When Mzee Baraka closes the local dispensary over budgeting feuds, the women utilize bicycle carts and ancient cellular communication to form a mobile clinic, showing that the community is the ultimate hospital.`
        }
      ];
    }

    try {
      const themesText = params.themes ? JSON.stringify(params.themes) : '';
      const prompt = `You are the Story Intelligence module (MOD-02) of CIVE StoryLab.
Generate 3 distinct story concept options for an African filmmaking context.

PROJECTION PARAMETERS:
- Genre: ${params.genre}
- Duration Target: ${params.duration}
- Creation Path: ${params.creationPath}
- Storytelling Style: ${params.style}
- Intended Language: ${params.language === 'sw' ? 'Swahili' : 'English'}
- Grounding Idea/Research Themes: ${params.idea || ''} ${themesText}

CONSTRAINTS:
1. Default to East African and communal/ensemble narrative conventions (African Storytelling Strategy).
2. Avoid expensive Western CGI tropes. Ensure concepts are realistic for the requested budget tier.
3. Incorporate bilingual code-switching cues where appropriate.

Respond strictly with a JSON array of 3 objects containing 'title', 'logline', and 'synopsis'.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                logline: { type: Type.STRING },
                synopsis: { type: Type.STRING }
              },
              required: ['title', 'logline', 'synopsis']
            }
          }
        }
      });

      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error('Story concept generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-02 & MOD-04: Generate Three-Act Structure & Beat Sheet
   */
  public static async generateOutline(concept: { title: string; logline: string; synopsis: string }, params: { genre: string; style: string }) {
    const client = getAIClient();
    if (!client) {
      return {
        three_act_structure: {
          act1: { title: 'Mwanzo (Act 1: The Clash of Kits)', description: 'Amina arrives back from Dodoma with standard modern medical tools, causing household tension with Mama Halima.' },
          act2: { title: 'Mgongano (Act 2: The Boycott)', description: 'Amina attempts to run a maternal clinic workshop, but the elders prevent pregnant mothers from attending.' },
          act3: { title: 'Ushindi (Act 3: Midwives United)', description: 'During a rainy midnight emergency, Amina\'s clinical tools and Halima\'s soothing herbs are combined to save a mother.' },
          turning_points: [
            'Amina finds her mother delivering a baby without sanitisation, raising immediate conflict.',
            'Baraka refuses van transport, isolating the village dispensary.',
            'The weather breaks down roads, forcing joint home-midwifery intervention.'
          ]
        },
        beat_sheet: [
          { beat_name: 'The Return', description: 'Amina returns with smart scrubs, clutching a medical metal kit.' },
          { beat_name: 'Household Duel', description: 'Amina critiques Halima\'s neem leaves. Halima claims university ruined her humility.' },
          { beat_name: 'The Transport Ban', description: 'Elder Baraka blocks clinic access, calling vans cargo resources.' },
          { beat_name: 'The Obstruction', description: 'Mwanahawa falls into obstructed labor during a rain deluge.' },
          { beat_name: 'Bridges of Dodoma', description: 'Mother and daughter combine clinical scrubs with ancestral comfort chants to deliver a safe, healthy child.' }
        ]
      };
    }

    try {
      const prompt = `You are the Plot & Narrative Intelligence module (MOD-02 / MOD-04) of CIVE StoryLab.
Expand the selected concept into a Three-Act Structure and a Beat Sheet suited for a ${params.genre} film styled as ${params.style}.

CONCEPT:
Title: ${concept.title}
Logline: ${concept.logline}
Synopsis: ${concept.synopsis}

Respond strictly with a JSON object matching this schema:
{
  "three_act_structure": {
    "act1": { "title": "Act 1 Title in Swahili/English", "description": "Act 1 description" },
    "act2": { "title": "Act 2 Title", "description": "Act 2 description" },
    "act3": { "title": "Act 3 Title", "description": "Act 3 description" },
    "turning_points": ["turning point 1", "turning point 2"]
  },
  "beat_sheet": [
    { "beat_name": "Short beat descriptor", "description": "Detailed beat description" }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              three_act_structure: {
                type: Type.OBJECT,
                properties: {
                  act1: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ['title', 'description']
                  },
                  act2: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ['title', 'description']
                  },
                  act3: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ['title', 'description']
                  },
                  turning_points: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['act1', 'act2', 'act3', 'turning_points']
              },
              beat_sheet: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    beat_name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['beat_name', 'description']
                }
              }
            },
            required: ['three_act_structure', 'beat_sheet']
          }
        }
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (e) {
      console.error('Outline generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-03: Character Extraction & Generation
   */
  public static async generateCharacters(storySummary: string, count: number, style: string): Promise<any[]> {
    const client = getAIClient();
    if (!client) {
      return [
        {
          name: 'Mama Halima',
          role_type: 'protagonist',
          background: 'Traditional midwife in her late 50s. Delivers children using customary clay-oven heat and local neem preparations.',
          motivation: 'Honoring customary practices and keeping village births sacred and safe.',
          voice_notes: 'Uses formal Kiswahili, rich in proverbs. Speaks with measured elder authority.',
          arc_summary: 'Shifts from resisting clinical nurses to co-authoring a sterile home-birth care checklist.'
        },
        {
          name: 'Amina Mrema',
          role_type: 'protagonist',
          background: ' Mama Halima\'s daughter, freshly graduated midwife from UDOM.',
          motivation: 'Eradicate maternal infections and establish clinical standards in her remote home district.',
          voice_notes: 'Speaks with fast-paced, scientific Swahili, frequently code-switching to medical English terms.',
          arc_summary: 'Learns to appreciate the communal psychological comfort her mother commands, merging her science with custom.'
        },
        {
          name: 'Mzee Baraka',
          role_type: 'antagonist',
          background: 'Local commercial transport contractor and district council member.',
          motivation: 'Maintain financial monopoly on regional transport cargo van rates.',
          voice_notes: 'Formal Swahili, deep-voiced, highly traditionalist.',
          arc_summary: 'Opposes mobile clinics until his own grandson requires safe clinic vehicle transport.'
        }
      ];
    }

    try {
      const prompt = `You are the Character Intelligence module (MOD-03) of CIVE StoryLab.
Generate exactly ${count} distinct character profiles based on the following story summary.

STORY SUMMARY:
${storySummary}

CONSTRAINTS:
1. Ensure characters reflect genuine East African personalities, motivations, and dialect patterns (African Storytelling Strategy).
2. Set logical roles: protagonist, antagonist, supporting, or minor.
3. Outline their dialect/voice notes: do they speak standard Swahili, rural dialects, or urban Swahili-English code-switching?

Respond strictly with a JSON array of objects following this schema:
[
  {
    "name": "Full Name",
    "role_type": "protagonist|antagonist|supporting|minor",
    "background": "Short background description",
    "motivation": "Core character motivation",
    "voice_notes": "Dialect, tone, Swahili/English code-switching patterns",
    "arc_summary": "Narrative trajectory"
  }
]`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role_type: { type: Type.STRING, enum: ['protagonist', 'antagonist', 'supporting', 'minor'] },
                background: { type: Type.STRING },
                motivation: { type: Type.STRING },
                voice_notes: { type: Type.STRING },
                arc_summary: { type: Type.STRING }
              },
              required: ['name', 'role_type', 'background', 'motivation', 'voice_notes']
            }
          }
        }
      });

      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error('Character generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-04: Generate Scenes List
   */
  public static async generateScenes(logline: string, beatSheet: any[]): Promise<any[]> {
    const client = getAIClient();
    if (!client) {
      return [
        {
          order_index: 1,
          slugline: 'EXT. CHAMWINO VILLAGE ROAD - DAY',
          purpose: 'Introduce Amina returning with her clinical medical case, highlighting remote geographic distance.',
          characters_present: ['Amina Mrema']
        },
        {
          order_index: 2,
          slugline: 'INT. MAMA HALIMA\'S KITCHEN - NIGHT',
          purpose: 'Establish family household tension as Amina lectures Mama Halima on birthing gloves, showing generational gaps.',
          characters_present: ['Mama Halima', 'Amina Mrema']
        },
        {
          order_index: 3,
          slugline: 'INT. COUNCILS OFFICE - DAY',
          purpose: 'Amina confronts Mzee Baraka for transport access, establishing institutional hurdles.',
          characters_present: ['Amina Mrema', 'Mzee Baraka']
        }
      ];
    }

    try {
      const prompt = `You are the Narrative & Scene Generator module (MOD-04) of CIVE StoryLab.
Create an ordered list of at least 3 scenes matching the logline and narrative beats.

STORY:
Logline: ${logline}
Beats: ${JSON.stringify(beatSheet)}

Respond strictly with a JSON array matching this schema:
[
  {
    "order_index": 1,
    "slugline": "INT/EXT. LOCATION - DAY/NIGHT",
    "purpose": "Precise dramatic purpose of this scene",
    "characters_present": ["Character Name 1", "Character Name 2"]
  }
]`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                order_index: { type: Type.INTEGER },
                slugline: { type: Type.STRING },
                purpose: { type: Type.STRING },
                characters_present: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['order_index', 'slugline', 'purpose', 'characters_present']
            }
          }
        }
      });

      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error('Scenes list generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-05 & MOD-06: Dialogue & Screenplay Generator
   */
  public static async generateScreenplayScene(params: {
    scene: any;
    characters: any[];
    priorSceneText?: string;
  }): Promise<string> {
    const client = getAIClient();
    if (!client) {
      return `EXT. CHAMWINO VILLAGE ROAD - DAY

The dry, orange earth of Chamwino stretches endlessly under a blistering sun. Dust devils twirl lazily in the scrub.

A noisy old regional bus squeaks to a stop, coughing diesel fumes.

AMINA (23) descends the metal step. She wears pristine blue university scrubs, her hair bound in neat braids. She holds a heavy stainless steel medical kit box tightly.

AMINA
(whispering to herself)
Dodoma imepita. Sasa hapa ndipo kwenye kazi halisi.

She sets off down the dusty orange road towards the distant village thatch roofs, dust rising under her boots.`;
    }

    try {
      const prompt = `You are the Screenplay & Dialogue module (MOD-05 & MOD-06) of CIVE StoryLab.
Write a full, detailed, professional screenplay scene in Courier format.

SCENE TO WRITE:
Slugline: ${params.scene.slugline}
Purpose: ${params.scene.purpose}
Characters Present: ${params.scene.characters_present?.join(', ') || ''}

CHARACTER METADATA:
${JSON.stringify(params.characters)}

PRIOR CONTEXT OUTLINE:
${params.priorSceneText || 'None'}

CONSTRAINTS:
1. Format output as a standard industry screenplay: CAPITALIZED character cues centered (or on separate lines), action blocks, and indented dialogue blocks.
2. Adhere to the bilingual Swahili-English rules: Amina code-switches under stress, Mama Halima uses deep formal sage Swahili.
3. No editorial commentary or Markdown blocks outside of standard screenplay elements. Respond only with the script.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      return response.text || '';
    } catch (e) {
      console.error('Screenplay scene generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-07: Storyboard Proposer & Panel Prompt Writer
   */
  public static async generateStoryboardPrompts(sceneText: string): Promise<Array<{ shot_type: string; caption: string; prompt: string }>> {
    const client = getAIClient();
    if (!client) {
      return [
        {
          shot_type: 'Wide',
          caption: 'Wide establishing shot of the Chamwino road as the old diesel bus pulls away, leaving Amina alone in the vast landscape.',
          prompt: 'A wide cinematic establishing shot of a dry, orange-dirt landscape in rural Tanzania, a dusty old yellow-and-white local bus driving away, leaving a lone young African woman in blue medical scrubs standing holding a steel kit case. High contrast sun, beautiful composition, sketch style.'
        },
        {
          shot_type: 'Medium',
          caption: 'Medium shot focused on Amina walking, clutching her medical case determinedly.',
          prompt: 'Medium-shot tracking a young African woman walking on an orange clay road, serious and earnest expression, clutching a stainless steel medical kit, heat haze background. Minimalist charcoal sketch.'
        },
        {
          shot_type: 'Close-up',
          caption: 'Close-up on Amina\'s face as she pauses, her expression showing mixed anxiety and fierce resolve.',
          prompt: 'Extreme close up of a young Tanzanian woman\'s eyes, sweat beads on her brow, fierce and resolute expression, warm cinematic backlighting, high detail line-art.'
        }
      ];
    }

    try {
      const prompt = `You are the Storyboard Intelligence module (MOD-07) of CIVE StoryLab.
Analyze the following screenplay text and propose at least 3 distinct storyboard panels (shots).
For each, provide a shot type (Wide|Medium|Close-up|Tracking), a caption describing the action, and a precise image-generation text prompt.

SCREENPLAY TEXT:
${sceneText}

Respond strictly with a JSON array matching this schema:
[
  {
    "shot_type": "Wide|Medium|Close-up",
    "caption": "User-friendly description of what is visible in the panel",
    "prompt": "Highly detailed artistic description for a stable-diffusion/nano-banana sketch image"
  }
]`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                shot_type: { type: Type.STRING },
                caption: { type: Type.STRING },
                prompt: { type: Type.STRING }
              },
              required: ['shot_type', 'caption', 'prompt']
            }
          }
        }
      });

      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error('Storyboard prompts generation failed', e);
      throw e;
    }
  }

  /**
   * MOD-08 & MOD-09: Production & Budget Description Assist
   */
  public static async generateProductionRecommendations(storySynopsis: string, characterCount: number, locationsCount: number): Promise<{
    equipment: string[];
    crew: Array<{ role: string; count: number; rationale: string }>;
    locations: Array<{ sceneName: string; type: string; permission: string }>;
  }> {
    const client = getAIClient();
    if (!client) {
      return {
        equipment: [
          'DSLR Camera Package: mirrorless body with 35mm & 50mm lenses',
          '3-point portable LED battery-powered panel set',
          'Rode wireless dual lavalier kit + handy recorder'
        ],
        crew: [
          { role: 'Director', count: 1, rationale: 'To direct actors and maintain dramatic pacing.' },
          { role: 'Camera Operator / DP', count: 1, rationale: 'To manage shooting setups and available dry sunlight.' },
          { role: 'Sound Recordist', count: 1, rationale: 'To ensure Swahili code-switching is captured clean of rural wind.' }
        ],
        locations: [
          { sceneName: 'Scene 1: EXT. CHAMWINO ROAD', type: 'Remote dirt road', permission: 'Obtain village elder clearance' },
          { sceneName: 'Scene 2: INT. HALIMA\'S HOUSE', type: 'Local clay home', permission: 'Rent local household for 1 day' }
        ]
      };
    }

    try {
      const prompt = `You are the Production Intelligence module (MOD-08) of CIVE StoryLab.
Generate equipment, crew, and location recommendations for this low-budget East African pre-production project.

STORY:
Synopsis: ${storySynopsis}
Total Characters: ${characterCount}
Locations: ${locationsCount}

Respond strictly with a JSON object matching this schema:
{
  "equipment": ["equip 1", "equip 2"],
  "crew": [
    { "role": "Role Title", "count": 1, "rationale": "Why this role is essential in local Tanzanian context" }
  ],
  "locations": [
    { "sceneName": "Scene slugline", "type": "Location type", "permission": "What clearance is needed locally" }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
              crew: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    rationale: { type: Type.STRING }
                  },
                  required: ['role', 'count', 'rationale']
                }
              },
              locations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneName: { type: Type.STRING },
                    type: { type: Type.STRING },
                    permission: { type: Type.STRING }
                  },
                  required: ['sceneName', 'type', 'permission']
                }
              }
            },
            required: ['equipment', 'crew', 'locations']
          }
        }
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (e) {
      console.error('Production recommendation failed', e);
      throw e;
    }
  }
}
