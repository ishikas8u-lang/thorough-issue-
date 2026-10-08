import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, Mail, Phone, BookOpen, GraduationCap, User, AlertCircle, Sparkles } from 'lucide-react';
import type { IStudentAuthService } from '../../application/interfaces';
import type { StudentSession } from '../../types';

interface SignInViewProps {
  authService: IStudentAuthService;
  onSuccess: (session: StudentSession) => void;
  noticeMessage?: string | null;
}

export const SignInView: React.FC<SignInViewProps> = ({
  authService,
  onSuccess,
  noticeMessage,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpContact, setSignUpContact] = useState('');
  const [signUpCourse, setSignUpCourse] = useState('');
  const [signUpBranch, setSignUpBranch] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFillDemo = () => {
    setSignInEmail('ananya.s@srmist.edu.in');
    setSignInPassword('Student@123');
    setErrorMessage(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const session = await authService.signIn(signInEmail, signInPassword);
      setSuccessMessage('Sign in successful! Redirecting to student profile...');
      setTimeout(() => {
        onSuccess(session);
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const session = await authService.signUp(
        {
          fullName: signUpFullName,
          email: signUpEmail,
          contactNumber: signUpContact,
          course: signUpCourse,
          branch: signUpBranch,
        },
        signUpPassword
      );
      setSuccessMessage('Student account created successfully! Opening your profile...');
      setTimeout(() => {
        onSuccess(session);
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem', maxWidth: '580px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span>Campus Operations</span>
        <span>&rsaquo;</span>
        <span>SRM University</span>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Student Portal</span>
      </nav>

      {/* Main Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-pink-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 1.6rem',
          boxShadow: 'var(--shadow-md)',
          minWidth: 0,
        }}
      >
        {/* SRM University Institutional Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--color-pink-100)',
              color: 'var(--color-pink-800)',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              border: '1px solid var(--color-pink-200)',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-pink-600)' }} />
            SRM UNIVERSITY
          </div>

          <h1
            className="title-section-clean"
            style={{
              marginBottom: '0.4rem',
            }}
          >
            {mode === 'signin' ? 'Student Sign In' : 'Create Student Account'}
          </h1>
          <p className="text-body-muted" style={{ fontSize: 'var(--text-sm)', maxWidth: '440px', margin: '0 auto' }}>
            {mode === 'signin'
              ? 'Access your student profile, saved preferences, and campus service history.'
              : 'Register your student profile for personalized campus operations access.'}
          </p>
        </div>

        {/* Informational Notice Banner */}
        {noticeMessage && (
          <div
            style={{
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-warning-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: 'var(--text-xs)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-success-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-surface-2)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.75rem',
            gap: '0.35rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              minHeight: '44px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'signin' ? 700 : 500,
              fontSize: 'var(--text-sm)',
              color: mode === 'signin' ? '#ffffff' : 'var(--color-text-muted)',
              background: mode === 'signin' ? 'var(--color-brand-primary)' : 'transparent',
              boxShadow: mode === 'signin' ? '0 2px 8px rgba(244, 63, 94, 0.35)' : 'none',
              transition: 'var(--transition-all)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '0.65rem 0.5rem',
              minHeight: '44px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'signup' ? 700 : 500,
              fontSize: 'var(--text-sm)',
              color: mode === 'signup' ? '#ffffff' : 'var(--color-text-muted)',
              background: mode === 'signup' ? 'var(--color-brand-primary)' : 'transparent',
              boxShadow: mode === 'signup' ? '0 2px 8px rgba(244, 63, 94, 0.35)' : 'none',
              transition: 'var(--transition-all)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="signin-email">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} /> Student Email Address *
                </span>
              </label>
              <input
                id="signin-email"
                type="email"
                className="form-input"
                placeholder="e.g. ananya.s@srmist.edu.in"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signin-password">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={15} /> Password *
                </span>
              </label>
              <input
                id="signin-password"
                type="password"
                className="form-input"
                placeholder="Enter your student account password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Quick Demo Pre-fill for reviewers */}
            <div
              style={{
                background: 'var(--color-pink-50)',
                border: '1px dashed var(--color-pink-300)',
                borderRadius: 'var(--radius-md)',
                padding: '0.8rem 1rem',
                margin: '1.25rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-pink-dark-text)', overflowWrap: 'anywhere' }}>
                <strong>Demo Student:</strong> <code>ananya.s@srmist.edu.in</code>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="btn-pink"
                style={{ padding: '0.35rem 0.75rem', minHeight: '38px', fontSize: 'var(--text-xs)' }}
                title="Fill credentials for test student"
              >
                Auto-Fill Demo
              </button>
            </div>

            <button
              type="submit"
              className="btn-pink-primary"
              disabled={isLoading}
              style={{ width: '100%', minHeight: '44px', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Student Account'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={15} /> Full Name *
                </span>
              </label>
              <input
                id="signup-name"
                type="text"
                className="form-input"
                placeholder="e.g. Ananya Sharma"
                value={signUpFullName}
                onChange={(e) => setSignUpFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} /> University Email Address *
                </span>
              </label>
              <input
                id="signup-email"
                type="email"
                className="form-input"
                placeholder="e.g. ananya.s@srmist.edu.in"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
              <div className="form-hint">Must be a valid email format.</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-contact">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={15} /> Contact Number *
                </span>
              </label>
              <input
                id="signup-contact"
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210 or 9876543210"
                value={signUpContact}
                onChange={(e) => setSignUpContact(e.target.value)}
                required
              />
              <div className="form-hint">Supports international country codes (7-15 digits total).</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-course">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={15} /> Course / Program *
                </span>
              </label>
              <input
                id="signup-course"
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech, M.Tech, MBA, B.Sc"
                value={signUpCourse}
                onChange={(e) => setSignUpCourse(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-branch">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BookOpen size={15} /> Branch / Specialization *
                </span>
              </label>
              <input
                id="signup-branch"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering, Mechanical"
                value={signUpBranch}
                onChange={(e) => setSignUpBranch(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={15} /> Password (Minimum 6 Characters) *
                </span>
              </label>
              <input
                id="signup-password"
                type="password"
                className="form-input"
                placeholder="Create a secure password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className="form-hint">Never stored in plain text; hashed securely using Web Crypto SHA-256.</div>
            </div>

            <button
              type="submit"
              className="btn-pink-primary"
              disabled={isLoading}
              style={{ width: '100%', minHeight: '44px', marginTop: '0.75rem' }}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Privacy Note */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-subtle)',
            lineHeight: 'var(--leading-relaxed)',
            textAlign: 'center',
          }}
        >
          <strong>Student Privacy Guarantee:</strong> Your contact number, course, and branch are strictly confidential. They are never exposed in public facilities problem tickets or transport timetables.
        </div>
      </div>
    </div>
  );
};
