import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Extends Express Request to include authenticated user context
 */
declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                sessionId?: string;
            };
        }
    }
}

/**
 * Clerk authentication middleware.
 * If BYPASS_AUTH=true (dev mode), attaches a dummy userId so all endpoints work without Clerk.
 * In production, verifies the Bearer token via Clerk.
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // ── Dev bypass ────────────────────────────────────────────────────────────
    if (env.BYPASS_AUTH) {
        req.auth = { userId: 'dev-user-bypass' };
        return next();
    }

    // ── Clerk verification ────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    try {
        // Dynamic import so the app still starts without CLERK_SECRET_KEY in dev
        const token = authHeader.split(' ')[1];

        // In @clerk/express, verifyToken is available on the client returned by createClerkClient? 
        // Wait, the error is "Property 'verifyToken' does not exist on type 'ClerkClient'". 
        // In newer Clerk SDKs it's accessed via `clerkClient.authenticateRequest` or `clerkClient.verifyToken` is exported statically. Let's just use `clerkClient.authenticateRequest`. If that doesn't work, we can fallback to standard JWT decode.
        // Actually, `verifyToken` is exported directly from '@clerk/backend'. Let's do a dynamic import of it.
        const { verifyToken } = await import('@clerk/backend');
        const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });

        req.auth = { userId: payload.sub };
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
