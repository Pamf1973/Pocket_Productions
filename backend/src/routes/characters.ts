import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const router = Router();

const CreateCharacterSchema = z.object({
    projectId: z.string(),
    personId: z.string().optional(),
    name: z.string().min(1),
    archetype: z.enum(['HERO', 'SHADOW', 'MENTOR', 'TRICKSTER', 'HERALD', 'SHAPESHIFTER', 'GUARDIAN', 'ALLY']).optional(),
    logline: z.string().optional(),
    backstory: z.string().optional(),
    want: z.string().optional(),
    need: z.string().optional(),
    flaw: z.string().optional(),
    wound: z.string().optional(),
    ghost: z.string().optional(),
    arcPct: z.number().min(0).max(100).default(0),
    colorHex: z.string().default('#6366f1'),
    notes: z.string().optional(),
});

// GET /api/characters?projectId=xxx
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const characters = await prisma.character.findMany({
            where: req.query.projectId ? { projectId: String(req.query.projectId) } : {},
            include: {
                person: true,
                relationshipsFrom: { include: { toCharacter: true } },
                relationshipsTo: { include: { fromCharacter: true } },
            },
            orderBy: { name: 'asc' },
        });
        res.json(characters);
    } catch (err) { next(err); }
});

// GET /api/characters/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const character = await prisma.character.findUnique({
            where: { id: String(req.params.id) },
            include: {
                person: true,
                relationshipsFrom: { include: { toCharacter: true } },
                relationshipsTo: { include: { fromCharacter: true } },
            },
        });
        if (!character) throw createError('Character not found', 404);
        res.json(character);
    } catch (err) { next(err); }
});

// POST /api/characters
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreateCharacterSchema.parse(req.body);
        const character = await prisma.character.create({ data });
        res.status(201).json(character);
    } catch (err) { next(err); }
});

// PATCH /api/characters/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = CreateCharacterSchema.omit({ projectId: true }).partial().parse(req.body);
        const character = await prisma.character.update({ where: { id: String(req.params.id) }, data });
        res.json(character);
    } catch (err) { next(err); }
});

// DELETE /api/characters/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.character.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

// POST /api/characters/relationships — create relationship between characters
router.post('/relationships', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            fromCharacterId: z.string(),
            toCharacterId: z.string(),
            relationshipType: z.enum(['FRIEND', 'ENEMY', 'LOVER', 'MENTOR', 'RIVAL', 'FAMILY', 'COLLEAGUE', 'NEUTRAL']),
            description: z.string().optional(),
            strength: z.number().int().min(1).max(10).default(5),
        });
        const rel = await prisma.characterRelationship.create({ data: Schema.parse(req.body) });
        res.status(201).json(rel);
    } catch (err) { next(err); }
});

// DELETE /api/characters/relationships/:id
router.delete('/relationships/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.characterRelationship.delete({ where: { id: String(req.params.id) } });
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;
