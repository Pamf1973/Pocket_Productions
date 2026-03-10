import { prisma } from '../lib/prisma';
import { SagTier, UnionStatus, DistributionType } from '@prisma/client';

export class SagRateService {
    /**
     * Resolves the correct SAG agreement tier from a project's total budget.
     * Tier boundaries per the PRD (July 2025–June 2026).
     */
    resolveAgreementTier(
        totalBudget: number,
        _distributionType?: DistributionType
    ): SagTier {
        if (totalBudget > 2_000_000) return SagTier.BASIC_THEATRICAL;
        if (totalBudget >= 700_000) return SagTier.LOW_BUDGET;
        if (totalBudget >= 300_000) return SagTier.MODERATE_LOW_BUDGET;
        return SagTier.ULTRA_LOW;
    }

    /**
     * Fetches the SagRateTable row for a given tier.
     */
    async getRateTable(tier: SagTier) {
        return prisma.sagRateTable.findUnique({ where: { tier } });
    }

    /**
     * Checks if a person's negotiated rate is below the SAG minimum for their project's tier.
     * Sets person.belowSagMinimum flag accordingly.
     */
    async checkBelowMinimum(personId: string): Promise<boolean> {
        const person = await prisma.person.findUniqueOrThrow({
            where: { id: personId },
            include: { project: true },
        });

        if (person.unionStatus === UnionStatus.NON_UNION) {
            // Non-union: no minimum. Clear flag if previously set.
            if (person.belowSagMinimum) {
                await prisma.person.update({
                    where: { id: personId },
                    data: { belowSagMinimum: false },
                });
            }
            return false;
        }

        const rateTable = await this.getRateTable(person.project.sagAgreementTier);
        if (!rateTable) return false;

        const minimum =
            person.rateUnit === 'WEEK'
                ? rateTable.weeklyRateMin ?? rateTable.dayRateMin * 5
                : rateTable.dayRateMin;

        const isBelowMinimum = person.negotiatedRate < minimum;

        await prisma.person.update({
            where: { id: personId },
            data: { belowSagMinimum: isBelowMinimum },
        });

        return isBelowMinimum;
    }

    /**
     * Auto-fills P&H fringe percentage on a person record from the SAG rate table.
     * Background performers get 20.5%, principals get 21%.
     */
    async autoFillPhFringe(
        personId: string,
        isBackground = false
    ): Promise<void> {
        const person = await prisma.person.findUniqueOrThrow({
            where: { id: personId },
            include: { project: true },
        });

        if (person.unionStatus === UnionStatus.NON_UNION) {
            await prisma.person.update({
                where: { id: personId },
                data: { phFringePct: 0 },
            });
            return;
        }

        const rateTable = await this.getRateTable(person.project.sagAgreementTier);
        const phPct = isBackground
            ? (rateTable?.phFringePctBackground ?? 20.5)
            : (rateTable?.phFringePctPrincipals ?? 21.0);

        await prisma.person.update({
            where: { id: personId },
            data: { phFringePct: phPct },
        });
    }

    /**
     * Updates the project's SAG agreement tier whenever totalBudget changes.
     */
    async updateProjectTier(projectId: string): Promise<SagTier> {
        const project = await prisma.project.findUniqueOrThrow({
            where: { id: projectId },
        });

        const newTier = this.resolveAgreementTier(
            project.totalBudget,
            project.distributionType
        );

        if (newTier !== project.sagAgreementTier) {
            await prisma.project.update({
                where: { id: projectId },
                data: { sagAgreementTier: newTier },
            });
        }

        return newTier;
    }

    /**
     * Returns all SAG rate tables (reference data for frontend display).
     */
    async getAllRateTables() {
        return prisma.sagRateTable.findMany({
            orderBy: { budgetMin: 'asc' },
        });
    }
}

export const sagRateService = new SagRateService();
