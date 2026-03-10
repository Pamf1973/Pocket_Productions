import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { claudeAIService } from '../services/ClaudeAIService';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/arc-templates — all arc templates (reference data)
router.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await prisma.arcTemplate.findMany();
        res.json(templates);
    } catch (err) { next(err); }
});

// GET /api/arc-templates/beats?projectId=xxx
router.get('/beats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const beats = await prisma.arcBeat.findMany({
            where: { projectId: String(projectId) },
            orderBy: { positionPct: 'asc' },
        });
        res.json(beats);
    } catch (err) { next(err); }
});

// POST /api/arc-templates/beats
router.post('/beats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            arcTemplateId: z.string().optional(),
            name: z.string().min(1),
            positionPct: z.number().min(0).max(100),
            description: z.string().optional(),
            notes: z.string().optional(),
            order: z.number().int().default(0),
        });
        const beat = await prisma.arcBeat.create({ data: Schema.parse(req.body) });
        res.status(201).json(beat);
    } catch (err) { next(err); }
});

// PATCH /api/arc-templates/beats/:id — drag-to-reposition
router.patch('/beats/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            name: z.string().optional(),
            positionPct: z.number().min(0).max(100).optional(),
            description: z.string().optional(),
            notes: z.string().optional(),
            order: z.number().int().optional(),
        });
        const beat = await prisma.arcBeat.update({
            where: { id: String(req.params.id) },
            data: Schema.parse(req.body),
        });
        res.json(beat);
    } catch (err) { next(err); }
});

// DELETE /api/arc-templates/beats/:id
router.delete('/beats/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.arcBeat.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/arc-templates/beats/ai-suggest — AI arc beat suggestions
router.post('/beats/ai-suggest', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            arcTemplateName: z.string(),
            logline: z.string().min(10),
            genre: z.string().optional(),
        });
        const params = Schema.parse(req.body);
        const beats = await claudeAIService.suggestArcBeats(params);
        res.json({ beats });
    } catch (err) { next(err); }
});

export default router;
