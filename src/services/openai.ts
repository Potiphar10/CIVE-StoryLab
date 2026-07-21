/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class OpenAIService {
  private static getApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required to use the ChatGPT API. Please add it via the Secrets panel in AI Studio.");
    }
    return key;
  }

  /**
   * Story Premise, Logline & Synopsis Options via ChatGPT (OpenAI API)
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
    const apiKey = this.getApiKey();

    const themesText = params.themes ? JSON.stringify(params.themes) : '';
    const systemPrompt = `You are the Story Intelligence module of CIVE StoryLab, utilizing OpenAI's ChatGPT.
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

Respond strictly with a JSON array of 3 objects containing 'title', 'logline', and 'synopsis'.
For example:
[
  {
    "title": "Story Title",
    "logline": "A compelling logline.",
    "synopsis": "A detailed synopsis paragraph."
  }
]`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate 3 movie concepts in ${params.language === 'sw' ? 'Swahili' : 'English'} language for a ${params.genre} film based on "${params.idea || 'African cultural themes'}".` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${response.status}`;
        throw new Error(`OpenAI API returned error: ${msg}`);
      }

      const data = await response.json();
      const contentText = data?.choices?.[0]?.message?.content?.trim();
      if (!contentText) {
        throw new Error("No content returned from OpenAI API");
      }

      // Since we requested a JSON object, check if it wrapped the array in a key or returned the array directly
      let parsed = JSON.parse(contentText);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && typeof parsed === 'object') {
        // Look for any array property inside the object (like 'concepts' or 'stories' or 'options')
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) {
          return parsed[arrayKey];
        }
        // If it's just an object, maybe it has 3 keys
        if (parsed.concepts && Array.isArray(parsed.concepts)) {
          return parsed.concepts;
        }
      }
      throw new Error("Unable to parse a valid list of story concepts from OpenAI response.");
    } catch (e: any) {
      console.error("ChatGPT story generation failed", e);
      throw e;
    }
  }
}
