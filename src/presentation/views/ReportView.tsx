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
      <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem', maxWidth: '680px' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.75rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid rgba(251, 113, 133, 0.35)',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h1 className="title-section" style={{ marginBottom: '0.45rem' }}>
            Report Successfully Logged!
          </h1>
          <p className="text-body-muted" style={{ margin: '0.5rem 0 1.5rem' }}>
            Your facilities report has been received and queued for review by campus maintenance teams.
          </p>

          <div className="ref-code-box">
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-text-subtle)' }}>
              Your Trackable Reference Code
            </div>
            <div className="ref-code-text">{submittedRefCode}</div>
            <button
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ padding: '0.55rem 1.15rem', minHeight: '44px' }}
              title="Copy Reference Code to clipboard"
            >
              {copied ? <><Check size={16} color="var(--color-brand-accent)" /> Copied to Clipboard!</> : <><Copy size={16} /> Copy Reference Code</>}
            </button>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: '1.75rem' }}>
            Save this code to check progress or read official Admin Block updates at any time without logging in.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onTrackSubmitted(submittedRefCode)}
              style={{ minWidth: '180px' }}
              title="Track report status now"
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
              title="Submit another report"
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
        <h1 className="title-section">
          Report a Campus Facilities Problem
        </h1>
        <p className="text-lead" style={{ marginTop: '0.45rem' }}>
          Submit trackable reports for broken lighting, plumbing leaks, accessibility barriers, or sanitation.
        </p>
      </div>

      {/* Mandatory Emergency Intercept Warning */}
      <div className="alert-notice" style={{ background: 'var(--color-urgent-soft)', borderColor: 'var(--color-urgent-border)', borderLeftColor: 'var(--color-urgent-bg)', color: '#ffe4e6', marginBottom: '2rem' }}>
        <div className="alert-notice-title" style={{ color: '#fecdd3' }}>
          <AlertTriangle size={20} color="var(--color-urgent-bg)" /> DO NOT USE THIS FORM FOR EMERGENCIES
        </div>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
          If you are reporting an active fire, gas leak, building collapse hazard, or medical danger, <strong>call Campus Security immediately</strong>. Web tickets are processed during standard facility operating hours.
        </p>
        <div style={{ marginTop: '0.85rem' }}>
          <a
            href={`tel:${PRIMARY_EMERGENCY.phone}`}
            className="urgent-dial-btn"
            style={{ padding: '0.5rem 1rem', minHeight: '44px', fontSize: 'var(--text-xs)' }}
            title={`Call Security Hotline ${PRIMARY_EMERGENCY.phone}`}
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
          padding: '2rem 1.6rem',
          boxShadow: 'var(--shadow-sm)',
          minWidth: 0,
        }}
      >
        {validationError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', padding: '0.8rem 1.1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.35rem', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <label className="form-label" htmlFor="report-description">
              3. Problem Description *
            </label>
            <span style={{ fontSize: 'var(--text-xs)', color: issueDescription.length > 500 ? '#b91c1c' : 'var(--color-text-subtle)' }}>
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
        <div style={{ background: 'var(--color-surface-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', margin: '1.5rem 0', minWidth: 0 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--color-text-main)', lineHeight: 'var(--leading-relaxed)' }}>
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              style={{ marginTop: '0.15rem', cursor: 'pointer', accentColor: 'var(--color-brand-accent)', flexShrink: 0 }}
            />
            <span>
              <strong>Privacy &amp; Processing Agreement:</strong> I understand this report will be routed to campus facilities operations. No student roll number or intrusive personal identification is recorded or shared publicly.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', minHeight: '44px' }}
          disabled={isSubmitting}
          title="Submit report to maintenance queue"
        >
          <ShieldCheck size={18} />
          <span>{isSubmitting ? 'Submitting Report...' : 'Submit Report & Generate Reference Code'}</span>
        </button>
      </form>
    </div>
  );
};
