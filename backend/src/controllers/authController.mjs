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

  const {
    fullName,
    registrationNumber,
    email,
    department,
    course,
    branch,
    year,
    contactNumber,
    phone,
    hostelType,
    busRouteId,
    password,
  } = body || {};

  // Email Validation: Must end with @srmuniversity.ac.in
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Please enter a valid university email address.' }));
    return;
  }

  if (!cleanEmail.endsWith('@srmuniversity.ac.in')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'University email must end with @srmuniversity.ac.in',
      })
    );
    return;
  }

  if (!fullName || fullName.trim().length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Full name must be at least 2 characters.' }));
    return;
  }

  // Registration Number: two letters followed by digits (e.g. RA2411003010001)
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase();
  if (!cleanRegNo || !/^[A-Z]{2}\d{4,14}$/.test(cleanRegNo)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'Registration number must start with 2 letters followed by digits (e.g. RA2411003010001).',
      })
    );
    return;
  }

  // Contact number: 7-15 digits
  const rawPhone = contactNumber || phone || '';
  const digits = rawPhone.replace(/\D/g, '');
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

  const cleanDept = (department || course || '').trim();
  if (!cleanDept) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Validation Error', message: 'Department or program is required.' }));
    return;
  }

  const cleanYear = (year || '1st Year').trim();

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
  const cleanHostel = hostelType === 'Hostel' ? 'Hostel' : 'Day Scholar';
  const cleanBusRoute = (busRouteId || '').trim() || null;

  db.prepare(`
    INSERT INTO students (
      id, full_name, registration_number, email, contact_number, phone,
      department, course, branch, year, hostel_type, bus_route_id,
      role, password_salt, password_hash, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', ?, ?, ?, ?)
  `).run(
    studentId,
    fullName.trim(),
    cleanRegNo,
    cleanEmail,
    rawPhone.trim(),
    rawPhone.trim(),
    cleanDept,
    course ? course.trim() : cleanDept,
    branch ? branch.trim() : cleanDept,
    cleanYear,
    cleanHostel,
    cleanBusRoute,
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
        registrationNumber: cleanRegNo,
        email: cleanEmail,
        contactNumber: rawPhone.trim(),
        phone: rawPhone.trim(),
        department: cleanDept,
        course: course ? course.trim() : cleanDept,
        branch: branch ? branch.trim() : cleanDept,
        year: cleanYear,
        hostelType: cleanHostel,
        busRouteId: cleanBusRoute,
        role: 'student',
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
    .prepare(`
      SELECT id, full_name, email, contact_number, phone, course, branch,
             registration_number, department, year, hostel_type, bus_route_id,
             employee_id, office, role, password_salt, password_hash, updated_at
      FROM students
      WHERE email = ?
    `)
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
        contactNumber: student.contact_number || student.phone || '',
        phone: student.phone || student.contact_number || '',
        registrationNumber: student.registration_number || '',
        department: student.department || '',
        year: student.year || '',
        hostelType: student.hostel_type || '',
        busRouteId: student.bus_route_id || '',
        course: student.course || '',
        branch: student.branch || '',
        employeeId: student.employee_id || '',
        office: student.office || '',
        role: student.role || 'student',
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

  const { fullName, contactNumber, phone, course, branch, department, year, hostelType, busRouteId } = body || {};

  const rawPhone = contactNumber || phone;
  if (rawPhone !== undefined) {
    const digits = rawPhone.replace(/\D/g, '');
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
        phone = COALESCE(?, phone),
        course = COALESCE(?, course),
        branch = COALESCE(?, branch),
        department = COALESCE(?, department),
        year = COALESCE(?, year),
        hostel_type = COALESCE(?, hostel_type),
        bus_route_id = COALESCE(?, bus_route_id),
        updated_at = ?
    WHERE id = ?
  `).run(
    fullName !== undefined ? fullName.trim() : null,
    rawPhone !== undefined ? rawPhone.trim() : null,
    rawPhone !== undefined ? rawPhone.trim() : null,
    course !== undefined ? course.trim() : null,
    branch !== undefined ? branch.trim() : null,
    department !== undefined ? department.trim() : null,
    year !== undefined ? year.trim() : null,
    hostelType !== undefined ? hostelType.trim() : null,
    busRouteId !== undefined ? busRouteId.trim() : null,
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
