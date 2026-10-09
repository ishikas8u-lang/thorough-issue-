import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let instance = null;

export function getDbPath() {
  if (process.env.DATABASE_PATH) {
    return path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.resolve(process.cwd(), process.env.DATABASE_PATH);
  }
  return path.resolve(__dirname, '../data/campus_assist.db');
}

export function getDb(customPath = null) {
  if (instance && !customPath) {
    return instance;
  }

  const dbPath = customPath || getDbPath();
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  if (!customPath) {
    instance = db;
  }
  return db;
}

export function runMigrations(db) {
  // Create schema_migrations table if not present
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations').all();
  const appliedSet = new Set(appliedRows.map((r) => r.version));

  const migrationsDir = path.resolve(__dirname, '../migrations');
  if (fs.existsSync(migrationsDir)) {
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of sqlFiles) {
      if (!appliedSet.has(file)) {
        const fullPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(fullPath, 'utf8');
        try {
          db.exec(sql);
          db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)')
            .run(file, new Date().toISOString());
        } catch {
          // If statement failed (e.g. column already added), record migration
          try {
            db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)')
              .run(file, new Date().toISOString());
          } catch {}
        }
      }
    }
  }

  // Idempotently ensure extended table columns
  try {
    const studentCols = db.prepare('PRAGMA table_info(students)').all().map((c) => c.name);
    if (!studentCols.includes('role')) {
      db.exec("ALTER TABLE students ADD COLUMN role TEXT NOT NULL DEFAULT 'student';");
    }
    if (!studentCols.includes('registration_number')) {
      db.exec('ALTER TABLE students ADD COLUMN registration_number TEXT;');
    }
    if (!studentCols.includes('department')) {
      db.exec('ALTER TABLE students ADD COLUMN department TEXT;');
    }
    if (!studentCols.includes('year')) {
      db.exec('ALTER TABLE students ADD COLUMN year TEXT;');
    }
    if (!studentCols.includes('phone')) {
      db.exec('ALTER TABLE students ADD COLUMN phone TEXT;');
    }
    if (!studentCols.includes('hostel_type')) {
      db.exec('ALTER TABLE students ADD COLUMN hostel_type TEXT;');
    }
    if (!studentCols.includes('bus_route_id')) {
      db.exec('ALTER TABLE students ADD COLUMN bus_route_id TEXT;');
    }
    if (!studentCols.includes('employee_id')) {
      db.exec('ALTER TABLE students ADD COLUMN employee_id TEXT;');
    }
    if (!studentCols.includes('office')) {
      db.exec('ALTER TABLE students ADD COLUMN office TEXT;');
    }

    const reportCols = db.prepare('PRAGMA table_info(reports)').all().map((c) => c.name);
    if (!reportCols.includes('admin_reply')) {
      db.exec('ALTER TABLE reports ADD COLUMN admin_reply TEXT;');
    }
    if (!reportCols.includes('student_id')) {
      db.exec('ALTER TABLE reports ADD COLUMN student_id TEXT;');
    }
    if (!reportCols.includes('escalated_to')) {
      db.exec('ALTER TABLE reports ADD COLUMN escalated_to TEXT;');
    }
    if (!reportCols.includes('escalation_note')) {
      db.exec('ALTER TABLE reports ADD COLUMN escalation_note TEXT;');
    }

    const routeCols = db.prepare('PRAGMA table_info(transit_routes)').all().map((c) => c.name);
    if (!routeCols.includes('driver_name')) {
      db.exec('ALTER TABLE transit_routes ADD COLUMN driver_name TEXT;');
    }
    if (!routeCols.includes('driver_phone')) {
      db.exec('ALTER TABLE transit_routes ADD COLUMN driver_phone TEXT;');
    }
    if (!routeCols.includes('bus_number')) {
      db.exec('ALTER TABLE transit_routes ADD COLUMN bus_number TEXT;');
    }
  } catch {
    // Columns already established
  }
}
