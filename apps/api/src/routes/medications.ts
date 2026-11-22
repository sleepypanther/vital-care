import { FastifyInstance } from 'fastify';

export async function medicationsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'medications', status: 'ok' }));
}
