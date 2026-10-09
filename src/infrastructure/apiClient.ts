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
  SosAlert,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
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
  // Only default Content-Type to JSON if body is string and not FormData
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
          registrationNumber: profile.registrationNumber,
          email: profile.email,
          department: profile.department || profile.branch,
          year: profile.year,
          contactNumber: profile.contactNumber || profile.phone,
          phone: profile.phone || profile.contactNumber,
          hostelType: profile.hostelType,
          busRouteId: profile.busRouteId,
          course: profile.course || profile.department,
          branch: profile.branch || profile.department,
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
    photo?: File | Blob | null;
    photoBase64?: string;
  }): Promise<{ referenceCode: string; status: ReportStatus; photoAvailable?: boolean; createdAt: string; message: string }> {
    if (report.photo) {
      const formData = new FormData();
      formData.append('category', report.category);
      formData.append('locationDescription', report.locationDescription);
      formData.append('issueDescription', report.issueDescription);
      formData.append('privacyAgreed', 'true');
      formData.append('photo', report.photo);

      return fetchJson('/reports', {
        method: 'POST',
        body: formData,
      });
    }

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

  // ── Emergency SOS ──
  async createSos(data: {
    lat?: number | null;
    lng?: number | null;
    accuracy?: number | null;
    message?: string;
  }, token?: string): Promise<{ id: string; status: 'new'; createdAt: string; message: string }> {
    return fetchJson('/sos', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  },

  async getStaffSosAlerts(token?: string): Promise<SosAlert[]> {
    return fetchJson<SosAlert[]>('/staff/sos', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async updateStaffSosStatus(
    alertId: string,
    status: 'new' | 'acknowledged' | 'resolved',
    token?: string
  ): Promise<SosAlert> {
    return fetchJson<SosAlert>(`/staff/sos/${encodeURIComponent(alertId)}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ status }),
    });
  },

  // ── Staff Triage ──
  async getStaffReports(token?: string): Promise<Report[]> {
    return fetchJson<Report[]>('/staff/reports', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async updateReportStatus(
    reportId: string,
    targetStatus?: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    adminReply?: string,
    token?: string
  ): Promise<Report> {
    return fetchJson<Report>(`/staff/reports/${encodeURIComponent(reportId)}/status`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({
        targetStatus,
        publicMessage,
        internalNote,
        adminReply,
      }),
    });
  },

  getReportPhotoUrl(reportId: string): string {
    return `${API_BASE}/staff/reports/${encodeURIComponent(reportId)}/photo`;
  },

  async fetchReportPhotoBlob(reportId: string, token?: string): Promise<Blob | null> {
    const url = `${API_BASE}/staff/reports/${encodeURIComponent(reportId)}/photo`;
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  },

  async getStudentReports(token: string): Promise<Report[]> {
    return fetchJson<Report[]>('/student/reports', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async escalateReport(
    reportId: string,
    authority: string,
    note?: string,
    token?: string
  ): Promise<Report> {
    return fetchJson<Report>(`/staff/reports/${encodeURIComponent(reportId)}/escalate`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ authority, note }),
    });
  },

  async updateRoute(
    routeId: string,
    updates: { driverName?: string; driverPhone?: string; busNumber?: string; timings?: string },
    token?: string
  ): Promise<{ route: Route; message: string }> {
    return fetchJson<{ route: Route; message: string }>(`/staff/routes/${encodeURIComponent(routeId)}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(updates),
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
