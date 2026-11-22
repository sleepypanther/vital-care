import { FastifyInstance } from 'fastify';

export async function scheduleRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'schedule', status: 'ok' }));
}
