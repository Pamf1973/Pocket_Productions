import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/color-palettes?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const palettes = await prisma.colorPalette.findMany({
            where: { projectId: String(projectId) },
            orderBy: { name: 'asc' },
        });
        res.json(palettes);
    } catch (err) { next(err); }
});

// POST /api/color-palettes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            name: z.string().min(1),
            swatches: z.array(z.object({
                hex: z.string(),
                emotion: z.string().optional(),
                productionCode: z.string().optional(),
                label: z.string().optional(),
            })),
            notes: z.string().optional(),
        });
        const palette = await prisma.colorPalette.create({ data: Schema.parse(req.body) });
        res.status(201).json(palette);
    } catch (err) { next(err); }
});

// PATCH /api/color-palettes/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            name: z.string().optional(),
            swatches: z.array(z.object({
                hex: z.string(),
                emotion: z.string().optional(),
                productionCode: z.string().optional(),
                label: z.string().optional(),
            })).optional(),
            notes: z.string().optional(),
        });
        const data = Schema.parse(req.body);
        const palette = await prisma.colorPalette.update({
            where: { id: String(req.params.id) },
            data: {
                name: data.name,
                swatches: data.swatches ? (data.swatches as any) : undefined,
                notes: data.notes,
            },
        });
        res.json(palette);
    } catch (err) { next(err); }
});

// DELETE /api/color-palettes/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.colorPalette.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;
