import { FastifyInstance } from 'fastify';

export async function patientRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ route: 'patient', status: 'ok' }));
}
