import React, { useState } from 'react';
import { User, Mail, Phone, GraduationCap, BookOpen, LogOut, Edit3, Check, X, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import type { IStudentAuthService } from '../../application/interfaces';
import type { StudentProfile, StudentSession } from '../../types';

interface ProfileViewProps {
  authService: IStudentAuthService;
  session: StudentSession;
  onProfileUpdated: (updatedProfile: StudentProfile) => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  authService,
  session,
  onProfileUpdated,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form edit fields
  const [fullName, setFullName] = useState(session.student.fullName);
  const [contactNumber, setContactNumber] = useState(session.student.contactNumber);
  const [course, setCourse] = useState(session.student.course);
  const [branch, setBranch] = useState(session.student.branch);

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStartEdit = () => {
    setFullName(session.student.fullName);
    setContactNumber(session.student.contactNumber);
    setCourse(session.student.course);
    setBranch(session.student.branch);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await authService.updateProfile({
        fullName,
        contactNumber,
        course,
        branch,
      });

      onProfileUpdated(updated);
      setIsEditing(false);
      setSuccessMessage('Student profile details updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem', maxWidth: '780px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '1.25rem' }}>
        <span>Campus Operations</span>
        <span>&rsaquo;</span>
        <span>SRM University</span>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>Student Profile</span>
      </nav>

      {/* Main Profile Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-pink-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header with SRM University Badge and Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'var(--color-pink-100)',
                color: 'var(--color-pink-800)',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                border: '1px solid var(--color-pink-200)',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-pink-600)' }} />
              SRM UNIVERSITY
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.1rem',
                fontWeight: 700,
                color: 'var(--color-brand-primary)',
                marginBottom: '0.35rem',
              }}
            >
              Student Profile & Account
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
              Verified student account on the Campus Assist operations portal.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="btn-pink"
                style={{ fontSize: '0.875rem' }}
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="btn-secondary"
              style={{ fontSize: '0.875rem', color: '#881337', borderColor: '#f43f5e' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
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

        {successMessage && (
          <div
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-success-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Card View / Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">
                  <User size={15} /> Full Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-email">
                  <Mail size={15} /> University Email (Permanent Identity)
                </label>
                <input
                  id="edit-email"
                  type="email"
                  className="form-input"
                  value={session.student.email}
                  disabled
                  style={{ opacity: 0.7, background: 'var(--color-surface-subtle)', cursor: 'not-allowed' }}
                />
                <div className="form-hint">Email address cannot be modified once registered.</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-contact">
                  <Phone size={15} /> Contact Number *
                </label>
                <input
                  id="edit-contact"
                  type="tel"
                  className="form-input"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
                <div className="form-hint">Accepts international formats (7-15 digits total).</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-course">
                  <GraduationCap size={15} /> Course / Program *
                </label>
                <input
                  id="edit-course"
                  type="text"
                  className="form-input"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech, M.Tech, MBA"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="edit-branch">
                  <BookOpen size={15} /> Branch / Specialization *
                </label>
                <input
                  id="edit-branch"
                  type="text"
                  className="form-input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
                disabled={isSaving}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="btn-pink-primary"
                disabled={isSaving}
              >
                <Check size={16} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* User Info Overview Banner */}
            <div
              style={{
                background: 'var(--color-pink-50)',
                border: '1px solid var(--color-pink-200)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  width: '3.75rem',
                  height: '3.75rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-pink-600), #851630)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(184, 45, 77, 0.3)',
                }}
              >
                {session.student.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  {session.student.fullName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  <span>{session.student.email}</span>
                  <span>&bull;</span>
                  <span className="badge-pastel-pink">
                    <ShieldCheck size={13} /> Active Student Session
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <User size={15} color="var(--color-pink-600)" /> Full Name
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {session.student.fullName}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Mail size={15} color="var(--color-pink-600)" /> Email Address
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {session.student.email}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Phone size={15} color="var(--color-pink-600)" /> Contact Number
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {session.student.contactNumber}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <GraduationCap size={15} color="var(--color-pink-600)" /> Course / Program
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {session.student.course}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <BookOpen size={15} color="var(--color-pink-600)" /> Branch / Specialization
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {session.student.branch}
                </div>
              </div>
            </div>

            {/* Session Metadata Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--color-text-subtle)',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} /> Last updated: {new Date(session.student.updatedAt).toLocaleString()}
              </div>
              <div>
                Session expires: {new Date(session.expiresAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Callout */}
        <div
          style={{
            marginTop: '2rem',
            background: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          <ShieldCheck size={20} color="var(--color-pink-600)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Strict Confidentiality Guaranteed:</strong> Your contact number, course, and branch are never displayed on public screens, facilities issue lookups, or transport timetables.
          </div>
        </div>
      </div>
    </div>
  );
};
