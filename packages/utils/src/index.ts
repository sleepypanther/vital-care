import { DataQuality } from '@healthcare/types';

export function isStale(timestamp: string, maxMinutes = 30): boolean {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  return diffMs > maxMinutes * 60 * 1000;
}

export function getQuality(timestamp: string, connected: boolean): DataQuality {
  if (!connected) return 'disconnected';
  if (isStale(timestamp)) return 'stale';
  return 'normal';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
