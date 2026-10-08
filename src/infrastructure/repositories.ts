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
import { apiClient } from './apiClient';

const STORAGE_KEY = 'campus_assist_reports_v1';

export class LocalStorageReportRepository implements IReportRepository {
  private statusPolicy = new ReportStatusPolicy();

  private getStoredReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
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
    const existingIndex = reports.findIndex(
      (r) => r.id === report.id || r.referenceCode === report.referenceCode
    );
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
    const found = reports.find((r) => r.referenceCode.toUpperCase() === cleanRef);
    return found || null;
  }

  public async findById(id: string): Promise<Report | null> {
    const reports = this.getStoredReports();
    const found = reports.find((r) => r.id === id);
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
    const reportIndex = reports.findIndex((r) => r.id === id);
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

/**
 * Connected Backend & SQLite Database Repository
 * Persists and reads live data from SQLite DB via /api endpoints
 * Gracefully falls back to local storage if network is offline
 */
export class ConnectedBackendReportRepository implements IReportRepository {
  private localFallback = new LocalStorageReportRepository();

  public async save(report: Report): Promise<void> {
    try {
      const res = await apiClient.createReport({
        category: report.category,
        locationDescription: report.locationDescription,
        issueDescription: report.issueDescription,
        privacyAgreed: true,
      });

      if (res && res.referenceCode) {
        report.referenceCode = res.referenceCode;
        report.status = res.status || 'RECEIVED';
        report.createdAt = res.createdAt || report.createdAt;
      }
    } catch (err) {
      console.warn('Backend save failed, using local storage cache fallback:', err);
    }
    // Always keep local storage in sync
    await this.localFallback.save(report);
  }

  public async findByReference(referenceCode: string): Promise<Report | null> {
    try {
      const publicView = await apiClient.lookupReport(referenceCode);
      if (publicView) {
        const report: Report = {
          id: `rep-db-${publicView.referenceCode}`,
          referenceCode: publicView.referenceCode,
          category: publicView.category,
          locationDescription: publicView.locationDescription,
          issueDescription: 'Confidential (Redacted for public verification privacy)',
          status: publicView.status,
          createdAt: publicView.createdAt,
          updatedAt: publicView.createdAt,
          auditTrail: publicView.updates.map((u, i) => ({
            id: `aud-${i}`,
            reportId: `rep-db-${publicView.referenceCode}`,
            previousStatus: u.status,
            newStatus: u.status,
            publicMessage: u.message,
            actorId: 'Campus Operations',
            createdAt: u.timestamp,
          })),
        };
        // Update local cache
        await this.localFallback.save(report);
        return report;
      }
    } catch (err) {
      console.warn('Backend lookup failed, checking local store:', err);
    }
    return this.localFallback.findByReference(referenceCode);
  }

  public async findById(id: string): Promise<Report | null> {
    const all = await this.findAll();
    return all.find((r) => r.id === id) || null;
  }

  public async findAll(): Promise<Report[]> {
    try {
      const dbReports = await apiClient.getStaffReports('admin');
      if (Array.isArray(dbReports) && dbReports.length > 0) {
        // Sync local cache
        for (const rep of dbReports) {
          await this.localFallback.save(rep);
        }
        return dbReports;
      }
    } catch (err) {
      console.warn('Backend findAll failed, using local store:', err);
    }
    return this.localFallback.findAll();
  }

  public async updateStatus(
    id: string,
    targetStatus: ReportStatus,
    publicMessage: string | undefined,
    internalNote: string | undefined,
    actorId: string
  ): Promise<Report> {
    try {
      const updated = await apiClient.updateReportStatus(
        id,
        targetStatus,
        publicMessage,
        internalNote,
        actorId || 'admin'
      );
      if (updated) {
        await this.localFallback.save(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Backend status update failed, saving locally:', err);
    }
    return this.localFallback.updateStatus(id, targetStatus, publicMessage, internalNote, actorId);
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
    return SEED_ROUTES.find((r) => r.id === id);
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
        .filter((a) => Boolean(a.publicMessage))
        .map((a) => ({
          status: a.newStatus,
          message: a.publicMessage!,
          timestamp: a.createdAt,
        })),
    };
  }
}
