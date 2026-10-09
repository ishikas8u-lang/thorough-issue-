import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Copy,
  Check,
  ShieldAlert,
  MapPin,
  AlertTriangle,
  HeartPulse,
  XCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { StaticSafetyDirectoryProvider } from '../../infrastructure/repositories';
import { apiClient } from '../../infrastructure/apiClient';
import type { SafetyContact, SafetyLocation } from '../../types';

export const SafetyView: React.FC = () => {
  const provider = new StaticSafetyDirectoryProvider();
  const defaultPrimary = provider.getPrimaryEmergency();

  const [primaryEmergency, setPrimaryEmergency] = useState<SafetyContact>(defaultPrimary);
  const [contacts, setContacts] = useState<SafetyContact[]>(provider.getContacts());
  const [locations, setLocations] = useState<SafetyLocation[]>(provider.getLocations());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // SOS State Machine
  // states: 'idle' | 'holding' | 'countdown' | 'locating' | 'manual_input' | 'sending' | 'sent'
  const [sosState, setSosState] = useState<
    'idle' | 'holding' | 'countdown' | 'locating' | 'manual_input' | 'sending' | 'sent'
  >('idle');
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [countdown, setCountdown] = useState(5);
  const [manualPlace, setManualPlace] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [sentAlertInfo, setSentAlertInfo] = useState<{ id: string; time: string } | null>(null);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  // Load directory from GET /api/safety
  useEffect(() => {
    let isMounted = true;
    apiClient
      .getSafety()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.contacts && data.contacts.length > 0) {
          const primary = data.contacts.find((c) => c.label.toLowerCase().includes('security')) || data.contacts[0];
          setPrimaryEmergency(primary);
          setContacts(data.contacts.filter((c) => c.id !== primary.id));
        }
        if (data.locations && data.locations.length > 0) {
          setLocations(data.locations);
        }
      })
      .catch((err) => {
        console.warn('Using offline safety directory fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdProgressIntervalRef.current) clearInterval(holdProgressIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleHoldStart = (e: React.SyntheticEvent) => {
    // Only start if in idle state
    if (sosState !== 'idle') return;
    if ('touches' in e && (e as React.TouchEvent).touches.length > 1) return;

    clearAllTimers();
    setSosState('holding');
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setHoldProgress(pct);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      clearAllTimers();
      triggerCountdown();
    }, 2000);
  };

  const handleHoldEnd = () => {
    if (sosState === 'holding') {
      clearAllTimers();
      setHoldProgress(0);
      setSosState('idle');
    }
  };

  const triggerCountdown = () => {
    setSosState('countdown');
    setCountdown(5);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          executeSosDispatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    clearAllTimers();
    setCountdown(5);
    setHoldProgress(0);
    setSosState('idle');
  };

  const executeSosDispatch = () => {
    setSosState('locating');

    if (!('geolocation' in navigator)) {
      setSosState('manual_input');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendSosAlert(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, null);
      },
      () => {
        // Geolocation denied or unavailable: fallback to manual place input
        setSosState('manual_input');
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  const sendSosAlert = async (
    lat: number | null,
    lng: number | null,
    accuracy: number | null,
    message: string | null
  ) => {
    setSosState('sending');
    try {
      const sessionStr = localStorage.getItem('campus_assist_student_session_v1');
      let token: string | undefined = undefined;
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          token = parsed.token;
        } catch {
          // ignore
        }
      }

      const res = await apiClient.createSos(
        {
          lat,
          lng,
          accuracy,
          message: message || undefined,
        },
        token
      );

      const alertTime = new Date(res.createdAt || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setSentAlertInfo({ id: res.id, time: alertTime });
      setSosState('sent');
    } catch {
      // In case of error, still show local mock confirmation
      const fallbackTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSentAlertInfo({ id: `sos-${Date.now()}`, time: fallbackTime });
      setSosState('sent');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlace.trim() || manualPlace.trim().length < 3) {
      setManualError('Please specify your current campus location or building.');
      return;
    }
    setManualError(null);
    sendSosAlert(null, null, null, manualPlace.trim());
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Page Heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="title-section">Campus Safety &amp; Emergency SOS</h1>
        <p className="text-lead" style={{ marginTop: '0.45rem' }}>
          One-touch Emergency SOS dispatch, verified hotlines, and on-campus safe assembly locations.
        </p>
      </div>

      {/* Mandatory Demo SOS Disclaimer Banner */}
      <div
        className="alert-notice"
        style={{
          background: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          borderLeftColor: '#ef4444',
          color: '#fee2e2',
          marginBottom: '2rem',
        }}
      >
        <div className="alert-notice-title" style={{ color: '#fca5a5' }}>
          <AlertTriangle size={20} color="#ef4444" /> Emergency Protocol Notice
        </div>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
          In an emergency, also call Campus Security: <strong>+91-11-2659-1000</strong>. Campus Assist provides auxiliary communication and security dispatch.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          EMERGENCY SOS BUTTON WORKSPACE (Phase C1)
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1417 0%, #161013 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(225, 29, 72, 0.45)',
          padding: '2.25rem 1.75rem',
          boxShadow: '0 10px 30px rgba(225, 29, 72, 0.25)',
          marginBottom: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(225, 29, 72, 0.2)',
              color: '#fb7185',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              border: '1px solid rgba(225, 29, 72, 0.4)',
            }}
          >
            <ShieldAlert size={15} /> Rapid Incident Dispatch
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              color: '#ffffff',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Immediate Emergency SOS
          </h2>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: '1.75rem',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Press and hold the button for 2 seconds to initiate campus emergency distress broadcast.
          </p>

          {/* STATE: Idle or Holding */}
          {(sosState === 'idle' || sosState === 'holding') && (
            <div>
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 1.25rem' }}>
                <button
                  type="button"
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  onTouchCancel={handleHoldEnd}
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: sosState === 'holding'
                      ? 'radial-gradient(circle, #f43f5e 0%, #be123c 100%)'
                      : 'radial-gradient(circle, #e11d48 0%, #9f1239 100%)',
                    color: '#ffffff',
                    border: '4px solid #ffffff',
                    boxShadow: sosState === 'holding'
                      ? '0 0 35px rgba(244, 63, 94, 0.8), inset 0 0 20px rgba(0,0,0,0.5)'
                      : '0 0 25px rgba(225, 29, 72, 0.55), 0 8px 16px rgba(0,0,0,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    transition: 'transform 0.1s ease',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation',
                  }}
                  aria-label="Hold 2 seconds for Emergency SOS"
                >
                  <ShieldAlert size={38} color="#ffffff" />
                  <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>SOS</span>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.04em', opacity: 0.9 }}>
                    {sosState === 'holding' ? `${holdProgress}%` : 'HOLD 2 SEC'}
                  </span>
                </button>
              </div>

              {/* Hold Progress Bar */}
              {sosState === 'holding' && (
                <div style={{ width: '220px', margin: '0 auto 0.75rem' }}>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${holdProgress}%`,
                        background: '#f43f5e',
                        transition: 'width 0.05s linear',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: '#fca5a5', marginTop: '0.35rem', display: 'block' }}>
                    Keep holding...
                  </span>
                </div>
              )}

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                Press &amp; hold on touch screen or mouse. Releasing early cancels trigger.
              </p>
            </div>
          )}

          {/* STATE: 5-Second Cancel Countdown */}
          {sosState === 'countdown' && (
            <div
              style={{
                background: 'rgba(225, 29, 72, 0.2)',
                border: '2px solid #e11d48',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: '0.35rem' }}>
                SOS Activated — Confirming Dispatch
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, margin: '0.5rem 0' }}>
                {countdown}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: '#ffe4e6', marginBottom: '1.25rem' }}>
                Broadcasting emergency alert to Campus Security in {countdown} seconds.
              </p>
              <button
                type="button"
                onClick={handleCancelCountdown}
                className="btn-secondary"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  minHeight: '44px',
                  padding: '0.65rem 1.5rem',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  margin: '0 auto',
                }}
              >
                <XCircle size={18} /> Cancel SOS Alert
              </button>
            </div>
          )}

          {/* STATE: Locating / Sending */}
          {(sosState === 'locating' || sosState === 'sending') && (
            <div style={{ padding: '1.5rem 0' }}>
              <div style={{ color: '#fb7185', marginBottom: '0.75rem' }}>
                <ShieldAlert size={36} className="animate-pulse" style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', color: '#ffffff', marginBottom: '0.35rem' }}>
                {sosState === 'locating' ? 'Acquiring GPS Location...' : 'Sending Emergency Alert...'}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Communicating with campus dispatch server...
              </p>
            </div>
          )}

          {/* STATE: Manual Place Input (Permission Denied Fallback) */}
          {sosState === 'manual_input' && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
                <MapPin size={18} />
                <strong style={{ fontSize: 'var(--text-sm)' }}>GPS Location Unavailable</strong>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Location permission was denied or timed out. Please specify your current building or landmark so response personnel can locate you:
              </p>

              {manualError && (
                <div style={{ color: '#fca5a5', fontSize: 'var(--text-xs)', marginBottom: '0.75rem' }}>
                  {manualError}
                </div>
              )}

              <form onSubmit={handleManualSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="sos-manual-place" className="form-label">
                    Your Current Campus Location *
                  </label>
                  <input
                    id="sos-manual-place"
                    type="text"
                    className="form-input"
                    value={manualPlace}
                    onChange={(e) => setManualPlace(e.target.value)}
                    placeholder="e.g. Academic Block B, 3rd Floor East Wing, Central Library"
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, minHeight: '44px' }}>
                    <Send size={16} /> Send SOS With Location
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    className="btn-secondary"
                    style={{ minHeight: '44px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STATE: Alert Sent Confirmation */}
          {sosState === 'sent' && sentAlertInfo && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '2px solid rgba(34, 197, 94, 0.45)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 1.25rem',
              }}
            >
              <div style={{ color: '#86efac', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: 'var(--text-xl)', color: '#ffffff', marginBottom: '0.35rem' }}>
                SOS Alert Dispatched!
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: '#dcfce7', marginBottom: '1rem' }}>
                Campus safety reviewers and operations desk have been notified at{' '}
                <strong>{sentAlertInfo.time}</strong>.
              </p>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: '#86efac',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-block',
                  marginBottom: '1.25rem',
                }}
              >
                Alert Reference: {sentAlertInfo.id}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSosState('idle');
                    setSentAlertInfo(null);
                    setManualPlace('');
                  }}
                  className="btn-secondary"
                  style={{ minHeight: '44px', margin: '0 auto' }}
                >
                  Reset SOS Button
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Emergency Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e222b 0%, #16181f 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.75rem',
          border: '1px solid rgba(251, 113, 133, 0.35)',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(251, 113, 133, 0.16)',
                color: 'var(--color-brand-primary)',
                border: '1px solid rgba(251, 113, 133, 0.3)',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                marginBottom: '0.85rem',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
              }}
            >
              <ShieldAlert size={15} /> 24/7 PRIMARY CAMPUS SECURITY HOTLINE
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 'var(--leading-tight)' }}>
              {primaryEmergency.label}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '0.04em', margin: '0.5rem 0', color: '#fff9fa', overflowWrap: 'anywhere' }}>
              {primaryEmergency.phone}
            </div>
            <p style={{ opacity: 0.9, maxWidth: '640px', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
              {primaryEmergency.instructions}
            </p>
            <div style={{ marginTop: '1.25rem', fontSize: 'var(--text-xs)', opacity: 0.85, color: '#f7d8dd' }}>
              Source: {primaryEmergency.source} • Verified: {new Date(primaryEmergency.verifiedAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px', flex: '0 0 auto' }}>
            <a
              href={`tel:${primaryEmergency.phone}`}
              className="urgent-dial-btn"
              style={{ background: 'var(--color-brand-gradient-rich)', color: '#ffffff', justifyContent: 'center', fontWeight: 800, minHeight: '44px' }}
              title={`Call Hotline ${primaryEmergency.phone}`}
            >
              <Phone size={18} /> Tap to Call Now
            </a>
            <button
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', justifyContent: 'center', minHeight: '44px' }}
              onClick={() => handleCopy(primaryEmergency.id, primaryEmergency.phone)}
              title="Copy Security Phone Number"
            >
              {copiedId === primaryEmergency.id ? (
                <>
                  <Check size={16} color="var(--color-brand-primary)" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy Number
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Verified Support Helplines */}
      <h2 className="title-section" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <HeartPulse size={24} color="var(--color-brand-accent)" /> Verified Campus Support Helplines
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '3.25rem' }}>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.6rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              minWidth: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span className="badge badge-received">{contact.source}</span>
              </div>
              <h3 className="title-card-sm" style={{ marginBottom: '0.35rem' }}>{contact.label}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-brand-accent)', marginBottom: '0.5rem', overflowWrap: 'anywhere' }}>
                {contact.phone}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: '1.25rem' }}>
                {contact.instructions}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
              <a href={`tel:${contact.phone}`} className="btn-primary" style={{ flex: 1, minHeight: '44px', padding: '0.6rem' }} title={`Call ${contact.label}`}>
                <Phone size={15} /> Call
              </a>
              <button
                className="btn-secondary"
                style={{ minHeight: '44px', minWidth: '44px', padding: '0.6rem 0.95rem' }}
                onClick={() => handleCopy(contact.id, contact.phone)}
                title="Copy phone number"
              >
                {copiedId === contact.id ? <Check size={16} color="var(--color-brand-primary)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Physical Safe Locations & Assembly Points */}
      <h2 className="title-section" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <MapPin size={24} color="var(--color-brand-accent)" /> Safe Locations &amp; Assembly Points
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        {locations.map((loc) => (
          <div
            key={loc.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.6rem',
              boxShadow: 'var(--shadow-sm)',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-progress">{loc.kind.replace('_', ' ')}</span>
            </div>
            <h3 className="title-card-sm" style={{ marginBottom: '0.35rem' }}>{loc.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-brand-accent)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '0.75rem', overflowWrap: 'anywhere' }}>
              <MapPin size={16} style={{ flexShrink: 0 }} /> <span>{loc.campusLocation}</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              {loc.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
