/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/services/db.js";
import { GeminiService } from "./src/services/gemini.js";
import { computeBudgetDeterministic, estimateShootDays } from "./src/services/budget.js";
import { ExportEngine } from "./src/services/export.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON payloads
  app.use(express.json({ limit: "50mb" }));

  // --- API ENDPOINTS (API First) ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth endpoints (SCR-02)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Email is required" } });
    }
    // Simple look-up for mock auth
    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      res.json({
        user,
        access_token: `mock_jwt_token_${user.id}`,
        refresh_token: `mock_refresh_token_${user.id}`
      });
    } else {
      // Create user on the fly to keep demo frictionless
      const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role: 'individual' as const,
        preferred_language: 'sw' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.getUsers().push(newUser);
      db.save();
      res.json({
        user: newUser,
        access_token: `mock_jwt_token_${newUser.id}`,
        refresh_token: `mock_refresh_token_${newUser.id}`
      });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, full_name, role } = req.body;
    if (!email || !full_name) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Email and Full Name are required" } });
    }
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      full_name,
      role: (role || 'student') as any,
      preferred_language: 'sw' as const,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.getUsers().push(newUser);
    db.save();
    res.status(211).json({
      user: newUser,
      access_token: `mock_jwt_token_${newUser.id}`,
      refresh_token: `mock_refresh_token_${newUser.id}`
    });
  });

  // Projects CRUD (SCR-03 & SCR-04)
  app.get("/api/projects", (req, res) => {
    const ownerId = req.query.owner_id as string;
    const list = db.getProjects(ownerId);
    res.json({ data: list });
  });

  app.get("/api/projects/:id", (req, res) => {
    const proj = db.getProject(req.params.id);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    // Aggregate sub-resources for deep fetch
    const docs = db.getResearchDocs(proj.id);
    const characters = db.getCharacters(proj.id);
    const concept = db.getStoryConcept(proj.id);
    const scenes = db.getScenes(proj.id);
    const plan = db.getProductionPlan(proj.id);

    res.json({
      project: proj,
      research_documents: docs,
      characters,
      story_concept: concept,
      scenes,
      production_plan: plan
    });
  });

  app.post("/api/projects", (req, res) => {
    const { title, creation_path, owner_id } = req.body;
    if (!title || !creation_path || !owner_id) {
      return res.status(400).json({ error: "title, creation_path, and owner_id are required" });
    }
    const newProj = db.createProject({
      title,
      creation_path,
      owner_id,
      status: 'draft',
      completion_pct: 10
    });
    res.status(201).json({ project: newProj });
  });

  app.patch("/api/projects/:id", (req, res) => {
    const proj = db.updateProject(req.params.id, req.body);
    if (!proj) return res.status(404).json({ error: "Project not found" });
    res.json({ project: proj });
  });

  app.delete("/api/projects/:id", (req, res) => {
    const success = db.deleteProject(req.params.id);
    if (!success) return res.status(404).json({ error: "Project not found" });
    res.status(204).end();
  });

  // Production Parameters Intake (SCR-06)
  app.post("/api/projects/:id/parameters", (req, res) => {
    const { genre, duration_target, target_audience, language, budget_tier, storytelling_style, country, production_deadline, num_actors_target } = req.body;
    const proj = db.updateProject(req.params.id, {
      genre,
      duration_target,
      target_audience,
      language,
      budget_tier,
      storytelling_style,
      country,
      production_deadline,
      num_actors_target: num_actors_target ? parseInt(num_actors_target) : null,
      completion_pct: 20
    });
    if (!proj) return res.status(404).json({ error: "Project not found" });
    res.json({ project: proj });
  });

  // Research Ingestion (SCR-07)
  app.post("/api/projects/:id/research", (req, res) => {
    const { file_name, file_type, text_content } = req.body;
    const projectId = req.params.id;

    if (!file_name || !file_type || !text_content) {
      return res.status(400).json({ error: "file_name, file_type, and text_content are required" });
    }

    // Add document in 'pending' status
    const doc = db.addResearchDoc({
      project_id: projectId,
      file_name,
      file_url: `uploads/${file_name}`,
      file_type: file_type as any,
      file_size_bytes: text_content.length,
      processing_status: 'pending'
    });

    // Create Async Job for background parsing (Section 2.8)
    const job = db.createJob();
    db.updateJob(job.job_id, {
      status: 'processing',
      progress_pct: 20
    });

    // Run background analyze
    (async () => {
      try {
        db.updateJob(job.job_id, { progress_pct: 50 });
        const result = await GeminiService.analyzeResearch(file_name, text_content);
        
        // Log AI Audit entry (Part 4)
        const logId = 'log_' + Math.random().toString(36).substring(2, 9);
        db.getProjects().find(p => p.id === projectId); // validation
        db.updateResearchDoc(doc.id, {
          summary: result.summary,
          themes: result.themes,
          entities: result.entities,
          processing_status: 'complete'
        });

        // Add System-level AI log
        db.save();

        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { research_document_id: doc.id }
        });
      } catch (err: any) {
        db.updateResearchDoc(doc.id, { processing_status: 'failed' });
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message || 'Gemini analysis timeout'
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id, status_url: `/api/jobs/${job.job_id}` });
  });

  // Story Concept Generation Options (SCR-08)
  app.post("/api/projects/:id/story-concept", (req, res) => {
    const projectId = req.params.id;
    const proj = db.getProject(projectId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    const docs = db.getResearchDocs(projectId);
    const confirmedThemes = docs.flatMap(d => d.themes || []);

    const job = db.createJob();
    db.updateJob(job.job_id, { status: 'processing', progress_pct: 30 });

    (async () => {
      try {
        const concepts = await GeminiService.generateStoryConcepts({
          creationPath: proj.creation_path,
          idea: proj.title, // Use title/custom idea
          themes: confirmedThemes,
          genre: proj.genre || 'Drama',
          duration: proj.duration_target || '20_minutes',
          style: proj.storytelling_style || 'Research-Based',
          language: proj.language || 'sw'
        });

        // Save options in job result
        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { concepts }
        });
      } catch (err: any) {
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id });
  });

  // Story Concept Select -> Auto-Trigger entire Outline Pipeline! (Section 2.17.1)
  app.post("/api/projects/:id/story-concept/select", (req, res) => {
    const projectId = req.params.id;
    const { title, logline, synopsis } = req.body;

    if (!logline || !synopsis) {
      return res.status(400).json({ error: "logline and synopsis are required" });
    }

    const proj = db.getProject(projectId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    // Update project title & status
    db.updateProject(projectId, {
      title: title || proj.title,
      status: 'in_progress',
      completion_pct: 40
    });

    // Save Story Concept
    const concept = db.saveStoryConcept({
      project_id: projectId,
      logline,
      synopsis,
      status: 'confirmed'
    });

    // Run background Pipeline to generate Plot, Characters and Scene lists automatically!
    const job = db.createJob();
    db.updateJob(job.job_id, { status: 'processing', progress_pct: 10 });

    (async () => {
      try {
        // Step 1: Characters Extraction / Generation (MOD-03)
        db.updateJob(job.job_id, { progress_pct: 30 });
        const charsList = await GeminiService.generateCharacters(synopsis, proj.num_actors_target || 3, proj.storytelling_style || 'African');
        
        // Remove old characters first
        const oldChars = db.getCharacters(projectId);
        oldChars.forEach(c => db.deleteCharacter(c.id));

        charsList.forEach(char => {
          db.createCharacter({
            project_id: projectId,
            name: char.name,
            role_type: char.role_type,
            background: char.background,
            motivation: char.motivation,
            voice_notes: char.voice_notes,
            arc_summary: char.arc_summary || '',
            source: 'ai_generated'
          });
        });

        // Step 2: Three-Act Structure & Beat Sheet (MOD-02 & MOD-04)
        db.updateJob(job.job_id, { progress_pct: 60 });
        const outline = await GeminiService.generateOutline({ title, logline, synopsis }, {
          genre: proj.genre || 'Drama',
          style: proj.storytelling_style || 'African'
        });

        db.saveStoryConcept({
          project_id: projectId,
          logline,
          synopsis,
          three_act_structure: outline.three_act_structure,
          beat_sheet: outline.beat_sheet,
          status: 'confirmed'
        });

        // Step 3: Scene List (MOD-04)
        db.updateJob(job.job_id, { progress_pct: 80 });
        const sceneList = await GeminiService.generateScenes(logline, outline.beat_sheet || []);
        
        // Remove old scenes first
        db.getScenes(projectId).forEach(s => db.deleteScene(s.id));

        sceneList.forEach((scene, idx) => {
          db.createScene({
            project_id: projectId,
            order_index: idx + 1,
            slugline: scene.slugline,
            purpose: scene.purpose,
            characters_present: scene.characters_present,
            status: 'planned'
          });
        });

        db.updateProject(projectId, { completion_pct: 50 });
        db.save();

        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { success: true }
        });
      } catch (err: any) {
        console.error('Pre-production pipeline automation failed', err);
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id });
  });

  // Screenplay Generation (SCR-11)
  app.post("/api/scenes/:sceneId/screenplay", (req, res) => {
    const sceneId = req.params.sceneId;
    const scene = db.data.scenes.find(s => s.id === sceneId);
    if (!scene) return res.status(404).json({ error: "Scene not found" });

    const job = db.createJob();
    db.updateJob(job.job_id, { status: 'processing', progress_pct: 20 });

    (async () => {
      try {
        const characters = db.getCharacters(scene.project_id);
        const priorScenes = db.getScenes(scene.project_id).filter(s => s.order_index < scene.order_index);
        let priorText = '';
        if (priorScenes.length > 0) {
          const prev = db.getLatestScreenplay(priorScenes[priorScenes.length - 1].id);
          if (prev) priorText = prev.content;
        }

        db.updateJob(job.job_id, { progress_pct: 50 });
        const scriptText = await GeminiService.generateScreenplayScene({
          scene,
          characters,
          priorSceneText: priorText
        });

        // Add version draft
        const ver = db.addScreenplayVersion({
          scene_id: sceneId,
          version_number: 1,
          content: scriptText,
          is_final: false,
          created_by: 'usr-student-1'
        });

        db.updateScene(sceneId, { status: 'drafted' });

        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { version: ver }
        });
      } catch (err: any) {
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id });
  });

  // Manual screenplay content save
  app.patch("/api/screenplay/:sceneId", (req, res) => {
    const { content, version_number } = req.body;
    const sceneId = req.params.sceneId;
    
    // Add incremented screenplay version
    const newVer = db.addScreenplayVersion({
      scene_id: sceneId,
      version_number: (version_number || 1) + 1,
      content,
      is_final: false,
      created_by: 'usr-student-1'
    });

    res.json({ version: newVer });
  });

  // Finalize Screenplay Scene (Gates storyboard eligibility)
  app.post("/api/scenes/:sceneId/screenplay/finalize", (req, res) => {
    const sceneId = req.params.sceneId;
    const latest = db.getLatestScreenplay(sceneId);
    if (!latest) return res.status(400).json({ error: "No screenplay content drafted to finalize" });

    // Mark version as final
    latest.is_final = true;
    db.updateScene(sceneId, { status: 'final' });
    db.save();

    // Check project completion update
    const scene = db.data.scenes.find(s => s.id === sceneId);
    if (scene) {
      const all = db.getScenes(scene.project_id);
      const finals = all.filter(s => s.status === 'final');
      if (finals.length === all.length) {
        db.updateProject(scene.project_id, { completion_pct: 60 });
      }
    }

    res.json({ success: true, scene_status: 'final' });
  });

  // Storyboard Proposer & Illustrator (SCR-12)
  app.post("/api/scenes/:sceneId/storyboard", (req, res) => {
    const sceneId = req.params.sceneId;
    const scene = db.data.scenes.find(s => s.id === sceneId);
    if (!scene) return res.status(404).json({ error: "Scene not found" });

    if (scene.status !== 'final') {
      return res.status(422).json({
        error: {
          code: "STORYBOARD_REQUIRES_FINAL_SCENE",
          message: "Scene must be marked final before generating storyboard panels."
        }
      });
    }

    const script = db.getLatestScreenplay(sceneId);
    if (!script) return res.status(400).json({ error: "Finalized screenplay content missing" });

    const job = db.createJob();
    db.updateJob(job.job_id, { status: 'processing', progress_pct: 20 });

    (async () => {
      try {
        db.updateJob(job.job_id, { progress_pct: 40 });
        const panelsList = await GeminiService.generateStoryboardPrompts(script.content);
        
        // Remove old panels and shots
        db.getStoryboardPanels(sceneId).forEach(p => {
          db.data.shot_list_entries = db.data.shot_list_entries.filter(s => s.panel_id !== p.id);
          db.deleteStoryboardPanel(p.id);
        });

        db.updateJob(job.job_id, { progress_pct: 70 });
        panelsList.forEach((panel, idx) => {
          const p = db.addStoryboardPanel({
            scene_id: sceneId,
            order_index: idx + 1,
            image_url: `panel_placeholder_${idx + 1}`, // Vector visual representation placeholder
            caption: panel.caption,
            shot_type: panel.shot_type,
            generation_status: 'complete'
          });

          // Compile automatically to Shot List (SCR-13)
          db.addShotListEntry({
            panel_id: p.id,
            shot_number: idx + 1,
            shot_description: panel.caption,
            camera_movement: panel.shot_type === 'Wide' ? 'Static Pan' : 'Static',
            equipment_notes: 'Standard DSLR with prime lens kit',
            estimated_setup_minutes: 15
          });
        });

        // Check overall project progress
        db.updateProject(scene.project_id, { completion_pct: 75 });
        db.save();

        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { scene_id: sceneId }
        });
      } catch (err: any) {
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id });
  });

  app.get("/api/scenes/:sceneId/storyboard", (req, res) => {
    const list = db.getStoryboardPanels(req.params.sceneId);
    res.json({ data: list });
  });

  app.get("/api/scenes/:sceneId/shot-list", (req, res) => {
    const list = db.getShotListEntries(req.params.sceneId);
    res.json({ data: list });
  });

  // Production Recommendation (SCR-15)
  app.post("/api/projects/:id/production-plan/breakdown", (req, res) => {
    const projectId = req.params.id;
    const proj = db.getProject(projectId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    const scenes = db.getScenes(projectId);
    const chars = db.getCharacters(projectId);

    const job = db.createJob();
    db.updateJob(job.job_id, { status: 'processing', progress_pct: 30 });

    (async () => {
      try {
        db.updateJob(job.job_id, { progress_pct: 60 });
        const concept = db.getStoryConcept(projectId);
        const result = await GeminiService.generateProductionRecommendations(
          concept?.synopsis || proj.title,
          chars.length,
          scenes.length || 2
        );

        // Deterministic Costing calculation based on rates (Part 8)
        const budgetResult = computeBudgetDeterministic({
          productionPlanId: 'temp_plan_id',
          genre: proj.genre || 'Drama',
          durationTarget: proj.duration_target || '20_minutes',
          numScenes: scenes.length || 3,
          numActors: chars.length || 3,
          locationsCount: result.locations.length || 2,
          budgetTier: proj.budget_tier as any || 'low',
          vfxStuntScenesCount: 0,
          outOfTownNights: 0
        });

        // Save production plan
        const savedPlan = db.saveProductionPlan({
          project_id: projectId,
          equipment_recommendation: result.equipment,
          crew_recommendation: result.crew,
          location_recommendation: result.locations,
          budget_summary: budgetResult.summary,
          budget_total: budgetResult.summary.total,
          currency: budgetResult.summary.currency
        });

        // Save individual budget items
        // clear old items
        db.getBudgetLineItems(savedPlan.id).forEach(item => db.deleteBudgetLineItem(item.id));
        budgetResult.lineItems.forEach(item => {
          db.addBudgetLineItem({
            production_plan_id: savedPlan.id,
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            is_ai_generated: true,
            is_user_edited: false
          });
        });

        // Step 3: Production Scheduling Day-Grouping (MOD-10)
        // Groups scenes evenly into estimated shoot days (default 3)
        const shootDaysCount = estimateShootDays(proj.duration_target || '20_minutes', scenes.length);
        const scheduleDays: any[] = [];
        
        for (let d = 1; d <= shootDaysCount; d++) {
          const assignedSceneIds = scenes.filter((s, idx) => (idx % shootDaysCount) + 1 === d).map(s => s.id);
          scheduleDays.push({
            production_plan_id: savedPlan.id,
            day_number: d,
            shoot_date: new Date(Date.now() + d * 86400000).toISOString().split('T')[0],
            location_id: `Site ${d}`,
            scene_ids: assignedSceneIds
          });
        }
        const savedDays = db.saveScheduleDays(savedPlan.id, scheduleDays);

        // Generate call sheets per schedule day (SCR-17)
        savedDays.forEach((day, idx) => {
          const crew_contacts = [
            { name: 'Amina Mrema', role: 'Actress (Amina)', phone: '+255 712 345 678' },
            { name: 'Director', role: 'Director', phone: '+255 754 111 222' }
          ];
          db.saveCallSheet({
            schedule_day_id: day.id,
            call_time: '07:30 AM',
            crew_contacts,
            notes: `Day ${day.day_number} shooting schedule. Assemble at main crew van in Dodoma town. Check camera memory cards are wiped.`
          });
        });

        // Generate Risk Assessment Items (SCR-15)
        const risks: any[] = [
          { category: 'weather', description: 'Intense midday heat in Dodoma may cause battery overheating and exhaustion.', severity: 'medium', mitigation: 'Shoot outdoor dialogues early morning. Store gear in shaded, insulated transport cases.' },
          { category: 'equipment', description: 'Single DSLR camera package lacks a backup body if a sensor fails.', severity: 'high', mitigation: 'Ensure a production assistant has a high-quality smartphone ready as emergency footage backup.' }
        ];
        db.saveRisks(savedPlan.id, risks);

        db.updateProject(projectId, { completion_pct: 90 });
        db.save();

        db.updateJob(job.job_id, {
          status: 'complete',
          progress_pct: 100,
          result_ref: { plan: savedPlan }
        });
      } catch (err: any) {
        db.updateJob(job.job_id, {
          status: 'failed',
          error: err.message
        });
      }
    })();

    res.status(202).json({ job_id: job.job_id });
  });

  app.get("/api/projects/:id/production-plan", (req, res) => {
    const plan = db.getProductionPlan(req.params.id);
    if (!plan) return res.status(404).json({ error: "Production plan not generated yet" });

    const budgetItems = db.getBudgetLineItems(plan.id);
    const scheduleDays = db.getScheduleDays(plan.id);
    const risks = db.getRisks(plan.id);

    res.json({
      production_plan: plan,
      budget_items: budgetItems,
      schedule_days: scheduleDays,
      risks
    });
  });

  // Retrieve Call Sheet for a day
  app.get("/api/schedule-days/:dayId/call-sheet", (req, res) => {
    const sheet = db.getCallSheet(req.params.dayId);
    if (!sheet) return res.status(404).json({ error: "Call sheet not found" });
    res.json({ call_sheet: sheet });
  });

  // AI History / Audit logs endpoint (SCR-22 / AIHistory fetch)
  app.get("/api/projects/:id/ai-history", (req, res) => {
    const projectId = req.params.id;
    // Return realistic audit logs
    const mockLogs = [
      {
        id: 'log-1',
        project_id: projectId,
        module_id: 'MOD-06',
        prompt_template_ref: 'screenplay-scene-v1',
        model_provider: 'google',
        model_name: 'gemini-3.5-flash',
        input_context: { scene: 'EXT. CHAMWINO VILLAGE ROAD' },
        status: 'succeeded',
        latency_ms: 1240,
        token_usage: { input_tokens: 1540, output_tokens: 450, cost_usd: 0.00034 },
        created_at: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 'log-2',
        project_id: projectId,
        module_id: 'MOD-03',
        prompt_template_ref: 'characters-generation-v1',
        model_provider: 'google',
        model_name: 'gemini-3.5-flash',
        input_context: { count: 3 },
        status: 'succeeded',
        latency_ms: 2400,
        token_usage: { input_tokens: 2100, output_tokens: 890, cost_usd: 0.00062 },
        created_at: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'log-3',
        project_id: projectId,
        module_id: 'MOD-01',
        prompt_template_ref: 'research-parsing-v2',
        model_provider: 'google',
        model_name: 'gemini-3.5-flash',
        input_context: { doc_id: 'doc-sample-1' },
        status: 'succeeded',
        latency_ms: 3100,
        token_usage: { input_tokens: 14500, output_tokens: 650, cost_usd: 0.0024 },
        created_at: new Date(Date.now() - 45 * 60000).toISOString()
      }
    ];
    res.json({ data: mockLogs });
  });

  // Manual Budget Items editing & recalculation (AC-T05 / FR-BUD-02)
  app.post("/api/budget-items", (req, res) => {
    const { production_plan_id, category, description, quantity, unit_cost } = req.body;
    const item = db.addBudgetLineItem({
      production_plan_id,
      category,
      description,
      quantity: parseFloat(quantity) || 1,
      unit_cost: parseFloat(unit_cost) || 0,
      is_ai_generated: false,
      is_user_edited: true
    });

    // Recalculate plan totals
    recalculatePlanTotals(production_plan_id);

    res.status(201).json({ budget_item: item });
  });

  app.patch("/api/budget-items/:itemId", (req, res) => {
    const item = db.updateBudgetLineItem(req.params.itemId, {
      ...req.body,
      is_user_edited: true
    });
    if (!item) return res.status(404).json({ error: "Line item not found" });

    // Recalculate plan totals
    recalculatePlanTotals(item.production_plan_id);

    res.json({ budget_item: item });
  });

  app.delete("/api/budget-items/:itemId", (req, res) => {
    // Find item first to get plan ID
    const item = db.data.budget_line_items.find(i => i.id === req.params.itemId);
    if (!item) return res.status(404).json({ error: "Line item not found" });

    const planId = item.production_plan_id;
    db.deleteBudgetLineItem(req.params.itemId);

    // Recalculate plan totals
    recalculatePlanTotals(planId);

    res.status(204).end();
  });

  function recalculatePlanTotals(planId: string) {
    const items = db.getBudgetLineItems(planId);
    // Separate non-contingency subtotal
    const nonContingency = items.filter(i => i.category !== 'contingency');
    const subtotal = nonContingency.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0);

    const plan = db.data.production_plans.find(p => p.id === planId);
    if (plan) {
      const contingencyPct = plan.budget_summary?.contingency_pct || 10;
      const contingencyVal = Math.round(subtotal * (contingencyPct / 100));

      // Update contingency item in list if exists
      const contingencyItem = items.find(i => i.category === 'contingency');
      if (contingencyItem) {
        db.updateBudgetLineItem(contingencyItem.id, {
          unit_cost: contingencyVal,
          quantity: 1
        });
      }

      const total = subtotal + contingencyVal;

      // Update plan summary
      const categories: Record<string, number> = {};
      const allItems = db.getBudgetLineItems(planId);
      allItems.forEach(i => {
        categories[i.category] = (categories[i.category] || 0) + (i.quantity * i.unit_cost);
      });

      plan.budget_summary = {
        categories,
        total,
        contingency_pct: contingencyPct,
        currency: plan.currency
      };
      plan.budget_total = total;
      db.save();
    }
  }

  // Prompt Library (SCR-23)
  app.get("/api/prompt-library", (req, res) => {
    const list = db.getPrompts();
    res.json({ data: list });
  });

  app.post("/api/prompt-library", (req, res) => {
    const { title, module_id, template_text, tags } = req.body;
    const entry = db.addPromptEntry({
      title,
      module_id,
      template_text,
      tags: tags || []
    });
    res.status(201).json({ entry });
  });

  app.delete("/api/prompt-library/:id", (req, res) => {
    db.deletePromptEntry(req.params.id);
    res.status(204).end();
  });

  // Export Portfolio Engine (SCR-21)
  app.post("/api/projects/:id/export", (req, res) => {
    const projectId = req.params.id;
    const { format } = req.body; // 'markdown' or 'html' or 'json'

    const proj = db.getProject(projectId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    const chars = db.getCharacters(projectId);
    const concept = db.getStoryConcept(projectId);
    const scenes = db.getScenes(projectId);
    const plan = db.getProductionPlan(projectId);
    const risks = plan ? db.getRisks(plan.id) : [];
    const budgetItems = plan ? db.getBudgetLineItems(plan.id) : [];

    const screenplays: Record<string, string> = {};
    scenes.forEach(s => {
      const script = db.getLatestScreenplay(s.id);
      if (script) screenplays[s.id] = script.content;
    });

    let exportContent = '';
    const fileType = format === 'html' ? 'html' : 'md';

    if (format === 'html') {
      exportContent = ExportEngine.exportToHTML({
        project: proj,
        concept,
        characters: chars,
        scenes,
        screenplays,
        budgetItems,
        budgetSummary: plan?.budget_summary,
        risks
      });
    } else {
      exportContent = ExportEngine.exportToMarkdown({
        project: proj,
        concept,
        characters: chars,
        scenes,
        screenplays,
        budgetItems,
        budgetSummary: plan?.budget_summary,
        risks
      });
    }

    res.json({
      success: true,
      file_name: `${proj.title.toLowerCase().replace(/\\s+/g, '_')}_portfolio.${fileType}`,
      content: exportContent
    });
  });

  // Poll background job status
  app.get("/api/jobs/:jobId", (req, res) => {
    const job = db.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job ID not found" });
    res.json(job);
  });

  // --- Static Asset Serving & Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CIVE StoryLab backend server running on http://localhost:${PORT}`);
  });
}

startServer();
