import { WearableReading } from './types';
import { generateId } from '@healthcare/utils';

export class DataNormalizer {
  normalize(raw: any, patientId: string, deviceId: string, source: string): WearableReading | null {
    try {
      if (!raw || raw.value === undefined || raw.value === null) {
        return null;
      }

      const recordedAt = raw.recordedAt ? new Date(raw.recordedAt) : new Date();
      const receivedAt = new Date();

      // Normalize metric types
      const metricMap: Record<string, string> = {
        'heart_rate': 'heartRate',
        'resting_heart_rate': 'restingHeartRate',
        'heart_rate_variability': 'hrv',
        'oxygen_saturation': 'spo2',
        'respiratory_rate': 'respiratoryRate',
        'step_count': 'steps',
        'distance_walking_running': 'distance',
        'active_energy_burned': 'caloriesActive',
        'basal_energy_burned': 'caloriesTotal',
      };

      const metricType = metricMap[raw.type] || raw.type;

      // Normalize units
      const unitMap: Record<string, string> = {
        'beats/min': 'bpm',
        'count/min': 'bpm',
      };

      const unit = unitMap[raw.unit] || raw.unit;

      return {
        id: generateId(),
        patientId,
        deviceId,
        sourcePlatform: source as any,
        metricType,
        value: typeof raw.value === 'number' ? raw.value : raw.value,
        unit,
        recordedAt,
        receivedAt,
        dataQuality: raw.quality || 'normal',
        sensorMetadata: raw.metadata,
      };
    } catch (error) {
      console.error('Normalization error:', error);
      return null;
    }
  }

  deduplicate(readings: WearableReading[], existing: WearableReading[]): WearableReading[] {
    const seen = new Set(
      existing.map(r => `${r.deviceId}-${r.metricType}-${r.recordedAt.getTime()}-${r.value}`)
    );
    
    return readings.filter(r => {
      const key = `${r.deviceId}-${r.metricType}-${r.recordedAt.getTime()}-${r.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
