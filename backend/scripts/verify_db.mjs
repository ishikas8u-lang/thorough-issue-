import { getDb, getDbPath } from '../src/db.mjs';

console.log('--- DATABASE STATUS VERIFICATION ---');
console.log('Database Path:', getDbPath());

try {
  const db = getDb();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('Database Tables:', tables.map(t => t.name).join(', '));

  const counts = {
    students: db.prepare('SELECT count(*) as c FROM students').get().c,
    sessions: db.prepare('SELECT count(*) as c FROM sessions').get().c,
    reports: db.prepare('SELECT count(*) as c FROM reports').get().c,
    auditLogs: db.prepare('SELECT count(*) as c FROM report_audit_log').get().c,
    safetyContacts: db.prepare('SELECT count(*) as c FROM safety_contacts').get().c,
    safetyLocations: db.prepare('SELECT count(*) as c FROM safety_locations').get().c,
    transitRoutes: db.prepare('SELECT count(*) as c FROM transit_routes').get().c,
    transitStops: db.prepare('SELECT count(*) as c FROM transit_stops').get().c,
  };

  console.log('Record Counts:', counts);
  console.log('Sample Report in DB:', db.prepare('SELECT reference_code, category, status FROM reports LIMIT 1').get());
  console.log('✓ Database verification successful!');
} catch (err) {
  console.error('✗ Database error:', err);
}
