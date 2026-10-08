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
  Map as MapIcon,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StaticTransportScheduleProvider } from '../../infrastructure/repositories';
import { apiClient } from '../../infrastructure/apiClient';
import type { Route, Stop } from '../../types';
import {
  LiveTransitMap,
  type MapWaypoint,
  type ShuttleInfo,
  REGIONAL_REFERENCE_HUBS,
} from '../components/LiveTransitMap';

// Realistic Waypoints mapped along Delhi & Haryana highway corridors
const ROUTE_MAP_WAYPOINTS: Record<string, MapWaypoint[]> = {
  'route-rohini-burari-sonipat': [
    { lat: 28.7186, lng: 77.1264, name: 'Rohini Sector 18 Metro (East Gate)', isStop: true, sequence: 1, stopId: 'rb-s1' },
    { lat: 28.7350, lng: 77.1450, name: 'Outer Ring Road Rohini Sector 16' },
    { lat: 28.7533, lng: 77.1989, name: 'Burari Crossing Bus Stand', isStop: true, sequence: 2, stopId: 'rb-s2' },
    { lat: 28.7618, lng: 77.1554, name: 'Mukarba Chowk Transport Interchange', isStop: true, sequence: 3, stopId: 'rb-s3' },
    { lat: 28.7850, lng: 77.1420, name: 'NH-44 GT Karnal Road Corridor' },
    { lat: 28.8021, lng: 77.1320, name: 'Alipur Main Highway Shelter', isStop: true, sequence: 4, stopId: 'rb-s4' },
    { lat: 28.8520, lng: 77.1290, name: 'Singhu Border (Delhi-Haryana Border)' },
    { lat: 28.8791, lng: 77.1215, name: 'Kundli Border / KMP Expressway Junction', isStop: true, sequence: 5, stopId: 'rb-s5' },
    { lat: 28.9320, lng: 77.1120, name: 'Rai Industrial Development Corridor (Haryana)' },
    { lat: 28.9720, lng: 77.1050, name: 'Rajiv Gandhi Education City Main Boulevard' },
    { lat: 28.9845, lng: 77.1023, name: 'Sonipat Campus Main Terminal (SRM University)', isStop: true, sequence: 6, stopId: 'rb-s6' },
  ],
  'route-manglapuri-sonipat': [
    { lat: 28.5912, lng: 77.0821, name: 'Manglapuri Bus Terminal (Dwarka / Janakpuri)', isStop: true, sequence: 1, stopId: 'mp-s1' },
    { lat: 28.6297, lng: 77.0815, name: 'Janakpuri District Centre Crossing', isStop: true, sequence: 2, stopId: 'mp-s2' },
    { lat: 28.6480, lng: 77.1120, name: 'Rajouri Garden / Shivaji Marg Corridor' },
    { lat: 28.6672, lng: 77.1245, name: 'Punjabi Bagh Club Road Junction', isStop: true, sequence: 3, stopId: 'mp-s3' },
    { lat: 28.6920, lng: 77.1500, name: 'Netaji Subhash Place / Shakurpur' },
    { lat: 28.7121, lng: 77.1745, name: 'Azadpur Metro Interchange', isStop: true, sequence: 4, stopId: 'mp-s4' },
    { lat: 28.7618, lng: 77.1554, name: 'Mukarba Chowk North Delhi Flyover' },
    { lat: 28.8520, lng: 77.1290, name: 'Singhu Border (Delhi-Haryana State Line)' },
    { lat: 28.8791, lng: 77.1215, name: 'Kundli - Sonipat Expressway Corridor' },
    { lat: 28.9845, lng: 77.1023, name: 'Sonipat Campus Main Terminal (SRM University)', isStop: true, sequence: 5, stopId: 'mp-s5' },
  ],
  'route-panipat-sonipat': [
    { lat: 29.3909, lng: 76.9635, name: 'Panipat Toll Plaza / Skylark Hub (Haryana)', isStop: true, sequence: 1, stopId: 'pp-s1' },
    { lat: 29.3100, lng: 76.9920, name: 'Diwana NH-44 Highway Stretch' },
    { lat: 29.2378, lng: 77.0184, name: 'Samalkha Highway Bus Shelter (Haryana)', isStop: true, sequence: 2, stopId: 'pp-s2' },
    { lat: 29.1850, lng: 77.0220, name: 'Pattikalyana Crossing NH-44' },
    { lat: 29.1354, lng: 77.0256, name: 'Ganaur Bus Stand Stoppage (Haryana)', isStop: true, sequence: 3, stopId: 'pp-s3' },
    { lat: 29.0800, lng: 77.0500, name: 'Murthal Toll Plaza Bypass' },
    { lat: 29.0275, lng: 77.0721, name: 'Murthal University Chowk (Haveli / Sukhdev)', isStop: true, sequence: 4, stopId: 'pp-s4' },
    { lat: 28.9950, lng: 77.0950, name: 'Rai - Sonipat Connecting Highway' },
    { lat: 28.9845, lng: 77.1023, name: 'Sonipat Campus North Gate (SRM University)', isStop: true, sequence: 5, stopId: 'pp-s5' },
  ],
  'route-rohtak-sonipat': [
    { lat: 28.8955, lng: 76.6066, name: 'Rohtak New Bus Stand (Rautak Terminal, Haryana)', isStop: true, sequence: 1, stopId: 'rt-s1' },
    { lat: 28.8821, lng: 76.6198, name: 'Rohtak PGIMS Medical Chowk (Haryana)', isStop: true, sequence: 2, stopId: 'rt-s2' },
    { lat: 28.8650, lng: 76.6550, name: 'Asthal Bohar Rohtak Outer Highway' },
    { lat: 28.8400, lng: 76.7800, name: 'Sampla KMP Expressway Interchange' },
    { lat: 28.8856, lng: 76.9142, name: 'Kharkhoda Bypass (Maruti IMT Hub, Haryana)', isStop: true, sequence: 3, stopId: 'rt-s3' },
    { lat: 28.9400, lng: 76.9750, name: 'Rathdhana Highway Crossing' },
    { lat: 28.9912, lng: 77.0154, name: 'Sonipat Subhash Chowk (Haryana)', isStop: true, sequence: 4, stopId: 'rt-s4' },
    { lat: 28.9845, lng: 77.1023, name: 'Sonipat Campus Main Gate (SRM University)', isStop: true, sequence: 5, stopId: 'rt-s5' },
  ],
};

const SHUTTLES: ShuttleInfo[] = [
  {
    id: 'bus-01',
    reg: 'HR-10-SRM-4091',
    name: 'Delhi NCR Express',
    routeId: 'route-rohini-burari-sonipat',
    driver: 'Rajender Kumar',
    driverPhone: '+91 98112 04812',
    capacity: '44 Seater (AC Deluxe)',
    occupancy: '72% Full (32/44)',
    color: '#fb7185',
  },
  {
    id: 'bus-02',
    reg: 'HR-10-SRM-1022',
    name: 'Delhi West Corridor',
    routeId: 'route-manglapuri-sonipat',
    driver: 'Surender Singh',
    driverPhone: '+91 98112 04815',
    capacity: '32 Seater (Campus Loop)',
    occupancy: '45% Full (14/32)',
    color: '#38bdf8',
  },
  {
    id: 'bus-03',
    reg: 'HR-10-SRM-7734',
    name: 'Haryana GT Road Express',
    routeId: 'route-panipat-sonipat',
    driver: 'Vikram Sharma',
    driverPhone: '+91 98112 04820',
    capacity: '50 Seater (NCR Coach)',
    occupancy: '60% Full (30/50)',
    color: '#34d399',
  },
  {
    id: 'bus-04',
    reg: 'HR-10-SRM-5521',
    name: 'Haryana Western Coach',
    routeId: 'route-rohtak-sonipat',
    driver: 'Dharamvir Malik',
    driverPhone: '+91 98112 04828',
    capacity: '40 Seater (Haryana Coach)',
    occupancy: '58% Full (23/40)',
    color: '#fbbf24',
  },
];

// Sample student location presets across Delhi and Haryana for instant testing
const REGION_STUDENT_PRESETS = [
  { label: 'Rohini Sector 18 (Delhi)', lat: 28.7186, lng: 77.1264 },
  { label: 'Kashmere Gate ISBT (Delhi)', lat: 28.6675, lng: 77.2285 },
  { label: 'Janakpuri West (Delhi)', lat: 28.6297, lng: 77.0815 },
  { label: 'Singhu Border (Delhi-Haryana)', lat: 28.8520, lng: 77.1290 },
  { label: 'Murthal GT Road (Haryana)', lat: 29.0275, lng: 77.0721 },
  { label: 'Panipat Skylark (Haryana)', lat: 29.3909, lng: 76.9635 },
  { label: 'Rohtak PGIMS (Haryana)', lat: 28.8821, lng: 76.6198 },
  { label: 'Gurugram IFFCO Chowk (Haryana)', lat: 28.4720, lng: 77.0725 },
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
  const [activeShuttle, setActiveShuttle] = useState<ShuttleInfo>(SHUTTLES[0]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [mapViewMode, setMapViewMode] = useState<'real-map' | 'radar-hud'>('real-map');

  // Live GPS telemetry state
  const [progress, setProgress] = useState(0.28); // 0.0 to 1.0 along the route
  const [currentSpeed, setCurrentSpeed] = useState(48);
  const [etaSeconds, setEtaSeconds] = useState(210);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // Student Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocationLabel, setUserLocationLabel] = useState<string | null>(null);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const waypoints = ROUTE_MAP_WAYPOINTS[selectedRouteId] || ROUTE_MAP_WAYPOINTS['route-rohini-burari-sonipat'];

  // Fetch routes from backend API on mount
  useEffect(() => {
    apiClient
      .getRoutes()
      .then((data) => {
        if (data?.routes && data.routes.length > 0) {
          setRoutes(data.routes);
        }
      })
      .catch(() => {
        // Keep static fallback
      });
  }, []);

  // Update active shuttle when route changes
  useEffect(() => {
    const matchingShuttle = SHUTTLES.find((s) => s.routeId === selectedRouteId);
    if (matchingShuttle) {
      setActiveShuttle(matchingShuttle);
    }
  }, [selectedRouteId]);

  // Simulation tick loop for vehicle motion
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.0025 * simSpeed;
        const next = prev + step;
        if (next >= 1) return 0.02; // loop back
        return next;
      });

      // Realistic speed variation
      setCurrentSpeed(() => {
        const base = 48;
        const variation = Math.sin(Date.now() / 3200) * 11;
        return Math.max(15, Math.round(base + variation));
      });

      // Decrement ETA countdown
      setEtaSeconds((prev) => (prev > 5 ? prev - Math.round(1 * simSpeed) : 340));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Calculate current vehicle coordinates from waypoints
  const stopsCount = activeRoute?.stops?.length || 5;
  const totalWaypoints = waypoints.length;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const rawIdx = clampedProgress * (totalWaypoints - 1);
  const curSeg = Math.min(totalWaypoints - 2, Math.floor(rawIdx));
  const subProg = rawIdx - curSeg;

  const p1 = waypoints[curSeg] || waypoints[0];
  const p2 = waypoints[curSeg + 1] || waypoints[waypoints.length - 1];

  const currentLatNum = p1.lat + (p2.lat - p1.lat) * subProg;
  const currentLngNum = p1.lng + (p2.lng - p1.lng) * subProg;
  const currentLat = currentLatNum.toFixed(4);
  const currentLng = currentLngNum.toFixed(4);

  // Next approaching stop along the route
  const stopWaypoints = waypoints.filter((w) => w.isStop || w.sequence !== undefined);
  const nextStopIdx = Math.min(
    stopsCount - 1,
    Math.max(0, Math.floor(clampedProgress * (stopsCount - 1)) + 1)
  );
  const nextStop = activeRoute?.stops?.[nextStopIdx];

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
        setUserLocationLabel('Live Device GPS');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve your location. You can select a test location below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Find distance to closest stop from user location
  let nearestStopInfo: { stop: Stop; distance: number } | null = null;
  if (userCoords && activeRoute?.stops) {
    let minDistance = Infinity;
    let closestStop: Stop = activeRoute.stops[0];

    stopWaypoints.forEach((wp, idx) => {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, wp.lat, wp.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestStop = activeRoute.stops[idx] || activeRoute.stops[0];
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

  const handleStopSelect = (_stop: Stop, index: number) => {
    setSelectedStopIndex(index);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(251, 113, 133, 0.14)', color: 'var(--color-brand-primary)', border: '1px solid rgba(251, 113, 133, 0.28)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
              <Sparkles size={14} /> Real Satellite &amp; Highway Telemetry
            </div>
            <h1 className="title-section">
              Campus Transit &amp; Real Delhi-Haryana GPS Map
            </h1>
            <p className="text-lead" style={{ marginTop: '0.45rem' }}>
              Real live maps referenced across whole <strong>Delhi NCT</strong> and <strong>Haryana</strong> corridors (Sonipat, Panipat, Rohtak, Gurugram, Kundli, Murthal).
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
          1. REAL MAP / RADAR TELEMETRY CONTAINER
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
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
              }}
            >
              <Bus size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--text-base)', color: '#ffffff' }}>{activeShuttle.name}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--color-brand-accent)', fontWeight: 700 }}>
                  {activeShuttle.reg}
                </span>
                <span className="badge badge-progress" style={{ fontSize: '10px' }}>
                  {activeRoute.name.split(':')[0]}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Driver: <strong>{activeShuttle.driver}</strong> &bull; Capacity: <strong>{activeShuttle.capacity}</strong> &bull; Occupancy: <strong>{activeShuttle.occupancy}</strong>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Shuttle Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setMapViewMode('real-map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mapViewMode === 'real-map' ? 'var(--color-brand-primary)' : 'transparent',
                  color: mapViewMode === 'real-map' ? '#ffffff' : 'var(--color-text-muted)',
                  transition: 'var(--transition-all)',
                }}
              >
                <MapIcon size={13} />
                <span>Real Map</span>
              </button>
              <button
                type="button"
                onClick={() => setMapViewMode('radar-hud')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mapViewMode === 'radar-hud' ? 'var(--color-brand-primary)' : 'transparent',
                  color: mapViewMode === 'radar-hud' ? '#ffffff' : 'var(--color-text-muted)',
                  transition: 'var(--transition-all)',
                }}
              >
                <Activity size={13} />
                <span>Radar HUD</span>
              </button>
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
        </div>

        {/* ── Viewport: Real Leaflet Map vs. Radar HUD ── */}
        {mapViewMode === 'real-map' ? (
          <LiveTransitMap
            activeRoute={activeRoute}
            activeShuttle={activeShuttle}
            waypoints={waypoints}
            stops={activeRoute.stops}
            progress={progress}
            currentSpeed={currentSpeed}
            etaSeconds={etaSeconds}
            userCoords={userCoords}
            onSelectStop={handleStopSelect}
            selectedStopIndex={selectedStopIndex}
          />
        ) : (
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
                const x = 60 + stopRatio * 880;
                const y = 300 - stopRatio * 220 + Math.sin(stopRatio * Math.PI) * 40;
                const isPast = progress >= stopRatio;
                const isNext = stop.id === nextStop?.id;

                return (
                  <g key={stop.id} style={{ cursor: 'pointer' }} onClick={() => handleStopSelect(stop, index)}>
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
                    <circle r="22" fill="none" stroke="#fb7185" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="8;30" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="14" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <path d="M -5,-5 L 5,-5 L 5,5 L -5,5 Z" fill="#ffffff" />
                  </g>
                );
              })()}
            </svg>
          </div>
        )}

        {/* Real-time Telemetry HUD Grid */}
        <div className="gps-telemetry-grid">
          {/* Coordinates */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <Compass size={13} color="var(--color-brand-accent)" /> Live Highway Coordinates
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
              {currentSpeed} km/h &bull; 348&deg; NNW (Sonipat)
            </span>
          </div>

          {/* Next Approaching Stop */}
          <div className="gps-telemetry-item">
            <span className="gps-telemetry-label">
              <MapPin size={13} color="var(--color-brand-accent)" /> Approaching Next Stop
            </span>
            <span className="gps-telemetry-val" style={{ color: '#ffffff', fontSize: 'var(--text-sm)' }}>
              {nextStop ? `${nextStop.name.slice(0, 24)}...` : 'Sonipat Terminus'}
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
              <Wifi size={13} color="var(--color-brand-accent)" /> Satellite Constellation
            </span>
            <span className="gps-telemetry-val" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)' }}>
              16 Sats (NavIC + GPS RTK &bull; &plusmn;1.1m)
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
          2. REGIONAL REFERENCE OVERLAY: WHOLE DELHI & HARYANA HUBS
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.4rem 1.6rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--color-brand-primary)" />
            <h3 className="title-card-sm" style={{ margin: 0 }}>
              Regional Reference Grid (Whole Delhi &amp; Haryana)
            </h3>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            8 Key NCR Commuter Hubs &bull; Click to Pinpoint on Map
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.65rem' }}>
          {REGIONAL_REFERENCE_HUBS.map((hub, idx) => (
            <div
              key={idx}
              onClick={() => {
                setUserCoords({ lat: hub.lat, lng: hub.lng });
                setUserLocationLabel(hub.name);
              }}
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                transition: 'var(--transition-all)',
              }}
              className="hover-lift"
              title={`Simulate student location at ${hub.name} (${hub.region})`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <strong style={{ fontSize: 'var(--text-xs)', color: '#f8fafc' }}>{hub.name}</strong>
                <span style={{ fontSize: '9px', background: 'rgba(251, 113, 133, 0.15)', color: '#fb7185', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  {hub.region.includes('Delhi') ? 'DELHI' : 'HR'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {hub.lat.toFixed(3)}° N, {hub.lng.toFixed(3)}° E
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STUDENT BROWSER GPS LOCATOR CARD & PRESET PICKERS
         ───────────────────────────────────────────────────────────── */}
      <div className="student-geo-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'rgba(251, 113, 133, 0.15)',
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
              Find My Nearest SRM Shuttle Stop (Student GPS Locator)
            </strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Detect your real device GPS coordinates or pick a Delhi/Haryana hub to calculate exact distance to your shelter.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-pink"
            style={{ minHeight: '40px', padding: '0.45rem 1rem', fontSize: 'var(--text-xs)' }}
            onClick={handleLocateMe}
            disabled={isLocating}
          >
            <LocateFixed size={14} />
            <span>{isLocating ? 'Detecting GPS...' : 'Detect Device GPS'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>Quick Presets:</span>
            {REGION_STUDENT_PRESETS.slice(0, 5).map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setUserCoords({ lat: preset.lat, lng: preset.lng });
                  setUserLocationLabel(preset.label);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'var(--transition-all)',
                }}
                className="hover-lift"
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
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
              Location: <strong>{userLocationLabel || 'Device GPS'}</strong> ({userCoords.lat.toFixed(4)}&deg; N, {userCoords.lng.toFixed(4)}&deg; E) &bull; Distance to shelter: <strong>{nearestStopInfo.distance} km</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-progress">
              Arrival Window: ~{Math.max(3, Math.round(nearestStopInfo.distance * 2.5))} mins
            </span>
            <button
              type="button"
              onClick={() => {
                setUserCoords(null);
                setUserLocationLabel(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-subtle)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>
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
          4. ACTIVE NOTICES & ROUTE TIMETABLES
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
              onClick={() => {
                setSelectedRouteId(route.id);
                setSelectedStopIndex(null);
              }}
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
                boxShadow: isSelected ? '0 4px 14px rgba(244, 63, 94, 0.35)' : 'var(--shadow-sm)',
                flexShrink: 0,
                cursor: 'pointer',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="title-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--color-brand-accent)" /> Stoppage Sequence ({activeRoute.stops.length} Stops)
              </h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                Click stop to highlight on map
              </span>
            </div>

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
                const isSelected = selectedStopIndex === index;

                return (
                  <div
                    key={stop.id}
                    onClick={() => handleStopSelect(stop, index)}
                    style={{
                      position: 'relative',
                      marginBottom: '1.65rem',
                      minWidth: 0,
                      cursor: 'pointer',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(251, 113, 133, 0.12)' : 'transparent',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Circle Node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.7rem',
                        top: '8px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: isSelected
                          ? '#ffffff'
                          : isApproaching
                          ? 'var(--color-brand-primary)'
                          : isFirst || isLast
                          ? 'var(--color-brand-primary)'
                          : 'var(--color-brand-accent)',
                        border: isSelected ? '3px solid var(--color-brand-primary)' : '3px solid var(--color-surface)',
                        boxShadow: isApproaching || isSelected ? '0 0 12px var(--color-brand-primary)' : '0 0 0 1px var(--color-border)',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-main)' }}>
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
              <span>Full corridor verified by SRM University Transport Cell. Operating on Indian Standard Time.</span>
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
