import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Maximize2,
  Navigation,
  School,
  Layers,
} from 'lucide-react';
import type { Route, Stop } from '../../types';

export interface MapWaypoint {
  lat: number;
  lng: number;
  name?: string;
  isStop?: boolean;
  stopId?: string;
  sequence?: number;
}

export interface ShuttleInfo {
  id: string;
  reg: string;
  name: string;
  routeId: string;
  driver: string;
  driverPhone: string;
  capacity: string;
  occupancy: string;
  color?: string;
}

interface LiveTransitMapProps {
  activeRoute: Route;
  activeShuttle: ShuttleInfo;
  waypoints: MapWaypoint[];
  stops: Stop[];
  progress: number; // 0 to 1 along waypoints
  currentSpeed: number;
  etaSeconds: number;
  userCoords: { lat: number; lng: number } | null;
  onSelectStop?: (stop: Stop, index: number) => void;
  selectedStopIndex?: number | null;
}

// SRM University Delhi-NCR Campus Anchor (Sonipat, Haryana)
export const SRM_CAMPUS_COORDS = {
  lat: 28.9845,
  lng: 77.1023,
  name: 'SRM University Delhi-NCR Campus',
  city: 'Sonipat, Haryana',
};

// Regional Reference Landmarks across Delhi & Haryana
export const REGIONAL_REFERENCE_HUBS = [
  { name: 'Kashmere Gate ISBT', region: 'North Delhi', lat: 28.6675, lng: 77.2285 },
  { name: 'Connaught Place', region: 'Central Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Singhu Border', region: 'Delhi-Haryana Border', lat: 28.8520, lng: 77.1290 },
  { name: 'Kundli KMP Hub', region: 'Sonipat, Haryana', lat: 28.8791, lng: 77.1215 },
  { name: 'Murthal GT Road', region: 'Sonipat, Haryana', lat: 29.0275, lng: 77.0721 },
  { name: 'Panipat Skylark Hub', region: 'Panipat, Haryana', lat: 29.3909, lng: 76.9635 },
  { name: 'Rohtak New Stand', region: 'Rohtak, Haryana', lat: 28.8955, lng: 76.6066 },
  { name: 'Gurugram IFFCO Chowk', region: 'Gurugram, Haryana', lat: 28.4720, lng: 77.0725 },
];

export const LiveTransitMap: React.FC<LiveTransitMapProps> = ({
  activeRoute,
  activeShuttle,
  waypoints,
  stops,
  progress,
  currentSpeed,
  etaSeconds,
  userCoords,
  onSelectStop,
  selectedStopIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Markers and layers references
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const shuttleMarkerRef = useRef<L.Marker | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userConnectingLineRef = useRef<L.Polyline | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('dark');
  const [autoFollowBus, setAutoFollowBus] = useState(false);
  const [currentCoord, setCurrentCoord] = useState<{ lat: number; lng: number }>({
    lat: waypoints[0]?.lat || 28.7186,
    lng: waypoints[0]?.lng || 77.1264,
  });
  const [headingDegrees, setHeadingDegrees] = useState(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [28.88, 77.08],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom attribution
    L.control
      .attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | CARTO')
      .addTo(map);

    // Tile layer: Official OpenStreetMap with zero watermark
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abc',
      className: mapStyle === 'dark' ? 'osm-dark-tiles' : '',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Add SRM Campus permanent landmark marker
    const campusIcon = L.divIcon({
      className: 'srm-campus-leaflet-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #be123c, #fb7185);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 9999px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 14px rgba(244, 63, 94, 0.5);
          font-family: Outfit, sans-serif;
          font-weight: 800;
          font-size: 11px;
          white-space: nowrap;
          transform: translate(-50%, -50%);
        ">
          <span>🎓</span>
          <span>SRM University Sonipat</span>
        </div>
      `,
      iconSize: [180, 30],
      iconAnchor: [90, 15],
    });

    const campusMarker = L.marker([SRM_CAMPUS_COORDS.lat, SRM_CAMPUS_COORDS.lng], { icon: campusIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: Outfit, sans-serif; padding: 4px; color: #121316;">
          <h4 style="font-weight: 800; margin: 0 0 4px; color: #be123c; font-size: 14px;">🎓 SRM University Delhi-NCR</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #475569;">Rajiv Gandhi Education City, Post Office P.S. Rai, Sonipat, Haryana 131029</p>
          <div style="font-size: 11px; font-family: monospace; background: #f1f5f9; padding: 3px 6px; border-radius: 4px;">
            Coords: 28.9845° N, 77.1023° E
          </div>
        </div>
      `);

    // Add Regional Reference Markers across Delhi & Haryana
    const hubMarkers: L.Marker[] = REGIONAL_REFERENCE_HUBS.map((hub) => {
      const hubIcon = L.divIcon({
        className: 'regional-hub-leaflet-marker',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(30, 34, 43, 0.88);
            backdrop-filter: blur(4px);
            color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 10px;
            font-family: Outfit, sans-serif;
            font-weight: 600;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            pointer-events: auto;
          ">
            <span style="color: #fb7185;">📍</span>
            <span>${hub.name}</span>
          </div>
        `,
        iconSize: [120, 22],
        iconAnchor: [60, 11],
      });

      return L.marker([hub.lat, hub.lng], { icon: hubIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Outfit, sans-serif; padding: 3px; color: #121316;">
            <strong style="color: #be123c; font-size: 12px;">${hub.name}</strong>
            <div style="font-size: 11px; color: #64748b;">Region: <strong>${hub.region}</strong></div>
            <div style="font-size: 10px; font-family: monospace; color: #475569; margin-top: 2px;">
              ${hub.lat.toFixed(4)}° N, ${hub.lng.toFixed(4)}° E
            </div>
          </div>
        `);
    });

    // Invalidate size on mount after layout stabilizes
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      campusMarker.remove();
      hubMarkers.forEach((m) => m.remove());
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when style toggled
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const tileContainer = tileLayerRef.current.getContainer();
    if (tileContainer) {
      if (mapStyle === 'dark') {
        tileContainer.classList.add('osm-dark-tiles');
      } else {
        tileContainer.classList.remove('osm-dark-tiles');
      }
    }
  }, [mapStyle]);

  // Update Route Polyline & Stop Markers when route/waypoints change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || waypoints.length === 0) return;

    // 1. Remove existing route polyline
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    // 2. Remove existing stop markers
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    const latLngs = waypoints.map((w) => [w.lat, w.lng] as [number, number]);

    // Draw glowing route polyline
    const polyline = L.polyline(latLngs, {
      color: '#fb7185',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: undefined,
    }).addTo(map);

    polylineLayerRef.current = polyline;

    // Fit map bounds to show whole active route
    try {
      const bounds = polyline.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch {
      // ignore
    }

    // Add Stop Markers along route
    const stopWaypoints = waypoints.filter((w) => w.isStop || w.sequence !== undefined);
    const newMarkers: L.Marker[] = [];

    stopWaypoints.forEach((wp, idx) => {
      const isSelected = selectedStopIndex === idx;
      const stopSeq = wp.sequence || idx + 1;

      const stopIcon = L.divIcon({
        className: 'leaflet-stop-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${isSelected ? '#fb7185' : '#1e222b'};
            color: ${isSelected ? '#ffffff' : '#f8fafc'};
            border: 2.5px solid ${isSelected ? '#ffffff' : '#fb7185'};
            box-shadow: 0 0 10px rgba(251, 113, 133, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Outfit, sans-serif;
            font-weight: 800;
            font-size: 11px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
          ">
            ${stopSeq}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const matchedStop = stops.find((s) => s.id === wp.stopId) || stops[idx];

      const marker = L.marker([wp.lat, wp.lng], { icon: stopIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; padding: 4px; min-width: 180px; color: #121316;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="background: #fb7185; color: #ffffff; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 800;">
              Stop #${stopSeq}
            </span>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">
              ${wp.lat.toFixed(4)}° N, ${wp.lng.toFixed(4)}° E
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a;">
            ${wp.name || matchedStop?.name || 'Bus Stoppage'}
          </h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">
            ${matchedStop?.campusLocation || 'NCR Corridor Highway Bay'}
          </p>
        </div>
      `);

      marker.on('click', () => {
        if (matchedStop && onSelectStop) {
          onSelectStop(matchedStop, idx);
        }
      });

      newMarkers.push(marker);
    });

    stopMarkersRef.current = newMarkers;
  }, [activeRoute, waypoints, stops, selectedStopIndex, onSelectStop]);

  // Interpolate Shuttle GPS position based on progress (0 to 1) along waypoints
  useEffect(() => {
    if (waypoints.length < 2) return;

    const totalSegments = waypoints.length - 1;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const rawIndex = clampedProgress * totalSegments;
    const segIndex = Math.min(totalSegments - 1, Math.floor(rawIndex));
    const subProgress = rawIndex - segIndex;

    const p1 = waypoints[segIndex];
    const p2 = waypoints[segIndex + 1];

    if (!p1 || !p2) return;

    const lat = p1.lat + (p2.lat - p1.lat) * subProgress;
    const lng = p1.lng + (p2.lng - p1.lng) * subProgress;

    // Calculate heading angle
    const dLat = p2.lat - p1.lat;
    const dLng = p2.lng - p1.lng;
    const angleRad = Math.atan2(dLng, dLat);
    const angleDeg = ((angleRad * 180) / Math.PI + 360) % 360;

    setCurrentCoord({ lat, lng });
    setHeadingDegrees(Math.round(angleDeg));

    const map = mapInstanceRef.current;
    if (!map) return;

    // Update or create shuttle marker
    const busHtml = `
      <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%); cursor: pointer;">
        <!-- Pulsing radar ripple -->
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #fb7185;
          background: rgba(251, 113, 133, 0.2);
          animation: map-pulse 1.8s infinite ease-out;
        "></div>
        <!-- Center vehicle marker -->
        <div style="
          position: absolute;
          inset: 6px;
          background: linear-gradient(135deg, #e11d48, #fb7185);
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 14px;
        ">
          🚍
        </div>
      </div>
    `;

    const shuttleIcon = L.divIcon({
      className: 'leaflet-shuttle-marker',
      html: busHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (shuttleMarkerRef.current) {
      shuttleMarkerRef.current.setLatLng([lat, lng]);
      shuttleMarkerRef.current.setIcon(shuttleIcon);
    } else {
      const marker = L.marker([lat, lng], { icon: shuttleIcon, zIndexOffset: 1000 }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; padding: 4px; min-width: 190px; color: #121316;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #e11d48; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: 800; font-size: 10px;">
              LIVE TELEMETRY
            </span>
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #0f172a;">
              ${activeShuttle.reg}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700;">
            ${activeShuttle.name}
          </h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            Driver: <strong>${activeShuttle.driver}</strong> (${activeShuttle.driverPhone})
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 4px;">
            <span>Speed: <strong>${currentSpeed} km/h</strong></span>
            <span>Occupancy: <strong>${activeShuttle.occupancy}</strong></span>
          </div>
          <div style="font-size: 11px; color: #be123c; font-weight: 700;">
            Next Stop ETA: <strong>${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s</strong>
          </div>
        </div>
      `);
      shuttleMarkerRef.current = marker;
    }

    // Auto follow bus if enabled
    if (autoFollowBus) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }, [progress, waypoints, activeShuttle, currentSpeed, autoFollowBus]);

  // Update Student User Location Marker & Connector Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userConnectingLineRef.current) {
        userConnectingLineRef.current.remove();
        userConnectingLineRef.current = null;
      }
      return;
    }

    const userHtml = `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        transform: translate(-50%, -50%);
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.25);
          border: 2px solid #38bdf8;
          animation: map-pulse 2s infinite ease-out;
        "></div>
        <div style="
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: #0284c7;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.5);
        "></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'leaflet-user-marker',
      html: userHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
    } else {
      const marker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon, zIndexOffset: 900 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Outfit, sans-serif; padding: 4px; color: #121316;">
            <strong style="color: #0284c7;">📍 You Are Here</strong>
            <p style="margin: 4px 0 0; font-size: 11px; font-family: monospace;">
              ${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E
            </p>
          </div>
        `);
      userMarkerRef.current = marker;
    }

    // Connect user location to closest waypoint with dashed line
    let closestWp = waypoints[0];
    let minDist = Infinity;
    waypoints.forEach((w) => {
      const d = Math.hypot(w.lat - userCoords.lat, w.lng - userCoords.lng);
      if (d < minDist) {
        minDist = d;
        closestWp = w;
      }
    });

    if (closestWp) {
      const linePts: [number, number][] = [
        [userCoords.lat, userCoords.lng],
        [closestWp.lat, closestWp.lng],
      ];
      if (userConnectingLineRef.current) {
        userConnectingLineRef.current.setLatLngs(linePts);
      } else {
        userConnectingLineRef.current = L.polyline(linePts, {
          color: '#38bdf8',
          weight: 2,
          dashArray: '6 6',
          opacity: 0.8,
        }).addTo(map);
      }
    }
  }, [userCoords, waypoints]);

  // Actions
  const handleFitWholeRegion = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setAutoFollowBus(false);
    // Bounding box for Delhi NCT + Sonipat + Panipat + Rohtak + Gurugram
    const regionBounds = L.latLngBounds([
      [28.40, 76.55], // SW corner (Gurugram/Jhajjar/Rohtak border)
      [29.45, 77.35], // NE corner (Panipat / Yamuna corridor)
    ]);
    map.fitBounds(regionBounds, { padding: [30, 30] });
  }, []);

  const handleFocusBus = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setAutoFollowBus((prev) => !prev);
    map.setView([currentCoord.lat, currentCoord.lng], 14, { animate: true });
  }, [currentCoord]);

  const handleFocusCampus = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setAutoFollowBus(false);
    map.setView([SRM_CAMPUS_COORDS.lat, SRM_CAMPUS_COORDS.lng], 15, { animate: true });
  }, []);

  const toggleMapStyle = useCallback(() => {
    setMapStyle((prev) => (prev === 'dark' ? 'street' : 'dark'));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Real Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '460px',
          background: '#121419',
        }}
      />

      {/* Floating HUD Controls (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <button
          type="button"
          onClick={handleFitWholeRegion}
          title="Fit Whole Delhi & Haryana Regional Map"
          style={{
            background: 'rgba(26, 29, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            border: '1px solid var(--color-border)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-all)',
          }}
        >
          <Maximize2 size={14} color="var(--color-brand-primary)" />
          <span>Whole Delhi &amp; Haryana</span>
        </button>

        <button
          type="button"
          onClick={handleFocusBus}
          title={autoFollowBus ? 'Disable auto-tracking' : 'Lock map to moving vehicle'}
          style={{
            background: autoFollowBus ? 'var(--color-brand-primary)' : 'rgba(26, 29, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            border: '1px solid var(--color-border)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-all)',
          }}
        >
          <Navigation size={14} />
          <span>{autoFollowBus ? 'Locking Bus 📍' : 'Focus Vehicle'}</span>
        </button>

        <button
          type="button"
          onClick={handleFocusCampus}
          title="Zoom to SRM University Sonipat Campus"
          style={{
            background: 'rgba(26, 29, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            border: '1px solid var(--color-border)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-all)',
          }}
        >
          <School size={14} color="#fde047" />
          <span>SRM Campus</span>
        </button>

        <button
          type="button"
          onClick={toggleMapStyle}
          title="Toggle Dark Matter / OpenStreetMap Tiles"
          style={{
            background: 'rgba(26, 29, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            border: '1px solid var(--color-border)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-all)',
          }}
        >
          <Layers size={14} color="#38bdf8" />
          <span>{mapStyle === 'dark' ? 'Dark HUD' : 'Street Map'}</span>
        </button>
      </div>

      {/* Floating GPS Telemetry Overlay Badge (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          zIndex: 1000,
          background: 'rgba(18, 19, 22, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(251, 113, 133, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: 'var(--shadow-lg)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="gps-pulse-live" />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
            REAL GPS MAP ACTIVE
          </span>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
          LAT: <span style={{ color: '#fb7185', fontWeight: 700 }}>{currentCoord.lat.toFixed(4)}° N</span> &bull; LNG: <span style={{ color: '#fb7185', fontWeight: 700 }}>{currentCoord.lng.toFixed(4)}° E</span>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
          HDG: <span style={{ color: '#fde047', fontWeight: 700 }}>{headingDegrees}°</span>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Map Reference: <strong style={{ color: '#f8fafc' }}>Delhi &amp; Haryana NCR</strong>
        </div>
      </div>
    </div>
  );
};
