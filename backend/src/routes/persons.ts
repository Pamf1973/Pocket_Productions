import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { sagRateService } from '../services/SagRateService';
import { budgetCalculationService } from '../services/BudgetCalculationService';
import { unionToggleService } from '../services/UnionToggleService';
import { createError } from '../middleware/errorHandler';

const router = Router();

const CreatePersonSchema = z.object({
    projectId: z.string(),
    departmentId: z.string().optional(),
    name: z.string().min(1),
    role: z.string().min(1),
    unionStatus: z.enum(['SAG_AFTRA', 'NON_UNION', 'TAFT_HARTLEY']).default('NON_UNION'),
    contractType: z.enum(['DAY_PLAYER', 'WEEKLY', 'WEEKLY_GUARANTEED', 'RUN_OF_SHOW']).default('DAY_PLAYER'),
    negotiatedRate: z.number().positive(),
    guaranteedUnits: z.number().positive().default(1),
    rateUnit: z.enum(['DAY', 'WEEK', 'FLAT']).default('DAY'),
    notes: z.string().optional(),
});

const UpdatePersonSchema = CreatePersonSchema.omit({ projectId: true }).partial();

// GET /api/persons?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId query param required', 400);
        const persons = await prisma.person.findMany({
            where: req.query.projectId ? { projectId: String(req.query.projectId) } : {},
            include: { department: true, character: true },
            orderBy: { name: 'asc' },
        });
        res.json(persons);
    } catch (err) { next(err); }
});

// GET /api/persons/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const person = await prisma.person.findUnique({
            where: { id: String(req.params.id) },
            include: { department: true, character: true, mealPenalties: true, perDiemEntries: true, budgetLineItems: true },
        });
        if (!person) throw createError('Person not found', 404);
        res.json(person);
    } catch (err) { next(err); }
});

// POST /api/persons
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreatePersonSchema.parse(req.body);
        const person = await prisma.person.create({ data });

        // Auto-fill P&H fringe and check below-minimum
        await sagRateService.autoFillPhFringe(person.id);
        const isBelowMin = await sagRateService.checkBelowMinimum(person.id);

        // Create a matching BudgetLineItem
        const project = await prisma.project.findUniqueOrThrow({ where: { id: data.projectId } });
        const isAtl = ['Director', 'Writer', 'Producer', 'Lead Actor', 'Lead'].some(
            (r) => data.role.toLowerCase().includes(r.toLowerCase())
        );
        await prisma.budgetLineItem.create({
            data: {
                projectId: data.projectId,
                personId: person.id,
                category: isAtl ? 'ABOVE_THE_LINE' : 'BTL_PRODUCTION',
                description: `${data.name} — ${data.role}`,
                baseAmount: data.negotiatedRate * data.guaranteedUnits,
                lineTotal: data.negotiatedRate * data.guaranteedUnits,
            },
        });

        const updated = await prisma.person.findUnique({ where: { id: person.id } });
        res.status(201).json({ ...updated, belowSagMinimum: isBelowMin });
    } catch (err) { next(err); }
});

// PATCH /api/persons/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = UpdatePersonSchema.parse(req.body);
        const person = await prisma.person.update({ where: { id: String(req.params.id) }, data });

        // Re-check SAG compliance and recalculate fringes
        await sagRateService.autoFillPhFringe(person.id);
        const isBelowMin = await sagRateService.checkBelowMinimum(person.id);
        await budgetCalculationService.recalculatePersonLineItem(person.id);

        const updated = await prisma.person.findUnique({ where: { id: person.id } });
        res.json({ ...updated, belowSagMinimumWarning: isBelowMin });
    } catch (err) { next(err); }
});

// DELETE /api/persons/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.person.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/persons/:id/meal-penalty — add a meal penalty entry
router.post('/:id/meal-penalty', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const MealPenaltySchema = z.object({
            shootDate: z.string(),
            intervalNumber: z.number().int().min(1).max(10),
        });
        const { shootDate, intervalNumber } = MealPenaltySchema.parse(req.body);

        // Amount based on interval: 1=$25, 2=$35, 3+=$50
        const amount = intervalNumber === 1 ? 25 : intervalNumber === 2 ? 35 : 50;

        const penalty = await prisma.mealPenalty.create({
            data: {
                personId: String(req.params.id),
                shootDate: new Date(shootDate),
                intervalNumber,
                amount,
            },
        });

        await budgetCalculationService.recalculatePersonLineItem(String(req.params.id));
        res.status(201).json(penalty);
    } catch (err) { next(err); }
});

// POST /api/persons/:id/per-diem — add per diem entries
router.post('/:id/per-diem', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const PerDiemSchema = z.object({
            locationId: z.string().optional(),
            dates: z.array(z.string()).min(1),
            amountPerDay: z.number().default(70),
        });
        const { locationId, dates, amountPerDay } = PerDiemSchema.parse(req.body);

        const entries = await prisma.$transaction(
            dates.map((date) =>
                prisma.perDiemEntry.create({
                    data: { personId: String(req.params.id), locationId, date: new Date(date), amount: amountPerDay },
                })
            )
        );

        await budgetCalculationService.recalculatePersonLineItem(String(req.params.id));
        res.status(201).json(entries);
    } catch (err) { next(err); }
});

export default router;
