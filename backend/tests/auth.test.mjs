import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './test_helper.mjs';

describe('Critical Flow: Student Authentication & Profile Authorization', () => {
  let env;
  let baseUrl;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
  });

  after(async () => {
    await env.stop();
  });

  const testStudent = {
    fullName: 'Test Fictional Student',
    email: 'test.student@example.test',
    contactNumber: '+91 98765 43210',
    course: 'B.Tech',
    branch: 'Computer Science',
    password: 'SecurePassword123',
  };

  test('POST /api/auth/signup - creates account and returns session token without storing plain-text password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token, 'Should return session token');
    assert.equal(data.student.email, testStudent.email);
    assert.equal(data.student.fullName, testStudent.fullName);

    // Verify DB storage: Password MUST be hashed and NEVER plain text
    const dbRow = env.db.prepare('SELECT password_hash, password_salt FROM students WHERE email = ?').get(testStudent.email);
    assert.ok(dbRow, 'Student must exist in database');
    assert.notEqual(dbRow.password_hash, testStudent.password, 'Password must NOT be plain text');
    assert.equal(dbRow.password_hash.length, 64, 'SHA-256 hash must be 64 hex characters');
  });

  test('POST /api/auth/signup - rejects duplicate email with 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.error, 'Conflict');
  });

  test('POST /api/auth/signup - rejects invalid contact numbers with 400', async () => {
    const invalidStudent = {
      ...testStudent,
      email: 'another@example.test',
      contactNumber: '123', // too short (< 7 digits)
    };

    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidStudent),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('between 7 and 15 digits'));
  });

  test('POST /api/auth/signin - succeeds with correct credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.student.email, testStudent.email);
  });

  test('POST /api/auth/signin - rejects invalid password with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: 'WrongPassword999',
      }),
    });

    assert.equal(res.status, 401);
  });

  test('GET /api/auth/profile - protects route against unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`);
    assert.equal(res.status, 401);
  });

  test('GET /api/auth/profile - returns student profile with valid Bearer token', async () => {
    // 1. Sign in to obtain token
    const signinRes = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    const { token } = await signinRes.json();

    // 2. Fetch profile with token
    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(profileRes.status, 200);
    const profile = await profileRes.json();
    assert.equal(profile.student.email, testStudent.email);
    assert.equal(profile.student.course, testStudent.course);
    assert.equal(profile.student.branch, testStudent.branch);
  });

  test('PUT /api/auth/profile - updates student fields and validates contact number', async () => {
    // Sign in
    const signinRes = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    const { token } = await signinRes.json();

    // Update
    const updateRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        course: 'M.Tech',
        branch: 'Data Science & AI',
        contactNumber: '+44 20 7946 0991', // International format
      }),
    });

    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.student.course, 'M.Tech');
    assert.equal(updated.student.branch, 'Data Science & AI');
    assert.equal(updated.student.contactNumber, '+44 20 7946 0991');
  });

  test('POST /api/auth/signout - ends session and revokes access', async () => {
    // Sign in
    const signinRes = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    const { token } = await signinRes.json();

    // Sign out
    const signoutRes = await fetch(`${baseUrl}/api/auth/signout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(signoutRes.status, 200);

    // Profile check must now fail
    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(profileRes.status, 401);
  });

  test('Rate Limiter - returns 429 Too Many Requests when rate limit threshold is exceeded', async () => {
    // Send requests with x-test-rate-limit: true
    let hitRateLimit = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-rate-limit': 'true',
        },
        body: JSON.stringify({
          email: testStudent.email,
          password: 'IncorrectPassword',
        }),
      });

      if (res.status === 429) {
        hitRateLimit = true;
        assert.ok(res.headers.get('Retry-After'));
        const body = await res.json();
        assert.equal(body.error, 'Too Many Requests');
        break;
      }
    }

    assert.ok(hitRateLimit, 'Should trigger HTTP 429 rate limit after repeated attempts');
  });
});
