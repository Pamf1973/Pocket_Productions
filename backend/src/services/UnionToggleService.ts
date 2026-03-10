import { prisma } from '../lib/prisma';
import { UnionStatus } from '@prisma/client';
import { sagRateService } from './SagRateService';
import { budgetCalculationService } from './BudgetCalculationService';

export interface UnionToggleResult {
    departmentId: string;
    personsUpdated: number;
    previousBudgetTotal: number;
    newBudgetTotal: number;
    delta: number;
    belowMinimumWarnings: string[]; // person names flagged
}

export class UnionToggleService {
    /**
     * Preview the budget delta before committing a union status change.
     * Does NOT persist any changes.
     */
    async previewToggle(
        departmentId: string,
        newStatus: UnionStatus
    ): Promise<{ delta: number; personsAffected: number }> {
        const persons = await prisma.person.findMany({
            where: { departmentId },
            include: { project: { select: { sagAgreementTier: true } } },
        });

        let delta = 0;
        for (const person of persons) {
            const currentPhFringe =
                person.unionStatus === UnionStatus.NON_UNION
                    ? 0
                    : person.negotiatedRate * person.guaranteedUnits * (person.phFringePct / 100);

            let newPhFringePct = 0;
            if (newStatus !== UnionStatus.NON_UNION) {
                const rateTable = await sagRateService.getRateTable(
                    person.project.sagAgreementTier
                );
                newPhFringePct = rateTable?.phFringePctPrincipals ?? 21.0;
            }

            const newPhFringe =
                newStatus === UnionStatus.NON_UNION
                    ? 0
                    : person.negotiatedRate * person.guaranteedUnits * (newPhFringePct / 100);

            delta += newPhFringe - currentPhFringe;
        }

        return { delta, personsAffected: persons.length };
    }

    /**
     * Commits a union status toggle for an entire department.
     * Cascades to all persons: updates union status, P&H fringe, and below-minimum flags.
     * Triggers full budget recalculation.
     */
    async toggleDepartmentUnionStatus(
        departmentId: string,
        newStatus: UnionStatus,
        projectId: string
    ): Promise<UnionToggleResult> {
        // Capture current budget total for delta
        const currentSummary =
            await budgetCalculationService.getWaterfallSummary(projectId);

        const persons = await prisma.person.findMany({
            where: { departmentId },
        });

        const belowMinimumWarnings: string[] = [];

        // Update department status
        await prisma.department.update({
            where: { id: departmentId },
            data: { unionStatus: newStatus },
        });

        // Cascade to all persons in department
        for (const person of persons) {
            await prisma.person.update({
                where: { id: person.id },
                data: { unionStatus: newStatus },
            });

            // Re-fill P&H fringe
            await sagRateService.autoFillPhFringe(person.id);

            // Check below-minimum
            const isBelowMin = await sagRateService.checkBelowMinimum(person.id);
            if (isBelowMin) {
                belowMinimumWarnings.push(person.name);
            }
        }

        // Full budget recalc
        const newSummary =
            await budgetCalculationService.recalculateProject(projectId);

        return {
            departmentId,
            personsUpdated: persons.length,
            previousBudgetTotal: currentSummary.total,
            newBudgetTotal: newSummary.total,
            delta: newSummary.total - currentSummary.total,
            belowMinimumWarnings,
        };
    }
}

export const unionToggleService = new UnionToggleService();
