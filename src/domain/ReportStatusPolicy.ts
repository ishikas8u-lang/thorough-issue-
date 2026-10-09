import type { ReportStatus } from '../types';

/**
 * Interface Segregation & Single Responsibility Principle (SRP):
 * ReportStatusPolicy is solely responsible for determining whether a proposed
 * transition between report statuses is permitted according to university operational rules.
 */
export interface IReportStatusPolicy {
  canTransition(current: ReportStatus, target: ReportStatus): boolean;
  getAllowedTransitions(current: ReportStatus): ReportStatus[];
}

export class ReportStatusPolicy implements IReportStatusPolicy {
  private static readonly ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
    RECEIVED: ['IN_REVIEW', 'DUPLICATE', 'REJECTED'],
    IN_REVIEW: ['IN_PROGRESS', 'ESCALATED', 'DUPLICATE', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'ESCALATED', 'IN_REVIEW'],
    ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'IN_REVIEW'],
    RESOLVED: ['IN_REVIEW'],
    DUPLICATE: ['IN_REVIEW'],
    REJECTED: ['IN_REVIEW'],
  };

  public canTransition(current: ReportStatus, target: ReportStatus): boolean {
    const validTargets = ReportStatusPolicy.ALLOWED_TRANSITIONS[current] || [];
    return validTargets.includes(target);
  }

  public getAllowedTransitions(current: ReportStatus): ReportStatus[] {
    return ReportStatusPolicy.ALLOWED_TRANSITIONS[current] || [];
  }
}
