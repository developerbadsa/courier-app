import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './modules/health/health.router.js';

export const createApp = (): Application => {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Root Healthcheck & Info
  app.use('/health', healthRouter);
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Shohnaat Logistics API',
      version: '1.0.0',
      status: 'online',
      currency: config.currency.default,
      documentation: '/api/v1/docs',
    });
  });

  // API v1 Router Skeleton
  const v1Router = express.Router();
  v1Router.use('/health', healthRouter);

  // Mount API v1
  app.use(config.apiPrefix, v1Router);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
