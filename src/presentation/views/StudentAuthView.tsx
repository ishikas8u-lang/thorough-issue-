import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  Calendar,
  Building,
  Bus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { IStudentAuthService } from '../../application/interfaces';
import type { StudentSession, Route } from '../../types';
import { apiClient } from '../../infrastructure/apiClient';

interface StudentAuthViewProps {
  authService: IStudentAuthService;
  initialMode?: 'signin' | 'signup';
  onSuccess: (session: StudentSession) => void;
  onBackToRoles: () => void;
  noticeMessage?: string | null;
}

export const StudentAuthView: React.FC<StudentAuthViewProps> = ({
  authService,
  initialMode = 'signin',
  onSuccess,
  onBackToRoles,
  noticeMessage,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [fullName, setFullName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [phone, setPhone] = useState('');
  const [hostelType, setHostelType] = useState<'hostel' | 'dayscholar'>('hostel');
  const [busRouteId, setBusRouteId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Route list for optional bus route selection
  const [routes, setRoutes] = useState<Route[]>([]);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load available transit routes for dropdown
    apiClient.getRoutes().then((data) => {
      if (data?.routes) {
        setRoutes(data.routes);
      }
    }).catch(() => {
      // Fallback
    });
  }, []);

  const handleUseDemoStudent = async () => {
    setSignInEmail('demo.student@srmuniversity.ac.in');
    setSignInPassword('Student@123');
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const session = await authService.signIn('demo.student@srmuniversity.ac.in', 'Student@123');
      setSuccessMessage('Signed in as Demo Student! Redirecting to student portal...');
      setTimeout(() => {
        onSuccess(session);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with demo student account.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith('@srmuniversity.ac.in')) {
      setIsLoading(false);
      setErrorMessage('University email must end with @srmuniversity.ac.in');
      return;
    }

    try {
      const session = await authService.signIn(cleanEmail, signInPassword);
      setSuccessMessage('Sign in successful! Redirecting to student portal...');
      setTimeout(() => {
        onSuccess(session);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Check your email and password.';
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

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@srmuniversity.ac.in')) {
      setIsLoading(false);
      setErrorMessage('University email must end with @srmuniversity.ac.in');
      return;
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();
    if (!cleanRegNo || !/^[A-Z]{2}\d{4,14}$/.test(cleanRegNo)) {
      setIsLoading(false);
      setErrorMessage('Registration number must start with 2 letters followed by digits (e.g. RA2411003010001).');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setIsLoading(false);
      setErrorMessage('Phone number must contain between 7 and 15 digits.');
      return;
    }

    if (password.length < 6) {
      setIsLoading(false);
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    try {
      const session = await authService.signUp(
        {
          fullName: fullName.trim(),
          registrationNumber: cleanRegNo,
          email: cleanEmail,
          department: department.trim(),
          year: year.trim(),
          contactNumber: phone.trim(),
          phone: phone.trim(),
          hostelType,
          busRouteId: busRouteId || undefined,
          course: department.trim(),
          branch: department.trim(),
        },
        password
      );

      setSuccessMessage('Student account created successfully! Redirecting to portal...');
      setTimeout(() => {
        onSuccess(session);
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check inputs.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>
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

      {/* Main Auth Card */}
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
        {/* Header with Icon */}
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
            <GraduationCap size={28} color="var(--color-brand-primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--color-text-main)' }}>
            Student Portal
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {mode === 'signin' ? 'Sign in to access student facilities and safety' : 'Create your student account'}
          </p>
        </div>


        {/* Notice Message if any */}
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

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--color-surface-2)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'signin' ? 'var(--color-surface)' : 'transparent',
              color: mode === 'signin' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              fontWeight: mode === 'signin' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'signup' ? 'var(--color-surface)' : 'transparent',
              color: mode === 'signup' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              fontWeight: mode === 'signup' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success Alerts */}
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

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <div>
            {/* Big Prominent "Use demo student account" button */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleUseDemoStudent}
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
                <span>Sign in as demo student</span>
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                Demo credentials: <code>demo.student@srmuniversity.ac.in</code> &bull; <code>Student@123</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>
                or sign in with credentials
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleSignInSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  <Mail size={14} /> University Email (@srmuniversity.ac.in)
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. student@srmuniversity.ac.in"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
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
                  placeholder="Enter password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-pink-primary"
                disabled={isLoading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {isLoading ? 'Signing In...' : 'Sign In as Student'}
              </button>
            </form>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <BookOpen size={14} /> Registration Number (2 letters + digits)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. RA2411003010001"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                Format: two letters followed by student digits (e.g. RA2411003010001).
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <Mail size={14} /> University Email (Must end with @srmuniversity.ac.in)
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="e.g. rahul.s@srmuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Building size={14} /> Department / Program
                </label>
                <select
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Eng.</option>
                  <option value="Electronics & Communication">Electronics &amp; Comm.</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="School of Management">School of Management</option>
                  <option value="Law & Legal Studies">Law &amp; Legal Studies</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Year of Study
                </label>
                <select
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <Phone size={14} /> Phone Number (7–15 digits)
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Hostel or Day Scholar</label>
                <select
                  className="input-field"
                  value={hostelType}
                  onChange={(e) => setHostelType(e.target.value as any)}
                >
                  <option value="hostel">Hostel Resident</option>
                  <option value="dayscholar">Day Scholar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Bus size={14} /> Bus Route (Optional)
                </label>
                <select
                  className="input-field"
                  value={busRouteId}
                  onChange={(e) => setBusRouteId(e.target.value)}
                >
                  <option value="">None / Self Transit</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} /> Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} /> Confirm Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-pink-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
