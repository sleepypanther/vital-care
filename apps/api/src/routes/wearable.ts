import { FastifyInstance } from 'fastify';
import { wearableManager, DataNormalizer, CapabilityDetector } from '@healthcare/wearable-core';
import { prisma } from '@healthcare/db';

const normalizer = new DataNormalizer();
const capabilityDetector = new CapabilityDetector();

export async function wearableRoutes(app: FastifyInstance) {
  app.get('/connect/options', async () => {
    return {
      options: [
        { id: 'healthkit', name: 'Apple Watch', platform: 'healthkit' },
        { id: 'healthconnect', name: 'Samsung / Wear OS', platform: 'healthconnect' },
        { id: 'garmin', name: 'Garmin', platform: 'garmin' },
        { id: 'fitbit', name: 'Fitbit', platform: 'fitbit' },
        { id: 'oura', name: 'Oura', platform: 'oura' },
      ],
    };
  });

  app.post('/connect', async (request, reply) => {
    const { patientId, source, deviceName } = request.body as any;
    const provider = wearableManager.get(source);
    
    if (!provider) {
      return reply.code(400).send({ error: 'Unsupported provider' });
    }

    const connected = await provider.connect(patientId);
    const capabilities = capabilityDetector.detectCapabilities(source);
    
    const device = await prisma.wearableDevice.create({
      data: {
        patientId,
        source,
        deviceName: deviceName || connected.deviceName,
        model: connected.deviceName,
        connected: true,
        lastSync: new Date(),
      },
    });

    return { device, capabilities };
  });

  app.get('/devices/:patientId', async (request) => {
    const { patientId } = request.params as any;
    const devices = await prisma.wearableDevice.findMany({
      where: { patientId },
    });
    return { devices };
  });

  app.post('/sync/:patientId', async (request, reply) => {
    const { patientId } = request.params as any;
    const { source } = request.body as any;
    
    const device = await prisma.wearableDevice.findFirst({
      where: { patientId, source, connected: true },
    });

    if (!device) {
      return reply.code(404).send({ error: 'No connected device' });
    }

    const provider = wearableManager.get(source);
    if (!provider) {
      return reply.code(400).send({ error: 'Unsupported provider' });
    }

    try {
      const rawReadings = await provider.fetchRecent(patientId);
      const existing = await prisma.vitalReading.findMany({
        where: { patientId, deviceId: device.id },
        take: 1000,
      });

      const normalized = rawReadings
        .map(r => normalizer.normalize(r, patientId, device.id, source))
        .filter(Boolean) as any[];

      const newReadings = normalizer.deduplicate(normalized, existing as any);

      if (newReadings.length > 0) {
        await prisma.vitalReading.createMany({
          data: newReadings.map(r => ({
            patientId: r.patientId,
            deviceId: r.deviceId,
            source: r.sourcePlatform,
            metric: r.metricType,
            value: typeof r.value === 'number' ? r.value : parseFloat(r.value) || 0,
            unit: r.unit,
            timestamp: r.recordedAt,
            quality: r.dataQuality,
            metadata: r.sensorMetadata || {},
          })),
        });
      }

      await prisma.wearableDevice.update({
        where: { id: device.id },
        data: { lastSync: new Date() },
      });

      return {
        success: true,
        measurementsImported: newReadings.length,
        duplicatesSkipped: normalized.length - newReadings.length,
      };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  app.get('/vitals/:patientId', async (request) => {
    const { patientId } = request.params as any;
    const { metric, limit = 100 } = request.query as any;

    const where: any = { patientId };
    if (metric) where.metric = metric;

    const readings = await prisma.vitalReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
    });

    return { readings };
  });

  app.get('/capabilities/:patientId', async (request) => {
    const { patientId } = request.params as any;
    const devices = await prisma.wearableDevice.findMany({
      where: { patientId, connected: true },
    });

    const capabilities = devices.map(d => ({
      deviceId: d.id,
      source: d.source,
      deviceName: d.deviceName,
      capabilities: capabilityDetector.detectCapabilities(d.source),
    }));

    return { capabilities };
  });
}
