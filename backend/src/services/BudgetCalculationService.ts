import { prisma } from '../lib/prisma';
import { SagTier, UnionStatus } from '@prisma/client';

export interface WaterfallSummary {
    aboveTheLine: number;
    btlProduction: number;
    btlPost: number;
    otherDirect: number;
    subtotal: number;
    contingencyPct: number;
    contingencyAmount: number;
    total: number;
    contingencyStatus: 'green' | 'amber' | 'red';
    lineItems: Array<{
        id: string;
        description: string;
        category: string;
        lineTotal: number;
    }>;
}

export class BudgetCalculationService {
    /**
     * Recalculates a single person's BudgetLineItem.
     * lineTotal = base_pay + P&H fringe + meal penalties + per diem
     */
    async recalculatePersonLineItem(personId: string): Promise<void> {
        const person = await prisma.person.findUniqueOrThrow({
            where: { id: personId },
            include: {
                mealPenalties: true,
                perDiemEntries: true,
            },
        });

        const baseAmount = person.negotiatedRate * person.guaranteedUnits;
        const phFringeAmount =
            person.unionStatus === UnionStatus.NON_UNION
                ? 0
                : baseAmount * (person.phFringePct / 100);

        const mealPenaltiesTotal = person.mealPenalties.reduce(
            (sum, mp) => sum + mp.amount,
            0
        );
        const perDiemTotal = person.perDiemEntries.reduce(
            (sum, pd) => sum + pd.amount,
            0
        );

        const lineTotal = baseAmount + phFringeAmount + mealPenaltiesTotal + perDiemTotal;

        // Update the person's cached fringe amount
        await prisma.person.update({
            where: { id: personId },
            data: { phFringeAmount },
        });

        // Upsert the associated BudgetLineItem
        const existing = await prisma.budgetLineItem.findFirst({
            where: { personId },
        });

        if (existing) {
            await prisma.budgetLineItem.update({
                where: { id: existing.id },
                data: {
                    baseAmount,
                    phFringeAmount,
                    mealPenaltiesTotal,
                    perDiemTotal,
                    lineTotal,
                },
            });
        }
    }

    /**
     * Recalculates ALL budget line items for a project and returns the waterfall summary.
     */
    async recalculateProject(projectId: string): Promise<WaterfallSummary> {
        const project = await prisma.project.findUniqueOrThrow({
            where: { id: projectId },
            include: {
                persons: {
                    include: { mealPenalties: true, perDiemEntries: true },
                },
                locations: true,
                budgetLineItems: true,
            },
        });

        // Recalculate each person's line item
        for (const person of project.persons) {
            await this.recalculatePersonLineItem(person.id);
        }

        // Recalculate location-based line items
        for (const location of project.locations) {
            const locationTotal = location.dailyFee * location.shootDays;
            const existingLocationLine = await prisma.budgetLineItem.findFirst({
                where: { locationId: location.id },
            });
            if (existingLocationLine) {
                await prisma.budgetLineItem.update({
                    where: { id: existingLocationLine.id },
                    data: {
                        baseAmount: locationTotal,
                        lineTotal: locationTotal,
                    },
                });
            }
        }

        return this.getWaterfallSummary(projectId);
    }

    /**
     * Returns the full waterfall breakdown for a project.
     */
    async getWaterfallSummary(projectId: string): Promise<WaterfallSummary> {
        const project = await prisma.project.findUniqueOrThrow({
            where: { id: projectId },
        });

        const lineItems = await prisma.budgetLineItem.findMany({
            where: { projectId },
        });

        const sum = (category: string) =>
            lineItems
                .filter((li) => li.category === category)
                .reduce((acc, li) => acc + li.lineTotal, 0);

        const aboveTheLine = sum('ABOVE_THE_LINE');
        const btlProduction = sum('BTL_PRODUCTION');
        const btlPost = sum('BTL_POST');
        const otherDirect = sum('OTHER_DIRECT');
        const subtotal = aboveTheLine + btlProduction + btlPost + otherDirect;

        const contingencyPct = project.contingencyPct;
        const contingencyAmount = subtotal * (contingencyPct / 100);
        const total = subtotal + contingencyAmount;

        // Determine contingency alert status
        const consumedRatio = subtotal / (project.totalBudget - contingencyAmount);
        let contingencyStatus: 'green' | 'amber' | 'red' = 'green';
        if (consumedRatio >= 1.0) contingencyStatus = 'red';
        else if (consumedRatio >= 0.8) contingencyStatus = 'amber';

        return {
            aboveTheLine,
            btlProduction,
            btlPost,
            otherDirect,
            subtotal,
            contingencyPct,
            contingencyAmount,
            total,
            contingencyStatus,
            lineItems: lineItems.map((li) => ({
                id: li.id,
                description: li.description,
                category: li.category,
                lineTotal: li.lineTotal,
            })),
        };
    }
}

export const budgetCalculationService = new BudgetCalculationService();
