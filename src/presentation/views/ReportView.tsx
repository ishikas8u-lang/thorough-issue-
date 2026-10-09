import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Phone,
  CheckCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Camera,
  X,
  MapPin,
  Loader2,
} from 'lucide-react';
import type { ReportCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { apiClient } from '../../infrastructure/apiClient';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';

interface ReportViewProps {
  reportRepository?: any;
  onTrackSubmitted: (refCode: string) => void;
}

// Client-side image resizing to under 1280px before upload
function resizeImageToMaxDimension(file: File, maxDim: number = 1280): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);

    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const resized = new File([blob], file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'), {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(resized);
        },
        outputType,
        0.85
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

const REPORT_CATEGORIES: ReportCategory[] = [
  'STREET_LIGHT',
  'ELECTRICITY',
  'WATER',
  'CLEANLINESS',
  'FURNITURE',
  'OTHER',
];

export const ReportView: React.FC<ReportViewProps> = ({ onTrackSubmitted }) => {
  const [category, setCategory] = useState<ReportCategory>('STREET_LIGHT');
  const [locationDescription, setLocationDescription] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Photo state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Location GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Success state
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      setValidationError('Only JPG, PNG, and WebP images are permitted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError('Selected image is too large. Please select an image under 10MB.');
      return;
    }

    setValidationError(null);
    setIsProcessingPhoto(true);

    try {
      const resized = await resizeImageToMaxDimension(file, 1280);
      setSelectedPhoto(resized);

      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      const preview = URL.createObjectURL(resized);
      setPhotoPreviewUrl(preview);
    } catch {
      setSelectedPhoto(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setSelectedPhoto(null);
    setPhotoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const areaString = `Campus GPS Landmark (${lat}° N, ${lng}° E)`;
        setLocationDescription((prev) => (prev ? `${prev} [${areaString}]` : areaString));
        setLocationNotice('Location added from GPS.');
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationNotice('Permission denied. Please enter your campus area manually.');
        } else {
          setLocationNotice('Could not acquire GPS position. Please enter campus area manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

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
      const res = await apiClient.createReport({
        category,
        locationDescription: locationDescription.trim(),
        issueDescription: issueDescription.trim(),
        privacyAgreed: true,
        photo: selectedPhoto,
      });

      if (res && res.referenceCode) {
        setSubmittedRefCode(res.referenceCode);
      } else {
        throw new Error('No reference code returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report. Please retry.';
      setValidationError(msg);
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
            Your facilities report has been received and queued for review by the Admin Block.
          </p>

          <div className="ref-code-box">
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                color: 'var(--color-text-subtle)',
              }}
            >
              Your Trackable Reference Code
            </div>
            <div className="ref-code-text">{submittedRefCode}</div>
            <button
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ padding: '0.55rem 1.15rem', minHeight: '44px' }}
              title="Copy Reference Code to clipboard"
            >
              {copied ? (
                <>
                  <Check size={16} color="var(--color-brand-accent)" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy Reference Code
                </>
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: '1.75rem',
            }}
          >
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
                handleRemovePhoto();
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
        <h1 className="title-section">Report a Campus Facilities Problem</h1>
        <p className="text-lead" style={{ marginTop: '0.45rem' }}>
          Submit trackable reports with photo evidence for broken street lights, electrical faults, plumbing, or cleanliness.
        </p>
      </div>

      {/* Emergency Intercept Warning */}
      <div
        className="alert-notice"
        style={{
          background: 'var(--color-urgent-soft)',
          borderColor: 'var(--color-urgent-border)',
          borderLeftColor: 'var(--color-urgent-bg)',
          color: '#ffe4e6',
          marginBottom: '2rem',
        }}
      >
        <div className="alert-notice-title" style={{ color: '#fecdd3' }}>
          <AlertTriangle size={20} color="var(--color-urgent-bg)" /> DO NOT USE THIS FORM FOR EMERGENCIES
        </div>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
          If you are reporting an active fire, gas leak, building collapse hazard, or medical danger,{' '}
          <strong>call Campus Security immediately</strong>.
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
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '0.8rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.35rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
            }}
          >
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
            {REPORT_CATEGORIES.map((catKey) => (
              <option key={catKey} value={catKey}>
                {CATEGORY_LABELS[catKey]}
              </option>
            ))}
          </select>
          <div className="form-hint">
            Select one: Street light, Electricity, Water, Cleanliness, Furniture, or Other.
          </div>
        </div>

        {/* 2. Campus Landmark / Area Field + GPS Button */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="form-label" htmlFor="report-location">
              2. Campus Area / Landmark *
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="btn-secondary"
              style={{
                minHeight: '34px',
                padding: '0.35rem 0.75rem',
                fontSize: 'var(--text-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Use current location"
            >
              {isLocating ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} color="var(--color-brand-primary)" />}
              <span>{isLocating ? 'Detecting Location...' : 'Use my current location'}</span>
            </button>
          </div>

          <input
            id="report-location"
            type="text"
            className="form-input"
            placeholder="e.g. SRM Tech Park 4th Floor, Hostel Block C, Pathway outside Library"
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            maxLength={140}
            required
          />

          {locationNotice && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-accent)', marginTop: '0.35rem' }}>
              {locationNotice}
            </div>
          )}
          <div className="form-hint">
            Be specific (building name, wing, floor or room number).
          </div>
        </div>

        {/* 3. Description with Character Counter */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <label className="form-label" htmlFor="report-description">
              3. Problem Description *
            </label>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: issueDescription.length > 500 ? '#ef4444' : 'var(--color-text-subtle)',
              }}
            >
              {issueDescription.length} / 500
            </span>
          </div>
          <textarea
            id="report-description"
            className="form-textarea"
            placeholder="Describe what is broken, leaking, or damaged. (Minimum 15 characters)"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            required
          />
          <div className="form-hint">
            Explain the defect clearly without personal student roll numbers or sensitive data.
          </div>
        </div>

        {/* 4. Photo Upload Attachment (Camera & Picker) */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" htmlFor="report-photo-input">
            4. Photo Attachment (Optional, max 3 MB)
          </label>

          <input
            id="report-photo-input"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          {photoPreviewUrl ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                flexWrap: 'wrap',
              }}
            >
              <img
                src={photoPreviewUrl}
                alt="Selected preview"
                style={{
                  width: '72px',
                  height: '72px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-main)', wordBreak: 'break-all' }}>
                  {selectedPhoto?.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Size: {selectedPhoto ? Math.round(selectedPhoto.size / 1024) : 0} KB &bull; Resized for upload
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="btn-secondary"
                style={{
                  minHeight: '38px',
                  padding: '0.4rem 0.8rem',
                  fontSize: 'var(--text-xs)',
                  color: '#f87171',
                }}
                title="Remove photo"
              >
                <X size={15} /> Remove
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingPhoto}
                className="btn-secondary"
                style={{
                  minHeight: '44px',
                  width: '100%',
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {isProcessingPhoto ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} color="var(--color-brand-primary)" />
                )}
                <span>{isProcessingPhoto ? 'Processing Image...' : 'Take Photo or Choose File'}</span>
              </button>
              <div className="form-hint" style={{ marginTop: '0.35rem' }}>
                Opens camera directly on mobile. Supports JPG, PNG, WebP (auto-resized under 1280px).
              </div>
            </div>
          )}
        </div>

        {/* 5. Privacy Notice */}
        <div
          style={{
            background: 'var(--color-surface-subtle)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            minWidth: 0,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-main)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              style={{
                marginTop: '0.15rem',
                cursor: 'pointer',
                accentColor: 'var(--color-brand-accent)',
                flexShrink: 0,
              }}
            />
            <span>
              <strong>Privacy &amp; Processing Agreement:</strong> I understand this report and photo will be routed to the Admin Block. No personal password or identity is shared publicly.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', minHeight: '44px' }}
          disabled={isSubmitting || isProcessingPhoto}
          title="Submit report to maintenance queue"
        >
          <ShieldCheck size={18} />
          <span>{isSubmitting ? 'Submitting Report...' : 'Submit Report & Generate Reference Code'}</span>
        </button>
      </form>
    </div>
  );
};
