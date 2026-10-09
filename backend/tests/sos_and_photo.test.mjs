import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment, loginAsStaff } from './test_helper.mjs';

describe('Critical Flow: Emergency SOS and Problem Report Photos', () => {
  let env;
  let baseUrl;
  let staffToken;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
    staffToken = await loginAsStaff(baseUrl);
  });

  after(async () => {
    await env.stop();
  });

  test('POST /api/sos - validates coordinates and creates alert', async () => {
    // 1. Invalid coordinates rejected
    const badRes = await fetch(`${baseUrl}/api/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 200, lng: 77.1 }),
    });
    assert.equal(badRes.status, 400);

    // 2. Valid GPS alert
    const goodRes = await fetch(`${baseUrl}/api/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 28.9845,
        lng: 77.1023,
        accuracy: 12.5,
        message: 'Near Academic Block B entrance',
      }),
    });
    assert.equal(goodRes.status, 201);
    const alertData = await goodRes.json();
    assert.ok(alertData.id);
    assert.equal(alertData.status, 'new');

    // 3. Fallback typed place alert (coordinates null)
    const typedRes = await fetch(`${baseUrl}/api/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: null,
        lng: null,
        message: 'Central Library 2nd Floor Study Wing',
      }),
    });
    assert.equal(typedRes.status, 201);

    // 4. Staff can list SOS alerts
    const listRes = await fetch(`${baseUrl}/api/staff/sos`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData));
    assert.ok(listData.length >= 2);

    // 5. Staff can acknowledge/resolve SOS alert
    const patchRes = await fetch(`${baseUrl}/api/staff/sos/${alertData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ status: 'acknowledged' }),
    });
    assert.equal(patchRes.status, 200);
    const patchedData = await patchRes.json();
    assert.equal(patchedData.status, 'acknowledged');
  });

  test('POST /api/reports - accepts photo upload and validates file signature', async () => {
    // Valid JPEG magic bytes (FF D8 FF E0 00 10 4A 46 49 46 00 01)
    const validJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00,
    ]);

    // Invalid file (e.g. plain text masquerading as image)
    const invalidFile = Buffer.from('NOT AN IMAGE FILE CONTENT HERE');

    // 1. Submit with invalid image signature -> 400
    const failRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'STREET_LIGHT',
        locationDescription: 'North Gate Walkway near Guard Post',
        issueDescription: 'Street light fixture #4 pole is bent and unlit.',
        privacyAgreed: true,
        photoBase64: invalidFile.toString('base64'),
      }),
    });
    assert.equal(failRes.status, 400);

    // 2. Submit with valid JPEG image signature -> 201
    const successRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'STREET_LIGHT',
        locationDescription: 'North Gate Walkway near Guard Post',
        issueDescription: 'Street light fixture #4 pole is bent and unlit.',
        privacyAgreed: true,
        photoBase64: validJpeg.toString('base64'),
      }),
    });
    assert.equal(successRes.status, 201);
    const reportData = await successRes.json();
    assert.ok(reportData.referenceCode);
    assert.equal(reportData.photoAvailable, true);

    // 3. Lookup report includes adminReply field
    const lookupRes = await fetch(`${baseUrl}/api/reports/lookup/${reportData.referenceCode}`);
    assert.equal(lookupRes.status, 200);
    const lookupData = await lookupRes.json();
    assert.equal(lookupData.referenceCode, reportData.referenceCode);
    assert.equal(lookupData.adminReply, null);

    // 4. Staff can see photoAvailable in list
    const staffReportsRes = await fetch(`${baseUrl}/api/staff/reports`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(staffReportsRes.status, 200);
    const staffReports = await staffReportsRes.json();
    const found = staffReports.find((r) => r.referenceCode === reportData.referenceCode);
    assert.ok(found);
    assert.equal(found.photoAvailable, true);

    // 5. Staff can retrieve photo binary
    const photoRes = await fetch(`${baseUrl}/api/staff/reports/${found.id}/photo`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(photoRes.status, 200);
    assert.equal(photoRes.headers.get('content-type'), 'image/jpeg');

    // 6. Staff can set admin reply
    const replyRes = await fetch(`${baseUrl}/api/staff/reports/${found.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'IN_REVIEW',
        adminReply: 'Electrician dispatched with replacement luminaire.',
      }),
    });
    assert.equal(replyRes.status, 200);

    // 7. Student lookup now sees the admin reply!
    const lookupAfterRes = await fetch(`${baseUrl}/api/reports/lookup/${reportData.referenceCode}`);
    assert.equal(lookupAfterRes.status, 200);
    const lookupAfterData = await lookupAfterRes.json();
    assert.equal(lookupAfterData.adminReply, 'Electrician dispatched with replacement luminaire.');
  });
});
