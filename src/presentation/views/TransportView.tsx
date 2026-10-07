import React, { useState } from 'react';
import { Bus, Clock, AlertTriangle, Calendar, MapPin, CheckCircle, Info, Navigation } from 'lucide-react';
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
              Delhi & Haryana ⇄ Sonipat Campus Transport
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginTop: '0.35rem' }}>
              Scheduled intercity and NCR shuttle routes connecting Rohini, Burari, Manglapuri, Panipat, and Rohtak with Sonipat Campus.
            </p>
          </div>

          <div
            className="pastel-card-sand"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            <Info size={16} color="var(--color-brand-accent)" /> Scheduled Timetables — 07:30 AM to 07:00 PM
          </div>
        </div>
      </div>

      {/* Regional Corridor Pastel Feature Highlight */}
      <div
        className="pastel-card-blue"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Navigation size={22} color="var(--color-brand-accent)" />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>
              Active Delhi NCR & Haryana Transit Corridors (Sonipat Campus Bound)
            </strong>
            <span style={{ fontSize: '0.85rem', opacity: 0.88 }}>
              Primary commuter pickup hubs: <strong>Rohini</strong> • <strong>Burari</strong> • <strong>Manglapuri</strong> • <strong>Panipat</strong> • <strong>Rohtak (Rautak)</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-received">Term Time Schedule</span>
          <span className="badge badge-progress">7:30 AM – 7:00 PM</span>
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
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.55, margin: '0.35rem 0' }}>
                {notice.body}
              </p>
              <div style={{ fontSize: '0.8125rem', opacity: 0.85, marginTop: '0.35rem' }}>
                Active Window: {new Date(notice.startsAt).toLocaleDateString()} to {new Date(notice.endsAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Route Selector Tabs (Pastel Accents with Wine Active) */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.85rem',
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
                gap: '0.55rem',
                padding: '0.8rem 1.35rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-brand-primary)' : 'var(--color-surface)',
                color: isSelected ? '#ffffff' : 'var(--color-text-main)',
                border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(82, 15, 27, 0.25)' : 'var(--shadow-sm)',
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
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-progress">Active Shuttle Route</span>
              <span className="badge badge-received">Timezone: {activeRoute.timezone}</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', marginBottom: '0.6rem', color: 'var(--color-brand-primary)' }}>
              {activeRoute.name}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {activeRoute.description}
            </p>

            <div className="pastel-card-sand" style={{ padding: '1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '0.4rem' }}>
                <Calendar size={16} color="var(--color-brand-accent)" /> <strong>Operating Schedule:</strong> {activeRoute.operatingDays}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <Clock size={16} /> Daily Service Window: <strong>07:30 AM to 07:00 PM (IST)</strong>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-brand-primary)' }}>
              <Clock size={18} color="var(--color-brand-accent)" /> Scheduled Departures ({activeRoute.timezone})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginBottom: '1.1rem' }}>
              Timetable departure times from terminus stop #{activeRoute.stops[0]?.sequence || 1}.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.5rem' }}>
              {activeRoute.scheduledDepartures.map((time, idx) => (
                <span
                  key={idx}
                  className="pastel-card-sand"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="pastel-card-sage" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <strong>Notice:</strong> Please arrive at your pickup shelter 5 minutes prior to listed departure times.
            </div>
          </div>

          {/* Right Column: Ordered Stop Timeline */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-primary)' }}>
              <MapPin size={22} color="var(--color-brand-accent)" /> Stoppage Sequence ({activeRoute.stops.length} Stops)
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
                  background: '#c8baa7',
                }}
              />

              {activeRoute.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === activeRoute.stops.length - 1;
                return (
                  <div key={stop.id} style={{ position: 'relative', marginBottom: '1.85rem' }}>
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
                        border: '3px solid #fdfbf7',
                        boxShadow: '0 0 0 1px #b8a698',
                      }}
                    />

                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-main)' }}>
                      Stop #{stop.sequence}: {stop.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {stop.campusLocation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pastel-card-sage" style={{ padding: '0.95rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <CheckCircle size={18} /> Shuttle runs regular scheduled intervals across all listed stops between 07:30 AM and 07:00 PM.
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
