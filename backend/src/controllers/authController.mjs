import crypto from 'node:crypto';
import { config } from '../config.mjs';
import {
  hashPassword,
  generateSalt,
  createStudentSession,
  extractSessionToken,
  getActiveStudentSession,
  deleteStudentSession,
} from '../security/auth.mjs';
import { checkRateLimit } from '../security/rateLimiter.mjs';

function setSessionCookie(res, token) {
  const isSecure = config.cookieSecure ? '; Secure' : '';
  const maxAge = Math.floor(config.sessionTtlMs / 1000);
  res.setHeader(
    'Set-Cookie',
    `session_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isSecure}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    'session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  );
}

export async function handleSignUp(req, res, db, body) {
  if (!checkRateLimit(req, res, 'auth')) return;

  const { fullName, email, contactNumber, course, branch, password } = body || {};

  // Validation
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Please enter a valid university email address.' }));
    return;
  }

  if (!fullName || fullName.trim().length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Full name must be at least 2 characters.' }));
    return;
  }

  // Contact number: 7-15 digits without country code bias
  const digits = (contactNumber || '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'Contact number must contain between 7 and 15 digits (supports international formats).',
      })
    );
    return;
  }

  if (!course || !course.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Course/program is required.' }));
    return;
  }

  if (!branch || !branch.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Branch/specialization is required.' }));
    return;
  }

  if (!password || password.length < 6) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' }));
    return;
  }

  // Check unique email
  const existing = db.prepare('SELECT id FROM students WHERE email = ?').get(cleanEmail);
  if (existing) {
    res.writeHead(409, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Conflict',
        message: 'A student account with this email address already exists. Please sign in.',
      })
    );
    return;
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  const studentId = `stu-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO students (id, full_name, email, contact_number, course, branch, password_salt, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    fullName.trim(),
    cleanEmail,
    contactNumber.trim(),
    course.trim(),
    branch.trim(),
    salt,
    hash,
    now,
    now
  );

  const session = createStudentSession(db, studentId);
  setSessionCookie(res, session.token);

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      token: session.token,
      expiresAt: session.expiresAt,
      student: {
        id: studentId,
        fullName: fullName.trim(),
        email: cleanEmail,
        contactNumber: contactNumber.trim(),
        course: course.trim(),
        branch: branch.trim(),
        updatedAt: now,
      },
    })
  );
}

export async function handleSignIn(req, res, db, body) {
  if (!checkRateLimit(req, res, 'auth')) return;

  const { email, password } = body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Request', message: 'Email and password are required.' }));
    return;
  }

  const student = db
    .prepare('SELECT id, full_name, email, contact_number, course, branch, password_salt, password_hash, updated_at FROM students WHERE email = ?')
    .get(cleanEmail);

  if (!student) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid email address or password.' }));
    return;
  }

  const computedHash = hashPassword(password, student.password_salt);
  if (computedHash !== student.password_hash) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid email address or password.' }));
    return;
  }

  const session = createStudentSession(db, student.id);
  setSessionCookie(res, session.token);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      token: session.token,
      expiresAt: session.expiresAt,
      student: {
        id: student.id,
        fullName: student.full_name,
        email: student.email,
        contactNumber: student.contact_number,
        course: student.course,
        branch: student.branch,
        updatedAt: student.updated_at,
      },
    })
  );
}

export async function handleGetProfile(req, res, db) {
  const token = extractSessionToken(req);
  const session = getActiveStudentSession(db, token);

  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized', message: 'Active student session required. Please sign in.' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(session));
}

export async function handleUpdateProfile(req, res, db, body) {
  const token = extractSessionToken(req);
  const session = getActiveStudentSession(db, token);

  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized', message: 'Active student session required.' }));
    return;
  }

  const { fullName, contactNumber, course, branch } = body || {};

  if (contactNumber !== undefined) {
    const digits = contactNumber.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Validation Error', message: 'Contact number must contain between 7 and 15 digits.' }));
      return;
    }
  }

  if (fullName !== undefined && fullName.trim().length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Full name must be at least 2 characters.' }));
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE students
    SET full_name = COALESCE(?, full_name),
        contact_number = COALESCE(?, contact_number),
        course = COALESCE(?, course),
        branch = COALESCE(?, branch),
        updated_at = ?
    WHERE id = ?
  `).run(
    fullName !== undefined ? fullName.trim() : null,
    contactNumber !== undefined ? contactNumber.trim() : null,
    course !== undefined ? course.trim() : null,
    branch !== undefined ? branch.trim() : null,
    now,
    session.student.id
  );

  const updatedSession = getActiveStudentSession(db, token);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(updatedSession));
}

export async function handleSignOut(req, res, db) {
  const token = extractSessionToken(req);
  if (token) {
    deleteStudentSession(db, token);
  }
  clearSessionCookie(res);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Successfully signed out.' }));
}
