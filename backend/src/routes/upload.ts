import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { s3Service } from '../services/S3Service';
import { createError } from '../middleware/errorHandler';

const router = Router();

// POST /api/upload/presigned — get a presigned S3 upload URL
router.post('/presigned', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Schema = z.object({
            projectId: z.string(),
            filename: z.string().min(1),
            contentType: z.string().min(1),
            type: z.enum(['storyboard', 'location', 'document']).default('location'),
        });
        const { projectId, filename, contentType, type } = Schema.parse(req.body);

        const key = s3Service.generateKey(projectId, type, filename);
        const urls = await s3Service.getPresignedUploadUrl(key, contentType);

        res.json({ key, ...urls });
    } catch (err) { next(err); }
});

// DELETE /api/upload/:key — delete an S3 object
router.delete('/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await s3Service.deleteObject(String(req.params.key));
        res.status(204).send();
    } catch (err) { next(err); }
});

export default router;
