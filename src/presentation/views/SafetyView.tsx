import React, { useState } from 'react';
import { Phone, Copy, Check, ShieldAlert, MapPin, AlertTriangle, HeartPulse } from 'lucide-react';
import { StaticSafetyDirectoryProvider } from '../../infrastructure/repositories';

export const SafetyView: React.FC = () => {
  const provider = new StaticSafetyDirectoryProvider();
  const primaryEmergency = provider.getPrimaryEmergency();
  const contacts = provider.getContacts().filter(c => c.id !== primaryEmergency.id);
  const locations = provider.getLocations();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Page Heading */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="title-section">
          Campus Safety & Emergency Directory
        </h1>
        <p className="text-lead" style={{ marginTop: '0.5rem' }}>
          Authoritative contact numbers, ambulance dispatch, and verified on-campus safe assembly locations.
        </p>
      </div>

      {/* Mandatory Emergency Intercept Callout */}
      <div className="alert-notice" style={{ background: 'var(--color-urgent-soft)', borderColor: 'var(--color-urgent-border)', borderLeftColor: 'var(--color-urgent-bg)', color: '#540f1a', marginBottom: '2rem' }}>
        <div className="alert-notice-title" style={{ color: '#540f1a' }}>
          <AlertTriangle size={20} color="var(--color-urgent-bg)" /> Critical Safety & Emergency Disclaimer
        </div>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
          Campus Assist is an informational web directory, <strong>not an emergency dispatch, surveillance, or real-time monitoring service</strong>. If you are experiencing an immediate threat to life, active violence, or medical trauma, dial Campus Security directly or contact city emergency authorities (112).
        </p>
      </div>

      {/* Primary Emergency Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3d0710 0%, #580f1b 50%, #731625 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.75rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(250, 219, 160, 0.2)', color: '#fadba0', border: '1px solid rgba(250, 219, 160, 0.35)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: '0.85rem', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
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
              {primaryEmergency.isDemo && ' (Demo Data)'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px', flex: '0 0 auto' }}>
            <a
              href={`tel:${primaryEmergency.phone}`}
              className="urgent-dial-btn"
              style={{ background: '#ffffff', color: '#520f1b', justifyContent: 'center', fontWeight: 800, minHeight: '44px' }}
              title={`Call Hotline ${primaryEmergency.phone}`}
            >
              <Phone size={18} /> Tap to Call Now
            </a>
            <button
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', justifyContent: 'center', minHeight: '44px' }}
              onClick={() => handleCopy(primaryEmergency.id, primaryEmergency.phone)}
              title="Copy Security Phone Number"
            >
              {copiedId === primaryEmergency.id ? (
                <>
                  <Check size={16} color="#fadba0" /> Copied!
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
                {contact.isDemo && <span className="badge badge-duplicate">DEMO</span>}
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
        <MapPin size={24} color="var(--color-brand-accent)" /> Safe Locations & Assembly Points
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
              {loc.isDemo && <span className="badge badge-duplicate">DEMO</span>}
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
