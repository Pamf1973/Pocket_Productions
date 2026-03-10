import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { claudeAIService } from '../services/ClaudeAIService';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/storyboard?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const shots = await prisma.storyboardShot.findMany({
            where: { projectId: String(projectId) },
            orderBy: [{ sceneNumber: 'asc' }, { shotNumber: 'asc' }],
        });
        res.json(shots);
    } catch (err) { next(err); }
});

// POST /api/storyboard — create shot manually
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            sceneNumber: z.string(),
            shotNumber: z.number().int().default(1),
            shotType: z.string().default('Wide'),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            colorHex: z.string().optional(),
            order: z.number().int().default(0),
            notes: z.string().optional(),
        });
        const shot = await prisma.storyboardShot.create({ data: Schema.parse(req.body) });
        res.status(201).json(shot);
    } catch (err) { next(err); }
});

// PATCH /api/storyboard/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            sceneNumber: z.string().optional(),
            shotType: z.string().optional(),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            colorHex: z.string().optional(),
            order: z.number().int().optional(),
            notes: z.string().optional(),
        });
        const shot = await prisma.storyboardShot.update({
            where: { id: String(req.params.id) },
            data: Schema.parse(req.body),
        });
        res.json(shot);
    } catch (err) { next(err); }
});

// DELETE /api/storyboard/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.storyboardShot.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/storyboard/ai-generate — AI shot description generation
router.post('/ai-generate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            sceneContext: z.string().min(10),
            shotType: z.string().default('Wide'),
            style: z.string().optional(),
            characterColors: z.record(z.string(), z.string()).optional(),
            saveShot: z.boolean().default(false),
            sceneNumber: z.string().optional(),
        });
        const { projectId, sceneContext, shotType, style, characterColors, saveShot, sceneNumber } =
            Schema.parse(req.body);

        // Pass just the parsed object to generateShotDescription
        const generated = await claudeAIService.generateShotDescription({
            sceneContext,
            shotType,
            style,
            characterColors,
        });

        let shot = null;
        if (saveShot) {
            shot = await prisma.storyboardShot.create({
                data: {
                    projectId,
                    sceneNumber: sceneNumber ?? '1',
                    shotType,
                    description: typeof generated === 'string' ? generated : (generated as any).description,
                    aiGenerated: true,
                    aiPrompt: sceneContext,
                },
            });
        }

        res.json({ generated, shot });
    } catch (err) { next(err); }
});

export default router;
