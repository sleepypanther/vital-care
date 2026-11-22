import { FastifyInstance } from 'fastify';

export async function labsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'labs', status: 'ok' }));
}
