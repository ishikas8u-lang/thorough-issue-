import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { IStudentAuthService } from '../../application/interfaces';
import type { StudentSession } from '../../types';

interface AdminAuthViewProps {
  authService: IStudentAuthService;
  onSuccess: (session: StudentSession) => void;
  onBackToRoles: () => void;
  noticeMessage?: string | null;
}

export const AdminAuthView: React.FC<AdminAuthViewProps> = ({
  authService,
  onSuccess,
  onBackToRoles,
  noticeMessage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUseDemoAdmin = async () => {
    setEmail('demo.admin@srmuniversity.ac.in');
    setPassword('Staff@Reviewer2026');
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const session = await authService.signIn('demo.admin@srmuniversity.ac.in', 'Staff@Reviewer2026');
      if (session.student.role !== 'staff' && session.student.role !== 'admin') {
        throw new Error('This account does not have Admin Block reviewer permissions.');
      }
      setSuccessMessage('Signed in as Demo Admin Reviewer! Redirecting to Admin Block...');
      setTimeout(() => {
        onSuccess(session);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with demo admin account.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@srmuniversity.ac.in')) {
      setIsLoading(false);
      setErrorMessage('Staff email must end with @srmuniversity.ac.in');
      return;
    }

    try {
      const session = await authService.signIn(cleanEmail, password);
      if (session.student.role !== 'staff' && session.student.role !== 'admin') {
        throw new Error('Access denied: This account does not possess staff/admin authorization.');
      }
      setSuccessMessage('Staff authentication confirmed! Redirecting to Admin Block...');
      setTimeout(() => {
        onSuccess(session);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid staff credentials or permissions.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Return to Role Choice */}
      <button
        type="button"
        onClick={onBackToRoles}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
          cursor: 'pointer',
          marginBottom: '1.25rem',
          padding: '0.25rem 0',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Role Selection</span>
      </button>

      {/* Main Admin Auth Card */}
      <div
        className="card"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Building2 size={28} color="var(--color-brand-primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--color-text-main)' }}>
            Admin Block Sign In
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Campus Operations, Facilities Review &amp; Dispatch
          </p>
        </div>


        {noticeMessage && (
          <div
            style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#fde047',
            }}
          >
            {noticeMessage}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              color: '#86efac',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Big Prominent "Use demo admin account" Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleUseDemoAdmin}
            disabled={isLoading}
            className="btn"
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18), rgba(251, 113, 133, 0.25))',
              border: '1.5px solid var(--color-brand-primary)',
              color: 'var(--color-brand-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={18} />
            <span>Sign in as demo admin</span>
          </button>
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
            Demo credentials: <code>demo.admin@srmuniversity.ac.in</code> &bull; <code>Staff@Reviewer2026</code>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>
            or enter staff credentials
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">
              <Mail size={14} /> Staff Email (@srmuniversity.ac.in)
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. admin@srmuniversity.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter staff password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-pink-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Admin Block'}
          </button>
        </form>
      </div>
    </div>
  );
};
