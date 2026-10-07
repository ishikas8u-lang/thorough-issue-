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
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '1.25rem' }}>
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
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* SRM University Institutional Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--color-pink-100)',
              color: 'var(--color-pink-800)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
              border: '1px solid var(--color-pink-200)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-pink-600)' }} />
            SRM UNIVERSITY
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--color-brand-primary)',
              marginBottom: '0.45rem',
            }}
          >
            {mode === 'signin' ? 'Student Sign In' : 'Create Student Account'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            {mode === 'signin'
              ? 'Access your student profile, saved preferences, and campus service history.'
              : 'Register your student profile for personalized campus operations access.'}
          </p>
        </div>

        {/* Informational Notice Banner (e.g. redirected from protected profile) */}
        {noticeMessage && (
          <div
            style={{
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--color-warning-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
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
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--color-success-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-pink-50)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-pink-200)',
            marginBottom: '1.75rem',
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
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'signin' ? 700 : 500,
              fontSize: '0.9rem',
              color: mode === 'signin' ? 'var(--color-pink-dark-text)' : 'var(--color-text-muted)',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
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
              padding: '0.6rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: mode === 'signup' ? 700 : 500,
              fontSize: '0.9rem',
              color: mode === 'signup' ? 'var(--color-pink-dark-text)' : 'var(--color-text-muted)',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
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
                <Mail size={15} /> Student Email Address *
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
                <Lock size={15} /> Password *
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
                padding: '0.85rem 1rem',
                margin: '1.25rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-pink-dark-text)' }}>
                <strong>Demo Student:</strong> <code>ananya.s@srmist.edu.in</code>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="btn-pink"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Auto-Fill Demo
              </button>
            </div>

            <button
              type="submit"
              className="btn-pink-primary"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}
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
                <User size={15} /> Full Name *
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
                <Mail size={15} /> University Email Address *
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
                <Phone size={15} /> Contact Number *
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
                <GraduationCap size={15} /> Course / Program *
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
                <BookOpen size={15} /> Branch / Specialization *
              </label>
              <input
                id="signup-branch"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering, Mechanical, Biotech"
                value={signUpBranch}
                onChange={(e) => setSignUpBranch(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">
                <Lock size={15} /> Password (Minimum 6 Characters) *
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
              style={{ width: '100%', marginTop: '0.75rem' }}
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
            fontSize: '0.8125rem',
            color: 'var(--color-text-subtle)',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          <strong>Student Privacy Guarantee:</strong> Your contact number, course, and branch are strictly confidential. They are never exposed in public facilities problem tickets or transport timetables.
        </div>
      </div>
    </div>
  );
};
