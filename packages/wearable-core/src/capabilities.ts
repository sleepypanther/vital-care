import { DeviceCapability } from './types';

export class CapabilityDetector {
  detectCapabilities(source: string, deviceModel?: string): DeviceCapability[] {
    const baseCapabilities: DeviceCapability[] = [
      { metric: 'heartRate', supported: true, available: false },
      { metric: 'steps', supported: true, available: false },
      { metric: 'sleep', supported: true, available: false },
      { metric: 'activity', supported: true, available: false },
    ];

    if (source === 'healthkit') {
      // Apple Watch capabilities
      baseCapabilities.push(
        { metric: 'restingHeartRate', supported: true, available: false },
        { metric: 'hrv', supported: true, available: false },
        { metric: 'spo2', supported: true, available: false },
        { metric: 'respiratoryRate', supported: true, available: false },
        { metric: 'ecg', supported: true, available: false },
        { metric: 'workouts', supported: true, available: false },
        { metric: 'bodyTemp', supported: true, available: false },
      );
    } else if (source === 'healthconnect') {
      baseCapabilities.push(
        { metric: 'restingHeartRate', supported: true, available: false },
        { metric: 'spo2', supported: true, available: false },
        { metric: 'workouts', supported: true, available: false },
      );
    }

    return baseCapabilities;
  }

  getAvailable(capabilities: DeviceCapability[]): DeviceCapability[] {
    return capabilities.filter(c => c.supported);
  }
}
