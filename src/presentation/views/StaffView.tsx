import React, { useState, useEffect } from 'react';
import { Lock, MapPin, User, LogOut } from 'lucide-react';
import type { IReportRepository } from '../../application/interfaces';
import type { Report, ReportStatus } from '../../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../types';
import { ReportStatusPolicy } from '../../domain/ReportStatusPolicy';

interface StaffViewProps {
  reportRepository: IReportRepository;
  staffUser: string | null;
  onLogin: (username: string) => void;
  onLogout: () => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  reportRepository,
  staffUser,
  onLogin,
  onLogout,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Mutation form state
  const [targetStatus, setTargetStatus] = useState<ReportStatus | ''>('');
  const [publicMessage, setPublicMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Login input state
  const [loginInput, setLoginInput] = useState('staff_vansh');

  const statusPolicy = new ReportStatusPolicy();

  const loadReports = async () => {
    const all = await reportRepository.findAll();
    setReports(all);
    if (!selectedReportId && all.length > 0) {
      setSelectedReportId(all[0].id);
    }
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Admin Block — Campus Assist';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    if (staffUser) {
      loadReports();
    }
  }, [staffUser]);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;
  const allowedTransitions = selectedReport ? statusPolicy.getAllowedTransitions(selectedReport.status) : [];

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !targetStatus) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const updated = await reportRepository.updateStatus(
        selectedReport.id,
        targetStatus,
        publicMessage,
        internalNote,
        staffUser || 'staff_anonymous'
      );

      setUpdateSuccess(`Status successfully transitioned to ${STATUS_LABELS[targetStatus].label}`);
      setPublicMessage('');
      setInternalNote('');
      setTargetStatus('');
      await loadReports();
      setSelectedReportId(updated.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      setUpdateError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // If unauthenticated, show Staff Login Gate
  if (!staffUser) {
    return (
      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '3rem', maxWidth: '480px' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: '#f1f5f9',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Lock size={28} />
          </div>

          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }}>
            <span>Campus Operations</span>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Admin Block</span>
          </nav>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
            Admin Block: Operations Triage Portal
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Authorized campus facility reviewers only. Enforces state machine policy and immutable audit tracking.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loginInput.trim()) onLogin(loginInput.trim());
            }}
          >
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="staff-user">
                Admin / Reviewer ID
              </label>
              <input
                id="staff-user"
                type="text"
                className="form-input"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. staff_vansh or staff_krisha"
                required
              />
              <div className="form-hint">
                Demo role: use <code>staff_vansh</code> or <code>staff_krisha</code>.
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Sign In to Admin Block
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered reports
  const filteredReports = statusFilter === 'ALL' ? reports : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Staff Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <div>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '0.4rem' }}>
            <span>Campus Operations</span>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Admin Block</span>
            <span>&rsaquo;</span>
            <span>Review Queue &amp; Triage</span>
          </nav>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            Admin Block: Review Queue & Triage
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <User size={15} /> Authenticated Reviewer: <strong>{staffUser}</strong>
            <span className="badge badge-received">RBAC: Facilities Officer</span>
          </div>
        </div>

        <button className="btn-secondary" onClick={onLogout} style={{ fontSize: '0.875rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['ALL', 'RECEIVED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'DUPLICATE', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className="badge"
            style={{
              cursor: 'pointer',
              background: statusFilter === st ? 'var(--color-brand-primary)' : '#f1f5f9',
              color: statusFilter === st ? '#ffffff' : 'var(--color-text-main)',
              border: 'none',
              padding: '0.4rem 0.85rem',
            }}
          >
            {st} {st !== 'ALL' ? `(${reports.filter((r) => r.status === st).length})` : `(${reports.length})`}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid: Queue List (Left) + Detail & Triage Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* Left: Queue List */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            maxHeight: '750px',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Queue Items ({filteredReports.length})
          </h3>

          {filteredReports.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No reports matching the selected status filter.
            </p>
          ) : (
            filteredReports.map((rep) => {
              const isSelected = rep.id === selectedReportId;
              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    setTargetStatus('');
                    setUpdateError(null);
                    setUpdateSuccess(null);
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-brand-accent)' : '1px solid var(--color-border)',
                    background: isSelected ? '#f0fdfa' : '#ffffff',
                    cursor: 'pointer',
                    marginBottom: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                      {rep.referenceCode}
                    </span>
                    <span className={`badge badge-${STATUS_LABELS[rep.status].tone}`}>
                      {STATUS_LABELS[rep.status].label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                    {CATEGORY_LABELS[rep.category]}
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {rep.locationDescription}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detail & Transition Inspector */}
        {selectedReport ? (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                  ACTIVE TICKET
                </span>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--color-brand-primary)' }}>
                  {selectedReport.referenceCode}
                </h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Internal ID: <code>{selectedReport.id}</code>
                </div>
              </div>

              <span className={`badge badge-${STATUS_LABELS[selectedReport.status].tone}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
                {STATUS_LABELS[selectedReport.status].label}
              </span>
            </div>

            {/* Ticket Info Details */}
            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <strong>Category:</strong> {CATEGORY_LABELS[selectedReport.category]}
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <strong>Landmark Location:</strong> {selectedReport.locationDescription}
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <strong>Defect Description:</strong>
                <p style={{ color: '#334155', marginTop: '0.2rem', lineHeight: 1.5 }}>{selectedReport.issueDescription}</p>
              </div>
            </div>

            {/* State Transition Triage Form */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-brand-primary)' }}>
                State Machine Transition Controls
              </h3>

              {allowedTransitions.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  No further transitions allowed from current terminal state.
                </div>
              ) : (
                <form onSubmit={handleStatusUpdate}>
                  {updateError && (
                    <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div style={{ color: '#15803d', background: '#dcfce7', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {updateSuccess}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="target-status">
                      Next Allowed State (Enforced by ReportStatusPolicy) *
                    </label>
                    <select
                      id="target-status"
                      className="form-select"
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                      required
                    >
                      <option value="">-- Choose Allowed State --</option>
                      {allowedTransitions.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_LABELS[st].label} ({st})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="public-msg">
                      Public Update Note (Visible to Student on Status Lookup)
                    </label>
                    <input
                      id="public-msg"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Electrician team dispatched with replacement fixture."
                      value={publicMessage}
                      onChange={(e) => setPublicMessage(e.target.value)}
                    />
                    <div className="form-hint">Keep clear, reassuring, and free of personal data.</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="internal-note">
                      Internal Admin Note (STRICTLY PRIVATE - Never Leaked to Public)
                    </label>
                    <input
                      id="internal-note"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Assigned to contractor Verma Electricals, work order #E-401"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                    />
                    <div className="form-hint">Stored securely in immutable audit log.</div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!targetStatus || isUpdating}
                    style={{ width: '100%' }}
                  >
                    {isUpdating ? 'Saving Transition...' : 'Execute Status Transition'}
                  </button>
                </form>
              )}
            </div>

            {/* Audit Trail Log View */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-subtle)' }}>
              Immutable Audit History ({selectedReport.auditTrail.length} Events)
            </h4>

            <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.8125rem' }}>
              {selectedReport.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderLeft: '3px solid var(--color-brand-accent)',
                    paddingLeft: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-subtle)' }}>
                    <span>
                      Actor: <strong>{entry.actorId}</strong> &rarr; {entry.newStatus}
                    </span>
                    <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {entry.publicMessage && (
                    <div style={{ color: 'var(--color-text-main)', marginTop: '0.15rem' }}>
                      <em>Public:</em> &ldquo;{entry.publicMessage}&rdquo;
                    </div>
                  )}
                  {entry.internalNote && (
                    <div style={{ color: '#b45309', marginTop: '0.15rem' }}>
                      <em>Internal:</em> &ldquo;{entry.internalNote}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            Select a report from the queue to inspect details.
          </div>
        )}
      </div>
    </div>
  );
};
