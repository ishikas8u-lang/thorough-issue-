-- ==============================================================================
-- Migration: 003_role_portals_and_fields.sql
-- Schema extensions for Student and Admin Block portals, RBAC, Escalation & Transit
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Extend students table with student-specific and admin-specific attributes
-- Note: SQLite column alterations are added safely; existing columns are preserved.
ALTER TABLE students ADD COLUMN registration_number TEXT;
ALTER TABLE students ADD COLUMN department TEXT;
ALTER TABLE students ADD COLUMN year TEXT;
ALTER TABLE students ADD COLUMN phone TEXT;
ALTER TABLE students ADD COLUMN hostel_type TEXT; -- 'Hostel' | 'Day Scholar'
ALTER TABLE students ADD COLUMN bus_route_id TEXT;
ALTER TABLE students ADD COLUMN employee_id TEXT;
ALTER TABLE students ADD COLUMN office TEXT;

-- 2. Extend reports table with student link and escalation details
ALTER TABLE reports ADD COLUMN student_id TEXT REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN escalated_to TEXT;
ALTER TABLE reports ADD COLUMN escalation_note TEXT;

CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students (registration_number);
CREATE INDEX IF NOT EXISTS idx_reports_student_id ON reports (student_id);
