import { PrismaClient, SagTier, ArcTemplateType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // ─── SAG-AFTRA Rate Tables (July 2025 – June 2026) ──────────────────────────
    console.log('📋 Seeding SAG-AFTRA rate tables...');

    const sagRates = [
        {
            tier: SagTier.BASIC_THEATRICAL,
            budgetMin: 2_000_001,
            budgetMax: null,
            dayRateMin: 1246,
            weeklyRateMin: 4326,
            phFringePctPrincipals: 21.0,
            phFringePctBackground: 20.5,
            mealPenalty1: 25,
            mealPenalty2: 35,
            mealPenaltyEach: 50,
            perDiemAmount: 70,
            weekendMultiplier: 2.0,
            otMultiplier1: 1.5,
            otMultiplier2: 2.0,
            effectiveFrom: new Date('2025-07-01'),
            effectiveTo: new Date('2026-06-30'),
        },
        {
            tier: SagTier.LOW_BUDGET,
            budgetMin: 700_000,
            budgetMax: 2_000_000,
            dayRateMin: 810,
            weeklyRateMin: 2812,
            phFringePctPrincipals: 21.0,
            phFringePctBackground: 20.5,
            mealPenalty1: 25,
            mealPenalty2: 35,
            mealPenaltyEach: 50,
            perDiemAmount: 70,
            weekendMultiplier: 2.0,
            otMultiplier1: 1.5,
            otMultiplier2: 2.0,
            effectiveFrom: new Date('2025-07-01'),
            effectiveTo: new Date('2026-06-30'),
        },
        {
            tier: SagTier.MODERATE_LOW_BUDGET,
            budgetMin: 300_000,
            budgetMax: 699_999,
            dayRateMin: 436,
            weeklyRateMin: 1514,
            phFringePctPrincipals: 21.0,
            phFringePctBackground: 20.5,
            mealPenalty1: 25,
            mealPenalty2: 35,
            mealPenaltyEach: 50,
            perDiemAmount: 70,
            weekendMultiplier: 2.0,
            otMultiplier1: 1.5,
            otMultiplier2: 2.0,
            effectiveFrom: new Date('2025-07-01'),
            effectiveTo: new Date('2026-06-30'),
        },
        {
            tier: SagTier.ULTRA_LOW,
            budgetMin: null,
            budgetMax: 299_999,
            dayRateMin: 249,
            weeklyRateMin: null,
            phFringePctPrincipals: 21.0,
            phFringePctBackground: 20.5,
            mealPenalty1: 25,
            mealPenalty2: 35,
            mealPenaltyEach: 50,
            perDiemAmount: 70,
            weekendMultiplier: 2.0,
            otMultiplier1: 1.5,
            otMultiplier2: 2.0,
            effectiveFrom: new Date('2025-07-01'),
            effectiveTo: new Date('2026-06-30'),
        },
    ];

    for (const rate of sagRates) {
        await prisma.sagRateTable.upsert({
            where: { tier: rate.tier },
            update: rate,
            create: rate,
        });
    }
    console.log(`  ✓ ${sagRates.length} SAG rate tiers seeded`);

    // ─── Non-Union Rate Benchmarks (NYC Market) ───────────────────────────────
    console.log('📋 Seeding non-union rate benchmarks...');

    const benchmarks = [
        { roleCategory: 'Lead / Principal Actor', dayRateMin: 300, dayRateMax: 600, weeklyRateMin: 1200, weeklyRateMax: 2500, notes: 'No P&H fringe' },
        { roleCategory: 'Supporting Actor', dayRateMin: 150, dayRateMax: 300, weeklyRateMin: 600, weeklyRateMax: 1200, notes: 'No P&H fringe' },
        { roleCategory: 'DP / Cinematographer', dayRateMin: 1000, dayRateMax: 1800, weeklyRateMin: 4000, weeklyRateMax: 7000, notes: 'Highly negotiable; often brings kit' },
        { roleCategory: '1st AC', dayRateMin: 325, dayRateMax: 550, weeklyRateMin: 1300, weeklyRateMax: 2200, notes: null },
        { roleCategory: '2nd AC', dayRateMin: 320, dayRateMax: 420, weeklyRateMin: 1280, weeklyRateMax: 1680, notes: null },
        { roleCategory: 'Production Coordinator', dayRateMin: 325, dayRateMax: 440, weeklyRateMin: 1300, weeklyRateMax: 1760, notes: null },
        { roleCategory: 'Set PA', dayRateMin: 100, dayRateMax: 200, weeklyRateMin: 500, weeklyRateMax: 1000, notes: null },
        { roleCategory: 'Gaffer', dayRateMin: 400, dayRateMax: 700, weeklyRateMin: 1600, weeklyRateMax: 2800, notes: null },
        { roleCategory: 'Key Grip', dayRateMin: 400, dayRateMax: 700, weeklyRateMin: 1600, weeklyRateMax: 2800, notes: null },
        { roleCategory: 'Production Sound Mixer', dayRateMin: 500, dayRateMax: 900, weeklyRateMin: 2000, weeklyRateMax: 3600, notes: 'Often brings sound package' },
    ];

    for (const b of benchmarks) {
        await prisma.nonUnionRateBenchmark.upsert({
            where: { id: `benchmark-${b.roleCategory.replace(/[^a-z0-9]/gi, '-').toLowerCase()}` },
            update: b,
            create: { id: `benchmark-${b.roleCategory.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`, ...b },
        });
    }
    console.log(`  ✓ ${benchmarks.length} non-union rate benchmarks seeded`);

    // ─── Arc Templates ────────────────────────────────────────────────────────
    console.log('🎭 Seeding arc templates...');

    const arcTemplates = [
        {
            type: ArcTemplateType.HEROS_JOURNEY,
            name: "Hero's Journey",
            description: 'Campbell\'s monomyth — 12 stages from ordinary world to return with the elixir',
            stages: [
                { name: 'Ordinary World', description: 'Hero\'s normal life before the adventure', typicalPositionPct: 5 },
                { name: 'Call to Adventure', description: 'The inciting incident disrupts the ordinary world', typicalPositionPct: 12 },
                { name: 'Refusal of the Call', description: 'Hero hesitates or refuses', typicalPositionPct: 18 },
                { name: 'Meeting the Mentor', description: 'Hero encounters a guide', typicalPositionPct: 22 },
                { name: 'Crossing the Threshold', description: 'Hero commits to the journey', typicalPositionPct: 25 },
                { name: 'Tests, Allies, Enemies', description: 'Hero faces challenges', typicalPositionPct: 40 },
                { name: 'Approach the Inmost Cave', description: 'Preparation for the ordeal', typicalPositionPct: 55 },
                { name: 'The Ordeal', description: 'Major crisis — near death moment', typicalPositionPct: 65 },
                { name: 'Reward', description: 'Hero seizes the sword', typicalPositionPct: 75 },
                { name: 'The Road Back', description: 'Hero begins the journey home', typicalPositionPct: 82 },
                { name: 'Resurrection', description: 'Final test — hero is transformed', typicalPositionPct: 90 },
                { name: 'Return with Elixir', description: 'Hero returns transformed with a gift for the world', typicalPositionPct: 99 },
            ],
        },
        {
            type: ArcTemplateType.SAVE_THE_CAT,
            name: 'Save the Cat',
            description: "Blake Snyder's 15-beat sheet for commercial screenplays",
            stages: [
                { name: 'Opening Image', description: 'Snapshot of the hero\'s problem', typicalPositionPct: 1 },
                { name: 'Theme Stated', description: 'What the story is about thematically', typicalPositionPct: 5 },
                { name: 'Set-Up', description: 'Introduce the world and stakes', typicalPositionPct: 10 },
                { name: 'Catalyst', description: 'Life-changing event', typicalPositionPct: 12 },
                { name: 'Debate', description: 'Hero questions the change', typicalPositionPct: 20 },
                { name: 'Break into Two', description: 'Hero enters a new world', typicalPositionPct: 25 },
                { name: 'B Story', description: 'New character introduces the theme', typicalPositionPct: 30 },
                { name: 'Fun and Games', description: 'Promise of the premise', typicalPositionPct: 45 },
                { name: 'Midpoint', description: 'False peak or false defeat', typicalPositionPct: 50 },
                { name: 'Bad Guys Close In', description: 'Stakes escalate', typicalPositionPct: 62 },
                { name: 'All is Lost', description: 'Worst moment — defeat', typicalPositionPct: 75 },
                { name: 'Dark Night of the Soul', description: 'Hero reflects', typicalPositionPct: 80 },
                { name: 'Break into Three', description: 'Solution is found', typicalPositionPct: 85 },
                { name: 'Finale', description: 'Hero executes the plan', typicalPositionPct: 92 },
                { name: 'Final Image', description: 'Mirror of the opening — world transformed', typicalPositionPct: 99 },
            ],
        },
        {
            type: ArcTemplateType.THREE_ACT,
            name: 'Three-Act Structure',
            description: 'Classical dramatic structure: setup, confrontation, resolution',
            stages: [
                { name: 'Act I — Setup', description: 'Establish world, character, and inciting incident', typicalPositionPct: 0 },
                { name: 'Plot Point 1', description: 'End of Act I — hero commits to the journey', typicalPositionPct: 25 },
                { name: 'Act II — Confrontation', description: 'Rising action, complications, midpoint reversal', typicalPositionPct: 25 },
                { name: 'Midpoint', description: 'Major reversal or revelation', typicalPositionPct: 50 },
                { name: 'Plot Point 2', description: 'End of Act II — all is lost moment', typicalPositionPct: 75 },
                { name: 'Act III — Resolution', description: 'Climax and denouement', typicalPositionPct: 75 },
                { name: 'Climax', description: 'Final confrontation', typicalPositionPct: 90 },
                { name: 'Resolution', description: 'New equilibrium', typicalPositionPct: 99 },
            ],
        },
        {
            type: ArcTemplateType.FREYTAGS_PYRAMID,
            name: "Freytag's Pyramid",
            description: 'Gustav Freytag\'s dramatic structure for tragedy and comedy',
            stages: [
                { name: 'Exposition', description: 'Background, setting, characters introduced', typicalPositionPct: 10 },
                { name: 'Rising Action', description: 'Conflict develops', typicalPositionPct: 30 },
                { name: 'Climax', description: 'Turning point — highest tension', typicalPositionPct: 50 },
                { name: 'Falling Action', description: 'Events triggered by climax unfold', typicalPositionPct: 70 },
                { name: 'Denouement', description: 'Resolution — conflict resolved', typicalPositionPct: 95 },
            ],
        },
        {
            type: ArcTemplateType.SHAKESPEAREAN_FIVE_ACT,
            name: 'Shakespearean Five-Act',
            description: 'Five-act dramatic structure used in Shakespeare\'s tragedies and comedies',
            stages: [
                { name: 'Act I — Exposition', description: 'Characters and conflict introduced', typicalPositionPct: 10 },
                { name: 'Act II — Rising Action', description: 'Complication and development', typicalPositionPct: 30 },
                { name: 'Act III — Climax', description: 'Dramatic turning point', typicalPositionPct: 50 },
                { name: 'Act IV — Falling Action', description: 'Consequences of the climax', typicalPositionPct: 70 },
                { name: 'Act V — Catastrophe/Resolution', description: 'Final outcome', typicalPositionPct: 95 },
            ],
        },
    ];

    for (const template of arcTemplates) {
        await prisma.arcTemplate.upsert({
            where: { type: template.type },
            update: { name: template.name, description: template.description, stages: template.stages },
            create: template,
        });
    }
    console.log(`  ✓ ${arcTemplates.length} arc templates seeded`);

    // ─── Demo Project: The Long Goodbye ──────────────────────────────────────
    console.log('🎬 Seeding demo project: The Long Goodbye...');

    const demo = await prisma.project.upsert({
        where: { id: 'demo-the-long-goodbye' },
        update: {},
        create: {
            id: 'demo-the-long-goodbye',
            clerkUserId: 'dev-user-bypass',
            title: 'The Long Goodbye',
            format: 'Feature Film',
            genre: 'Neo-Noir',
            year: 2025,
            totalBudget: 1_245_000,
            sagAgreementTier: SagTier.LOW_BUDGET,
            distributionType: 'THEATRICAL',
            contingencyPct: 10,
            logline: 'A washed-up private detective in present-day NYC is hired to find a missing woman, only to uncover a conspiracy that implicates his closest allies.',
            isDemo: true,
        },
    });

    // Departments
    const deptCast = await prisma.department.upsert({
        where: { id: 'demo-dept-cast' },
        update: {},
        create: { id: 'demo-dept-cast', projectId: demo.id, name: 'Cast', unionStatus: 'SAG_AFTRA' },
    });
    const deptCamera = await prisma.department.upsert({
        where: { id: 'demo-dept-camera' },
        update: {},
        create: { id: 'demo-dept-camera', projectId: demo.id, name: 'Camera', unionStatus: 'NON_UNION' },
    });

    // Persons (cast)
    const personVera = await prisma.person.upsert({
        where: { id: 'demo-person-vera' },
        update: {},
        create: {
            id: 'demo-person-vera',
            projectId: demo.id,
            departmentId: deptCast.id,
            name: 'Sarah Chen',
            role: 'Lead Actor — Vera Lane',
            unionStatus: 'SAG_AFTRA',
            contractType: 'WEEKLY_GUARANTEED',
            negotiatedRate: 810,
            guaranteedUnits: 22,
            rateUnit: 'DAY',
            phFringePct: 21.0,
            phFringeAmount: 810 * 22 * 0.21,
            belowSagMinimum: false,
        },
    });

    const personMarcus = await prisma.person.upsert({
        where: { id: 'demo-person-marcus' },
        update: {},
        create: {
            id: 'demo-person-marcus',
            projectId: demo.id,
            departmentId: deptCast.id,
            name: 'David Osei',
            role: 'Supporting Actor — Marcus Cole',
            unionStatus: 'SAG_AFTRA',
            contractType: 'DAY_PLAYER',
            negotiatedRate: 810,
            guaranteedUnits: 15,
            rateUnit: 'DAY',
            phFringePct: 21.0,
            phFringeAmount: 810 * 15 * 0.21,
            belowSagMinimum: false,
        },
    });

    const personDP = await prisma.person.upsert({
        where: { id: 'demo-person-dp' },
        update: {},
        create: {
            id: 'demo-person-dp',
            projectId: demo.id,
            departmentId: deptCamera.id,
            name: 'Mia Torres',
            role: 'Director of Photography',
            unionStatus: 'NON_UNION',
            contractType: 'WEEKLY',
            negotiatedRate: 1400,
            guaranteedUnits: 6,
            rateUnit: 'WEEK',
            phFringePct: 0,
            phFringeAmount: 0,
            belowSagMinimum: false,
        },
    });

    // Characters
    await prisma.character.upsert({
        where: { id: 'demo-char-vera' },
        update: {},
        create: {
            id: 'demo-char-vera',
            projectId: demo.id,
            personId: personVera.id,
            name: 'Vera Lane',
            archetype: 'HERO',
            logline: 'A disgraced homicide detective turned PI who must reconcile her past to solve an impossible case.',
            want: 'To find the missing woman and clear her name',
            need: 'To accept that she cannot save everyone',
            flaw: 'Obsessive control — cannot delegate or trust others',
            wound: 'Lost her partner due to her own mistake three years ago',
            ghost: 'The night her partner died still plays on loop in her mind',
            arcPct: 0,
            colorHex: '#e11d48',
        },
    });

    await prisma.character.upsert({
        where: { id: 'demo-char-marcus' },
        update: {},
        create: {
            id: 'demo-char-marcus',
            projectId: demo.id,
            personId: personMarcus.id,
            name: 'Marcus Cole',
            archetype: 'SHADOW',
            logline: 'A charming fixer who operates in the gray zones of the city — Vera\'s greatest obstacle and mirror.',
            want: 'To protect his empire and those loyal to him',
            need: 'To acknowledge the human cost of his ambition',
            flaw: 'Rationalizes moral compromise as pragmatism',
            wound: 'Grew up watching his community fail from systemic neglect',
            ghost: 'The face of the first person he had to betray to survive',
            arcPct: 0,
            colorHex: '#7c3aed',
        },
    });

    await prisma.character.upsert({
        where: { id: 'demo-char-elaine' },
        update: {},
        create: {
            id: 'demo-char-elaine',
            projectId: demo.id,
            name: 'Dr. Elaine Marsh',
            archetype: 'MENTOR',
            logline: 'Vera\'s former therapist who holds a key piece of the puzzle she doesn\'t know she has.',
            want: 'To protect her patient\'s confidentiality',
            need: 'To do the right thing even at personal cost',
            flaw: 'Hides behind professional distance to avoid emotional risk',
            wound: 'Lost her own daughter to an unsolved disappearance',
            ghost: 'The case file she closed too soon',
            arcPct: 0,
            colorHex: '#0891b2',
        },
    });

    await prisma.character.upsert({
        where: { id: 'demo-char-parish' },
        update: {},
        create: {
            id: 'demo-char-parish',
            projectId: demo.id,
            name: 'Parish',
            archetype: 'TRICKSTER',
            logline: 'A street-level information broker who sells everyone\'s secrets — including his own.',
            want: 'To stay alive and unaffiliated',
            need: 'A cause worth risking his life for',
            flaw: 'Loyalty is always for sale',
            wound: 'Betrayed by someone he believed in as a young man',
            ghost: 'The mentor who turned out to be the villain',
            arcPct: 0,
            colorHex: '#d97706',
        },
    });

    // Locations
    await prisma.location.upsert({
        where: { id: 'demo-loc-meatpacking' },
        update: {},
        create: {
            id: 'demo-loc-meatpacking',
            projectId: demo.id,
            name: 'Meatpacking District Loft',
            address: 'Gansevoort St, Meatpacking District, New York, NY 10014',
            lat: 40.7399,
            lng: -74.0060,
            permitStatus: 'PERMITTED',
            dailyFee: 3500,
            shootDays: 8,
            description: "Vera's office — exposed brick, low light, city views. Primary detective story location.",
        },
    });

    await prisma.location.upsert({
        where: { id: 'demo-loc-rooftop' },
        update: {},
        create: {
            id: 'demo-loc-rooftop',
            projectId: demo.id,
            name: 'Rooftop 14th & 9th Ave',
            address: '14th St & 9th Ave, New York, NY 10011',
            lat: 40.7415,
            lng: -74.0064,
            permitStatus: 'SCOUTING',
            dailyFee: 2000,
            shootDays: 3,
            description: 'Night confrontation scenes — panoramic NYC backdrop.',
        },
    });

    await prisma.location.upsert({
        where: { id: 'demo-loc-warehouse' },
        update: {},
        create: {
            id: 'demo-loc-warehouse',
            projectId: demo.id,
            name: 'Abandoned Warehouse — Red Hook',
            address: 'Van Dyke St, Red Hook, Brooklyn, NY 11231',
            lat: 40.6753,
            lng: -74.0126,
            permitStatus: 'NEGOTIATING',
            dailyFee: 1500,
            shootDays: 4,
            description: 'Act 3 climax location — raw industrial space.',
        },
    });

    await prisma.location.upsert({
        where: { id: 'demo-loc-precinct' },
        update: {},
        create: {
            id: 'demo-loc-precinct',
            projectId: demo.id,
            name: 'Police Precinct Lobby',
            address: '230 E 21st St, New York, NY 10010',
            lat: 40.7378,
            lng: -73.9804,
            permitStatus: 'PERMITTED',
            dailyFee: 4500,
            shootDays: 2,
            description: 'Vera\'s former precinct — flashback and confrontation scenes.',
        },
    });

    // Arc beats (Save the Cat template)
    const beatTemplate = await prisma.arcTemplate.findUnique({ where: { type: ArcTemplateType.SAVE_THE_CAT } });

    const arcBeats = [
        { name: 'Opening Image', positionPct: 1, description: 'Vera alone in her rain-soaked office, staring at an old case photo. She\'s barely surviving.' },
        { name: 'Catalyst', positionPct: 12, description: 'A well-dressed stranger hires Vera to find his missing wife — the same woman Vera once testified against.' },
        { name: 'Break Into 2', positionPct: 25, description: 'Vera accepts the case, knowing it means going back into the world she escaped.' },
        { name: 'Midpoint', positionPct: 50, description: 'Vera discovers the missing woman faked her disappearance — and left clues meant specifically for Vera.' },
        { name: 'All Is Lost', positionPct: 75, description: 'Marcus exposes Vera\'s past mistake — her credibility destroyed, the case collapses.' },
        { name: 'Finale', positionPct: 90, description: 'Vera confronts Marcus and the client in the warehouse, choosing truth over self-preservation.' },
        { name: 'Final Image', positionPct: 99, description: 'Vera back in her office — same rain, but she opens the window for the first time.' },
    ];

    for (let i = 0; i < arcBeats.length; i++) {
        const beat = arcBeats[i];
        await prisma.arcBeat.upsert({
            where: { id: `demo-beat-${i}` },
            update: {},
            create: {
                id: `demo-beat-${i}`,
                projectId: demo.id,
                arcTemplateId: beatTemplate?.id,
                ...beat,
                order: i,
            },
        });
    }

    // Phases (Gantt)
    const phases = [
        {
            id: 'demo-phase-dev', type: 'DEVELOPMENT' as const, name: 'Development', shootDays: 0, color: '#6366f1', order: 0,
            startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31')
        },
        {
            id: 'demo-phase-pre', type: 'PRE_PRODUCTION' as const, name: 'Pre-Production', shootDays: 0, color: '#0891b2', order: 1,
            startDate: new Date('2025-04-01'), endDate: new Date('2025-06-15')
        },
        {
            id: 'demo-phase-prod1', type: 'PRODUCTION' as const, name: 'Principal Photography — Block 1', shootDays: 12, color: '#e11d48', order: 2,
            startDate: new Date('2025-07-01'), endDate: new Date('2025-07-31')
        },
        {
            id: 'demo-phase-prod2', type: 'PRODUCTION' as const, name: 'Principal Photography — Block 2', shootDays: 10, color: '#e11d48', order: 3,
            startDate: new Date('2025-08-01'), endDate: new Date('2025-08-28')
        },
        {
            id: 'demo-phase-post', type: 'POST_PRODUCTION' as const, name: 'Post Production', shootDays: 0, color: '#7c3aed', order: 4,
            startDate: new Date('2025-09-01'), endDate: new Date('2025-11-30')
        },
        {
            id: 'demo-phase-delivery', type: 'DELIVERY' as const, name: 'Delivery & Festival Prep', shootDays: 0, color: '#d97706', order: 5,
            startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31')
        },
    ];

    for (const phase of phases) {
        await prisma.phase.upsert({
            where: { id: phase.id },
            update: {},
            create: { ...phase, projectId: demo.id },
        });
    }

    // Color Palette
    await prisma.colorPalette.upsert({
        where: { id: 'demo-palette-production' },
        update: {},
        create: {
            id: 'demo-palette-production',
            projectId: demo.id,
            name: 'Production Color Code',
            swatches: [
                { hex: '#e11d48', emotion: 'urgency, danger', productionCode: 'RED', label: 'Lead' },
                { hex: '#2563eb', emotion: 'calm, authority', productionCode: 'BLUE', label: '2nd Lead' },
                { hex: '#16a34a', emotion: 'support, growth', productionCode: 'GREEN', label: 'Supporting' },
                { hex: '#ca8a04', emotion: 'caution, WIP', productionCode: 'YELLOW', label: 'In Progress' },
                { hex: '#7c3aed', emotion: 'mystery, digital', productionCode: 'PURPLE', label: 'VFX' },
                { hex: '#db2777', emotion: 'critical path', productionCode: 'PINK', label: 'Critical' },
            ],
        },
    });

    // Budget line items for demo project
    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-vera' },
        update: {},
        create: {
            id: 'demo-line-vera',
            projectId: demo.id,
            personId: personVera.id,
            category: 'ABOVE_THE_LINE',
            description: 'Sarah Chen — Lead Actor (Vera Lane) — 22 days SAG Low Budget',
            baseAmount: 810 * 22,
            phFringeAmount: 810 * 22 * 0.21,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 810 * 22 * 1.21,
        },
    });

    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-marcus' },
        update: {},
        create: {
            id: 'demo-line-marcus',
            projectId: demo.id,
            personId: personMarcus.id,
            category: 'ABOVE_THE_LINE',
            description: 'David Osei — Supporting Actor (Marcus Cole) — 15 days SAG Low Budget',
            baseAmount: 810 * 15,
            phFringeAmount: 810 * 15 * 0.21,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 810 * 15 * 1.21,
        },
    });

    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-dp' },
        update: {},
        create: {
            id: 'demo-line-dp',
            projectId: demo.id,
            personId: personDP.id,
            category: 'BTL_PRODUCTION',
            description: 'Mia Torres — DP — 6 weeks non-union',
            baseAmount: 1400 * 6,
            phFringeAmount: 0,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 1400 * 6,
        },
    });

    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-meatpacking' },
        update: {},
        create: {
            id: 'demo-line-meatpacking',
            projectId: demo.id,
            locationId: 'demo-loc-meatpacking',
            category: 'BTL_PRODUCTION',
            description: 'Location fee — Meatpacking District Loft — 8 days',
            baseAmount: 3500 * 8,
            phFringeAmount: 0,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 3500 * 8,
        },
    });

    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-post' },
        update: {},
        create: {
            id: 'demo-line-post',
            projectId: demo.id,
            category: 'BTL_POST',
            description: 'Editorial, Color Grade, Sound Design (flat)',
            baseAmount: 85_000,
            phFringeAmount: 0,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 85_000,
        },
    });

    await prisma.budgetLineItem.upsert({
        where: { id: 'demo-line-insurance' },
        update: {},
        create: {
            id: 'demo-line-insurance',
            projectId: demo.id,
            category: 'OTHER_DIRECT',
            description: 'E&O Insurance + Production Insurance (est. 2.5%)',
            baseAmount: 1_245_000 * 0.025,
            phFringeAmount: 0,
            mealPenaltiesTotal: 0,
            perDiemTotal: 0,
            lineTotal: 1_245_000 * 0.025,
        },
    });

    console.log('  ✓ Demo project "The Long Goodbye" seeded');
    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
