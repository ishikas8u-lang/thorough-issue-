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
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
          Campus Safety & Emergency Directory
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          Authoritative contact numbers, ambulance dispatch, and verified on-campus safe assembly locations.
        </p>
      </div>

      {/* Mandatory Emergency Intercept Callout */}
      <div className="alert-notice" style={{ background: '#fef2f2', borderColor: '#fca5a5', borderLeftColor: '#dc2626', color: '#991b1b', marginBottom: '2rem' }}>
        <div className="alert-notice-title" style={{ color: '#991b1b' }}>
          <AlertTriangle size={20} /> Critical Safety & Emergency Disclaimer
        </div>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>
          Campus Assist is an informational web directory, <strong>not an emergency dispatch, surveillance, or real-time monitoring service</strong>. If you are experiencing an immediate threat to life, active violence, or medical trauma, dial Campus Security directly or contact city emergency authorities (112).
        </p>
      </div>

      {/* Primary Emergency Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldAlert size={15} /> 24/7 PRIMARY CAMPUS SECURITY HOTLINE
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {primaryEmergency.label}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.04em', margin: '0.5rem 0' }}>
              {primaryEmergency.phone}
            </div>
            <p style={{ opacity: 0.9, maxWidth: '640px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {primaryEmergency.instructions}
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8125rem', opacity: 0.75 }}>
              Source: {primaryEmergency.source} • Verified: {new Date(primaryEmergency.verifiedAt).toLocaleDateString()}
              {primaryEmergency.isDemo && ' (Demo Data)'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
            <a
              href={`tel:${primaryEmergency.phone}`}
              className="urgent-dial-btn"
              style={{ background: '#ffffff', color: '#991b1b', justifyContent: 'center' }}
            >
              <Phone size={18} /> Tap to Call Now
            </a>
            <button
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', justifyContent: 'center' }}
              onClick={() => handleCopy(primaryEmergency.id, primaryEmergency.phone)}
            >
              {copiedId === primaryEmergency.id ? (
                <>
                  <Check size={16} /> Copied!
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
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HeartPulse size={22} color="var(--color-brand-accent)" /> Verified Campus Support Helplines
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-received">{contact.source}</span>
                {contact.isDemo && <span className="badge badge-duplicate">DEMO</span>}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{contact.label}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
                {contact.phone}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {contact.instructions}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`tel:${contact.phone}`} className="btn-primary" style={{ flex: 1, padding: '0.55rem' }}>
                <Phone size={15} /> Call
              </a>
              <button
                className="btn-secondary"
                style={{ padding: '0.55rem 0.85rem' }}
                onClick={() => handleCopy(contact.id, contact.phone)}
                title="Copy phone number"
              >
                {copiedId === contact.id ? <Check size={16} color="green" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Physical Safe Locations & Assembly Points */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={22} color="var(--color-brand-accent)" /> Physical Safe Locations & Assembly Points
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {locations.map((loc) => (
          <div
            key={loc.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-progress">{loc.kind.replace('_', ' ')}</span>
              {loc.isDemo && <span className="badge badge-duplicate">DEMO</span>}
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{loc.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand-accent)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <MapPin size={16} /> {loc.campusLocation}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {loc.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
