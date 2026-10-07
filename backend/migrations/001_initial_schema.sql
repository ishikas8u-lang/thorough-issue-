-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Campus Assist Core Relational Schema (SQLite / Clean Architecture)
-- Author: Vansh (Backend Owner)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  contact_number TEXT NOT NULL,
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);

-- 2. Sessions Table (Stateful Auth Tokens)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

-- 3. Facilities Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  category TEXT NOT NULL,
  location_description TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_reference_code ON reports (reference_code);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- 4. Report Immutable Audit Trail Table
CREATE TABLE IF NOT EXISTS report_audit_log (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  public_message TEXT,
  internal_note TEXT,
  actor_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_report_id ON report_audit_log (report_id);

-- 5. Safety Directory Contacts Table
CREATE TABLE IF NOT EXISTS safety_contacts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  phone TEXT NOT NULL,
  instructions TEXT NOT NULL,
  source TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 1
);

-- 6. Safety Verified Locations Table
CREATE TABLE IF NOT EXISTS safety_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  campus_location TEXT NOT NULL,
  description TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 1
);

-- 7. Transit Routes Table
CREATE TABLE IF NOT EXISTS transit_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  operating_days TEXT NOT NULL,
  timezone TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 1,
  scheduled_departures_json TEXT NOT NULL
);

-- 8. Transit Ordered Stops Table
CREATE TABLE IF NOT EXISTS transit_stops (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES transit_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  campus_location TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transit_stops_route ON transit_stops (route_id, sequence);
