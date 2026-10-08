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
            padding: '2.25rem 1.75rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'var(--color-surface-subtle)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Lock size={26} />
          </div>

          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }}>
            <span>Campus Operations</span>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Admin Block</span>
          </nav>

          <h2 className="title-card" style={{ marginBottom: '0.45rem' }}>
            Admin Block: Operations Triage Portal
          </h2>
          <p className="text-body-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
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

            <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '44px', marginTop: '0.5rem' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', minWidth: 0 }}>
        <div>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span>Campus Operations</span>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Admin Block</span>
            <span>&rsaquo;</span>
            <span>Review Queue &amp; Triage</span>
          </nav>
          <h1 className="title-section-clean" style={{ marginBottom: '0.35rem' }}>
            Admin Block: Review Queue &amp; Triage
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
            <User size={14} /> Authenticated Reviewer: <strong>{staffUser}</strong>
            <span className="badge badge-received">RBAC: Facilities Officer</span>
          </div>
        </div>

        <button className="btn-secondary" onClick={onLogout} style={{ minHeight: '44px' }} title="Sign out of Admin Block">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', minWidth: 0 }}>
        {['ALL', 'RECEIVED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'DUPLICATE', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className="badge"
            style={{
              cursor: 'pointer',
              background: statusFilter === st ? 'var(--color-brand-primary)' : 'var(--color-surface-hover)',
              color: statusFilter === st ? '#ffffff' : 'var(--color-text-main)',
              border: 'none',
              padding: '0.4rem 0.75rem',
              minHeight: '34px',
            }}
            title={`Filter by ${st}`}
          >
            {st} {st !== 'ALL' ? `(${reports.filter((r) => r.status === st).length})` : `(${reports.length})`}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid: Queue List (Left) + Detail & Triage Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.75rem', minWidth: 0 }}>
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
            minWidth: 0,
          }}
        >
          <h3 className="title-card-sm" style={{ marginBottom: '1rem' }}>
            Queue Items ({filteredReports.length})
          </h3>

          {filteredReports.length === 0 ? (
            <p className="text-body-muted" style={{ textAlign: 'center', padding: '2rem 0', fontSize: 'var(--text-sm)' }}>
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
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-brand-accent)' : '1px solid var(--color-border)',
                    background: isSelected ? 'var(--color-brand-accent-light)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    marginBottom: '0.65rem',
                    transition: 'var(--transition-all)',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-brand-primary)', fontSize: 'var(--text-sm)' }}>
                      {rep.referenceCode}
                    </span>
                    <span className={`badge badge-${STATUS_LABELS[rep.status].tone}`}>
                      {STATUS_LABELS[rep.status].label}
                    </span>
                  </div>

                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.2rem' }}>
                    {CATEGORY_LABELS[rep.category]}
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', overflowWrap: 'anywhere' }}>
                    <MapPin size={13} style={{ flexShrink: 0 }} /> <span>{rep.locationDescription}</span>
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
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', minWidth: 0 }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 600, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
                  ACTIVE TICKET
                </span>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xl)', color: 'var(--color-brand-primary)', overflowWrap: 'anywhere' }}>
                  {selectedReport.referenceCode}
                </h2>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Internal ID: <code>{selectedReport.id}</code>
                </div>
              </div>

              <span className={`badge badge-${STATUS_LABELS[selectedReport.status].tone}`} style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.75rem' }}>
                {STATUS_LABELS[selectedReport.status].label}
              </span>
            </div>

            {/* Ticket Info Details */}
            <div style={{ marginBottom: '1.35rem', background: 'var(--color-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                <strong>Category:</strong> {CATEGORY_LABELS[selectedReport.category]}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', marginBottom: '0.35rem', overflowWrap: 'anywhere' }}>
                <strong>Landmark Location:</strong> {selectedReport.locationDescription}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                <strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', marginTop: '0.65rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.45rem' }}>
                <strong>Defect Description:</strong>
                <p style={{ color: 'var(--color-text-main)', marginTop: '0.2rem', lineHeight: 'var(--leading-relaxed)', overflowWrap: 'anywhere' }}>{selectedReport.issueDescription}</p>
              </div>
            </div>

            {/* State Transition Triage Form */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--color-surface)', minWidth: 0 }}>
              <h3 className="title-card-sm" style={{ marginBottom: '0.75rem' }}>
                State Machine Transition Controls
              </h3>

              {allowedTransitions.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                  No further transitions allowed from current terminal state.
                </div>
              ) : (
                <form onSubmit={handleStatusUpdate}>
                  {updateError && (
                    <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', marginBottom: '0.75rem' }}>
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div style={{ color: '#15803d', background: '#dcfce7', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', marginBottom: '0.75rem' }}>
                      {updateSuccess}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="target-status">
                      Next Allowed State (Enforced by Policy) *
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
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    {isUpdating ? 'Saving Transition...' : 'Execute Status Transition'}
                  </button>
                </form>
              )}
            </div>

            {/* Audit Trail Log View */}
            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-subtle)' }}>
              Immutable Audit History ({selectedReport.auditTrail.length} Events)
            </h4>

            <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: 'var(--text-xs)', minWidth: 0 }}>
              {selectedReport.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderLeft: '3px solid var(--color-brand-accent)',
                    paddingLeft: '0.75rem',
                    marginBottom: '0.75rem',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-subtle)', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <span>
                      Actor: <strong>{entry.actorId}</strong> &rarr; {entry.newStatus}
                    </span>
                    <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {entry.publicMessage && (
                    <div style={{ color: 'var(--color-text-main)', marginTop: '0.15rem', overflowWrap: 'anywhere' }}>
                      <em>Public:</em> &ldquo;{entry.publicMessage}&rdquo;
                    </div>
                  )}
                  {entry.internalNote && (
                    <div style={{ color: '#b45309', marginTop: '0.15rem', overflowWrap: 'anywhere' }}>
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
