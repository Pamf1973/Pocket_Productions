import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { budgetCalculationService } from '../services/BudgetCalculationService';
import { createError } from '../middleware/errorHandler';

const router = Router();

const CreatePhaseSchema = z.object({
    projectId: z.string(),
    type: z.enum(['DEVELOPMENT', 'PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'DELIVERY']),
    name: z.string().min(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    shootDays: z.number().int().min(0).default(0),
    color: z.string().default('#6366f1'),
    order: z.number().int().default(0),
    notes: z.string().optional(),
});

// GET /api/phases?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const phases = await prisma.phase.findMany({
            where: { projectId: String(projectId) },
            orderBy: { order: 'asc' },
            include: { crewAssignments: { include: { person: true } } },
        });
        res.json(phases);
    } catch (err) { next(err); }
});

// POST /api/phases
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreatePhaseSchema.parse(req.body);
        const phase = await prisma.phase.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
        res.status(201).json(phase);
    } catch (err) { next(err); }
});

// PATCH /api/phases/:id — updating shootDays triggers budget recalc
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreatePhaseSchema.omit({ projectId: true }).partial().parse(req.body);
        const phase = await prisma.phase.update({
            where: { id: String(req.params.id) },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });

        // When shoot days change, recalculate all crew costs for the project
        if (data.shootDays !== undefined) {
            await budgetCalculationService.recalculateProject(phase.projectId);
        }

        res.json(phase);
    } catch (err) { next(err); }
});

// DELETE /api/phases/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const phase = await prisma.phase.delete({ where: { id: String(req.params.id) } });
        await budgetCalculationService.recalculateProject(phase.projectId);
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/phases/:id/crew — assign crew member to phase
router.post('/:id/crew', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { personId, role } = z.object({
            personId: z.string(),
            role: z.string().optional(),
        }).parse(req.body);

        const phaseId = String(req.params.id);
        const assignment = await prisma.phaseCrewAssignment.upsert({
            where: {
                phaseId_personId: {
                    phaseId: phaseId,
                    personId: personId,
                },
            },
            update: { role },
            create: { phaseId, personId, role },
            include: { person: true },
        });
        res.status(201).json(assignment);
    } catch (err) { next(err); }
});

// DELETE /api/phases/:id/crew/:personId — remove crew from phase
router.delete('/:id/crew/:personId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.phaseCrewAssignment.deleteMany({
            where: { phaseId: String(req.params.id), personId: String(req.params.personId) },
        });
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;
