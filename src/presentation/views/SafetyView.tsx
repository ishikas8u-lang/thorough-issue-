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
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
          Campus Safety & Emergency Directory
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginTop: '0.35rem' }}>
          Authoritative contact numbers, ambulance dispatch, and verified on-campus safe assembly locations.
        </p>
      </div>

      {/* Mandatory Emergency Intercept Callout */}
      <div className="alert-notice" style={{ background: 'var(--color-urgent-soft)', borderColor: 'var(--color-urgent-border)', borderLeftColor: 'var(--color-urgent-bg)', color: '#540f1a', marginBottom: '2rem' }}>
        <div className="alert-notice-title" style={{ color: '#540f1a' }}>
          <AlertTriangle size={20} color="var(--color-urgent-bg)" /> Critical Safety & Emergency Disclaimer
        </div>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.55 }}>
          Campus Assist is an informational web directory, <strong>not an emergency dispatch, surveillance, or real-time monitoring service</strong>. If you are experiencing an immediate threat to life, active violence, or medical trauma, dial Campus Security directly or contact city emergency authorities (112).
        </p>
      </div>

      {/* Primary Emergency Card (Deep Velvet Wine & Gold Highlights) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3d0710 0%, #580f1b 50%, #731625 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.75rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(250, 219, 160, 0.2)', color: '#fadba0', border: '1px solid rgba(250, 219, 160, 0.35)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8125rem', fontWeight: 800, marginBottom: '0.85rem', letterSpacing: '0.04em' }}>
              <ShieldAlert size={15} /> 24/7 PRIMARY CAMPUS SECURITY HOTLINE
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {primaryEmergency.label}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.25rem', fontWeight: 700, letterSpacing: '0.04em', margin: '0.6rem 0', color: '#fff9fa' }}>
              {primaryEmergency.phone}
            </div>
            <p style={{ opacity: 0.9, maxWidth: '640px', fontSize: '0.975rem', lineHeight: 1.6 }}>
              {primaryEmergency.instructions}
            </p>
            <div style={{ marginTop: '1.25rem', fontSize: '0.8125rem', opacity: 0.8, color: '#f7d8dd' }}>
              Source: {primaryEmergency.source} • Verified: {new Date(primaryEmergency.verifiedAt).toLocaleDateString()}
              {primaryEmergency.isDemo && ' (Demo Data)'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '190px' }}>
            <a
              href={`tel:${primaryEmergency.phone}`}
              className="urgent-dial-btn"
              style={{ background: '#ffffff', color: '#520f1b', justifyContent: 'center', fontWeight: 800 }}
            >
              <Phone size={18} /> Tap to Call Now
            </a>
            <button
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', justifyContent: 'center' }}
              onClick={() => handleCopy(primaryEmergency.id, primaryEmergency.phone)}
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
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--color-brand-primary)', marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <HeartPulse size={24} color="var(--color-brand-accent)" /> Verified Campus Support Helplines
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3.25rem' }}>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span className="badge badge-received">{contact.source}</span>
                {contact.isDemo && <span className="badge badge-duplicate">DEMO</span>}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--color-brand-primary)' }}>{contact.label}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-brand-accent)', marginBottom: '0.6rem' }}>
                {contact.phone}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55, marginBottom: '1.35rem' }}>
                {contact.instructions}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <a href={`tel:${contact.phone}`} className="btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                <Phone size={15} /> Call
              </a>
              <button
                className="btn-secondary"
                style={{ padding: '0.6rem 0.95rem' }}
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
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--color-brand-primary)', marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <MapPin size={24} color="var(--color-brand-accent)" /> Physical Safe Locations & Assembly Points
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {locations.map((loc) => (
          <div
            key={loc.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span className="badge badge-progress">{loc.kind.replace('_', ' ')}</span>
              {loc.isDemo && <span className="badge badge-duplicate">DEMO</span>}
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--color-brand-primary)' }}>{loc.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-brand-accent)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              <MapPin size={16} /> {loc.campusLocation}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
              {loc.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
