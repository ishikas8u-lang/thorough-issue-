import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from '../src/db.mjs';
import { createRequestHandler } from '../src/app.mjs';
import { resetRateLimits } from '../src/security/rateLimiter.mjs';
import {
  DEMO_SAFETY_CONTACTS,
  DEMO_SAFETY_LOCATIONS,
  DEMO_TRANSIT_ROUTES,
} from '../seeds/demo_seed_data.mjs';

process.env.NODE_ENV = 'test';

export function createTestEnvironment() {
  resetRateLimits();

  // Create isolated in-memory SQLite database
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);

  // Pre-seed static safety & transport fixtures
  for (const c of DEMO_SAFETY_CONTACTS) {
    db.prepare(`
      INSERT INTO safety_contacts (id, label, phone, instructions, source, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(c.id, c.label, c.phone, c.instructions, c.source, c.verifiedAt, c.isDemo);
  }

  for (const loc of DEMO_SAFETY_LOCATIONS) {
    db.prepare(`
      INSERT INTO safety_locations (id, name, kind, campus_location, description, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(loc.id, loc.name, loc.kind, loc.campusLocation, loc.description, loc.verifiedAt, loc.isDemo);
  }

  for (const r of DEMO_TRANSIT_ROUTES) {
    db.prepare(`
      INSERT INTO transit_routes (id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      r.id,
      r.name,
      r.description,
      r.operatingDays,
      r.timezone,
      r.lastUpdated,
      r.isDemo,
      JSON.stringify(r.scheduledDepartures)
    );

    for (const s of r.stops) {
      db.prepare(`
        INSERT INTO transit_stops (id, route_id, name, sequence, campus_location)
        VALUES (?, ?, ?, ?, ?)
      `).run(s.id, r.id, s.name, s.sequence, s.campusLocation);
    }
  }

  const handler = createRequestHandler(db);
  const server = http.createServer(handler);

  return {
    db,
    server,
    async start() {
      return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          resolve(`http://127.0.0.1:${port}`);
        });
      });
    },
    async stop() {
      return new Promise((resolve) => {
        server.close(resolve);
      });
    },
  };
}
