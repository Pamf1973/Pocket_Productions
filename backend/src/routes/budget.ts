import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { unionToggleService } from '../services/UnionToggleService';
import { createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/budget/line-items?projectId=xxx&category=xxx
router.get('/line-items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId, category } = req.query;
        if (!projectId) throw createError('projectId required', 400);

        const lineItems = await prisma.budgetLineItem.findMany({
            where: {
                projectId: String(projectId),
                ...(category ? { category: String(category) as any } : {}),
            },
            include: { person: true, location: true },
            orderBy: [{ category: 'asc' }, { description: 'asc' }],
        });
        res.json(lineItems);
    } catch (err) { next(err); }
});

// POST /api/budget/line-items — create standalone line item (non-person)
router.post('/line-items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            category: z.enum(['ABOVE_THE_LINE', 'BTL_PRODUCTION', 'BTL_POST', 'OTHER_DIRECT']),
            description: z.string().min(1),
            baseAmount: z.number().default(0),
            otherAmount: z.number().default(0),
            notes: z.string().optional(),
        });
        const data = Schema.parse(req.body);
        const lineItem = await prisma.budgetLineItem.create({
            data: { ...data, lineTotal: data.baseAmount + data.otherAmount },
        });
        res.status(201).json(lineItem);
    } catch (err) { next(err); }
});

// PATCH /api/budget/line-items/:id
router.patch('/line-items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            description: z.string().optional(),
            baseAmount: z.number().optional(),
            otherAmount: z.number().optional(),
            notes: z.string().optional(),
            isLocked: z.boolean().optional(),
        });
        const data = Schema.parse(req.body);
        const existing = await prisma.budgetLineItem.findUniqueOrThrow({ where: { id: String(req.params.id) } });
        const baseAmount = data.baseAmount ?? existing.baseAmount;
        const otherAmount = data.otherAmount ?? existing.otherAmount;
        const lineTotal = baseAmount + existing.phFringeAmount + existing.mealPenaltiesTotal + existing.perDiemTotal + otherAmount;

        const lineItem = await prisma.budgetLineItem.update({
            where: { id: String(req.params.id) },
            data: { ...data, lineTotal },
        });
        res.json(lineItem);
    } catch (err) { next(err); }
});

// DELETE /api/budget/line-items/:id
router.delete('/line-items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.budgetLineItem.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/budget/departments/:id/toggle-union — union cascade with delta preview
router.post('/departments/:id/toggle-union', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            newStatus: z.enum(['SAG_AFTRA', 'NON_UNION', 'TAFT_HARTLEY']),
            projectId: z.string(),
            preview: z.boolean().default(false),
        });
        const { newStatus, projectId, preview } = Schema.parse(req.body);

        if (preview) {
            const delta = await unionToggleService.previewToggle(String(req.params.id), newStatus as any);
            return res.json({ preview: true, ...delta });
        }

        const result = await unionToggleService.toggleDepartmentUnionStatus(
            String(req.params.id),
            newStatus as any,
            projectId
        );
        res.json(result);
    } catch (err) { next(err); }
});

// GET /api/budget/departments?projectId=xxx
router.get('/departments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.query;
        if (!projectId) throw createError('projectId required', 400);
        const departments = await prisma.department.findMany({
            where: { projectId: String(projectId) },
            include: { persons: true },
        });
        res.json(departments);
    } catch (err) { next(err); }
});

// POST /api/budget/departments
router.post('/departments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            name: z.string().min(1),
            unionStatus: z.enum(['SAG_AFTRA', 'NON_UNION', 'TAFT_HARTLEY']).default('NON_UNION'),
        });
        const dept = await prisma.department.create({ data: Schema.parse(req.body) });
        res.status(201).json(dept);
    } catch (err) { next(err); }
});

export default router;
