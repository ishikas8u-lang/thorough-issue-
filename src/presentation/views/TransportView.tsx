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
            <h1 className="title-section">
              Delhi &amp; Haryana ⇄ Sonipat Campus Transport
            </h1>
            <p className="text-lead" style={{ marginTop: '0.45rem' }}>
              Scheduled intercity and NCR shuttle routes connecting Rohini, Burari, Manglapuri, Panipat, and Rohtak with Sonipat Campus.
            </p>
          </div>

          <div
            className="pastel-card-sand"
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
            }}
          >
            <Info size={15} color="var(--color-brand-accent)" /> 07:30 AM to 07:00 PM Timetable
          </div>
        </div>
      </div>

      {/* Regional Corridor Pastel Feature Highlight */}
      <div
        className="pastel-card-blue"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.15rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 300px' }}>
          <Navigation size={22} color="var(--color-brand-accent)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-snug)' }}>
              Active Delhi NCR &amp; Haryana Transit Corridors (Sonipat Campus Bound)
            </strong>
            <span style={{ fontSize: 'var(--text-xs)', opacity: 0.9, lineHeight: 'var(--leading-normal)' }}>
              Primary commuter pickup hubs: <strong>Rohini</strong> • <strong>Burari</strong> • <strong>Manglapuri</strong> • <strong>Panipat</strong> • <strong>Rohtak</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className="badge badge-received">Term Time</span>
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
              <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', margin: '0.35rem 0' }}>
                {notice.body}
              </p>
              <div style={{ fontSize: 'var(--text-xs)', opacity: 0.85, marginTop: '0.35rem' }}>
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
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--color-border)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--color-brand-primary)' : 'var(--color-surface)',
                color: isSelected ? '#ffffff' : 'var(--color-text-main)',
                border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-all)',
                boxShadow: isSelected ? '0 4px 12px rgba(82, 15, 27, 0.25)' : 'var(--shadow-sm)',
                flexShrink: 0,
              }}
              title={`Switch to route: ${route.name}`}
            >
              <Bus size={17} />
              <span>{route.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Route Detail View */}
      {activeRoute ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.75rem' }}>
          {/* Left Column: Route Metadata & Timetable Departures */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-progress">Active Shuttle Route</span>
              <span className="badge badge-received">Timezone: {activeRoute.timezone}</span>
            </div>

            <h2 className="title-card" style={{ marginBottom: '0.5rem' }}>
              {activeRoute.name}
            </h2>
            <p className="text-body-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: '1.35rem' }}>
              {activeRoute.description}
            </p>

            <div className="pastel-card-sand" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                <Calendar size={16} color="var(--color-brand-accent)" style={{ flexShrink: 0 }} />
                <span><strong>Operating Schedule:</strong> {activeRoute.operatingDays}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <Clock size={15} style={{ flexShrink: 0 }} />
                <span>Daily Service Window: <strong>07:30 AM to 07:00 PM (IST)</strong></span>
              </div>
            </div>

            <h3 className="title-card-sm" style={{ marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={17} color="var(--color-brand-accent)" /> Scheduled Departures ({activeRoute.timezone})
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginBottom: '1rem' }}>
              Timetable departure times from terminus stop #{activeRoute.stops[0]?.sequence || 1}.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
              {activeRoute.scheduledDepartures.map((time, idx) => (
                <span
                  key={idx}
                  className="pastel-card-sand"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="pastel-card-sage" style={{ padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <strong>Notice:</strong> Please arrive at your pickup shelter 5 minutes prior to listed departure times.
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
              minWidth: 0,
            }}
          >
            <h3 className="title-card" style={{ marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <MapPin size={20} color="var(--color-brand-accent)" /> Stoppage Sequence ({activeRoute.stops.length} Stops)
            </h3>

            <div style={{ position: 'relative', paddingLeft: '1.6rem', marginLeft: '0.4rem', minWidth: 0 }}>
              {/* Vertical connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  bottom: '24px',
                  left: '6px',
                  width: '2px',
                  background: '#c8baa7',
                }}
              />

              {activeRoute.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === activeRoute.stops.length - 1;
                return (
                  <div key={stop.id} style={{ position: 'relative', marginBottom: '1.65rem', minWidth: 0 }}>
                    {/* Circle Node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.7rem',
                        top: '3px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: isFirst || isLast ? 'var(--color-brand-primary)' : 'var(--color-brand-accent)',
                        border: '3px solid #fdfbf7',
                        boxShadow: '0 0 0 1px #b8a698',
                      }}
                    />

                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-main)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                      Stop #{stop.sequence}: {stop.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem', overflowWrap: 'anywhere' }}>
                      {stop.campusLocation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pastel-card-sage" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', minWidth: 0 }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>Shuttle runs regular scheduled intervals across all listed stops between 07:30 AM and 07:00 PM.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p className="text-body-muted">No route selected.</p>
        </div>
      )}
    </div>
  );
};
