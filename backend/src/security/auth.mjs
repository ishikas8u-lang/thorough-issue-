import crypto from 'node:crypto';
import { config } from '../config.mjs';

/**
 * Computes salted SHA-256 digest. Guarantees zero plain-text storage.
 */
export function hashPassword(password, salt) {
  const hash = crypto.createHash('sha256');
  hash.update(`${salt}:${password}`);
  return hash.digest('hex');
}

export function generateSalt(byteCount = 16) {
  return crypto.randomBytes(byteCount).toString('hex');
}

export function generateToken(byteCount = 24) {
  return `tok_${crypto.randomBytes(byteCount).toString('hex')}`;
}

export function extractSessionToken(req) {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie: session_token=<token>
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('session_token=')) {
        return c.substring('session_token='.length).trim();
      }
    }
  }

  return null;
}

export function createStudentSession(db, studentId) {
  const token = generateToken(24);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.sessionTtlMs).toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (token, student_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(token, studentId, expiresAt, now.toISOString());

  return { token, expiresAt };
}

export function getActiveStudentSession(db, token) {
  if (!token) return null;

  const row = db.prepare(`
    SELECT s.token, s.expires_at, st.id, st.full_name, st.email, st.contact_number, st.course, st.branch, st.updated_at
    FROM sessions s
    JOIN students st ON st.id = s.student_id
    WHERE s.token = ?
  `).get(token);

  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    // Expired
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    token: row.token,
    expiresAt: row.expires_at,
    student: {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      contactNumber: row.contact_number,
      course: row.course,
      branch: row.branch,
      updatedAt: row.updated_at,
    },
  };
}

export function deleteStudentSession(db, token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function verifyStaffAuth(req) {
  // Checks staff authorization header or reviewer token
  const staffHeader = req.headers['x-staff-user'] || req.headers['x-staff-id'];
  if (staffHeader && (staffHeader === 'staff_vansh' || staffHeader === 'staff_krisha')) {
    return {
      authenticated: true,
      staffId: staffHeader,
      role: 'FACILITIES_REVIEWER',
    };
  }

  // Also check Bearer staff tokens
  const authHeader = req.headers['authorization'];
  if (authHeader && (authHeader === 'Bearer staff_secret_token_vansh' || authHeader === 'Bearer staff_secret_token_krisha')) {
    return {
      authenticated: true,
      staffId: authHeader.includes('vansh') ? 'staff_vansh' : 'staff_krisha',
      role: 'FACILITIES_REVIEWER',
    };
  }

  return { authenticated: false };
}
