import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { claudeAIService } from '../services/ClaudeAIService';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/ai/shot — generate storyboard shot description
router.post('/shot', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            sceneContext: z.string().min(10),
            shotType: z.string().default('Wide'),
            style: z.string().optional(),
            characterColors: z.record(z.string(), z.string()).optional(),
        });
        const result = await claudeAIService.generateShotDescription(Schema.parse(req.body));
        res.json({ result });
    } catch (err) { next(err); }
});

// POST /api/ai/character-backstory — generate character backstory and dialogue
router.post('/character-backstory', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            name: z.string(),
            archetype: z.string(),
            want: z.string().optional(),
            need: z.string().optional(),
            flaw: z.string().optional(),
            wound: z.string().optional(),
            logline: z.string().optional(),
            genre: z.string().optional(),
        });
        const result = await claudeAIService.generateCharacterBackstory(Schema.parse(req.body));
        res.json({ result });
    } catch (err) { next(err); }
});

// POST /api/ai/arc-beats — suggest arc beats
router.post('/arc-beats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            arcTemplateName: z.string(),
            logline: z.string().min(10),
            genre: z.string().optional(),
        });
        const beats = await claudeAIService.suggestArcBeats(Schema.parse(req.body));
        res.json({ beats });
    } catch (err) { next(err); }
});

// POST /api/ai/location-match — match locations to a scene description
router.post('/location-match', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            sceneDescription: z.string().min(10),
            locations: z.array(z.object({
                id: z.string(),
                name: z.string(),
                address: z.string().optional(),
                description: z.string().optional(),
            })),
        });
        const matches = await claudeAIService.matchLocations(Schema.parse(req.body));
        res.json({ matches });
    } catch (err) { next(err); }
});

// POST /api/ai/analyze-script — parse a screenplay and return full production breakdown
router.post('/analyze-script', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            scriptText: z.string().min(50),
        });
        const { scriptText } = Schema.parse(req.body);
        const result = await claudeAIService.analyzeScript(scriptText);
        res.json({ result });
    } catch (err) {
        next(err);
    }
});

// POST /api/ai/budget-query — answer a budget question with AI suggestions
router.post('/budget-query', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            question: z.string().min(3),
            lineItems: z.array(
                z.object({
                    category: z.string(),
                    description: z.string(),
                    qty: z.number(),
                    rate: z.number(),
                    total: z.number(),
                })
            ).default([]),
            totalBudget: z.number().optional(),
            sagEnabled: z.boolean().optional(),
        });
        const params = Schema.parse(req.body);
        const result = await claudeAIService.queryBudget(params);
        res.json({ result });
    } catch (err) {
        next(err);
    }
});

// POST /api/ai/generate-image — generate a DALL-E 3 storyboard frame image
router.post('/generate-image', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            sceneHeading: z.string().default('EXT. LOCATION - DAY'),
            description: z.string().min(5),
            shotType: z.string().default('Wide Shot'),
            lighting: z.string().default('Natural'),
            mood: z.string().default('Neutral'),
        });
        const params = Schema.parse(req.body);
        const result = await claudeAIService.generateStoryboardImage(params);
        res.json(result);
    } catch (err) { next(err); }
});

// Category map — Claude categories → Prisma BudgetCategory enum
const CATEGORY_TO_DB: Record<string, 'ABOVE_THE_LINE' | 'BTL_PRODUCTION' | 'BTL_POST' | 'OTHER_DIRECT'> = {
  Cast: 'ABOVE_THE_LINE',
  Crew: 'BTL_PRODUCTION',
  Locations: 'BTL_PRODUCTION',
  Equipment: 'BTL_PRODUCTION',
  Post: 'BTL_POST',
  Misc: 'OTHER_DIRECT',
};

// POST /api/ai/analyze-and-save — analyze script and persist budget + storyboard shots to a project
router.post('/analyze-and-save', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            scriptText: z.string().min(50),
        });
        const { projectId, scriptText } = Schema.parse(req.body);

        // Verify project belongs to this user
        const project = await prisma.project.findFirst({
            where: { id: projectId, clerkUserId: req.auth!.userId },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Analyze with Claude
        const analysis = await claudeAIService.analyzeScript(scriptText);

        // Clear previous AI-generated storyboard shots for this project
        await prisma.storyboardShot.deleteMany({ where: { projectId, aiGenerated: true } });

        // Clear previous budget line items for this project (AI-generated ones, identified by notes containing "aiGenerated")
        await prisma.budgetLineItem.deleteMany({
            where: {
                projectId,
                notes: { contains: '"aiGenerated":true' },
            },
        });

        // Bulk-create budget line items
        let budgetCount = 0;
        if (analysis.budgetLineItems?.length) {
            await prisma.budgetLineItem.createMany({
                data: analysis.budgetLineItems.map((item) => ({
                    projectId,
                    category: CATEGORY_TO_DB[item.category] ?? 'OTHER_DIRECT',
                    description: item.description,
                    baseAmount: item.total ?? 0,
                    lineTotal: item.total ?? 0,
                    notes: JSON.stringify({
                        aiGenerated: true,
                        qty: item.qty,
                        rate: item.rate,
                        flag: item.flag ?? null,
                        originalCategory: item.category,
                    }),
                })),
            });
            budgetCount = analysis.budgetLineItems.length;
        }

        // Bulk-create storyboard shots
        let shotCount = 0;
        if (analysis.storyboardShots?.length) {
            await prisma.storyboardShot.createMany({
                data: analysis.storyboardShots.map((shot, i) => ({
                    projectId,
                    sceneNumber: shot.sceneHeading || `Scene ${i + 1}`,
                    shotNumber: i + 1,
                    shotType: shot.shotType || 'Wide',
                    description: shot.description,
                    aiGenerated: true,
                    aiPrompt: shot.sceneHeading,
                    order: i,
                    notes: JSON.stringify({
                        frameLabel: shot.frameLabel,
                        cameraMovement: shot.cameraMovement,
                        lighting: shot.lighting,
                        mood: shot.mood,
                    }),
                })),
            });
            shotCount = analysis.storyboardShots.length;
        }

        // Update project logline if we got a better summary
        if (analysis.summary) {
            await prisma.project.update({
                where: { id: projectId },
                data: { logline: analysis.summary },
            });
        }

        res.json({
            budgetCount,
            shotCount,
            title: analysis.title,
            summary: analysis.summary,
            estimatedDays: analysis.estimatedDays,
            cast: analysis.cast,
            locations: analysis.locations,
        });
    } catch (err) { next(err); }
});

export default router;
