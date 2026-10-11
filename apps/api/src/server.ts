import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma, checkDatabaseHealth } from './config/database.js';
import { initializeEventHandlers } from './events/dispatcher/setupHandlers.js';
import { outboxWorker } from './events/workers/OutboxWorker.js';
import { reminderWorker } from './events/workers/ReminderWorker.js';

async function bootstrap() {
  logger.info('Initializing Project Management Platform API...');

  // Initialize Event-Driven Architecture handlers
  initializeEventHandlers();

  // Test database connection
  const dbOk = await checkDatabaseHealth();
  if (!dbOk) {
    logger.warn(
      'Database connection could not be established at startup. Please ensure PostgreSQL is running and accessible via DATABASE_URL.'
    );
  } else {
    logger.info('PostgreSQL connected successfully.');
  }

  // Start background workers
  outboxWorker.start();
  reminderWorker.start();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API endpoints available at http://localhost:${env.PORT}/api/v1`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    outboxWorker.stop();
    reminderWorker.stop();

    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Prisma disconnected');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error', { error: String(err) });
  process.exit(1);
});
