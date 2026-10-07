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
    <div className="container" style={{ paddingBottom: '3rem' }}>
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
        <a href={`tel:${PRIMARY_EMERGENCY.phone}`} className="urgent-dial-btn">
          <Phone size={18} /> Call Security: {PRIMARY_EMERGENCY.phone}
        </a>
      </section>

      {/* Hero Intro */}
      <div style={{ textAlign: 'center', margin: '3rem auto 2rem', maxWidth: '760px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-pink-800)', background: 'var(--color-pink-100)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-pink-200)', marginBottom: '0.75rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-pink-600)' }} />
          SRM UNIVERSITY &bull; OFFICIAL OPERATIONS GATEWAY
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.85rem', fontWeight: 700, color: 'var(--color-brand-primary)', marginBottom: '0.9rem', letterSpacing: '-0.02em', lineHeight: 1.18 }}>
          One Authoritative Hub for Campus Life & Operations
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
          Access verified emergency hotlines, inspect scheduled shuttle timetables, and submit trackable facilities defect reports without lost chat threads or outdated noticeboards.
        </p>

        {/* Student Account Quick Action Card */}
        <div
          style={{
            marginTop: '1.75rem',
            background: 'var(--color-pink-50)',
            border: '1px solid var(--color-pink-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--color-pink-dark-text)', fontWeight: 600 }}>
            SRM Students: Sign in to manage your verified student profile and contact details.
          </div>
          <button
            type="button"
            className="btn-pink"
            onClick={() => onNavigate('signin')}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.875rem' }}
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
            <div className="service-card-icon" style={{ background: '#f6e4e7', color: '#6e121f' }}>
              <ShieldAlert size={28} />
            </div>
            <h3>Safety & Emergency</h3>
            <p>
              Verified 24/7 security control room hotlines, medical clinic ambulance dispatch, safe assembly points, and late-night safe zones.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('safety')}>
            View Safety Directory <ArrowRight size={16} />
          </button>
        </div>

        {/* Service 2: Transport */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: '#ecdec9', color: '#572f16' }}>
              <Bus size={28} />
            </div>
            <h3>Campus Transport</h3>
            <p>
              Published shuttle routes, ordered stoppage sequences, and departure timetables in campus time. Clearly labeled scheduled info.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('transport')}>
            View Shuttle Schedules <ArrowRight size={16} />
          </button>
        </div>

        {/* Service 3: Report an Issue */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: '#f5e8e3', color: '#7a2214' }}>
              <Wrench size={28} />
            </div>
            <h3>Facilities Issue Reporting</h3>
            <p>
              Report broken streetlights, plumbing leaks, sanitation issues, or broken accessibility ramps. Receive a trackable reference code.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('report')}>
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
          padding: '2.25rem',
          margin: '2.5rem 0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
            <Search size={22} color="var(--color-brand-accent)" /> Track an Existing Report
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>
            Have a reference code (e.g. <code>CA-4912-K7</code>)? Check its real-time triage status and official public maintenance notes.
          </p>
          <form onSubmit={handleLookupSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="e.g. CA-4912-K7"
              value={quickRef}
              onChange={(e) => setQuickRef(e.target.value)}
              className="form-input"
              style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Check Status
            </button>
          </form>
        </div>
      </div>

      {/* Core Architectural & Value Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#572f16', fontWeight: 700, marginBottom: '0.45rem' }}>
            <CheckCircle2 size={18} color="var(--color-brand-accent)" /> Truthful Scheduled Transit
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
            Timetables clearly indicate scheduled times in IST without misleading live GPS claims.
          </p>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#21541c', fontWeight: 700, marginBottom: '0.45rem' }}>
            <CheckCircle2 size={18} color="#21541c" /> Privacy-First Design
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
            No mandatory student roll numbers or GPS tracking. Public lookups show safe status projections only.
          </p>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)', fontWeight: 700, marginBottom: '0.45rem' }}>
            <Clock size={18} color="var(--color-brand-accent)" /> SOLID Architecture
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
            Built following SRP, OCP, LSP, ISP, and DIP for rock-solid testability and modular maintainability.
          </p>
        </div>
      </div>
    </div>
  );
};
