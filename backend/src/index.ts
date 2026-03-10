import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT;

async function main() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🎬 Pocket Productions API running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${env.NODE_ENV}`);
            console.log(`🔐 Auth bypass: ${env.BYPASS_AUTH ? 'ENABLED (dev mode)' : 'disabled'}`);
            console.log(`🤖 Claude AI: ${env.ANTHROPIC_API_KEY ? 'configured' : 'NOT configured'}`);
            console.log(`☁️  AWS S3: ${env.AWS_ACCESS_KEY_ID ? 'configured' : 'NOT configured'}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
