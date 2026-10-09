import { verifyStaffAuth } from '../security/auth.mjs';

export async function handleGetRoutes(req, res, db) {
  const routes = db
    .prepare(
      'SELECT id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json, driver_name, driver_phone, bus_number FROM transit_routes'
    )
    .all();
  const stops = db
    .prepare(
      'SELECT id, route_id, name, sequence, campus_location FROM transit_stops ORDER BY sequence ASC'
    )
    .all();

  const formatted = routes.map((r) => {
    let departures = [];
    try {
      departures = JSON.parse(r.scheduled_departures_json);
    } catch {
      departures = [];
    }

    const routeStops = stops
      .filter((s) => s.route_id === r.id)
      .map((s) => ({
        id: s.id,
        name: s.name,
        sequence: s.sequence,
        campusLocation: s.campus_location,
      }));

    return {
      id: r.id,
      name: r.name,
      description: r.description,
      operatingDays: r.operating_days,
      timezone: r.timezone,
      lastUpdated: r.last_updated,
      isDemo: Boolean(r.is_demo),
      driverName: r.driver_name || 'Rajesh Kumar',
      driverPhone: r.driver_phone || '+91 98765 43210',
      busNumber: r.bus_number || 'DL 1P B-4029',
      scheduledDepartures: departures,
      stops: routeStops,
    };
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      routes: formatted,
      activeNotices: [
        {
          id: 'notice-transit-01',
          title: 'University Shuttle Transit Notice',
          body: 'Buses follow published schedules: morning arrival at campus by 9:00 AM, and evening return leaving campus at 4:30 PM.',
        },
      ],
      disclaimer: 'Operating on Indian Standard Time (IST). Verified by SRM University Transport Cell.',
    })
  );
}

export async function handleStaffUpdateRoute(req, res, db, routeId, body) {
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

  const existing = db.prepare('SELECT id, scheduled_departures_json FROM transit_routes WHERE id = ?').get(routeId);
  if (!existing) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', message: 'Route not found.' }));
    return;
  }

  const { driverName, driverPhone, busNumber, scheduledDepartures, timings } = body || {};

  let departuresJson = existing.scheduled_departures_json;
  if (Array.isArray(scheduledDepartures)) {
    departuresJson = JSON.stringify(scheduledDepartures);
  } else if (typeof timings === 'string' && timings.trim()) {
    departuresJson = JSON.stringify([timings.trim()]);
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE transit_routes
    SET driver_name = COALESCE(?, driver_name),
        driver_phone = COALESCE(?, driver_phone),
        bus_number = COALESCE(?, bus_number),
        scheduled_departures_json = ?,
        last_updated = ?
    WHERE id = ?
  `).run(
    driverName !== undefined ? driverName.trim() : null,
    driverPhone !== undefined ? driverPhone.trim() : null,
    busNumber !== undefined ? busNumber.trim() : null,
    departuresJson,
    now,
    routeId
  );

  const updated = db
    .prepare('SELECT id, name, driver_name, driver_phone, bus_number, scheduled_departures_json, last_updated FROM transit_routes WHERE id = ?')
    .get(routeId);

  let parsedDepartures = [];
  try {
    parsedDepartures = JSON.parse(updated.scheduled_departures_json);
  } catch {}

  const routeObj = {
    id: updated.id,
    name: updated.name,
    driverName: updated.driver_name,
    driverPhone: updated.driver_phone,
    busNumber: updated.bus_number,
    timings: timings || (parsedDepartures.length ? parsedDepartures.join(', ') : ''),
    scheduledDepartures: parsedDepartures,
    lastUpdated: updated.last_updated,
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      route: routeObj,
      ...routeObj,
      message: 'Transport route details updated successfully.',
    })
  );
}
