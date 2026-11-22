import { FastifyInstance } from 'fastify';

export async function reportsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'reports', status: 'ok' }));
}
