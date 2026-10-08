/**
 * API Client for SRM University Campus Assist System
 * Connects Frontend directly to Backend REST APIs & SQLite Database
 */

import type {
  Report,
  PublicReportView,
  SafetyContact,
  SafetyLocation,
  Route,
  ReportStatus,
  StudentProfile,
  StudentSession,
} from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  public status: number;
  public details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(`Unable to connect to backend server: ${msg}`, 0);
  }

  let data: any = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const errorMsg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed with HTTP status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}

export const apiClient = {
  // ── Health Check ──
  async checkHealth(): Promise<{ ok: boolean; status?: string; database?: string; latency: number }> {
    const start = performance.now();
    try {
      const res = await fetchJson<{ status: string; service: string; database?: string }>('/health');
      const latency = Math.round(performance.now() - start);
      return { ok: res.status === 'available', status: res.status, database: res.database, latency };
    } catch {
      return { ok: false, latency: 0 };
    }
  },

  // ── Student Auth ──
  async signUp(
    profile: Omit<StudentProfile, 'id' | 'updatedAt'>,
    password: string
  ): Promise<StudentSession> {
    const data = await fetchJson<{ token: string; expiresAt: string; student: StudentProfile }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          contactNumber: profile.contactNumber,
          course: profile.course,
          branch: profile.branch,
          password,
        }),
      }
    );
    return {
      token: data.token,
      expiresAt: data.expiresAt,
      student: data.student,
    };
  },

  async signIn(email: string, password: string): Promise<StudentSession> {
    const data = await fetchJson<{ token: string; expiresAt: string; student: StudentProfile }>(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return {
      token: data.token,
      expiresAt: data.expiresAt,
      student: data.student,
    };
  },

  async getProfile(token: string): Promise<StudentProfile> {
    const data = await fetchJson<{ student: StudentProfile }>('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.student;
  },

  async updateProfile(
    token: string,
    fields: Partial<Omit<StudentProfile, 'id' | 'email'>>
  ): Promise<StudentProfile> {
    const data = await fetchJson<{ student: StudentProfile }>('/auth/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    });
    return data.student;
  },

  async signOut(token?: string): Promise<void> {
    try {
      await fetchJson('/auth/signout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Ignore network errors on signout
    }
  },

  // ── Problem Reports ──
  async createReport(report: {
    category: string;
    locationDescription: string;
    issueDescription: string;
    privacyAgreed?: boolean;
  }): Promise<{ referenceCode: string; status: ReportStatus; createdAt: string; message: string }> {
    return fetchJson('/reports', {
      method: 'POST',
      body: JSON.stringify({
        ...report,
        privacyAgreed: true,
      }),
    });
  },

  async lookupReport(referenceCode: string): Promise<PublicReportView> {
    return fetchJson<PublicReportView>(`/reports/lookup/${encodeURIComponent(referenceCode)}`);
  },

  // ── Staff Triage ──
  async getStaffReports(staffUser: string = 'admin'): Promise<Report[]> {
    return fetchJson<Report[]>('/staff/reports', {
      headers: {
        'X-Staff-User': staffUser,
      },
    });
  },

  async updateReportStatus(
    reportId: string,
    targetStatus: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    staffUser: string = 'admin'
  ): Promise<Report> {
    return fetchJson<Report>(`/staff/reports/${encodeURIComponent(reportId)}/status`, {
      method: 'PATCH',
      headers: {
        'X-Staff-User': staffUser,
      },
      body: JSON.stringify({
        targetStatus,
        publicMessage,
        internalNote,
      }),
    });
  },

  // ── Safety & Transport ──
  async getSafety(): Promise<{ contacts: SafetyContact[]; locations: SafetyLocation[] }> {
    return fetchJson<{ contacts: SafetyContact[]; locations: SafetyLocation[] }>('/safety');
  },

  async getRoutes(): Promise<{ routes: Route[] }> {
    return fetchJson<{ routes: Route[] }>('/routes');
  },
};
