import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './test_helper.mjs';

describe('Critical Flow: Report Submission & Public Lookup Privacy', () => {
  let env;
  let baseUrl;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
  });

  after(async () => {
    await env.stop();
  });

  let createdRefCode = null;

  test('POST /api/reports - rejects submission when privacy disclaimer is not agreed', async () => {
    const res = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'LIGHTING_ELECTRICAL',
        locationDescription: 'Pathway behind Academic Block 3',
        issueDescription: 'Overhead light fixture is completely broken.',
        privacyAgreed: false,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('privacy notice'));
  });

  test('POST /api/reports - rejects invalid category with 400', async () => {
    const res = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'INVALID_CATEGORY_NAME',
        locationDescription: 'Pathway behind Academic Block 3',
        issueDescription: 'Overhead light fixture is completely broken.',
        privacyAgreed: true,
      }),
    });

    assert.equal(res.status, 400);
  });

  test('POST /api/reports - submits valid report and generates CA-XXXX-XX reference code', async () => {
    const res = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'LIGHTING_ELECTRICAL',
        locationDescription: 'North Quad Walkway near Science Wing',
        issueDescription: 'Streetlight #18 is flickering constantly after 7 PM.',
        privacyAgreed: true,
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.referenceCode);
    assert.match(data.referenceCode, /^CA-[2-9A-Z]{4}-[2-9A-Z]{2}$/);
    assert.equal(data.status, 'RECEIVED');

    createdRefCode = data.referenceCode;
  });

  test('GET /api/reports/lookup/:ref - returns public status and enforces strict privacy isolation', async () => {
    assert.ok(createdRefCode, 'Reference code must exist from previous test');

    // Seed a staff internal note and public message into the report
    const dbReport = env.db.prepare('SELECT id FROM reports WHERE reference_code = ?').get(createdRefCode);
    env.db.prepare(`
      INSERT INTO report_audit_log (id, report_id, previous_status, new_status, public_message, internal_note, actor_id, created_at)
      VALUES (?, ?, 'RECEIVED', 'IN_REVIEW', 'Maintenance crew dispatched with inspection kit.', 'CONFIDENTIAL NOTE: Contractor Verma called.', 'staff_vansh', ?)
    `).run(`aud-test-priv-${Date.now()}`, dbReport.id, new Date().toISOString());

    const res = await fetch(`${baseUrl}/api/reports/lookup/${createdRefCode}`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.referenceCode, createdRefCode);
    assert.equal(data.category, 'LIGHTING_ELECTRICAL');

    // Verify updates array
    assert.ok(Array.isArray(data.updates));
    assert.equal(data.updates.length, 1);
    assert.equal(data.updates[0].message, 'Maintenance crew dispatched with inspection kit.');

    // STRICT PRIVACY AUDIT: Ensure sensitive and internal fields NEVER leak
    assert.equal(data.id, undefined, 'Internal database UUID must never be exposed');
    assert.equal(data.internalNote, undefined, 'Internal note must never be exposed');
    assert.equal(data.internal_note, undefined, 'Internal note column must never be exposed');
    assert.equal(data.actorId, undefined, 'Staff reviewer actor ID must never be exposed');
    assert.equal(data.actor_id, undefined, 'Staff actor ID must never be exposed');
    assert.equal(data.studentId, undefined, 'No student ID property may exist');
    assert.equal(data.contactNumber, undefined, 'No student contact number may exist');

    const jsonString = JSON.stringify(data);
    assert.ok(!jsonString.includes('CONFIDENTIAL NOTE'), 'Confidential internal note must not exist anywhere in payload');
    assert.ok(!jsonString.includes('staff_vansh'), 'Staff reviewer name must not exist in public lookup');
  });

  test('GET /api/reports/lookup/:ref - returns 404 for unknown reference code', async () => {
    const res = await fetch(`${baseUrl}/api/reports/lookup/CA-NONEXISTENT-99`);
    assert.equal(res.status, 404);
  });
});
