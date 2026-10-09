import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  User,
  LogOut,
  ShieldAlert,
  Clock,
  Search,
  MessageSquare,
  LayoutDashboard,
  FileText,
  Bus,
  AlertTriangle,
  Building2,
  Phone,
  Send,
  Save,
  Share2,
} from 'lucide-react';
import type { Report, ReportStatus, SosAlert, Route } from '../../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../types';
import { ReportStatusPolicy } from '../../domain/ReportStatusPolicy';
import { apiClient } from '../../infrastructure/apiClient';

interface StaffViewProps {
  reportRepository?: any;
  staffUser?: any;
  onLogin?: (user: string) => void;
  onLogout: () => void;
}

const ESCALATION_AUTHORITIES = [
  'Facilities Head',
  'Electrical Dept',
  'Security Head',
  'Transport Officer',
];

export const StaffView: React.FC<StaffViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'sos' | 'transport' | 'profile'>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<{
    name: string;
    email: string;
    employeeId?: string;
    office?: string;
    department?: string;
  } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Mutation form state
  const [targetStatus, setTargetStatus] = useState<ReportStatus | ''>('');
  const [publicMessage, setPublicMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [adminReply, setAdminReply] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Escalation state
  const [escalateAuthority, setEscalateAuthority] = useState<string>(ESCALATION_AUTHORITIES[0]);
  const [escalateNote, setEscalateNote] = useState<string>('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null);
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // Transport edit state
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editTimings, setEditTimings] = useState('');
  const [editBusNumber, setEditBusNumber] = useState('');
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [routeSuccess, setRouteSuccess] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Photo viewer state
  const [photoBlobUrl, setPhotoBlobUrl] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const statusPolicy = new ReportStatusPolicy();
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check current session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('campus_assist_student_session_v1');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session && session.token && (session.student?.role === 'staff' || session.student?.role === 'admin')) {
          setAuthToken(session.token);
          setStaffInfo({
            name: session.student.fullName || 'Demo Admin',
            email: session.student.email || 'demo.admin@srmuniversity.ac.in',
            employeeId: session.student.employeeId || 'EMP-SRM-2026',
            office: session.student.office || 'Campus Operations',
            department: session.student.department || 'Facilities & Infrastructure',
          });
        }
      } catch {
        // ignore
      }
    }
    setIsAuthChecking(false);
  }, []);

  const loadReports = async (token: string) => {
    try {
      const data = await apiClient.getStaffReports(token);
      setReports(data || []);
      if (!selectedReportId && data && data.length > 0) {
        setSelectedReportId(data[0].id);
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAuthToken(null);
      }
    }
  };

  const loadSosAlerts = async (token: string) => {
    try {
      const data = await apiClient.getStaffSosAlerts(token);
      setSosAlerts(data || []);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAuthToken(null);
      }
    }
  };

  const loadRoutes = async () => {
    try {
      const data = await apiClient.getRoutes();
      if (data?.routes) {
        setRoutes(data.routes);
        if (data.routes.length > 0 && !selectedRouteId) {
          const first = data.routes[0];
          setSelectedRouteId(first.id);
          setEditDriverName(first.driverName || '');
          setEditDriverPhone(first.driverPhone || '');
          setEditBusNumber(first.busNumber || '');
          setEditTimings(first.scheduledDepartures ? first.scheduledDepartures.join(', ') : '07:30 AM - 07:00 PM');
        }
      }
    } catch {}
  };

  // Poll SOS inbox & reports every 10 seconds
  useEffect(() => {
    if (!authToken) return;

    loadReports(authToken);
    loadSosAlerts(authToken);
    loadRoutes();

    pollingTimerRef.current = setInterval(() => {
      loadSosAlerts(authToken);
      loadReports(authToken);
    }, 10000);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [authToken]);

  // When selected route changes, populate edit form
  useEffect(() => {
    const route = routes.find((r) => r.id === selectedRouteId);
    if (route) {
      setEditDriverName(route.driverName || '');
      setEditDriverPhone(route.driverPhone || '');
      setEditBusNumber(route.busNumber || '');
      setEditTimings(route.scheduledDepartures ? route.scheduledDepartures.join(', ') : '07:30 AM - 07:00 PM');
      setRouteSuccess(null);
      setRouteError(null);
    }
  }, [selectedRouteId, routes]);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;
  const allowedTransitions = selectedReport ? statusPolicy.getAllowedTransitions(selectedReport.status) : [];

  // Reset form when selected report changes
  useEffect(() => {
    if (selectedReport) {
      setTargetStatus('');
      setPublicMessage('');
      setInternalNote('');
      setAdminReply(selectedReport.adminReply || '');
      setUpdateError(null);
      setUpdateSuccess(null);
      setEscalateSuccess(null);
      setEscalateError(null);
      setShowEscalateModal(false);

      if (selectedReport.photoAvailable && authToken) {
        setIsLoadingPhoto(true);
        if (photoBlobUrl) {
          URL.revokeObjectURL(photoBlobUrl);
          setPhotoBlobUrl(null);
        }
        apiClient
          .fetchReportPhotoBlob(selectedReport.id, authToken)
          .then((blob) => {
            if (blob) {
              setPhotoBlobUrl(URL.createObjectURL(blob));
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingPhoto(false));
      } else {
        if (photoBlobUrl) {
          URL.revokeObjectURL(photoBlobUrl);
          setPhotoBlobUrl(null);
        }
      }
    }
  }, [selectedReportId]);

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !authToken) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await apiClient.updateReportStatus(
        selectedReport.id,
        targetStatus || undefined,
        publicMessage || undefined,
        internalNote || undefined,
        adminReply !== undefined ? adminReply : undefined,
        authToken
      );

      setUpdateSuccess(`Report updated successfully.`);
      await loadReports(authToken);
      setTargetStatus('');
      setPublicMessage('');
      setInternalNote('');
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update report status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEscalateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !authToken) return;

    setIsEscalating(true);
    setEscalateError(null);
    setEscalateSuccess(null);

    try {
      await apiClient.escalateReport(
        selectedReport.id,
        escalateAuthority,
        escalateNote || undefined,
        authToken
      );

      setEscalateSuccess(`Successfully escalated to ${escalateAuthority}!`);
      setShowEscalateModal(false);
      setEscalateNote('');
      await loadReports(authToken);
    } catch (err: any) {
      setEscalateError(err.message || 'Failed to escalate report.');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !authToken) return;

    setIsSavingRoute(true);
    setRouteSuccess(null);
    setRouteError(null);

    try {
      await apiClient.updateRoute(
        selectedRouteId,
        {
          driverName: editDriverName.trim(),
          driverPhone: editDriverPhone.trim(),
          busNumber: editBusNumber.trim(),
          timings: editTimings.trim(),
        },
        authToken
      );

      setRouteSuccess('Transport route timings and driver details updated successfully.');
      await loadRoutes();
    } catch (err: any) {
      setRouteError(err.message || 'Failed to update route.');
    } finally {
      setIsSavingRoute(false);
    }
  };

  const handleSosStatusChange = async (alertId: string, newStatus: 'new' | 'acknowledged' | 'resolved') => {
    if (!authToken) return;
    try {
      await apiClient.updateStaffSosStatus(alertId, newStatus, authToken);
      await loadSosAlerts(authToken);
    } catch {}
  };

  const handleSignOutLocal = async () => {
    if (authToken) {
      await apiClient.signOut(authToken).catch(() => {});
    }
    localStorage.removeItem('campus_assist_student_session_v1');
    setAuthToken(null);
    onLogout();
  };

  if (isAuthChecking) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="text-body-muted">Verifying staff reviewer session...</p>
      </div>
    );
  }

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      r.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issueDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Counters
  const newSosCount = sosAlerts.filter((a) => a.status === 'new').length;
  const receivedCount = reports.filter((r) => r.status === 'RECEIVED').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'IN_REVIEW').length;
  const escalatedCount = reports.filter((r) => r.status === 'ESCALATED').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem', maxWidth: '1200px' }}>
      {/* Staff Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1rem',
          minWidth: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                background: 'var(--color-brand-primary)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Admin Block
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
              Campus Operations &bull; SRM University
            </span>
          </div>
          <h1 className="title-section-clean" style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
            Operations &amp; Facilities Triage Portal
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right', display: 'none', sm: 'block' } as any}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {staffInfo?.name || 'Demo Admin'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {staffInfo?.office || 'Campus Operations'}
            </div>
          </div>
          <button className="btn-secondary" onClick={handleSignOutLocal} style={{ minHeight: '40px' }} title="Sign out of Admin Block">
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="btn-secondary"
          style={{
            minHeight: '40px',
            background: activeTab === 'dashboard' ? 'var(--color-brand-primary)' : 'var(--color-surface)',
            color: activeTab === 'dashboard' ? '#ffffff' : 'var(--color-text-main)',
            border: activeTab === 'dashboard' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className="btn-secondary"
          style={{
            minHeight: '40px',
            background: activeTab === 'reports' ? 'var(--color-brand-primary)' : 'var(--color-surface)',
            color: activeTab === 'reports' ? '#ffffff' : 'var(--color-text-main)',
            border: activeTab === 'reports' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <FileText size={16} />
          <span>Reports Queue ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sos')}
          className="btn-secondary"
          style={{
            minHeight: '40px',
            background: activeTab === 'sos' ? '#e11d48' : 'var(--color-surface)',
            color: activeTab === 'sos' ? '#ffffff' : 'var(--color-text-main)',
            border: activeTab === 'sos' ? '1px solid #e11d48' : '1px solid var(--color-border)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <ShieldAlert size={16} />
          <span>SOS Inbox ({sosAlerts.length})</span>
          {newSosCount > 0 && (
            <span style={{ background: '#ffffff', color: '#e11d48', borderRadius: '10px', padding: '0.1rem 0.45rem', fontSize: '11px', fontWeight: 900 }}>
              {newSosCount} NEW
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transport')}
          className="btn-secondary"
          style={{
            minHeight: '40px',
            background: activeTab === 'transport' ? 'var(--color-brand-primary)' : 'var(--color-surface)',
            color: activeTab === 'transport' ? '#ffffff' : 'var(--color-text-main)',
            border: activeTab === 'transport' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Bus size={16} />
          <span>Transport Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="btn-secondary"
          style={{
            minHeight: '40px',
            background: activeTab === 'profile' ? 'var(--color-brand-primary)' : 'var(--color-surface)',
            color: activeTab === 'profile' ? '#ffffff' : 'var(--color-text-main)',
            border: activeTab === 'profile' ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <User size={16} />
          <span>Admin Profile</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: OPERATIONS DASHBOARD
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Summary Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {/* New Reports */}
            <div
              onClick={() => {
                setStatusFilter('RECEIVED');
                setActiveTab('reports');
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                New Reports
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>
                {receivedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                Awaiting staff triage
              </div>
            </div>

            {/* In Progress */}
            <div
              onClick={() => {
                setStatusFilter('IN_PROGRESS');
                setActiveTab('reports');
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                In Progress
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                Maintenance dispatched
              </div>
            </div>

            {/* Escalated */}
            <div
              onClick={() => {
                setStatusFilter('ESCALATED');
                setActiveTab('reports');
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1.5px solid rgba(234, 179, 8, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#fde047', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Escalated
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fde047' }}>
                {escalatedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                Higher authority action
              </div>
            </div>

            {/* Resolved */}
            <div
              onClick={() => {
                setStatusFilter('RESOLVED');
                setActiveTab('reports');
              }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Resolved
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                Repairs completed
              </div>
            </div>

            {/* SOS Alerts */}
            <div
              onClick={() => setActiveTab('sos')}
              style={{
                background: newSosCount > 0 ? 'rgba(225, 29, 72, 0.15)' : 'var(--color-surface)',
                border: newSosCount > 0 ? '1.5px solid #e11d48' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>
                New SOS Alerts
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>
                {newSosCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>
                {newSosCount > 0 ? 'Urgent attention required!' : 'No pending emergencies'}
              </div>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Recent Incoming Reports */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                  Recent Tickets
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {reports.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReportId(r.id);
                      setActiveTab('reports');
                    }}
                    style={{
                      background: 'var(--color-surface-2)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-brand-primary)' }}>
                        {r.referenceCode} &bull; <span style={{ color: 'var(--color-text-main)', fontFamily: 'inherit' }}>{CATEGORY_LABELS[r.category] || r.category}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        {r.locationDescription}
                      </div>
                    </div>
                    <span className={`badge badge-${(STATUS_LABELS[r.status] || { tone: 'received' }).tone}`} style={{ fontSize: '0.7rem' }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Transport Status */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                  Shuttle Route Status
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('transport')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-brand-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Manage &rarr;
                </button>
              </div>

              {routes.map((rt) => (
                <div
                  key={rt.id}
                  style={{
                    background: 'var(--color-surface-2)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                    {rt.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Driver: <strong>{rt.driverName}</strong> ({rt.driverPhone}) &bull; Bus: <code>{rt.busNumber}</code>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                    Scheduled Timings: {rt.scheduledDepartures ? rt.scheduledDepartures.slice(0, 3).join(', ') + '...' : '7:30 AM - 7:00 PM'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FACILITIES REPORTS QUEUE & TRIAGE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Reports List & Filters */}
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  type="text"
                  placeholder="Search ref, location, issue..."
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses ({reports.length})</option>
                <option value="RECEIVED">Received</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ESCALATED">Escalated</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '680px', overflowY: 'auto' }}>
              {filteredReports.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)' }}>
                  No reports match filter criteria.
                </div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = r.id === selectedReportId;
                  const statusInfo = STATUS_LABELS[r.status] || { label: r.status, tone: 'received' };
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReportId(r.id)}
                      style={{
                        background: isSelected ? 'rgba(251, 113, 133, 0.12)' : 'var(--color-surface)',
                        border: isSelected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-brand-primary)' }}>
                          {r.referenceCode}
                        </span>
                        <span className={`badge badge-${statusInfo.tone}`} style={{ fontSize: '0.7rem' }}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.2rem' }}>
                        {CATEGORY_LABELS[r.category] || r.category}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.35rem' }}>
                        {r.locationDescription}
                      </div>

                      {r.escalatedTo && (
                        <div style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 600, marginBottom: '0.25rem' }}>
                          &bull; Escalated to {r.escalatedTo}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.photoAvailable && <span style={{ color: 'var(--color-brand-hover)' }}>📷 Photo Attached</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Report Details & Action Panel */}
          {selectedReport ? (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                    {selectedReport.referenceCode}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Logged: {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${(STATUS_LABELS[selectedReport.status] || { tone: 'received' }).tone}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                    {selectedReport.status}
                  </span>

                  {/* Escalate button */}
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(true)}
                    className="btn"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      color: '#fde047',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    title="Escalate ticket to higher department authority"
                  >
                    <Share2 size={13} />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>

              {/* Escalated Banner if applicable */}
              {selectedReport.escalatedTo && (
                <div
                  style={{
                    background: 'rgba(234, 179, 8, 0.12)',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    color: '#fde047',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ fontWeight: 800 }}>&bull; Escalated to: {selectedReport.escalatedTo}</div>
                  {selectedReport.escalationNote && (
                    <div style={{ fontSize: '0.8rem', color: '#fef08a', marginTop: '0.2rem' }}>
                      Note: {selectedReport.escalationNote}
                    </div>
                  )}
                </div>
              )}

              {/* Escalate Modal / Panel */}
              {showEscalateModal && (
                <div
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1.5px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fde047', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={16} /> Escalate to Higher Authority
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEscalateModal(false)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleEscalateReport}>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Choose Authority</label>
                      <select
                        className="input-field"
                        value={escalateAuthority}
                        onChange={(e) => setEscalateAuthority(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {ESCALATION_AUTHORITIES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Escalation Reason / Note</label>
                      <textarea
                        className="input-field"
                        rows={2}
                        placeholder="e.g. Critical safety issue requires immediate intervention"
                        value={escalateNote}
                        onChange={(e) => setEscalateNote(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isEscalating}
                      className="btn"
                      style={{
                        background: '#eab308',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      {isEscalating ? 'Recording Escalation...' : 'Confirm Escalation'}
                    </button>
                  </form>
                </div>
              )}

              {escalateSuccess && (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#86efac', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {escalateSuccess}
                </div>
              )}
              {escalateError && (
                <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {escalateError}
                </div>
              )}

              {/* Location & Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Landmark Location
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <MapPin size={16} color="var(--color-brand-primary)" />
                  <span>{selectedReport.locationDescription}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Issue Description
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5, background: 'var(--color-surface-2)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  {selectedReport.issueDescription}
                </div>
              </div>

              {/* Attached Photo Preview */}
              {selectedReport.photoAvailable && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Photo Evidence
                  </div>
                  {isLoadingPhoto ? (
                    <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      Loading photo evidence...
                    </div>
                  ) : photoBlobUrl ? (
                    <img
                      src={photoBlobUrl}
                      alt="Report evidence"
                      style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--color-border)' }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Photo available on server.</div>
                  )}
                </div>
              )}

              {/* Status Update & Reply Form */}
              <form onSubmit={handleUpdateReport} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '1rem' }}>
                  Respond &amp; Update Status
                </h3>

                {updateSuccess && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#86efac', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {updateSuccess}
                  </div>
                )}
                {updateError && (
                  <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {updateError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    Status Transition (Current: {selectedReport.status})
                  </label>
                  <select
                    className="input-field"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as any)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="">Keep status ({selectedReport.status})</option>
                    {allowedTransitions.map((st) => (
                      <option key={st} value={st}>Advance to {st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    <MessageSquare size={14} /> Official Reply to Student (Visible on Public Tracking)
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="e.g. Electrician Sharma assigned. Work order #E-101."
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    Internal Operations Note (Logged to audit trail)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Bucket truck dispatched."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn btn-pink-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <Send size={15} />
                  <span>{isUpdating ? 'Saving Update...' : 'Submit Update & Reply'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              Select a report from the list to view details and action triage.
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: EMERGENCY SOS DISTRESS INBOX
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 className="title-card-sm" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#e11d48" /> Active SOS Distress Alerts ({sosAlerts.length})
            </h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Auto-refreshing every 10 seconds
            </span>
          </div>

          {sosAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <p className="text-body-muted">No emergency SOS alerts logged.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {sosAlerts.map((alert) => {
                const isNew = alert.status === 'new';
                const hasGps = alert.lat !== null && alert.lat !== undefined && alert.lng !== null && alert.lng !== undefined;
                const mapLink = hasGps ? `https://www.google.com/maps?q=${alert.lat},${alert.lng}` : null;

                return (
                  <div
                    key={alert.id}
                    style={{
                      background: 'var(--color-surface)',
                      border: isNew ? '2px solid #e11d48' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem 1.5rem',
                      boxShadow: isNew ? '0 0 16px rgba(225, 29, 72, 0.25)' : 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span
                          style={{
                            background: isNew ? '#e11d48' : alert.status === 'acknowledged' ? '#f59e0b' : '#10b981',
                            color: '#ffffff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {alert.status}
                        </span>
                        <span style={{ marginLeft: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Alert ID: <code>{alert.id}</code> &bull; {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {alert.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => handleSosStatusChange(alert.id, 'acknowledged')}
                            className="btn-secondary"
                            style={{ minHeight: '34px', fontSize: 'var(--text-xs)', borderColor: '#f59e0b', color: '#f59e0b' }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => handleSosStatusChange(alert.id, 'resolved')}
                            className="btn-secondary"
                            style={{ minHeight: '34px', fontSize: 'var(--text-xs)', borderColor: '#10b981', color: '#10b981' }}
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                      {hasGps ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                          <MapPin size={16} color="#e11d48" />
                          <span>Coordinates: {alert.lat?.toFixed(5)}, {alert.lng?.toFixed(5)} (&plusmn;{alert.accuracy || 10}m)</span>
                          {mapLink && (
                            <a href={mapLink} target="_blank" rel="noreferrer" style={{ color: 'var(--color-brand-primary)', textDecoration: 'underline', marginLeft: '0.25rem' }}>
                              Open Map
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--color-text-subtle)' }}>GPS Coordinates: None supplied</div>
                      )}

                      {alert.message && (
                        <div style={{ color: 'var(--color-text-main)', background: 'var(--color-surface-2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          Message: &ldquo;{alert.message}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: TRANSPORT MANAGEMENT (View & Edit Route Timings & Driver)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'transport' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Routes List */}
          <div>
            <h2 className="title-card-sm" style={{ marginBottom: '1rem' }}>
              Campus Shuttle Routes ({routes.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routes.map((rt) => {
                const isSelected = rt.id === selectedRouteId;
                return (
                  <div
                    key={rt.id}
                    onClick={() => setSelectedRouteId(rt.id)}
                    style={{
                      background: isSelected ? 'rgba(251, 113, 133, 0.12)' : 'var(--color-surface)',
                      border: isSelected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.15rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                      {rt.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      Driver: <strong>{rt.driverName || 'Rajesh Kumar'}</strong> &bull; {rt.driverPhone || '+91 98765 43210'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                      Timings: {rt.scheduledDepartures ? rt.scheduledDepartures.join(', ') : '7:30 AM - 7:00 PM'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Route Details Form */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
              Edit Route Timetable &amp; Driver
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Changes will update live shuttle timings for students across the campus app.
            </p>

            {routeSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#86efac', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {routeSuccess}
              </div>
            )}
            {routeError && (
              <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {routeError}
              </div>
            )}

            <form onSubmit={handleSaveRoute}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  <User size={14} /> Assigned Driver Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rajesh Kumar"
                  value={editDriverName}
                  onChange={(e) => setEditDriverName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  <Phone size={14} /> Driver Phone Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. +91 98765 43210"
                  value={editDriverPhone}
                  onChange={(e) => setEditDriverPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  <Bus size={14} /> Vehicle / Bus Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. DL 1P B-4029"
                  value={editBusNumber}
                  onChange={(e) => setEditBusNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  <Clock size={14} /> Scheduled Timings / Departures
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 07:30 AM, 08:15 AM, 09:30 AM, 01:30 PM, 05:15 PM"
                  value={editTimings}
                  onChange={(e) => setEditTimings(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                  Comma-separated timetable or operating range.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingRoute}
                className="btn btn-pink-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                <Save size={16} />
                <span>{isSavingRoute ? 'Saving Timetable...' : 'Save Route Timings'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: ADMIN PROFILE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(251, 113, 133, 0.1))',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <Building2 size={32} color="var(--color-brand-primary)" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-text-main)' }}>
                {staffInfo?.name || 'Demo Admin'}
              </h2>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                {staffInfo?.email || 'demo.admin@srmuniversity.ac.in'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Employee ID
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-brand-primary)', fontFamily: 'var(--font-mono)' }}>
                  {staffInfo?.employeeId || 'EMP-SRM-2026'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Office Assignment
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {staffInfo?.office || 'Campus Operations'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Department
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {staffInfo?.department || 'Facilities & Infrastructure'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Access Role
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4ade80' }}>
                  Operations Administrator
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOutLocal}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', color: '#fca5a5', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            >
              <LogOut size={16} />
              <span>Sign Out of Admin Block</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
