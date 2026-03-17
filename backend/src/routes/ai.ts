import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { claudeAIService } from '../services/ClaudeAIService';

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

export default router;
