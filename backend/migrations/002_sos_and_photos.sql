-- ==============================================================================
-- Migration: 002_sos_and_photos.sql
-- Campus Assist SOS Alerts & Incident Photos Schema
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  lat REAL,
  lng REAL,
  accuracy REAL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'acknowledged', 'resolved'
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts (status);
CREATE INDEX IF NOT EXISTS idx_sos_created_at ON sos_alerts (created_at);

-- 2. Report Photos Table (stores photos directly in SQLite as binary BLOBs)
CREATE TABLE IF NOT EXISTS report_photos (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  photo_blob BLOB NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON report_photos (report_id);
