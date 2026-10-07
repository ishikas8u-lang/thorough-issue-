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

  test('GET /api/safety - returns structured directory and marks demo content with disclaimers', async () => {
    const res = await fetch(`${baseUrl}/api/safety`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(data.emergencyHelpline, 'Should have emergency helpline');
    assert.equal(data.emergencyHelpline.phone, '+91-11-2659-1000');
    assert.equal(data.emergencyHelpline.isDemo, true, 'Emergency helpline must be flagged as demo');

    assert.ok(Array.isArray(data.contacts), 'Should have contacts array');
    assert.ok(data.contacts.length >= 2);
    for (const c of data.contacts) {
      assert.equal(c.isDemo, true);
    }

    assert.ok(Array.isArray(data.locations), 'Should have verified locations');
    assert.ok(data.locations.length >= 2);
    for (const loc of data.locations) {
      assert.equal(loc.isDemo, true);
    }

    assert.ok(data.disclaimer, 'Must contain clear safety disclaimer');
    assert.ok(data.disclaimer.includes('not an emergency dispatch'));
  });

  test('GET /api/routes - returns Delhi-Sonipat route with 7:30 AM - 7:00 PM timetable', async () => {
    const res = await fetch(`${baseUrl}/api/routes`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.ok(Array.isArray(data.routes), 'Should have routes array');
    assert.ok(data.routes.length >= 1);

    const corridor = data.routes.find((r) => r.id === 'route-delhi-sonipat-demo');
    assert.ok(corridor, 'Delhi-Sonipat corridor route must exist');
    assert.equal(corridor.isDemo, true);

    // Verify stoppage sequence
    const stopNames = corridor.stops.map((s) => s.name);
    assert.ok(stopNames.some((n) => n.includes('Rohini')));
    assert.ok(stopNames.some((n) => n.includes('Burari')));
    assert.ok(stopNames.some((n) => n.includes('Manglapuri')));
    assert.ok(stopNames.some((n) => n.includes('Panipat')));
    assert.ok(stopNames.some((n) => n.includes('Rohtak')));
    assert.ok(stopNames.some((n) => n.includes('Sonipat')));

    // Verify scheduled operating hours (7:30 AM to 7:00 PM)
    assert.ok(corridor.scheduledDepartures.includes('07:30 AM'));
    assert.ok(corridor.scheduledDepartures.includes('07:00 PM'));

    // Check notice
    assert.ok(Array.isArray(data.activeNotices));
    assert.ok(data.activeNotices[0].body.includes('7:30 AM to 7:00 PM'));
  });
});
