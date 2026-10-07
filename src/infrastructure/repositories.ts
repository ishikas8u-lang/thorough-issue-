import type {
  IReportRepository,
  ISafetyDirectoryProvider,
  ITransportScheduleProvider,
  IPublicReportPresenter,
} from '../application/interfaces';
import type {
  Report,
  PublicReportView,
  SafetyContact,
  SafetyLocation,
  Route,
  ServiceNotice,
  ReportStatus,
} from '../types';
import {
  PRIMARY_EMERGENCY,
  SEED_CONTACTS,
  SEED_LOCATIONS,
  SEED_ROUTES,
  SEED_NOTICES,
  SEED_REPORTS,
} from './seedData';
import { ReportStatusPolicy } from '../domain/ReportStatusPolicy';

const STORAGE_KEY = 'campus_assist_reports_v1';

export class LocalStorageReportRepository implements IReportRepository {
  private statusPolicy = new ReportStatusPolicy();

  private getStoredReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with realistic seed reports
        this.saveStoredReports(SEED_REPORTS);
        return SEED_REPORTS;
      }
      return JSON.parse(data) as Report[];
    } catch {
      return SEED_REPORTS;
    }
  }

  private saveStoredReports(reports: Report[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Graceful fallback
    }
  }

  public async save(report: Report): Promise<void> {
    const reports = this.getStoredReports();
    const existingIndex = reports.findIndex(r => r.id === report.id || r.referenceCode === report.referenceCode);
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    this.saveStoredReports(reports);
  }

  public async findByReference(referenceCode: string): Promise<Report | null> {
    const reports = this.getStoredReports();
    const cleanRef = referenceCode.trim().toUpperCase();
    const found = reports.find(r => r.referenceCode.toUpperCase() === cleanRef);
    return found || null;
  }

  public async findById(id: string): Promise<Report | null> {
    const reports = this.getStoredReports();
    const found = reports.find(r => r.id === id);
    return found || null;
  }

  public async findAll(): Promise<Report[]> {
    return this.getStoredReports();
  }

  public async updateStatus(
    id: string,
    targetStatus: ReportStatus,
    publicMessage: string | undefined,
    internalNote: string | undefined,
    actorId: string
  ): Promise<Report> {
    const reports = this.getStoredReports();
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new Error(`Report with ID ${id} not found.`);
    }

    const report = reports[reportIndex];
    if (!this.statusPolicy.canTransition(report.status, targetStatus)) {
      throw new Error(`Illegal state transition from ${report.status} to ${targetStatus}`);
    }

    const previousStatus = report.status;
    const now = new Date().toISOString();

    report.status = targetStatus;
    report.updatedAt = now;

    const auditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportId: report.id,
      previousStatus,
      newStatus: targetStatus,
      publicMessage: publicMessage?.trim() || undefined,
      internalNote: internalNote?.trim() || undefined,
      actorId,
      createdAt: now,
    };

    report.auditTrail.push(auditEntry);
    reports[reportIndex] = report;
    this.saveStoredReports(reports);

    return report;
  }
}

export class StaticSafetyDirectoryProvider implements ISafetyDirectoryProvider {
  public getPrimaryEmergency(): SafetyContact {
    return PRIMARY_EMERGENCY;
  }

  public getContacts(): SafetyContact[] {
    return SEED_CONTACTS;
  }

  public getLocations(): SafetyLocation[] {
    return SEED_LOCATIONS;
  }
}

export class StaticTransportScheduleProvider implements ITransportScheduleProvider {
  public getRoutes(): Route[] {
    return SEED_ROUTES;
  }

  public getRouteById(id: string): Route | undefined {
    return SEED_ROUTES.find(r => r.id === id);
  }

  public getActiveNotices(): ServiceNotice[] {
    return SEED_NOTICES;
  }
}

/**
 * SRP & Privacy Preserving Presenter:
 * Strips internal IDs, actor identities, internal notes, and raw database properties.
 */
export class PublicReportPresenter implements IPublicReportPresenter {
  public present(report: Report): PublicReportView {
    return {
      referenceCode: report.referenceCode,
      category: report.category,
      locationDescription: report.locationDescription,
      status: report.status,
      createdAt: report.createdAt,
      updates: report.auditTrail
        .filter(a => Boolean(a.publicMessage))
        .map(a => ({
          status: a.newStatus,
          message: a.publicMessage!,
          timestamp: a.createdAt,
        })),
    };
  }
}
