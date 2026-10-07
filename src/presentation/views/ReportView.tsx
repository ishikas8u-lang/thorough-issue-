import React, { useState } from 'react';
import { AlertTriangle, Phone, CheckCircle, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ReportCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { ReferenceCodeGenerator } from '../../domain/ReferenceCodeGenerator';
import type { IReportRepository } from '../../application/interfaces';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';

interface ReportViewProps {
  reportRepository: IReportRepository;
  onTrackSubmitted: (refCode: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ reportRepository, onTrackSubmitted }) => {
  const [category, setCategory] = useState<ReportCategory>('LIGHTING_ELECTRICAL');
  const [locationDescription, setLocationDescription] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Success state
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validations (RFC 2119 & RPT-01 constraints)
    if (!locationDescription.trim() || locationDescription.trim().length < 5) {
      setValidationError('Please provide a specific campus location or landmark (at least 5 characters).');
      return;
    }

    if (!issueDescription.trim() || issueDescription.trim().length < 15) {
      setValidationError('Please provide a concise description of the issue (minimum 15 characters).');
      return;
    }

    if (issueDescription.trim().length > 500) {
      setValidationError('Description exceeds maximum permitted limit (500 characters).');
      return;
    }

    if (!privacyAgreed) {
      setValidationError('You must acknowledge the campus privacy and processing notice.');
      return;
    }

    setIsSubmitting(true);

    try {
      const codeGen = new ReferenceCodeGenerator();
      const refCode = codeGen.generate();
      const now = new Date().toISOString();

      await reportRepository.save({
        id: `rep-${Date.now()}`,
        referenceCode: refCode,
        category,
        locationDescription: locationDescription.trim(),
        issueDescription: issueDescription.trim(),
        status: 'RECEIVED',
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            reportId: `rep-${Date.now()}`,
            previousStatus: 'RECEIVED',
            newStatus: 'RECEIVED',
            publicMessage: 'Report registered in campus facilities maintenance queue.',
            internalNote: 'Automated student intake.',
            actorId: 'system',
            createdAt: now,
          },
        ],
      });

      setSubmittedRefCode(refCode);
    } catch {
      setValidationError('Failed to submit report. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedRefCode) {
      navigator.clipboard.writeText(submittedRefCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If submitted successfully, show Confirmation Screen
  if (submittedRefCode) {
    return (
      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2.5rem', maxWidth: '680px' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.75rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '4.25rem',
              height: '4.25rem',
              borderRadius: '50%',
              background: '#f6e4e7',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.35rem',
              border: '2px solid rgba(82, 15, 27, 0.15)',
            }}
          >
            <CheckCircle size={40} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
            Report Successfully Logged!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', margin: '0.6rem 0 1.6rem', lineHeight: 1.55 }}>
            Your facilities report has been received and queued for review by campus maintenance teams.
          </p>

          <div className="ref-code-box">
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)' }}>
              Your Trackable Reference Code
            </div>
            <div className="ref-code-text">{submittedRefCode}</div>
            <button
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.875rem' }}
            >
              {copied ? <><Check size={16} color="var(--color-brand-accent)" /> Copied to Clipboard!</> : <><Copy size={16} /> Copy Reference Code</>}
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55, marginBottom: '2rem' }}>
            Save this code to check progress or read official staff updates at any time without logging in.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onTrackSubmitted(submittedRefCode)}
              style={{ minWidth: '190px' }}
            >
              Track Report Status <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setSubmittedRefCode(null);
                setLocationDescription('');
                setIssueDescription('');
                setPrivacyAgreed(false);
              }}
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem', maxWidth: '780px' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
          Report a Campus Facilities Problem
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginTop: '0.35rem' }}>
          Submit trackable reports for broken lighting, plumbing leaks, accessibility barriers, or sanitation.
        </p>
      </div>

      {/* Mandatory Emergency Intercept Warning */}
      <div className="alert-notice" style={{ background: 'var(--color-urgent-soft)', borderColor: 'var(--color-urgent-border)', borderLeftColor: 'var(--color-urgent-bg)', color: '#540f1a', marginBottom: '2rem' }}>
        <div className="alert-notice-title" style={{ color: '#540f1a' }}>
          <AlertTriangle size={20} color="var(--color-urgent-bg)" /> DO NOT USE THIS FORM FOR EMERGENCIES
        </div>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.55 }}>
          If you are reporting an active fire, gas leak, building collapse hazard, or medical danger, <strong>call Campus Security immediately</strong>. Web tickets are processed during standard facility operating hours.
        </p>
        <div style={{ marginTop: '0.85rem' }}>
          <a
            href={`tel:${PRIMARY_EMERGENCY.phone}`}
            className="urgent-dial-btn"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <Phone size={14} /> Call Security Hotline: {PRIMARY_EMERGENCY.phone}
          </a>
        </div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {validationError && (
          <div style={{ background: '#fae4e7', border: '1px solid #eab0ba', color: '#731221', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.925rem', fontWeight: 600 }}>
            {validationError}
          </div>
        )}

        {/* 1. Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="report-category">
            1. Problem Category *
          </label>
          <select
            id="report-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((catKey) => (
              <option key={catKey} value={catKey}>
                {CATEGORY_LABELS[catKey]}
              </option>
            ))}
          </select>
          <div className="form-hint">Select the category that best matches the physical defect.</div>
        </div>

        {/* 2. Campus Landmark / Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="report-location">
            2. Campus Location / Landmark *
          </label>
          <input
            id="report-location"
            type="text"
            className="form-input"
            placeholder="e.g. 3rd Floor Academic Block B, Corridor near Room 304"
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            maxLength={120}
          />
          <div className="form-hint">
            Be as specific as possible (building name, floor number, wing, or nearest numbered room). No GPS needed.
          </div>
        </div>

        {/* 3. Description */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="report-description">
              3. Problem Description *
            </label>
            <span style={{ fontSize: '0.8125rem', color: issueDescription.length > 500 ? 'red' : 'var(--color-text-subtle)' }}>
              {issueDescription.length} / 500
            </span>
          </div>
          <textarea
            id="report-description"
            className="form-textarea"
            placeholder="Describe what is broken, leaking, or blocked. (Minimum 15 characters)"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
          />
          <div className="form-hint">
            Explain the physical defect clearly. Please do not include student personal identification or names.
          </div>
        </div>

        {/* 4. Privacy Notice */}
        <div style={{ background: 'var(--color-surface-subtle)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', margin: '1.75rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.55 }}>
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: 'var(--color-brand-accent)' }}
            />
            <span>
              <strong>Privacy & Processing Agreement:</strong> I understand this report will be routed to campus facilities operations. No student roll number or intrusive personal identification is recorded or shared publicly.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          disabled={isSubmitting}
        >
          <ShieldCheck size={18} />
          {isSubmitting ? 'Submitting Report...' : 'Submit Report & Generate Reference Code'}
        </button>
      </form>
    </div>
  );
};
