/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Scene, ScreenplayVersion, StoryboardPanel, ShotListEntry, BudgetLineItem, ScheduleDay, CallSheet, RiskAssessmentItem } from '../types.js';

export class ExportEngine {
  public static exportToMarkdown(data: {
    project: Project;
    concept?: any;
    characters: any[];
    scenes: Scene[];
    screenplays: Record<string, string>;
    budgetItems?: BudgetLineItem[];
    budgetSummary?: any;
    risks?: RiskAssessmentItem[];
  }): string {
    const { project, concept, characters, scenes, screenplays, budgetItems, budgetSummary, risks } = data;

    let md = `# CIVE StoryLab: ${project.title || 'Untitled Project'}\n`;
    md += `*Generated: ${new Date().toLocaleDateString()} | Path: ${project.creation_path === 'path_a' ? 'Research-Driven' : 'Idea-Driven'}*\n\n`;

    // 1. Metadata
    md += `## 1. Production Parameters\n`;
    md += `- **Genre:** ${project.genre || 'N/A'}\n`;
    md += `- **Duration Target:** ${project.duration_target || 'N/A'}\n`;
    md += `- **Target Audience:** ${project.target_audience || 'N/A'}\n`;
    md += `- **Language:** ${project.language === 'sw' ? 'Kiswahili (English Code-switching allowed)' : 'English'}\n`;
    md += `- **Budget Tier:** ${project.budget_tier || 'N/A'}\n`;
    md += `- **Storytelling Style:** ${project.storytelling_style || 'N/A'}\n\n`;

    // 2. Concept & Outline
    if (concept) {
      md += `## 2. Story Premise & Outline\n`;
      md += `### Logline\n> ${concept.logline || 'No logline created yet.'}\n\n`;
      md += `### Synopsis\n${concept.synopsis || 'No synopsis created yet.'}\n\n`;

      if (concept.three_act_structure) {
        md += `### Three-Act Structure\n`;
        md += `#### Act I: Setup\n${concept.three_act_structure.act1?.title || 'Act 1'}: ${concept.three_act_structure.act1?.description || ''}\n\n`;
        md += `#### Act II: Confrontation\n${concept.three_act_structure.act2?.title || 'Act 2'}: ${concept.three_act_structure.act2?.description || ''}\n\n`;
        md += `#### Act III: Climax & Resolution\n${concept.three_act_structure.act3?.title || 'Act 3'}: ${concept.three_act_structure.act3?.description || ''}\n\n`;
      }
    }

    // 3. Characters
    if (characters && characters.length > 0) {
      md += `## 3. Character Profiles\n`;
      characters.forEach(char => {
        md += `### ${char.name} (${char.role_type.toUpperCase()})\n`;
        md += `- **Background:** ${char.background || 'N/A'}\n`;
        md += `- **Motivation:** ${char.motivation || 'N/A'}\n`;
        md += `- **Voice & Dialect Notes:** ${char.voice_notes || 'N/A'}\n`;
        md += `- **Narrative Arc:** ${char.arc_summary || 'N/A'}\n\n`;
      });
    }

    // 4. Beat Sheet
    if (concept && concept.beat_sheet && concept.beat_sheet.length > 0) {
      md += `## 4. Beat Sheet\n`;
      concept.beat_sheet.forEach((beat: any, idx: number) => {
        md += `${idx + 1}. **${beat.beat_name}**: ${beat.description}\n`;
      });
      md += `\n`;
    }

    // 5. Screenplay (Courier Style Layout)
    md += `## 5. Screenplay Draft\n\n`;
    scenes.forEach(scene => {
      md += `### Scene ${scene.order_index}: ${scene.slugline || 'Planned Slugline'}\n`;
      md += `*Purpose:* ${scene.purpose || 'N/A'}\n\n`;

      const scriptContent = screenplays[scene.id];
      if (scriptContent) {
        md += `\`\`\`text\n${scriptContent}\n\`\`\`\n\n`;
      } else {
        md += `*(No script drafted for this scene yet)*\n\n`;
      }
    });

    // 6. Budget Breakdown
    if (budgetItems && budgetItems.length > 0) {
      md += `## 6. Itemized Budget Estimate (${budgetSummary?.currency || 'TZS'})\n`;
      md += `| Category | Line Item Description | Qty | Unit Cost | Total Cost | Source |\n`;
      md += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
      budgetItems.forEach(item => {
        md += `| ${item.category} | ${item.description} | ${item.quantity} | ${item.unit_cost.toLocaleString()} | **${item.total_cost.toLocaleString()}** | ${item.is_user_edited ? 'User Edited' : 'AI Generated'} |\n`;
      });
      md += `\n**GRAND TOTAL: ${budgetSummary?.total?.toLocaleString() || '0'} ${budgetSummary?.currency || 'TZS'}** (includes ${budgetSummary?.contingency_pct || 10}% contingency)\n\n`;
    }

    // 7. Risk Assessment
    if (risks && risks.length > 0) {
      md += `## 7. Operational Risk Assessment\n`;
      md += `| Category | Risk Description | Severity | Mitigation Strategy |\n`;
      md += `| :--- | :--- | :---: | :--- |\n`;
      risks.forEach(risk => {
        md += `| ${risk.category} | ${risk.description} | **${risk.severity.toUpperCase()}** | ${risk.mitigation || 'N/A'} |\n`;
      });
      md += `\n`;
    }

    return md;
  }

  public static exportToHTML(data: {
    project: Project;
    concept?: any;
    characters: any[];
    scenes: Scene[];
    screenplays: Record<string, string>;
    budgetItems?: BudgetLineItem[];
    budgetSummary?: any;
    risks?: RiskAssessmentItem[];
  }): string {
    const { project, concept, characters, scenes, screenplays, budgetItems, budgetSummary, risks } = data;

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CIVE StoryLab: ${project.title || 'Pre-production Portfolio'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 850px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1, h2, h3, h4 {
      color: #0E2A5C;
    }
    h1 {
      border-bottom: 3px solid #0E2A5C;
      padding-bottom: 10px;
    }
    h2 {
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-top: 40px;
    }
    blockquote {
      background: #f9f9f9;
      border-left: 5px solid #0984FD;
      margin: 1.5em 10px;
      padding: 0.5em 10px;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #0E2A5C;
      color: white;
    }
    tr:nth-child(even) {
      background: #f4f6fa;
    }
    .screenplay {
      font-family: "Courier New", Courier, monospace;
      font-size: 11pt;
      background: #fafafa;
      border: 1px solid #ccc;
      padding: 30px;
      white-space: pre-wrap;
      line-height: 1.2;
      margin: 20px 0;
      color: black;
    }
    .meta-box {
      border: 1px solid #0984FD;
      background: #f0f7ff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 25px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .badge-high { background: #fee2e2; color: #b91c1c; }
    .badge-medium { background: #fef3c7; color: #b45309; }
    .badge-low { background: #dcfce7; color: #15803d; }
  </style>
</head>
<body>
  <h1>${project.title || 'Kizazi Salama'}</h1>
  <p><em>Generated by CIVE StoryLab &copy; ${new Date().getFullYear()}</em></p>

  <div class="meta-box">
    <h3>Production Metadata</h3>
    <p><strong>Genre:</strong> ${project.genre || 'N/A'} | 
       <strong>Duration:</strong> ${project.duration_target?.replace('_', ' ') || 'N/A'} | 
       <strong>Style:</strong> ${project.storytelling_style || 'N/A'} | 
       <strong>Budget Tier:</strong> ${project.budget_tier?.toUpperCase() || 'N/A'}</p>
  </div>
`;

    if (concept) {
      html += `
  <h2>1. Story Concept & Synopsis</h2>
  <p><strong>Logline:</strong></p>
  <blockquote>${concept.logline || 'N/A'}</blockquote>
  <p><strong>Synopsis:</strong></p>
  <p>${concept.synopsis?.replace(/\n/g, '<br>') || 'N/A'}</p>
`;
    }

    if (characters && characters.length > 0) {
      html += `<h2>2. Cast & Character Profiles</h2>`;
      characters.forEach(char => {
        html += `
  <h3>${char.name} <span style="font-size:0.7em; font-weight:normal; color:#666;">(${char.role_type})</span></h3>
  <p><strong>Background:</strong> ${char.background || 'N/A'}</p>
  <p><strong>Motivation:</strong> ${char.motivation || 'N/A'}</p>
  <p><strong>Voice/Dialect:</strong> ${char.voice_notes || 'N/A'}</p>
  <p><strong>Arc:</strong> ${char.arc_summary || 'N/A'}</p>
`;
      });
    }

    html += `<h2>3. Screenplay (Industry Courier Format)</h2>`;
    scenes.forEach(scene => {
      html += `
  <h3>Scene ${scene.order_index}: ${scene.slugline || 'Planned Scene'}</h3>
  <p><em>Scene Purpose: ${scene.purpose || 'N/A'}</em></p>
`;
      const scriptContent = screenplays[scene.id];
      if (scriptContent) {
        html += `<div class="screenplay">${scriptContent}</div>`;
      } else {
        html += `<p><em>(Script content pending generation)</em></p>`;
      }
    });

    if (budgetItems && budgetItems.length > 0) {
      html += `
  <h2>4. Itemized Production Budget Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Line Item Description</th>
        <th>Quantity</th>
        <th>Unit Cost</th>
        <th>Total Cost</th>
      </tr>
    </thead>
    <tbody>
`;
      budgetItems.forEach(item => {
        html += `
      <tr>
        <td><span class="badge badge-low">${item.category.replace('_', ' ').toUpperCase()}</span></td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${item.unit_cost.toLocaleString()} ${budgetSummary?.currency || 'TZS'}</td>
        <td><strong>${item.total_cost.toLocaleString()} ${budgetSummary?.currency || 'TZS'}</strong></td>
      </tr>
`;
      });

      html += `
    </tbody>
  </table>
  <h3 style="text-align: right; margin-top:20px;">GRAND TOTAL: ${budgetSummary?.total?.toLocaleString()} ${budgetSummary?.currency || 'TZS'}</h3>
`;
    }

    if (risks && risks.length > 0) {
      html += `
  <h2>5. Operational Risk Register</h2>
  <table>
    <thead>
      <tr>
        <th>Risk Category</th>
        <th>Operational Description</th>
        <th>Severity</th>
        <th>Mitigation Plan</th>
      </tr>
    </thead>
    <tbody>
`;
      risks.forEach(risk => {
        html += `
      <tr>
        <td><strong>${risk.category.toUpperCase()}</strong></td>
        <td>${risk.description}</td>
        <td><span class="badge badge-${risk.severity}">${risk.severity.toUpperCase()}</span></td>
        <td>${risk.mitigation || 'N/A'}</td>
      </tr>
`;
      });
      html += `
    </tbody>
  </table>
`;
    }

    html += `
</body>
</html>`;
    return html;
  }
}
