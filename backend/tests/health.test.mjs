import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './test_helper.mjs';

describe('Critical Flow: Health-Check Endpoint & Information Sanitization', () => {
  let env;
  let baseUrl;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
  });

  after(async () => {
    await env.stop();
  });

  test('GET /health - returns 200 OK and reports service availability without leaking secrets', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'available');
    assert.equal(data.service, 'campus-assist-backend');
    assert.equal(data.database, 'connected');
    assert.ok(typeof data.uptimeSeconds === 'number');
    assert.ok(data.timestamp);

    // SECURITY CHECK: Verify no secrets, env vars, or internal paths are leaked
    const raw = JSON.stringify(data);
    assert.ok(!raw.includes('password'), 'Must not contain password');
    assert.ok(!raw.includes('secret'), 'Must not contain secret');
    assert.ok(!raw.includes('DATABASE_PATH'), 'Must not contain environment keys');
    assert.ok(!raw.includes('node_modules'), 'Must not contain file system traces');
  });

  test('GET /api/health - alias endpoint functions identically', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'available');
  });
});
