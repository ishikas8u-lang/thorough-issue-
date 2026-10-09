#!/usr/bin/env node
import http from 'node:http';
import { getDb, runMigrations, getDbPath } from '../src/db.mjs';
import { createRequestHandler } from '../src/app.mjs';
import {
  DEMO_STUDENT,
  DEMO_ADMIN,
  DEMO_SAFETY_CONTACTS,
  DEMO_SAFETY_LOCATIONS,
  DEMO_TRANSIT_ROUTES,
  DEMO_REPORTS,
} from '../seeds/demo_seed_data.mjs';
import { generateSalt, hashPassword } from '../src/security/auth.mjs';

console.log('==============================================');
console.log('Campus Assist Production Service Initializer');
console.log('==============================================');

// 1. Establish database connection & run migrations
const dbPath = getDbPath();
console.log(`Connecting to SQLite database at: ${dbPath}`);
const db = getDb();
runMigrations(db);
console.log('✓ Migrations successfully applied.');

// 2. Check if database is empty & seed only if needed
function isDatabaseEmpty() {
  try {
    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const reportCount = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
    const adminExists = db.prepare('SELECT id FROM students WHERE email = ?').get(DEMO_ADMIN.email);
    return (studentCount === 0 && reportCount === 0) || !adminExists;
  } catch {
    return true;
  }
}

if (isDatabaseEmpty()) {
  console.log('Database requires seeding. Seeding initial baseline data...');

  // Seed demo student
  const studentSalt = generateSalt();
  const studentHash = hashPassword(DEMO_STUDENT.passwordPlain, studentSalt);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO students (
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
    DEMO_STUDENT.role || 'student',
    now,
    now
  );

  // Seed demo admin
  const adminSalt = generateSalt();
  const adminHash = hashPassword(DEMO_ADMIN.passwordPlain, adminSalt);
  db.prepare(`
    INSERT OR REPLACE INTO students (
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
    DEMO_ADMIN.role || 'admin',
    now,
    now
  );

  // Seed safety contacts
  for (const c of DEMO_SAFETY_CONTACTS) {
    db.prepare(`
      INSERT OR REPLACE INTO safety_contacts (id, label, phone, instructions, source, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(c.id, c.label, c.phone, c.instructions, c.source, c.verifiedAt, c.isDemo);
  }

  // Seed safety locations
  for (const loc of DEMO_SAFETY_LOCATIONS) {
    db.prepare(`
      INSERT OR REPLACE INTO safety_locations (id, name, kind, campus_location, description, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(loc.id, loc.name, loc.kind, loc.campusLocation, loc.description, loc.verifiedAt, loc.isDemo);
  }

  // Seed transit routes
  for (const r of DEMO_TRANSIT_ROUTES) {
    db.prepare(`
      INSERT OR REPLACE INTO transit_routes (id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json, driver_name, driver_phone, bus_number)
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

    db.prepare('DELETE FROM transit_stops WHERE route_id = ?').run(r.id);
    for (const s of r.stops) {
      db.prepare(`
        INSERT INTO transit_stops (id, route_id, name, sequence, campus_location)
        VALUES (?, ?, ?, ?, ?)
      `).run(s.id, r.id, s.name, s.sequence, s.campusLocation);
    }
  }

  // Seed reports & audit log
  for (const rep of DEMO_REPORTS) {
    db.prepare(`
      INSERT OR REPLACE INTO reports (id, reference_code, category, location_description, issue_description, status, admin_reply, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      rep.id,
      rep.referenceCode,
      rep.category,
      rep.locationDescription,
      rep.issueDescription,
      rep.status,
      rep.adminReply || null,
      rep.createdAt,
      rep.updatedAt
    );

    for (const aud of rep.auditTrail) {
      db.prepare(`
        INSERT OR REPLACE INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
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

  console.log('✓ Demo data successfully seeded.');
} else {
  console.log('✓ Existing data found. Skipping re-seed to preserve database state.');
}

// 3. Start unified HTTP service
const requestHandler = createRequestHandler(db);
const server = http.createServer(requestHandler);

const port = parseInt(process.env.PORT || '4000', 10);
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.log('==============================================');
  console.log(`✓ Campus Assist unified service live on http://${host}:${port}`);
  console.log(`✓ Serving built frontend (dist/) with API at /api`);
  console.log(`✓ Health check active at /health and /api/health`);
  console.log('==============================================');
});

function shutdown() {
  console.log('\nShutting down Campus Assist service...');
  server.close(() => {
    console.log('✓ Service terminated cleanly.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
