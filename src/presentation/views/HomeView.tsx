import React, { useState } from 'react';
import { Phone, ShieldAlert, Bus, Wrench, ArrowRight, Search, CheckCircle2, Clock } from 'lucide-react';
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
      <div style={{ textAlign: 'center', margin: '2.5rem auto 1.5rem', maxWidth: '720px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-brand-primary)', marginBottom: '0.75rem' }}>
          One Reliable Hub for Campus Essentials
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>
          Access verified emergency helplines, scheduled shuttle timetables, and submit trackable facilities defect reports without rummaging through noticeboards or chat groups.
        </p>
      </div>

      {/* Three Core Services Grid */}
      <div className="services-grid">
        {/* Service 1: Safety */}
        <div className="service-card">
          <div>
            <div className="service-card-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
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
            <div className="service-card-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
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
            <div className="service-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
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
          padding: '2rem',
          margin: '2.5rem 0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Search size={20} color="var(--color-brand-accent)" /> Track an Existing Report
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1', fontWeight: 700, marginBottom: '0.35rem' }}>
            <CheckCircle2 size={18} /> Truthful Scheduled Transit
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Timetables clearly indicate scheduled times in IST without misleading live GPS claims.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 700, marginBottom: '0.35rem' }}>
            <CheckCircle2 size={18} /> Privacy-First Design
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            No mandatory student roll numbers or GPS tracking. Public lookups show safe status projections only.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 700, marginBottom: '0.35rem' }}>
            <Clock size={18} /> SOLID Architecture
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Built following SRP, OCP, LSP, ISP, and DIP for rock-solid testability and modular maintainability.
          </p>
        </div>
      </div>
    </div>
  );
};
