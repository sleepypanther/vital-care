import { FastifyInstance } from 'fastify';

export async function caregiverRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'caregiver', status: 'ok' }));
}
