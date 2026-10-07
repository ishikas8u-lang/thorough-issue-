#!/usr/bin/env node
import { getDb, runMigrations, getDbPath } from '../src/db.mjs';

console.log('--- Campus Assist Database Migration Tool ---');
console.log(`Database target: ${getDbPath()}`);

try {
  const db = getDb();
  runMigrations(db);
  console.log('✓ All database migrations applied successfully.');
  process.exit(0);
} catch (err) {
  console.error('✗ Migration failed:', err);
  process.exit(1);
}
