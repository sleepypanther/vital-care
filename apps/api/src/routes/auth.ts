import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'auth', status: 'ok' }));
}
