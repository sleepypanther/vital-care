import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { env } from '@healthcare/config';
import { authRoutes } from './routes/auth';
import { patientRoutes } from './routes/patient';
import { caregiverRoutes } from './routes/caregiver';
import { wearableRoutes } from './routes/wearable';
import { emergencyRoutes } from './routes/emergency';
import { medicationRoutes } from './routes/medications';
import { scheduleRoutes } from './routes/schedule';
import { labRoutes } from './routes/labs';
import { reportRoutes } from './routes/reports';
import { notificationRoutes } from './routes/notifications';
import { auditRoutes } from './routes/audit';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.jwtSecret });
  await app.register(websocket);

  app.get('/health', async () => ({ status: 'ok', service: 'healthcare-api' }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(patientRoutes, { prefix: '/patients' });
  await app.register(caregiverRoutes, { prefix: '/caregivers' });
  await app.register(wearableRoutes, { prefix: '/wearables' });
  await app.register(emergencyRoutes, { prefix: '/emergency' });
  await app.register(medicationRoutes, { prefix: '/medications' });
  await app.register(scheduleRoutes, { prefix: '/schedule' });
  await app.register(labRoutes, { prefix: '/labs' });
  await app.register(reportRoutes, { prefix: '/reports' });
  await app.register(notificationRoutes, { prefix: '/notifications' });
  await app.register(auditRoutes, { prefix: '/audit' });

  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    app.log.info(`API listening on port ${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
