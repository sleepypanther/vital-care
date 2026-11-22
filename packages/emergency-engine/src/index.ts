import { EmergencyEventType } from '@healthcare/types';

export interface FallSignal {
  impactDetected: boolean;
  noMovement: boolean;
  watchWorn: boolean;
  sensorConfidence: number;
  timestamp: string;
}

export interface EmergencyRuleContext {
  sosTriggered: boolean;
  fallSignal?: FallSignal;
  noResponseToConfirmation: boolean;
  deviceDisconnected: boolean;
  watchNotWorn: boolean;
  recentVitalsMissing: boolean;
  signalQualityOk: boolean;
}

export interface EmergencyDecision {
  shouldTrigger: boolean;
  type?: EmergencyEventType;
  reason?: string;
  requiresConfirmation: boolean;
  escalationDelaySeconds: number;
}

export const DEFAULT_ESCALATION_DELAY = 30;

export function evaluateEmergency(ctx: EmergencyRuleContext): EmergencyDecision {
  // Never diagnose. Deterministic rules only.
  if (ctx.sosTriggered) {
    return {
      shouldTrigger: true,
      type: 'sos',
      reason: 'Patient triggered SOS',
      requiresConfirmation: false,
      escalationDelaySeconds: 0,
    };
  }

  if (ctx.noResponseToConfirmation) {
    return {
      shouldTrigger: true,
      type: 'no_response',
      reason: 'No response to emergency confirmation',
      requiresConfirmation: false,
      escalationDelaySeconds: DEFAULT_ESCALATION_DELAY,
    };
  }

  if (ctx.fallSignal) {
    const { impactDetected, noMovement, watchWorn, sensorConfidence } = ctx.fallSignal;
    if (impactDetected && noMovement && watchWorn && sensorConfidence >= 0.7 && ctx.signalQualityOk) {
      return {
        shouldTrigger: true,
        type: 'fall',
        reason: 'Possible fall detected by sensors',
        requiresConfirmation: true,
        escalationDelaySeconds: DEFAULT_ESCALATION_DELAY,
      };
    }
  }

  if (ctx.recentVitalsMissing && ctx.deviceDisconnected && ctx.watchNotWorn === false && !ctx.signalQualityOk) {
    return {
      shouldTrigger: false,
      type: 'no_movement',
      reason: 'Insufficient data to trigger emergency',
      requiresConfirmation: false,
      escalationDelaySeconds: DEFAULT_ESCALATION_DELAY,
    };
  }

  return {
    shouldTrigger: false,
    requiresConfirmation: false,
    escalationDelaySeconds: DEFAULT_ESCALATION_DELAY,
  };
}

export const EMERGENCY_DISCLAIMER = 'This is a safety workflow, not a medical diagnosis. If life-threatening, call local emergency services immediately.';
