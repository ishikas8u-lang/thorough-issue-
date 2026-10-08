import React, { useState } from 'react';
import { Phone, ShieldAlert, Bus, Wrench, ArrowRight, Search, CheckCircle2, Clock, User } from 'lucide-react';
import { PRIMARY_EMERGENCY } from '../../infrastructure/seedData';
import type { ActiveTab } from '../components/Navbar';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onQuickLookup: (refCode: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onQuickLookup }) => {
  const [quickRef, setQuickRef] = useState('');

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRef.trim()) {
      onQuickLookup(quickRef.trim());
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      {/* Urgent Emergency Callout Hero Banner */}
      <section className="urgent-hero-banner" role="region" aria-label="Urgent Safety Assistance">
        <div className="urgent-hero-content">
          <h2>
            <Phone size={20} /> Need Urgent Help on Campus?
          </h2>
          <p>
            For physical threats, medical trauma, or immediate fire emergencies, call Campus Security Control Room.
            <br />
            <strong>Campus Assist is an informational directory, not an emergency dispatch or monitoring service.</strong>
          </p>
        </div>
        <a href={`tel:${PRIMARY_EMERGENCY.phone}`} className="urgent-dial-btn" title={`Call Security Control Room: ${PRIMARY_EMERGENCY.phone}`}>
          <Phone size={18} /> Call Security: {PRIMARY_EMERGENCY.phone}
        </a>
      </section>

      {/* Hero Intro */}
      <div style={{ textAlign: 'center', margin: '2.5rem auto 2rem', maxWidth: '760px', minWidth: 0 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)',
            color: 'var(--color-pink-800)',
            background: 'var(--color-pink-100)',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-pink-200)',
            marginBottom: '0.85rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-pink-600)' }} />
          SRM UNIVERSITY &bull; OPERATIONS GATEWAY
        </div>

        <h1 className="title-hero" style={{ marginBottom: '0.9rem' }}>
          One Authoritative Hub for Campus Life & Operations
        </h1>

        <p className="text-lead" style={{ maxWidth: '680px', margin: '0 auto' }}>
          Access verified emergency hotlines, inspect scheduled shuttle timetables, and submit trackable facilities defect reports without lost chat threads or outdated noticeboards.
        </p>

        {/* Student Account Quick Action Card */}
        <div
          style={{
            marginTop: '1.75rem',
            background: 'var(--color-pink-50)',
            border: '1px solid var(--color-pink-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.4rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.9rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '100%',
          }}
        >
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-pink-dark-text)', fontWeight: 600 }}>
            SRM Students: Sign in to manage your verified student profile and contact details.
          </div>
          <button
            type="button"
            className="btn-pink"
            onClick={() => onNavigate('signin')}
            style={{ padding: '0.45rem 0.95rem', minHeight: '44px' }}
            title="Go to Student Account"
          >
            <User size={15} color="var(--color-pink-600)" /> Student Account <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Three Core Services Grid */}
      <div className="services-grid">
        {/* Service 1: Safety */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: 'rgba(244, 63, 94, 0.16)', color: 'var(--color-brand-primary)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <ShieldAlert size={26} />
            </div>
            <h3 className="title-card">Safety & Emergency</h3>
            <p>
              Verified 24/7 security control room hotlines, medical clinic ambulance dispatch, safe assembly points, and late-night safe zones.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('safety')} title="View Safety Directory">
            View Safety Directory <ArrowRight size={16} />
          </button>
        </div>

        {/* Service 2: Transport */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: 'rgba(59, 130, 246, 0.16)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <Bus size={26} />
            </div>
            <h3 className="title-card">Campus Transport</h3>
            <p>
              Published shuttle routes, ordered stoppage sequences, and departure timetables in campus time. Clearly labeled scheduled info.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('transport')} title="View Shuttle Schedules">
            View Shuttle Schedules <ArrowRight size={16} />
          </button>
        </div>

        {/* Service 3: Report an Issue */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: 'rgba(245, 158, 11, 0.16)', color: '#fde047', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Wrench size={26} />
            </div>
            <h3 className="title-card">Facilities Issue Reporting</h3>
            <p>
              Report broken streetlights, plumbing leaks, sanitation issues, or broken accessibility ramps. Receive a trackable reference code.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('report')} title="Report a Problem">
            Report a Problem <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Lookup Bar */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          margin: '2.5rem 0',
          boxShadow: 'var(--shadow-sm)',
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', minWidth: 0 }}>
          <h3
            className="title-card"
            style={{
              marginBottom: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Search size={22} color="var(--color-brand-accent)" /> Track an Existing Report
          </h3>
          <p className="text-body-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: '1.35rem' }}>
            Have a reference code (e.g. <code>CA-4912-K7</code>)? Check its real-time triage status and official public maintenance notes.
          </p>
          <form
            onSubmit={handleLookupSubmit}
            style={{
              display: 'flex',
              gap: '0.65rem',
              maxWidth: '480px',
              margin: '0 auto',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="e.g. CA-4912-K7"
              value={quickRef}
              onChange={(e) => setQuickRef(e.target.value)}
              className="form-input"
              style={{
                flex: '1 1 200px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}
              aria-label="Report Reference Code"
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: '0 0 auto' }}
              title="Query Report Status"
            >
              Check Status
            </button>
          </form>
        </div>
      </div>

      {/* Core Architectural & Value Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '1.25rem',
          marginTop: '2rem',
        }}
      >
        <div
          style={{
            background: 'var(--color-surface)',
            padding: '1.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-brand-primary)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              marginBottom: '0.45rem',
            }}
          >
            <CheckCircle2 size={18} color="var(--color-brand-accent)" /> Truthful Scheduled Transit
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
            Timetables clearly indicate scheduled times in IST without misleading live GPS claims.
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            padding: '1.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#86efac',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              marginBottom: '0.45rem',
            }}
          >
            <CheckCircle2 size={18} color="#86efac" /> Privacy-First Design
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
            No mandatory student roll numbers or GPS tracking. Public lookups show safe status projections only.
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            padding: '1.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-brand-primary)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              marginBottom: '0.45rem',
            }}
          >
            <Clock size={18} color="var(--color-brand-accent)" /> SOLID Architecture
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
            Built following SRP, OCP, LSP, ISP, and DIP for rock-solid testability and modular maintainability.
          </p>
        </div>
      </div>
    </div>
  );
};
