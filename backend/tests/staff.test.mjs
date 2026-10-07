import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './test_helper.mjs';

describe('Critical Flow: Staff-Only Report Updates & Access Control', () => {
  let env;
  let baseUrl;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
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

  test('GET /api/staff/reports - allows authenticated staff reviewer', async () => {
    const res = await fetch(`${baseUrl}/api/staff/reports`, {
      headers: { 'X-Staff-User': 'staff_vansh' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});
