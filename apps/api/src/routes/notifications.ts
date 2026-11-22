import { FastifyInstance } from 'fastify';

export async function notificationsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'notifications', status: 'ok' }));
}
