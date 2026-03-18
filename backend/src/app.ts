import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';

// Routes
import projectsRouter from './routes/projects';
import phasesRouter from './routes/phases';
import personsRouter from './routes/persons';
import budgetRouter from './routes/budget';
import charactersRouter from './routes/characters';
import locationsRouter from './routes/locations';
import arcTemplatesRouter from './routes/arcTemplates';
import storyboardRouter from './routes/storyboard';
import colorPalettesRouter from './routes/colorPalettes';
import aiRouter from './routes/ai';
import uploadRouter from './routes/upload';
import sagRatesRouter from './routes/sagRates';

// Middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now to avoid PWA asset issues in dev
}));
app.use(cors({
    origin: (origin, callback) => {
        // Dynamically allow the requesting origin to support Vercel preview URLs and local dev
        callback(null, origin || true);
    },
    credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static PWA Assets ────────────────────────────────────────────────────────
// Serve manifest.json, sw.js, and icons
app.use(express.static(path.join(__dirname, '../public')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ─── Public Routes (no auth) ──────────────────────────────────────────────────
app.use('/api/sag-rates', sagRatesRouter);

// ─── Protected Routes (requires Clerk auth) ───────────────────────────────────
app.use('/api', authMiddleware);
app.use('/api/projects', projectsRouter);
app.use('/api/phases', phasesRouter);
app.use('/api/persons', personsRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/arc-templates', arcTemplatesRouter);
app.use('/api/storyboard', storyboardRouter);
app.use('/api/color-palettes', colorPalettesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/upload', uploadRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
