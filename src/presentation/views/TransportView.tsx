import React, { useState, useEffect } from 'react';
import {
  Bus,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  CheckCircle,
  Compass,
  Radio,
  Play,
  Pause,
  Phone,
  ShieldAlert,
  LocateFixed,
  Wifi,
  Gauge,
} from 'lucide-react';
import { StaticTransportScheduleProvider } from '../../infrastructure/repositories';
import { apiClient } from '../../infrastructure/apiClient';
import type { Route, Stop } from '../../types';

// Stop coordinates along the Delhi NCR - Sonipat Corridors
interface GpsCoordinate {
  lat: number;
  lng: number;
}

const ROUTE_GPS_STOPS: Record<string, GpsCoordinate[]> = {
  'route-rohini-burari-sonipat': [
    { lat: 28.7186, lng: 77.1264 }, // Rohini Sec 18
    { lat: 28.7533, lng: 77.1989 }, // Burari
    { lat: 28.7618, lng: 77.1554 }, // Mukarba Chowk
    { lat: 28.8021, lng: 77.1320 }, // Alipur
    { lat: 28.8791, lng: 77.1215 }, // Kundli
    { lat: 28.9845, lng: 77.1023 }, // SRM Sonipat
  ],
  'route-manglapuri-sonipat': [
    { lat: 28.5912, lng: 77.0821 }, // Manglapuri
    { lat: 28.6297, lng: 77.0815 }, // Janakpuri
    { lat: 28.6672, lng: 77.1245 }, // Punjabi Bagh
    { lat: 28.7121, lng: 77.1745 }, // Azadpur
    { lat: 28.9845, lng: 77.1023 }, // SRM Sonipat
  ],
  'route-panipat-sonipat': [
    { lat: 29.3909, lng: 76.9635 }, // Panipat
    { lat: 29.2378, lng: 77.0184 }, // Samalkha
    { lat: 29.1354, lng: 77.0256 }, // Ganaur
    { lat: 29.0275, lng: 77.0721 }, // Murthal
    { lat: 28.9845, lng: 77.1023 }, // SRM Sonipat
  ],
  'route-rohtak-sonipat': [
    { lat: 28.8955, lng: 76.6066 }, // Rohtak New Stand
    { lat: 28.8821, lng: 76.6198 }, // PGIMS Chowk
    { lat: 28.8856, lng: 76.9142 }, // Kharkhoda Bypass
    { lat: 28.9912, lng: 77.0154 }, // Sonipat Subhash Chowk
    { lat: 28.9845, lng: 77.1023 }, // SRM Sonipat
  ],
};

const SHUTTLES = [
  {
    id: 'bus-01',
    reg: 'HR-10-SRM-4091',
    name: 'Delhi NCR Express',
    routeId: 'route-rohini-burari-sonipat',
    driver: 'Rajender Kumar',
    driverPhone: '+91 98112 04812',
    capacity: '44 Seater (AC Deluxe)',
    occupancy: '72% Full (32/44)',
  },
  {
    id: 'bus-02',
    reg: 'HR-10-SRM-1022',
    name: 'Campus Circular Shuttle',
    routeId: 'route-rohini-burari-sonipat',
    driver: 'Surender Singh',
    driverPhone: '+91 98112 04815',
    capacity: '32 Seater (Campus Loop)',
    occupancy: '45% Full (14/32)',
  },
  {
    id: 'bus-03',
    reg: 'HR-10-SRM-7734',
    name: 'GT Road Express',
    routeId: 'route-panipat-sonipat',
    driver: 'Vikram Sharma',
    driverPhone: '+91 98112 04820',
    capacity: '50 Seater (NCR Coach)',
    occupancy: '60% Full (30/50)',
  },
];

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const TransportView: React.FC = () => {
  const provider = new StaticTransportScheduleProvider();
  const [routes, setRoutes] = useState<Route[]>(provider.getRoutes());
  const notices = provider.getActiveNotices();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'route-rohini-burari-sonipat');
  const [activeShuttle, setActiveShuttle] = useState(SHUTTLES[0]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Live GPS telemetry state
  const [progress, setProgress] = useState(0.35); // 0.0 to 1.0 along the route
  const [currentSpeed, setCurrentSpeed] = useState(42);
  const [etaSeconds, setEtaSeconds] = useState(240);
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  // Student Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const stopCoords = ROUTE_GPS_STOPS[selectedRouteId] || ROUTE_GPS_STOPS['route-rohini-burari-sonipat'];

  // Fetch routes from backend API on mount
  useEffect(() => {
    apiClient.getRoutes().then((data) => {
      if (data?.routes && data.routes.length > 0) {
        setRoutes(data.routes);
      }
    }).catch(() => {
      // Keep static routes fallback
    });
  }, []);

  // Simulation tick loop for vehicle motion
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.003 * simSpeed;
        const next = prev + step;
        if (next >= 1) return 0.02; // loop back
        return next;
      });

      // Realistic speed variation
      setCurrentSpeed(() => {
        // Stop dwelling near integer stop fractions
        const base = 42;
        const variation = Math.sin(Date.now() / 3000) * 12;
        return Math.max(0, Math.round(base + variation));
      });

      // Decrement ETA countdown
      setEtaSeconds((prev) => (prev > 5 ? prev - Math.round(1 * simSpeed) : 320));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Interpolate current vehicle coordinates
  const stopsCount = (activeRoute?.stops?.length || 5);
  const totalSegments = stopsCount - 1;
  const currentSegment = Math.min(
    totalSegments - 1,
    Math.floor(progress * totalSegments)
  );
  const segmentProgress = (progress * totalSegments) - currentSegment;

  const startCoord = stopCoords[currentSegment] || { lat: 28.7186, lng: 77.1264 };
  const endCoord = stopCoords[currentSegment + 1] || { lat: 28.9845, lng: 77.1023 };

  const currentLat = (startCoord.lat + (endCoord.lat - startCoord.lat) * segmentProgress).toFixed(4);
  const currentLng = (startCoord.lng + (endCoord.lng - startCoord.lng) * segmentProgress).toFixed(4);

  const nextStopIndex = Math.min(stopsCount - 1, currentSegment + 1);
  const nextStop = activeRoute?.stops?.[nextStopIndex];

  // Browser Geolocation Detector
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve your location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Find distance to closest stop from user location
  let nearestStopInfo: { stop: Stop; distance: number } | null = null;
  if (userCoords && activeRoute?.stops) {
    let minDistance = Infinity;
    let closestStop: Stop = activeRoute.stops[0];

    activeRoute.stops.forEach((stop, idx) => {
      const coord = stopCoords[idx] || stopCoords[0];
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, coord.lat, coord.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestStop = stop;
      }
    });

    nearestStopInfo = { stop: closestStop, distance: minDistance };
  }

  // Format ETA seconds into mm:ss
  const formatEta = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title-section">
              Campus Transit &amp; Live GPS Tracking
            </h1>
            <p className="text-lead" style={{ marginTop: '0.45rem' }}>
              Real-time satellite GPS tracking, live shuttle telemetry, scheduled NCR corridors, and student stop locator.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-progress" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="gps-pulse-live" /> GPS Telemetry Live
            </span>
            <span className="badge badge-received">07:30 AM – 07:00 PM Timetable</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. LIVE GPS RADAR & VEHICLE TELEMETRY CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="gps-card">
        {/* HUD Top Bar */}
        <div className="gps-hud-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-brand-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bus size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: 'var(--text-base)', color: '#ffffff' }}>{activeShuttle.name}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--color-brand-accent)' }}>
                  {activeShuttle.reg}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                Driver: <strong>{activeShuttle.driver}</strong> &bull; Capacity: <strong>{activeShuttle.capacity}</strong> &bull; Occupancy: <strong>{activeShuttle.occupancy}</strong>
              </div>
            </div>
          </div>

          {/* Shuttle Switcher */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {SHUTTLES.map((shuttle) => (
              <button
                key={shuttle.id}
                type="button"
                className={`gps-bus-chip ${activeShuttle.id === shuttle.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveShuttle(shuttle);
                  setSelectedRouteId(shuttle.routeId);
                }}
              >
                <Radio size={12} />
                <span>{shuttle.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Radar Interactive Route Map Canvas */}
        <div className="gps-radar-viewport">
          <div className="gps-radar-grid" />
          <div className="gps-radar-circles" />

          {/* SVG Route Visualization */}
          <svg
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            viewBox="0 0 1000 380"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#be123c" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Background Route Path Glow */}
            <path
              d="M 60,300 C 250,280 400,180 550,140 C 700,100 850,90 940,80"
              fill="none"
              stroke="rgba(251, 113, 133, 0.25)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Active Route Path */}
            <path
              d="M 60,300 C 250,280 400,180 550,140 C 700,100 850,90 940,80"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="6 4"
            />

            {/* Route Stops Markers */}
            {activeRoute?.stops?.map((stop, index) => {
              const stopRatio = index / Math.max(1, activeRoute.stops.length - 1);
              // Calculate coordinate on SVG curve
              const x = 60 + stopRatio * 880;
              const y = 300 - stopRatio * 220 + Math.sin(stopRatio * Math.PI) * 40;
              const isPast = progress >= stopRatio;
              const isNext = stop.id === nextStop?.id;

              return (
                <g
                  key={stop.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredStop(index)}
                  onMouseLeave={() => setHoveredStop(null)}
                >
                  {isNext && (
                    <circle cx={x} cy={y} r="18" fill="rgba(251, 113, 133, 0.3)" className="animate-pulse" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isNext ? '9' : '6'}
                    fill={isPast ? '#22c55e' : isNext ? '#fb7185' : '#64748b'}
                    stroke="#121419"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y + 24}
                    textAnchor="middle"
                    fill={isNext ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontFamily="Outfit, sans-serif"
                    fontWeight={isNext ? '700' : '500'}
                  >
                    #{stop.sequence} {stop.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Vehicle Position Node on SVG Curve */}
            {(() => {
              const x = 60 + progress * 880;
              const y = 300 - progress * 220 + Math.sin(progress * Math.PI) * 40;
              return (
                <g transform={`translate(${x}, ${y})`}>
                  {/* Radar Ripple */}
                  <circle r="22" fill="none" stroke="#fb7185" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="8;30" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  {/* Bus Icon Marker Pin */}
                  <circle r="14" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                  <path
                    d="M -5,-5 L 5,-5 L 5,5 L -5,5 Z"
                    fill="#ffffff"
                  />
                </g>
              );
            })()}
          </svg>

          {/* Hovered Stop Tooltip Overlay */}
          {hoveredStop !== null && activeRoute?.stops?.[hoveredStop] && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(20, 10, 16, 0.95)',
                border: '1px solid var(--color-brand-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                fontSize: 'var(--text-xs)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <strong>Stop #{activeRoute.stops[hoveredStop].sequence}: {activeRoute.stops[hoveredStop].name}</strong>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                {activeRoute.stops[hoveredStop].campusLocation}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Telemetry HUD Grid */}
        <div className="gps-telemetry-grid">
          {/* Coordinates */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <Compass size={13} color="var(--color-brand-accent)" /> Live GPS Coordinates
            </span>
            <span className="gps-telemetry-val">
              {currentLat}&deg; N, {currentLng}&deg; E
            </span>
          </div>

          {/* Speed & Heading */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <Gauge size={13} color="var(--color-brand-accent)" /> Velocity &bull; Heading
            </span>
            <span className="gps-telemetry-val">
              {currentSpeed} km/h &bull; 352&deg; NNW
            </span>
          </div>

          {/* Next Approaching Stop */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <MapPin size={13} color="var(--color-brand-accent)" /> Approaching Next Stop
            </span>
            <span className="gps-telemetry-val" style={{ color: '#ffffff', fontSize: 'var(--text-sm)' }}>
              {nextStop ? `${nextStop.name.slice(0, 22)}...` : 'Sonipat Terminus'}
            </span>
          </div>

          {/* Next Stop ETA */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <Clock size={13} color="var(--color-brand-accent)" /> Estimated Arrival
            </span>
            <span className="gps-telemetry-val" style={{ color: '#22c55e' }}>
              ETA {formatEta(etaSeconds)}
            </span>
          </div>

          {/* Satellite Telemetry */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <Wifi size={13} color="var(--color-brand-accent)" /> Satellite Telemetry
            </span>
            <span className="gps-telemetry-val" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)' }}>
              14 Sats (RTK Fix &bull; &plusmn;1.4m)
            </span>
          </div>
        </div>

        {/* GPS Control Bar */}
        <div className="gps-controls-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)' }}
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? 'Pause live tracking simulation' : 'Resume live tracking simulation'}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulating ? 'Pause Telemetry' : 'Resume Telemetry'}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <span>Sim Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimSpeed(spd)}
                  style={{
                    background: simSpeed === spd ? 'var(--color-brand-primary)' : 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              href={`tel:${activeShuttle.driverPhone}`}
              className="btn-secondary"
              style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)' }}
              title={`Call driver ${activeShuttle.driver}`}
            >
              <Phone size={14} />
              <span>Call Shuttle Driver</span>
            </a>

            <a
              href="tel:01302203712"
              className="btn-primary"
              style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: 'var(--text-xs)' }}
              title="Direct Transit Control Dispatch"
            >
              <ShieldAlert size={14} />
              <span>Transit Dispatch SOS</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STUDENT BROWSER GPS LOCATOR CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="student-geo-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'rgba(224, 76, 98, 0.15)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocateFixed size={20} />
          </div>

          <div>
            <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--color-text-main)' }}>
              Find My Nearest SRM Shuttle Stop (Student GPS)
            </strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Detect your device's live coordinates to calculate the exact distance to your pickup shelter.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-pink"
          style={{ minHeight: '40px', padding: '0.45rem 1rem', fontSize: 'var(--text-xs)' }}
          onClick={handleLocateMe}
          disabled={isLocating}
        >
          <LocateFixed size={14} />
          <span>{isLocating ? 'Detecting GPS...' : 'Detect My Location'}</span>
        </button>
      </div>

      {/* Geolocation Result Callout */}
      {nearestStopInfo && userCoords && (
        <div
          className="pastel-card-sand"
          style={{
            padding: '1.15rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} color="#22c55e" /> Nearest Pickup Stop Detected: {nearestStopInfo.stop.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Your device GPS: <strong>{userCoords.lat.toFixed(4)}&deg; N, {userCoords.lng.toFixed(4)}&deg; E</strong> &bull; Distance to shelter: <strong>{nearestStopInfo.distance} km</strong>
            </div>
          </div>

          <span className="badge badge-progress">
            Arrival Window: ~{Math.max(3, Math.round(nearestStopInfo.distance * 2.5))} mins
          </span>
        </div>
      )}

      {geoError && (
        <div className="alert-notice" style={{ marginBottom: '2rem' }}>
          <div className="alert-notice-title">
            <AlertTriangle size={16} /> GPS Location Notice
          </div>
          <p style={{ fontSize: 'var(--text-xs)', margin: '0.2rem 0' }}>{geoError}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE NOTICES & ROUTE TIMETABLES
         ───────────────────────────────────────────────────────────── */}
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

      {/* Route Selector Tabs */}
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

      {/* Selected Route Timetable & Stoppage Sequence */}
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
                  background: 'var(--color-border)',
                }}
              />

              {activeRoute.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === activeRoute.stops.length - 1;
                const isApproaching = stop.id === nextStop?.id;

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
                        background: isApproaching
                          ? 'var(--color-brand-primary)'
                          : isFirst || isLast
                          ? 'var(--color-brand-primary)'
                          : 'var(--color-brand-accent)',
                        border: '3px solid var(--color-surface)',
                        boxShadow: isApproaching ? '0 0 12px var(--color-brand-primary)' : '0 0 0 1px var(--color-border)',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-main)' }}>
                        Stop #{stop.sequence}: {stop.name}
                      </span>
                      {isApproaching && (
                        <span className="badge badge-progress" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                          Next Stop &bull; {formatEta(etaSeconds)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
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
