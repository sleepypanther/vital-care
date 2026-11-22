import { FastifyInstance } from 'fastify';

export async function auditRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'audit', status: 'ok' }));
}
