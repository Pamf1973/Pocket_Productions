import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { claudeAIService } from '../services/ClaudeAIService';
import { createError } from '../middleware/errorHandler';

const router = Router();

const CreateLocationSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    permitStatus: z.enum(['SCOUTING', 'NEGOTIATING', 'APPLIED', 'PERMITTED', 'DENIED']).default('SCOUTING'),
    dailyFee: z.number().min(0).default(0),
    shootDays: z.number().int().min(0).default(0),
    description: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    notes: z.string().optional(),
});

// GET /api/locations?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const locations = await prisma.location.findMany({
            where: { projectId: String(projectId) },
            orderBy: { name: 'asc' },
        });
        res.json(locations);
    } catch (err) { next(err); }
});

// GET /api/locations/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = await prisma.location.findUnique({
            where: { id: String(req.params.id) },
            include: { budgetLineItems: true, perDiemEntries: true },
        });
        if (!location) throw createError('Location not found', 404);
        res.json(location);
    } catch (err) { next(err); }
});

// POST /api/locations
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreateLocationSchema.parse(req.body);
        const location = await prisma.location.create({ data });

        // Auto-create a budget line item for this location's fees
        if (data.dailyFee > 0 || data.shootDays > 0) {
            await prisma.budgetLineItem.create({
                data: {
                    projectId: data.projectId,
                    locationId: location.id,
                    category: 'BTL_PRODUCTION',
                    description: `Location fee — ${data.name}`,
                    baseAmount: data.dailyFee * data.shootDays,
                    lineTotal: data.dailyFee * data.shootDays,
                },
            });
        }

        res.status(201).json(location);
    } catch (err) { next(err); }
});

// PATCH /api/locations/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreateLocationSchema.omit({ projectId: true }).partial().parse(req.body);
        const location = await prisma.location.update({ where: { id: String(req.params.id) }, data });

        // Update linked budget line item if fee/shootDays changed
        if (data.dailyFee !== undefined || data.shootDays !== undefined) {
            const existingLine = await prisma.budgetLineItem.findFirst({ where: { locationId: location.id } });
            if (existingLine) {
                const newTotal = location.dailyFee * location.shootDays;
                await prisma.budgetLineItem.update({
                    where: { id: existingLine.id },
                    data: { baseAmount: newTotal, lineTotal: newTotal },
                });
            }
        }

        res.json(location);
    } catch (err) { next(err); }
});

// DELETE /api/locations/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.location.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// PATCH /api/locations/:id/permit — update permit status
router.patch('/:id/permit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { permitStatus } = z.object({
            permitStatus: z.enum(['SCOUTING', 'NEGOTIATING', 'APPLIED', 'PERMITTED', 'DENIED']),
        }).parse(req.body);
        const location = await prisma.location.update({
            where: { id: String(req.params.id) },
            data: { permitStatus },
        });
        res.json(location);
    } catch (err) { next(err); }
});

// POST /api/locations/:id/add-photo — add S3 photo URL to location
router.post('/:id/add-photo', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { photoUrl } = z.object({ photoUrl: z.string().url() }).parse(req.body);
        const location = await prisma.location.findUniqueOrThrow({ where: { id: String(req.params.id) } });
        const updated = await prisma.location.update({
            where: { id: String(req.params.id) },
            data: { photoUrls: [...location.photoUrls, photoUrl] },
        });
        res.json(updated);
    } catch (err) { next(err); }
});

// POST /api/locations/ai-match — AI location matching
router.post('/ai-match', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sceneDescription, projectId } = z.object({
            sceneDescription: z.string().min(10),
            projectId: z.string(),
        }).parse(req.body);

        const locations = await prisma.location.findMany({
            where: { projectId: String(projectId) },
            select: { id: true, name: true, address: true, description: true },
        });

        const availableLocs = locations.map((l: any) => ({
            id: l.id,
            name: l.name,
            description: l.description ?? undefined,
            address: l.address ?? undefined
        }));

        const matches = await claudeAIService.matchLocations({ sceneDescription, locations: availableLocs });
        res.json({ matches });
    } catch (err) { next(err); }
});

export default router;
