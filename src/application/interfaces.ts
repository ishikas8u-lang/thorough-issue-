import type {
  Report,
  PublicReportView,
  SafetyContact,
  SafetyLocation,
  Route,
  ServiceNotice,
  ReportStatus,
  StudentProfile,
  StudentSession,
} from '../types';

/**
 * Interface Segregation Principle (ISP) & Dependency Inversion Principle (DIP):
 * High-level use-cases depend exclusively on these narrow, client-focused interfaces.
 */

export interface ISafetyDirectoryProvider {
  getPrimaryEmergency(): SafetyContact;
  getContacts(): SafetyContact[];
  getLocations(): SafetyLocation[];
}

export interface ITransportScheduleProvider {
  getRoutes(): Route[];
  getRouteById(id: string): Route | undefined;
  getActiveNotices(): ServiceNotice[];
}

export interface IReportRepository {
  save(report: Report): Promise<void>;
  findByReference(referenceCode: string): Promise<Report | null>;
  findById(id: string): Promise<Report | null>;
  findAll(): Promise<Report[]>;
  updateStatus(
    id: string,
    targetStatus: ReportStatus,
    publicMessage: string | undefined,
    internalNote: string | undefined,
    actorId: string
  ): Promise<Report>;
}

export interface IPublicReportPresenter {
  present(report: Report): PublicReportView;
}

export interface IStudentAuthService {
  getCurrentSession(): Promise<StudentSession | null>;
  signIn(email: string, password: string): Promise<StudentSession>;
  signUp(profile: Omit<StudentProfile, 'id' | 'updatedAt'>, password: string): Promise<StudentSession>;
  updateProfile(profile: Partial<Omit<StudentProfile, 'id' | 'email'>>): Promise<StudentProfile>;
  signOut(): Promise<void>;
}

