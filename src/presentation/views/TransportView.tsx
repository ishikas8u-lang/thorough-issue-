import React, { useState } from 'react';
import { Bus, Clock, AlertTriangle, Calendar, MapPin, CheckCircle, Info } from 'lucide-react';
import { StaticTransportScheduleProvider } from '../../infrastructure/repositories';

export const TransportView: React.FC = () => {
  const provider = new StaticTransportScheduleProvider();
  const routes = provider.getRoutes();
  const notices = provider.getActiveNotices();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const activeRoute = provider.getRouteById(selectedRouteId) || routes[0];

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Page Title & Critical Disclaimer */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
              Campus Transport Timetables
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
              Official scheduled campus shuttle routes, stop sequences, and service notices.
            </p>
          </div>

          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            <Info size={16} color="#0284c7" /> Scheduled Timetables — Not Live GPS Tracking
          </div>
        </div>
      </div>

      {/* Active Service Disruption Notices */}
      {notices.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {notices.map((notice) => (
            <div key={notice.id} className="alert-notice">
              <div className="alert-notice-title">
                <AlertTriangle size={18} /> {notice.title}
              </div>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, margin: '0.35rem 0' }}>
                {notice.body}
              </p>
              <div style={{ fontSize: '0.8125rem', opacity: 0.85, marginTop: '0.35rem' }}>
                Active Window: {new Date(notice.startsAt).toLocaleDateString()} to {new Date(notice.endsAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Route Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-brand-primary)' : 'var(--color-surface)',
                color: isSelected ? '#ffffff' : 'var(--color-text-main)',
                border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
              }}
            >
              <Bus size={18} />
              {route.name}
            </button>
          );
        })}
      </div>

      {/* Selected Route Detail View */}
      {activeRoute ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Route Metadata & Timetable Departures */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-received">Active Shuttle Route</span>
              <span className="badge badge-duplicate">Timezone: {activeRoute.timezone}</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeRoute.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
              {activeRoute.description}
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155', marginBottom: '0.35rem' }}>
                <Calendar size={16} /> <strong>Operating Schedule:</strong> {activeRoute.operatingDays}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                <Clock size={16} /> Last Timetable Refresh: {activeRoute.lastUpdated} (Demo Baseline)
              </div>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--color-brand-accent)" /> Scheduled Departures ({activeRoute.timezone})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '1rem' }}>
              Timetable departure times from terminus stop #{activeRoute.stops[0]?.sequence || 1}.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {activeRoute.scheduledDepartures.map((time, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.65rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                  }}
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Ordered Stop Timeline */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--color-brand-accent)" /> Stoppage Sequence ({activeRoute.stops.length} Stops)
            </h3>

            <div style={{ position: 'relative', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
              {/* Vertical connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  bottom: '24px',
                  left: '7px',
                  width: '2px',
                  background: '#cbd5e1',
                }}
              />

              {activeRoute.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === activeRoute.stops.length - 1;
                return (
                  <div key={stop.id} style={{ position: 'relative', marginBottom: '1.75rem' }}>
                    {/* Circle Node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.85rem',
                        top: '2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: isFirst || isLast ? 'var(--color-brand-primary)' : 'var(--color-brand-accent)',
                        border: '3px solid #ffffff',
                        boxShadow: '0 0 0 1px #94a3b8',
                      }}
                    />

                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                      Stop #{stop.sequence}: {stop.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {stop.campusLocation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#166534' }}>
              <CheckCircle size={18} /> Shuttle runs regular scheduled intervals across all listed stops.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p>No route selected.</p>
        </div>
      )}
    </div>
  );
};
