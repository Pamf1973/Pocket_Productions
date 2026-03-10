import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { sagRateService } from '../services/SagRateService';
import { budgetCalculationService } from '../services/BudgetCalculationService';
import { createError } from '../middleware/errorHandler';

const router = Router();

const CreateProjectSchema = z.object({
    title: z.string().min(1),
    format: z.string().default('Feature Film'),
    genre: z.string().optional(),
    year: z.number().int().optional(),
    totalBudget: z.number().positive(),
    distributionType: z.enum(['THEATRICAL', 'STREAMING', 'FESTIVAL', 'DIRECT']).default('THEATRICAL'),
    contingencyPct: z.number().min(5).max(30).default(10),
    logline: z.string().optional(),
    notes: z.string().optional(),
});

const UpdateProjectSchema = CreateProjectSchema.partial();

// GET /api/projects — list all projects for the authenticated user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await prisma.project.findMany({
            where: { clerkUserId: req.auth!.userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { phases: true, persons: true, characters: true, locations: true } },
            },
        });
        res.json(projects);
    } catch (err) { next(err); }
});

// GET /api/projects/:id — get single project with full details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: String(req.params.id), clerkUserId: req.auth!.userId },
            include: {
                phases: { orderBy: { order: 'asc' } },
                departments: true,
                persons: { include: { department: true } },
                budgetLineItems: { orderBy: { category: 'asc' } },
                characters: true,
                locations: true,
                arcBeats: { orderBy: { positionPct: 'asc' } },
                colorPalettes: true,
            },
        });
        if (!project) throw createError('Project not found', 404);
        res.json(project);
    } catch (err) { next(err); }
});

// POST /api/projects — create project
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreateProjectSchema.parse(req.body);
        const sagAgreementTier = sagRateService.resolveAgreementTier(
            data.totalBudget,
            data.distributionType as any
        );
        const project = await prisma.project.create({
            data: { ...data, clerkUserId: req.auth!.userId, sagAgreementTier },
        });
        res.status(201).json(project);
    } catch (err) { next(err); }
});

// PATCH /api/projects/:id — update project
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.project.findFirst({
            where: { id: String(req.params.id), clerkUserId: req.auth!.userId },
        });
        if (!existing) throw createError('Project not found', 404);

        const data = UpdateProjectSchema.parse(req.body);
        const updateData: any = { ...data };

        // If budget changed, re-resolve SAG tier
        if (data.totalBudget !== undefined) {
            updateData.sagAgreementTier = sagRateService.resolveAgreementTier(
                data.totalBudget,
                (data.distributionType ?? existing.distributionType) as any
            );
        }

        const project = await prisma.project.update({
            where: { id: String(req.params.id) },
            data: updateData,
        });
        res.json(project);
    } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clerkUserId = req.auth!.userId;
        await prisma.project.delete({ where: { id: String(req.params.id), clerkUserId } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// GET /api/projects/:id/budget/waterfall — budget waterfall summary
router.get('/:id/budget/waterfall', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clerkUserId = req.auth!.userId;
        await prisma.project.findUniqueOrThrow({ where: { id: String(req.params.id), clerkUserId } }); // Auth check
        const waterfall = await budgetCalculationService.getWaterfallSummary(String(req.params.id));
        res.json(waterfall);
    } catch (err) { next(err); }
});

// POST /api/projects/:id/budget/recalculate — trigger full recalculation
router.post('/:id/budget/recalculate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clerkUserId = req.auth!.userId;
        await prisma.project.findUniqueOrThrow({ where: { id: String(req.params.id), clerkUserId } }); // Auth check
        await budgetCalculationService.recalculateProject(String(req.params.id));
        res.json({ success: true, message: 'Project budget recalculated' });
    } catch (err) { next(err); }
});

export default router;
