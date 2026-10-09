import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment, loginAsStaff, loginAsStudent } from './test_helper.mjs';

describe('Critical Flow: Staff-Only Report Updates & Access Control', () => {
  let env;
  let baseUrl;
  let staffToken;
  let studentToken;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
    staffToken = await loginAsStaff(baseUrl);
    studentToken = await loginAsStudent(baseUrl);
  });

  after(async () => {
    await env.stop();
  });

  test('GET /api/staff/reports - rejects unauthenticated access with 401', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'Unauthorized');
  });

  test('PATCH /api/staff/reports/:id/status - rejects unauthenticated status changes with 401', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports/rep-sample/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus: 'IN_REVIEW' }),
    });
    assert.equal(res.status, 401);
  });

  test('GET /api/staff/reports - ignores X-Staff-User header without valid session token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports`, {
      headers: { 'X-Staff-User': 'admin' },
    });
    assert.equal(res.status, 401);
  });

  test('GET /api/staff/reports - rejects student session with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.error, 'Forbidden');
  });

  test('GET /api/staff/reports - allows authenticated staff reviewer with valid session token (200)', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  test('GET /api/staff/sos - enforces staff role authorization', async () => {
    // Unauthenticated -> 401
    const unauth = await fetch(`${baseUrl}/api/staff/sos`);
    assert.equal(unauth.status, 401);

    // Student -> 403
    const studentRes = await fetch(`${baseUrl}/api/staff/sos`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(studentRes.status, 403);

    // Staff -> 200
    const staffRes = await fetch(`${baseUrl}/api/staff/sos`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(staffRes.status, 200);
    const alerts = await staffRes.json();
    assert.ok(Array.isArray(alerts));
  });

  test('PATCH /api/staff/reports/:id/escalate - rejects student with 403 and allows staff to escalate', async () => {
    // 1. Student gets 403 Forbidden
    const studentRes = await fetch(`${baseUrl}/api/staff/reports/rep-demo-001/escalate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        authority: 'Facilities Head',
        note: 'Urgent repair needed for broken light post',
      }),
    });
    assert.equal(studentRes.status, 403);

    // 2. Staff can escalate
    const staffRes = await fetch(`${baseUrl}/api/staff/reports/rep-demo-001/escalate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        authority: 'Facilities Head',
        note: 'Urgent repair needed for broken light post',
      }),
    });
    assert.equal(staffRes.status, 200);
    const updated = await staffRes.json();
    assert.equal(updated.status, 'ESCALATED');
    assert.equal(updated.escalatedTo, 'Facilities Head');
    assert.equal(updated.escalationNote, 'Urgent repair needed for broken light post');
  });

  test('PATCH /api/staff/routes/:id - rejects student with 403 and allows staff to update transport timings', async () => {
    // 1. Student gets 403 Forbidden
    const studentRes = await fetch(`${baseUrl}/api/staff/routes/route-delhi-sonipat-demo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        driverName: 'Suresh Kumar',
        driverPhone: '+91 98765 11111',
        timings: '07:15 AM - 07:15 PM',
      }),
    });
    assert.equal(studentRes.status, 403);

    // 2. Staff can update route
    const staffRes = await fetch(`${baseUrl}/api/staff/routes/route-delhi-sonipat-demo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        driverName: 'Suresh Kumar',
        driverPhone: '+91 98765 11111',
        timings: '07:15 AM - 07:15 PM',
      }),
    });
    assert.equal(staffRes.status, 200);
    const updated = await staffRes.json();
    assert.equal(updated.route.driverName, 'Suresh Kumar');
    assert.equal(updated.route.driverPhone, '+91 98765 11111');
    assert.equal(updated.route.timings, '07:15 AM - 07:15 PM');
  });
});

