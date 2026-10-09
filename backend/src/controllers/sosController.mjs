import crypto from 'node:crypto';
import { verifyStaffAuth, extractSessionToken, getActiveStudentSession } from '../security/auth.mjs';
import { checkRateLimit } from '../security/rateLimiter.mjs';

export function validateCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { valid: true, isNull: true, lat: null, lng: null };
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (Number.isNaN(numLat) || Number.isNaN(numLng)) {
    return { valid: false, error: 'Coordinates must be valid numbers.' };
  }
  if (numLat < -90 || numLat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90.' };
  }
  if (numLng < -180 || numLng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180.' };
  }
  return { valid: true, isNull: false, lat: numLat, lng: numLng };
}

export async function handleCreateSos(req, res, db, body) {
  if (!checkRateLimit(req, res, 'sos_submit')) return;

  const { lat, lng, accuracy, message } = body || {};

  // Check coordinates
  const coordCheck = validateCoordinates(lat, lng);
  if (!coordCheck.valid) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: coordCheck.error }));
    return;
  }

  // If coordinates are null, message (typed location) must be present
  if (coordCheck.isNull && (!message || !message.trim())) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'Must provide either GPS coordinates or a typed campus location.',
      })
    );
    return;
  }

  // Works signed-in or not
  let userId = null;
  const token = extractSessionToken(req);
  if (token) {
    const session = getActiveStudentSession(db, token);
    if (session) {
      userId = session.student.id;
    }
  }

  const alertId = `sos-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();
  const numAccuracy = accuracy !== undefined && accuracy !== null ? Number(accuracy) : null;

  db.prepare(`
    INSERT INTO sos_alerts (id, user_id, lat, lng, accuracy, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    alertId,
    userId,
    coordCheck.lat,
    coordCheck.lng,
    numAccuracy,
    message ? message.trim() : null,
    now
  );

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: alertId,
      status: 'new',
      createdAt: now,
      message: 'SOS alert received. Campus safety and operations have been alerted.',
    })
  );
}

export async function handleStaffListSos(req, res, db) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required.',
      })
    );
    return;
  }

  const alerts = db
    .prepare(`
      SELECT s.id, s.user_id, s.lat, s.lng, s.accuracy, s.message, s.status, s.created_at,
             st.full_name as user_name, st.contact_number as user_phone, st.email as user_email
      FROM sos_alerts s
      LEFT JOIN students st ON st.id = s.user_id
      ORDER BY s.created_at DESC
    `)
    .all();

  const formatted = alerts.map((a) => ({
    id: a.id,
    userId: a.user_id,
    userName: a.user_name || null,
    userPhone: a.user_phone || null,
    userEmail: a.user_email || null,
    lat: a.lat,
    lng: a.lng,
    accuracy: a.accuracy,
    message: a.message,
    status: a.status,
    createdAt: a.created_at,
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(formatted));
}

export async function handleStaffUpdateSos(req, res, db, alertId, body) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required.',
      })
    );
    return;
  }

  const { status } = body || {};
  const validStatuses = ['new', 'acknowledged', 'resolved'];
  if (!validStatuses.includes(status)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      })
    );
    return;
  }

  const existing = db.prepare('SELECT id FROM sos_alerts WHERE id = ?').get(alertId);
  if (!existing) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', message: 'SOS alert not found.' }));
    return;
  }

  db.prepare('UPDATE sos_alerts SET status = ? WHERE id = ?').run(status, alertId);

  const updated = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(alertId);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: updated.id,
      userId: updated.user_id,
      lat: updated.lat,
      lng: updated.lng,
      accuracy: updated.accuracy,
      message: updated.message,
      status: updated.status,
      createdAt: updated.created_at,
    })
  );
}
