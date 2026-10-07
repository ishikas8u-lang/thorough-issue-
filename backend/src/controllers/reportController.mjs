import crypto from 'node:crypto';
import {
  ReportStatusPolicy,
  VALID_CATEGORIES,
  generateReferenceCode,
} from '../domain/reportPolicy.mjs';
import { verifyStaffAuth } from '../security/auth.mjs';
import { checkRateLimit } from '../security/rateLimiter.mjs';

const statusPolicy = new ReportStatusPolicy();

export async function handleCreateReport(req, res, db, body) {
  if (!checkRateLimit(req, res, 'report_submit')) return;

  const { category, locationDescription, issueDescription, privacyAgreed } =
    body || {};

  if (!privacyAgreed) {
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

  const reportId = `rep-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const referenceCode = generateReferenceCode();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reports (id, reference_code, category, location_description, issue_description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'RECEIVED', ?, ?)
  `).run(
    reportId,
    referenceCode,
    category,
    locationDescription.trim(),
    issueDescription.trim(),
    now,
    now
  );

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      referenceCode,
      status: 'RECEIVED',
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
      SELECT id, reference_code, category, location_description, status, created_at
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
    createdAt: report.created_at,
    updates: publicUpdates,
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(publicProjection));
}

export async function handleStaffListReports(req, res, db) {
  const staff = verifyStaffAuth(req);
  if (!staff.authenticated) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Staff authentication required to view operations queue.',
      })
    );
    return;
  }

  const reports = db
    .prepare(`
      SELECT id, reference_code, category, location_description, issue_description, status, created_at, updated_at
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

  const result = reports.map((r) => ({
    id: r.id,
    referenceCode: r.reference_code,
    category: r.category,
    locationDescription: r.location_description,
    issueDescription: r.issue_description,
    status: r.status,
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

export async function handleStaffUpdateReportStatus(req, res, db, reportId, body) {
  const staff = verifyStaffAuth(req);
  if (!staff.authenticated) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Staff authentication required to triage reports.',
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

  const { targetStatus, publicMessage, internalNote } = body || {};

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

  const now = new Date().toISOString();
  const auditId = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  db.prepare(`
    UPDATE reports
    SET status = ?, updated_at = ?
    WHERE id = ?
  `).run(targetStatus, now, report.id);

  db.prepare(`
    INSERT INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    auditId,
    report.id,
    report.status,
    targetStatus,
    publicMessage ? publicMessage.trim() : null,
    internalNote ? internalNote.trim() : null,
    staff.staffId,
    now
  );

  const updatedReport = db
    .prepare(`
      SELECT id, reference_code, category, location_description, issue_description, status, created_at, updated_at
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
