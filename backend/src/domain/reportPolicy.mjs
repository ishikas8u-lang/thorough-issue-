import crypto from 'node:crypto';

/**
 * Single Responsibility Principle (SRP):
 * Enforces business rules and state machine transition constraints.
 */
export const ALLOWED_TRANSITIONS = {
  RECEIVED: ['IN_REVIEW', 'DUPLICATE', 'REJECTED'],
  IN_REVIEW: ['IN_PROGRESS', 'DUPLICATE', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'IN_REVIEW'],
  RESOLVED: ['IN_REVIEW'], // Reopened defect
  DUPLICATE: ['IN_REVIEW'], // False duplicate appeal
  REJECTED: ['IN_REVIEW'], // Reopened appeal
};

export const VALID_STATUSES = [
  'RECEIVED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'DUPLICATE',
  'REJECTED',
];

export const VALID_CATEGORIES = [
  'LIGHTING_ELECTRICAL',
  'BUILDING_FACILITY',
  'CLEANLINESS',
  'ACCESSIBILITY',
  'TRANSPORT_STOP',
  'OTHER',
];

export class ReportStatusPolicy {
  canTransition(currentStatus, targetStatus) {
    if (!currentStatus || !targetStatus) return false;
    if (currentStatus === targetStatus) return false;

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  getAllowedTransitions(currentStatus) {
    return ALLOWED_TRANSITIONS[currentStatus] || [];
  }
}

/**
 * Generates an unambiguous, non-sequential reference code (format: CA-XXXX-XX)
 */
export function generateReferenceCode() {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += chars[randomBytes[i] % chars.length];
  }
  for (let i = 4; i < 6; i++) {
    part2 += chars[randomBytes[i] % chars.length];
  }

  return `CA-${part1}-${part2}`;
}
