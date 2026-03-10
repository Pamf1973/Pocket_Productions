import { Router, Request, Response, NextFunction } from 'express';
import { sagRateService } from '../services/SagRateService';

const router = Router();

// GET /api/sag-rates — all rate tables (public, no auth required)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const rates = await sagRateService.getAllRateTables();
        res.json(rates);
    } catch (err) { next(err); }
});

// GET /api/sag-rates/non-union-benchmarks — market rate reference
router.get('/non-union-benchmarks', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const { prisma } = await import('../lib/prisma');
        const benchmarks = await prisma.nonUnionRateBenchmark.findMany({
            orderBy: { roleCategory: 'asc' },
        });
        res.json(benchmarks);
    } catch (err) { next(err); }
});

export default router;
