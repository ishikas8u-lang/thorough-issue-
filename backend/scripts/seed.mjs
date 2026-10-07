#!/usr/bin/env node
import { getDb, runMigrations, getDbPath } from '../src/db.mjs';
import {
  DEMO_STUDENT,
  DEMO_SAFETY_CONTACTS,
  DEMO_SAFETY_LOCATIONS,
  DEMO_TRANSIT_ROUTES,
  DEMO_REPORTS,
  FICTIONAL_DISCLAIMER,
} from '../seeds/demo_seed_data.mjs';
import { generateSalt, hashPassword } from '../src/security/auth.mjs';

console.log('--- Campus Assist Demo Database Seeder ---');
console.log(`Database target: ${getDbPath()}`);
console.log(`Disclaimer: ${FICTIONAL_DISCLAIMER}`);

try {
  const db = getDb();
  runMigrations(db);

  // 1. Seed Demo Student
  const existingStudent = db
    .prepare('SELECT id FROM students WHERE email = ?')
    .get(DEMO_STUDENT.email);

  if (!existingStudent) {
    const salt = generateSalt();
    const hash = hashPassword(DEMO_STUDENT.passwordPlain, salt);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO students (id, full_name, email, contact_number, course, branch, password_salt, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      DEMO_STUDENT.id,
      DEMO_STUDENT.fullName,
      DEMO_STUDENT.email,
      DEMO_STUDENT.contactNumber,
      DEMO_STUDENT.course,
      DEMO_STUDENT.branch,
      salt,
      hash,
      now,
      now
    );
    console.log(`✓ Seeded demo student: ${DEMO_STUDENT.email} (Password: ${DEMO_STUDENT.passwordPlain})`);
  }

  // 2. Seed Safety Contacts
  for (const c of DEMO_SAFETY_CONTACTS) {
    db.prepare(`
      INSERT OR REPLACE INTO safety_contacts (id, label, phone, instructions, source, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(c.id, c.label, c.phone, c.instructions, c.source, c.verifiedAt, c.isDemo);
  }
  console.log(`✓ Seeded ${DEMO_SAFETY_CONTACTS.length} demo safety directory contacts.`);

  // 3. Seed Safety Locations
  for (const loc of DEMO_SAFETY_LOCATIONS) {
    db.prepare(`
      INSERT OR REPLACE INTO safety_locations (id, name, kind, campus_location, description, verified_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(loc.id, loc.name, loc.kind, loc.campusLocation, loc.description, loc.verifiedAt, loc.isDemo);
  }
  console.log(`✓ Seeded ${DEMO_SAFETY_LOCATIONS.length} demo safety locations.`);

  // 4. Seed Transit Routes & Stops
  for (const r of DEMO_TRANSIT_ROUTES) {
    db.prepare(`
      INSERT OR REPLACE INTO transit_routes (id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json)
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

    // Delete existing stops for idempotency
    db.prepare('DELETE FROM transit_stops WHERE route_id = ?').run(r.id);
    for (const s of r.stops) {
      db.prepare(`
        INSERT INTO transit_stops (id, route_id, name, sequence, campus_location)
        VALUES (?, ?, ?, ?, ?)
      `).run(s.id, r.id, s.name, s.sequence, s.campusLocation);
    }
  }
  console.log(`✓ Seeded ${DEMO_TRANSIT_ROUTES.length} demo transit routes and stops.`);

  // 5. Seed Demo Reports
  for (const rep of DEMO_REPORTS) {
    db.prepare(`
      INSERT OR REPLACE INTO reports (id, reference_code, category, location_description, issue_description, status, created_at, updated_at)
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

    // Seed audit trail
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
  console.log(`✓ Seeded ${DEMO_REPORTS.length} demo facilities problem reports.`);

  console.log('✓ Seeding complete. Remember: All data is fictional demo test fixtures.');
  process.exit(0);
} catch (err) {
  console.error('✗ Seeding failed:', err);
  process.exit(1);
}
