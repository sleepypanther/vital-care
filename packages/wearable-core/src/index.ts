export * from './types';
export * from './normalizer';
export * from './capabilities';

import { VitalReading, VitalSource, DataQuality } from '@healthcare/types';
import { getQuality } from '@healthcare/utils';

export interface WearableProvider {
  name: string;
  source: VitalSource;
  isAvailable(): Promise<boolean>;
  requestPermissions(metrics: string[]): Promise<boolean>;
  connect(patientId: string): Promise<{ deviceId: string; deviceName: string }>;
  disconnect(deviceId: string): Promise<void>;
  fetchRecent(patientId: string, since?: string): Promise<any[]>;
  getCapabilities(): Promise<any[]>;
}

export class MockWearableProvider implements WearableProvider {
  name = 'MockProvider';
  source: VitalSource = 'mock';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async connect(patientId: string): Promise<{ deviceId: string; deviceName: string }> {
    return { deviceId: `mock-${patientId}`, deviceName: 'Mock Watch (Dev)' };
  }

  async disconnect(): Promise<void> {
    return;
  }

  async fetchRecent(patientId: string): Promise<any[]> {
    return [];
  }

  async getCapabilities(): Promise<any[]> {
    return [];
  }
}

export class WearableManager {
  private providers = new Map<VitalSource, WearableProvider>();

  register(provider: WearableProvider): void {
    this.providers.set(provider.source, provider);
  }

  get(source: VitalSource): WearableProvider | undefined {
    return this.providers.get(source);
  }

  list(): WearableProvider[] {
    return Array.from(this.providers.values());
  }
}

export const wearableManager = new WearableManager();
wearableManager.register(new MockWearableProvider());
