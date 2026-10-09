import crypto from 'node:crypto';
import {
  ReportStatusPolicy,
  VALID_CATEGORIES,
  generateReferenceCode,
} from '../domain/reportPolicy.mjs';
import {
  verifyStaffAuth,
  verifyStudentAuth,
  extractSessionToken,
  getActiveStudentSession,
} from '../security/auth.mjs';
import { checkRateLimit } from '../security/rateLimiter.mjs';

const statusPolicy = new ReportStatusPolicy();
const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3 MB

export function validateImageSignature(buffer) {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File is too small or invalid image.' };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, mimeType: 'image/png' };
  }
  // WebP: RIFF (0-3) and WEBP (8-11)
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }
  return { valid: false, error: 'Invalid file signature. Only JPG, PNG, and WebP images are accepted.' };
}

export async function handleCreateReport(req, res, db, body) {
  if (!checkRateLimit(req, res, 'report_submit')) return;

  const { category, locationDescription, issueDescription, privacyAgreed } =
    body || {};

  const isAgreed = privacyAgreed === true || privacyAgreed === 'true';
  if (!isAgreed) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Bad Request',
        message: 'You must agree to the privacy notice before submitting.',
      })
    );
    return;
  }

  if (!VALID_CATEGORIES.includes(category)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      })
    );
    return;
  }

  if (!locationDescription || locationDescription.trim().length < 5) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'Location description must be at least 5 characters.',
      })
    );
    return;
  }

  if (
    !issueDescription ||
    issueDescription.trim().length < 15 ||
    issueDescription.trim().length > 500
  ) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Validation Error',
        message: 'Issue description must be between 15 and 500 characters.',
      })
    );
    return;
  }

  // Check optional photo attachment
  let photoBuffer = null;
  if (body.photo && Buffer.isBuffer(body.photo.buffer)) {
    photoBuffer = body.photo.buffer;
  } else if (body.photoBuffer && Buffer.isBuffer(body.photoBuffer)) {
    photoBuffer = body.photoBuffer;
  } else if (body.photoBase64 && typeof body.photoBase64 === 'string') {
    const cleanBase64 = body.photoBase64.replace(/^data:image\/\w+;base64,/, '');
    photoBuffer = Buffer.from(cleanBase64, 'base64');
  }

  let photoMimeType = null;
  if (photoBuffer && photoBuffer.length > 0) {
    if (photoBuffer.length > MAX_PHOTO_BYTES) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Validation Error',
          message: 'Attached photo exceeds maximum allowed limit of 3 MB.',
        })
      );
      return;
    }

    const sigResult = validateImageSignature(photoBuffer);
    if (!sigResult.valid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Validation Error',
          message: sigResult.error,
        })
      );
      return;
    }
    photoMimeType = sigResult.mimeType;
  }

  const token = extractSessionToken(req);
  const session = token ? getActiveStudentSession(db, token) : null;
  const studentId = session ? session.student.id : null;

  const reportId = `rep-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const referenceCode = generateReferenceCode();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reports (id, reference_code, category, location_description, issue_description, status, student_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?)
  `).run(
    reportId,
    referenceCode,
    category,
    locationDescription.trim(),
    issueDescription.trim(),
    studentId,
    now,
    now
  );

  if (photoBuffer && photoMimeType) {
    const photoId = `pho-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO report_photos (id, report_id, photo_blob, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(photoId, reportId, photoBuffer, photoMimeType, now);
  }

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      referenceCode,
      status: 'RECEIVED',
      photoAvailable: Boolean(photoBuffer),
      createdAt: now,
      message: 'Report received and queued for review. Save your reference code.',
    })
  );
}

export async function handleLookupReport(req, res, db, referenceCode) {
  if (!checkRateLimit(req, res, 'lookup')) return;

  const cleanRef = (referenceCode || '').trim().toUpperCase();

  const report = db
    .prepare(`
      SELECT id, reference_code, category, location_description, status, admin_reply, escalated_to, created_at
      FROM reports
      WHERE reference_code = ?
    `)
    .get(cleanRef);

  if (!report) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Not Found',
        message: `No facilities report found matching reference code '${cleanRef}'.`,
      })
    );
    return;
  }

  // Public Privacy Safe Projection:
  // Strictly filter only public audit messages. Never expose internalNote, actorId, or internal UUID.
  const publicUpdates = db
    .prepare(`
      SELECT new_status as status, public_message as message, created_at as timestamp
      FROM report_audit_log
      WHERE report_id = ? AND public_message IS NOT NULL AND public_message != ''
      ORDER BY created_at ASC
    `)
    .all(report.id);

  const publicProjection = {
    referenceCode: report.reference_code,
    category: report.category,
    locationDescription: report.location_description,
    status: report.status,
    adminReply: report.admin_reply || null,
    escalatedTo: report.escalated_to || null,
    createdAt: report.created_at,
    updates: publicUpdates,
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(publicProjection));
}

export async function handleStaffListReports(req, res, db) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required to view operations queue.',
      })
    );
    return;
  }

  const reports = db
    .prepare(`
      SELECT id, reference_code, category, location_description, issue_description, status, admin_reply, escalated_to, escalation_note, student_id, created_at, updated_at
      FROM reports
      ORDER BY created_at DESC
    `)
    .all();

  const auditRows = db
    .prepare(`
      SELECT id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at
      FROM report_audit_log
      ORDER BY created_at ASC
    `)
    .all();

  const photoRows = db
    .prepare(`
      SELECT report_id, id FROM report_photos
    `)
    .all();
  const photoMap = new Set(photoRows.map((p) => p.report_id));

  const result = reports.map((r) => ({
    id: r.id,
    referenceCode: r.reference_code,
    category: r.category,
    locationDescription: r.location_description,
    issueDescription: r.issue_description,
    status: r.status,
    adminReply: r.admin_reply || null,
    escalatedTo: r.escalated_to || null,
    escalationNote: r.escalation_note || null,
    studentId: r.student_id || null,
    photoAvailable: photoMap.has(r.id),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    auditTrail: auditRows
      .filter((a) => a.report_id === r.id)
      .map((a) => ({
        id: a.id,
        previousStatus: a.previous_status,
        newStatus: a.new_status,
        publicMessage: a.public_message,
        internalNote: a.internal_note,
        actorId: a.actor_id,
        createdAt: a.created_at,
      })),
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

export async function handleStaffGetReportPhoto(req, res, db, reportId) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required to view report photos.',
      })
    );
    return;
  }

  const photoRow = db
    .prepare('SELECT photo_blob, mime_type FROM report_photos WHERE report_id = ?')
    .get(reportId);

  if (!photoRow || !photoRow.photo_blob) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', message: 'No photo attached to this report.' }));
    return;
  }

  res.writeHead(200, {
    'Content-Type': photoRow.mime_type,
    'Content-Length': photoRow.photo_blob.length,
    'Cache-Control': 'private, no-cache',
  });
  res.end(photoRow.photo_blob);
}

export async function handleStaffUpdateReportStatus(req, res, db, reportId, body) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required to triage reports.',
      })
    );
    return;
  }

  const report = db
    .prepare('SELECT id, status, reference_code, admin_reply FROM reports WHERE id = ?')
    .get(reportId);

  if (!report) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', message: 'Report not found.' }));
    return;
  }

  const { targetStatus, publicMessage, internalNote, adminReply } = body || {};

  // If targetStatus is supplied and differs from current status, enforce state machine transitions
  if (targetStatus && targetStatus !== report.status) {
    if (!statusPolicy.canTransition(report.status, targetStatus)) {
      const allowed = statusPolicy.getAllowedTransitions(report.status);
      res.writeHead(422, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Illegal State Transition',
          message: `Illegal transition from '${report.status}' to '${targetStatus}'.`,
          currentStatus: report.status,
          allowedTransitions: allowed,
        })
      );
      return;
    }
  }

  const newStatus = targetStatus || report.status;
  const now = new Date().toISOString();
  const effectiveAdminReply =
    adminReply !== undefined
      ? (adminReply ? adminReply.trim() : null)
      : (publicMessage ? publicMessage.trim() : report.admin_reply);

  db.prepare(`
    UPDATE reports
    SET status = ?, admin_reply = ?, updated_at = ?
    WHERE id = ?
  `).run(newStatus, effectiveAdminReply, now, report.id);

  if (targetStatus || publicMessage || internalNote) {
    const auditId = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      report.id,
      report.status,
      newStatus,
      publicMessage ? publicMessage.trim() : (effectiveAdminReply || null),
      internalNote ? internalNote.trim() : null,
      staff.staffId,
      now
    );
  }

  const updatedReport = db
    .prepare(`
      SELECT id, reference_code, category, location_description, issue_description, status, admin_reply, created_at, updated_at
      FROM reports
      WHERE id = ?
    `)
    .get(report.id);

  const auditHistory = db
    .prepare(`
      SELECT id, previous_status, new_status, public_message, internal_note, actor_id, created_at
      FROM report_audit_log
      WHERE report_id = ?
      ORDER BY created_at ASC
    `)
    .all(report.id);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: updatedReport.id,
      referenceCode: updatedReport.reference_code,
      category: updatedReport.category,
      locationDescription: updatedReport.location_description,
      issueDescription: updatedReport.issue_description,
      status: updatedReport.status,
      adminReply: updatedReport.admin_reply,
      createdAt: updatedReport.created_at,
      updatedAt: updatedReport.updated_at,
      auditTrail: auditHistory.map((a) => ({
        id: a.id,
        previousStatus: a.previous_status,
        newStatus: a.new_status,
        publicMessage: a.public_message,
        internalNote: a.internal_note,
        actorId: a.actor_id,
        createdAt: a.created_at,
      })),
    })
  );
}

export async function handleStudentListReports(req, res, db) {
  const auth = verifyStudentAuth(req, db);
  if (!auth.authenticated) {
    const statusCode = auth.status || (auth.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: auth.message || 'Student authentication required.',
      })
    );
    return;
  }

  const reports = db
    .prepare(`
      SELECT id, reference_code, category, location_description, issue_description, status, admin_reply, escalated_to, created_at, updated_at
      FROM reports
      WHERE student_id = ?
      ORDER BY created_at DESC
    `)
    .all(auth.student.id);

  const photoRows = db
    .prepare('SELECT report_id FROM report_photos')
    .all();
  const photoMap = new Set(photoRows.map((p) => p.report_id));

  const result = reports.map((r) => ({
    id: r.id,
    referenceCode: r.reference_code,
    category: r.category,
    locationDescription: r.location_description,
    issueDescription: r.issue_description,
    status: r.status,
    adminReply: r.admin_reply || null,
    escalatedTo: r.escalated_to || null,
    photoAvailable: photoMap.has(r.id),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

export async function handleStaffEscalateReport(req, res, db, reportId, body) {
  const staff = verifyStaffAuth(req, db);
  if (!staff.authenticated) {
    const statusCode = staff.status || (staff.isForbidden ? 403 : 401);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: statusCode === 403 ? 'Forbidden' : 'Unauthorized',
        message: staff.message || 'Staff authentication required.',
      })
    );
    return;
  }

  const report = db
    .prepare('SELECT id, status, reference_code FROM reports WHERE id = ?')
    .get(reportId);

  if (!report) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', message: 'Report not found.' }));
    return;
  }

  const targetAuthority = (body?.authority || body?.escalatedTo || '').trim();
  if (!targetAuthority) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Request', message: 'Escalation authority is required.' }));
    return;
  }

  const now = new Date().toISOString();
  const escalationNote = body?.note ? body.note.trim() : (body?.escalationNote ? body.escalationNote.trim() : null);

  db.prepare(`
    UPDATE reports
    SET status = 'ESCALATED', escalated_to = ?, escalation_note = ?, updated_at = ?
    WHERE id = ?
  `).run(targetAuthority, escalationNote, now, report.id);

  const auditId = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  db.prepare(`
    INSERT INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
    VALUES (?, ?, ?, 'ESCALATED', ?, ?, ?, ?)
  `).run(
    auditId,
    report.id,
    report.status,
    `Ticket escalated to ${targetAuthority} for immediate action.`,
    `Escalated to ${targetAuthority}: ${escalationNote || 'No additional note'}`,
    staff.staffId,
    now
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: report.id,
      status: 'ESCALATED',
      escalatedTo: targetAuthority,
      escalationNote,
      message: `Report successfully escalated to ${targetAuthority}.`,
    })
  );
}
