import { FastifyInstance } from 'fastify';
import { evaluateEmergency, EMERGENCY_DISCLAIMER } from '@healthcare/emergency-engine';
import { prisma } from '@healthcare/db';

export async function emergencyRoutes(app: FastifyInstance) {
  app.post('/sos', async (request, reply) => {
    const { patientId } = request.body as any;

    const event = await prisma.emergencyEvent.create({
      data: {
        patientId,
        type: 'sos',
        status: 'active',
        reason: 'Patient triggered SOS',
        metadata: { disclaimer: EMERGENCY_DISCLAIMER },
      },
    });

    // Notify caregivers would go here
    return { event, disclaimer: EMERGENCY_DISCLAIMER };
  });

  app.post('/fall', async (request, reply) => {
    const { patientId, impactDetected, noMovement, watchWorn, sensorConfidence } = request.body as any;

    const decision = evaluateEmergency({
      sosTriggered: false,
      fallSignal: { impactDetected, noMovement, watchWorn, sensorConfidence, timestamp: new Date().toISOString() },
      noResponseToConfirmation: false,
      deviceDisconnected: false,
      watchNotWorn: !watchWorn,
      recentVitalsMissing: false,
      signalQualityOk: sensorConfidence >= 0.7,
    });

    if (decision.shouldTrigger && decision.type === 'fall') {
      const event = await prisma.emergencyEvent.create({
        data: {
          patientId,
          type: 'fall',
          status: 'active',
          reason: decision.reason,
          metadata: { requiresConfirmation: decision.requiresConfirmation },
        },
      });
      return { triggered: true, event, requiresConfirmation: true, disclaimer: EMERGENCY_DISCLAIMER };
    }

    return { triggered: false, disclaimer: EMERGENCY_DISCLAIMER };
  });

  app.post('/confirm', async (request, reply) => {
    const { eventId, response } = request.body as any; // 'ok' or 'help'
    
    if (response === 'help') {
      const event = await prisma.emergencyEvent.update({
        where: { id: eventId },
        data: { status: 'acknowledged', acknowledgedAt: new Date() },
      });
      return { status: 'escalated', event };
    } else {
      const event = await prisma.emergencyEvent.update({
        where: { id: eventId },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });
      return { status: 'cancelled', event };
    }
  });

  app.get('/events/:patientId', async (request) => {
    const { patientId } = request.params as any;
    const events = await prisma.emergencyEvent.findMany({
      where: { patientId },
      orderBy: { triggeredAt: 'desc' },
      take: 50,
    });
    return { events };
  });
}
