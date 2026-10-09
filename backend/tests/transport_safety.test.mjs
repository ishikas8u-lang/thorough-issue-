import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './test_helper.mjs';

describe('Critical Flow: Transport & Safety Directory Responses', () => {
  let env;
  let baseUrl;

  before(async () => {
    env = createTestEnvironment();
    baseUrl = await env.start();
  });

  after(async () => {
    await env.stop();
  });

  test('GET /api/safety - returns structured directory and honest emergency contact line', async () => {
    const res = await fetch(`${baseUrl}/api/safety`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.emergencyHelpline, 'Should have emergency helpline');
    assert.equal(data.emergencyHelpline.phone, '+91-11-2659-1000');

    assert.ok(Array.isArray(data.contacts), 'Should have contacts array');
    assert.ok(data.contacts.length >= 2);

    assert.ok(Array.isArray(data.locations), 'Should have verified locations');
    assert.ok(data.locations.length >= 2);

    assert.ok(data.disclaimer, 'Must contain clear safety disclaimer');
    assert.equal(data.disclaimer, 'In an emergency, also call Campus Security: +91-11-2659-1000.');
  });

  test('GET /api/routes - returns Delhi-Sonipat route with morning and evening runs', async () => {
    const res = await fetch(`${baseUrl}/api/routes`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(Array.isArray(data.routes), 'Should have routes array');
    assert.ok(data.routes.length >= 1);

    const corridor = data.routes.find((r) => r.id === 'route-delhi-sonipat-demo');
    assert.ok(corridor, 'Delhi-Sonipat corridor route must exist');

    // Verify stoppage sequence
    const stopNames = corridor.stops.map((s) => s.name);
    assert.ok(stopNames.some((n) => n.includes('Rohini')));
    assert.ok(stopNames.some((n) => n.includes('Burari')));
    assert.ok(stopNames.some((n) => n.includes('Sonipat')));

    // Verify scheduled operating hours (morning arrival by 9:00 AM, evening departure at 4:30 PM)
    assert.ok(corridor.scheduledDepartures.includes('07:30 AM'));
    assert.ok(corridor.scheduledDepartures.includes('04:30 PM'));
    assert.equal(corridor.scheduledDepartures.length, 2);

    // Check notice
    assert.ok(Array.isArray(data.activeNotices));
    assert.ok(data.activeNotices[0].body.includes('9:00 AM') && data.activeNotices[0].body.includes('4:30 PM'));
  });
});
