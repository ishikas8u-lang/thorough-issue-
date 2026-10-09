import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { runMigrations } from '../src/db.mjs';
import { createRequestHandler } from '../src/app.mjs';
import { resetRateLimits } from '../src/security/rateLimiter.mjs';
import { generateSalt, hashPassword } from '../src/security/auth.mjs';
import {
  DEMO_STUDENT,
  DEMO_ADMIN,
  DEMO_SAFETY_CONTACTS,
  DEMO_SAFETY_LOCATIONS,
  DEMO_TRANSIT_ROUTES,
  DEMO_REPORTS,
} from '../seeds/demo_seed_data.mjs';

process.env.NODE_ENV = 'test';

export function createTestEnvironment() {
  resetRateLimits();

  // Create isolated in-memory SQLite database
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);

  // Pre-seed demo student and demo admin accounts
  const studentSalt = generateSalt();
  const studentHash = hashPassword(DEMO_STUDENT.passwordPlain, studentSalt);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO students (
      id, full_name, email, contact_number, phone, course, branch,
      registration_number, department, year, hostel_type, bus_route_id,
      password_salt, password_hash, role, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    DEMO_STUDENT.id,
    DEMO_STUDENT.fullName,
    DEMO_STUDENT.email,
    DEMO_STUDENT.contactNumber,
    DEMO_STUDENT.phone,
    DEMO_STUDENT.course,
    DEMO_STUDENT.branch,
    DEMO_STUDENT.registrationNumber,
    DEMO_STUDENT.department,
    DEMO_STUDENT.year,
    DEMO_STUDENT.hostelType,
    DEMO_STUDENT.busRouteId,
    studentSalt,
    studentHash,
    'student',
    now,
    now
  );

  const adminSalt = generateSalt();
  const adminHash = hashPassword(DEMO_ADMIN.passwordPlain, adminSalt);
  db.prepare(`
    INSERT INTO students (
      id, full_name, email, contact_number, phone, course, branch,
      employee_id, office, department,
      password_salt, password_hash, role, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    DEMO_ADMIN.id,
    DEMO_ADMIN.fullName,
    DEMO_ADMIN.email,
    DEMO_ADMIN.contactNumber,
    DEMO_ADMIN.phone,
    DEMO_ADMIN.course,
    DEMO_ADMIN.branch,
    DEMO_ADMIN.employeeId,
    DEMO_ADMIN.office,
    DEMO_ADMIN.department,
    adminSalt,
    adminHash,
    'admin',
    now,
    now
  );

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
      INSERT INTO transit_routes (id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json, driver_name, driver_phone, bus_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      r.id,
      r.name,
      r.description,
      r.operatingDays,
      r.timezone,
      r.lastUpdated,
      r.isDemo,
      JSON.stringify(r.scheduledDepartures),
      r.driverName || 'Rajesh Kumar (Demo Driver)',
      r.driverPhone || '+91 98765 43210',
      r.busNumber || 'DL 1P B-4029'
    );

    for (const s of r.stops) {
      db.prepare(`
        INSERT INTO transit_stops (id, route_id, name, sequence, campus_location)
        VALUES (?, ?, ?, ?, ?)
      `).run(s.id, r.id, s.name, s.sequence, s.campusLocation);
    }
  }

  for (const rep of DEMO_REPORTS) {
    db.prepare(`
      INSERT INTO reports (id, reference_code, category, location_description, issue_description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      rep.id,
      rep.referenceCode,
      rep.category,
      rep.locationDescription,
      rep.issueDescription,
      rep.status,
      rep.createdAt,
      rep.updatedAt
    );

    for (const aud of rep.auditTrail) {
      db.prepare(`
        INSERT INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        aud.id,
        rep.id,
        aud.previousStatus,
        aud.newStatus,
        aud.publicMessage,
        aud.internalNote,
        aud.actorId,
        aud.createdAt
      );
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

export async function loginAsStaff(baseUrl) {
  const res = await fetch(`${baseUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DEMO_ADMIN.email,
      password: DEMO_ADMIN.passwordPlain,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to login as staff in test: ${res.status}`);
  }
  const data = await res.json();
  return data.token;
}

export async function loginAsStudent(baseUrl) {
  const res = await fetch(`${baseUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DEMO_STUDENT.email,
      password: DEMO_STUDENT.passwordPlain,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to login as student in test: ${res.status}`);
  }
  const data = await res.json();
  return data.token;
}
