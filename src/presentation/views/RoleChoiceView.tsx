import React from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Building2,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { PRIMARY_EMERGENCY, SEED_CONTACTS } from '../../infrastructure/seedData';

interface RoleChoiceViewProps {
  onSelectStudent: () => void;
  onSelectAdmin: () => void;
}

export const RoleChoiceView: React.FC<RoleChoiceViewProps> = ({
  onSelectStudent,
  onSelectAdmin,
}) => {
  return (
    <div className="role-choice-wrapper" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Hero Welcome Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(251, 113, 133, 0.1))',
            border: '1px solid rgba(251, 113, 133, 0.3)',
            marginBottom: '1rem',
          }}
        >
          <ShieldAlert size={36} color="var(--color-brand-primary)" />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand-primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          SRM UNIVERSITY &bull; CAMPUS ASSIST
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--color-text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
          Welcome to Campus Assist
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: 'var(--color-text-muted)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Your central campus gateway for emergency assistance, facilities maintenance, and shuttle schedules. Select your role to continue:
        </p>
      </div>

      {/* Two Large Role Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {/* Student Portal Card */}
        <div
          onClick={onSelectStudent}
          className="role-card-hover"
          style={{
            background: 'var(--color-surface)',
            border: '2px solid rgba(251, 113, 133, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                <GraduationCap size={28} color="var(--color-brand-primary)" />
              </div>
              <span
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--color-brand-primary)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                Student Portal
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 0.6rem 0' }}>
              Student
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Report campus issues with photos, trigger emergency SOS, track repair status, and view university shuttle routes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Report problems (lighting, electricity, etc.) with photo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Instant Emergency SOS &amp; campus safe havens</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>My reports &amp; live ticket status tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Bus timetables, live stops &amp; driver contact</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-pink-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStudent();
            }}
          >
            <span>Enter Student Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Admin Block Card */}
        <div
          onClick={onSelectAdmin}
          className="role-card-hover"
          style={{
            background: 'var(--color-surface)',
            border: '2px solid rgba(251, 113, 133, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                <Building2 size={28} color="var(--color-brand-primary)" />
              </div>
              <span
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--color-brand-primary)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                Operations &bull; Staff
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 0.6rem 0' }}>
              Admin Block
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Review student problem reports, send direct replies, escalate tickets to department heads, and manage transport timetables.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Operations triage dashboard &amp; queue filters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Review reports, photo evidence &amp; reply to student</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>Escalate tickets to Facilities, Electrical, or Security Heads</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                <CheckCircle2 size={16} color="var(--color-brand-primary)" />
                <span>SOS alert inbox &amp; transit timetable management</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-pink-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAdmin();
            }}
          >
            <span>Enter Admin Block</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Emergency Assistance Section (Visible WITHOUT Sign-In) */}
      <section
        className="emergency-access-section"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}
        aria-label="Campus Emergency Contacts"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertTriangle size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
                Immediate Campus Emergency Assistance
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Accessible to all visitors 24/7 without signing in. For urgent threats, medical issues, or security assistance.
            </p>
          </div>

          <a
            href={`tel:${PRIMARY_EMERGENCY.phone}`}
            className="btn btn-emergency-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <PhoneCall size={18} />
            <span>Call Security ({PRIMARY_EMERGENCY.phone})</span>
          </a>
        </div>

        {/* Emergency Contacts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {SEED_CONTACTS.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  {c.instructions}
                </div>
              </div>
              <a
                href={`tel:${c.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-brand-primary)',
                  textDecoration: 'none',
                }}
              >
                <Phone size={14} />
                <span>{c.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
