import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment, loginAsStaff } from './test_helper.mjs';

describe('Critical Flow: State Machine Valid and Invalid Status Transitions', () => {
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

  test('Enforces legal state machine sequence and rejects illegal jumps (422)', async () => {
    // 1. Create fresh report (starts in RECEIVED)
    const submitRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'BUILDING_FACILITY',
        locationDescription: 'Hostel Block C, 2nd Floor Restroom',
        issueDescription: 'Washbasin faucet is leaking water continuously.',
        privacyAgreed: true,
      }),
    });
    assert.equal(submitRes.status, 201);
    const { referenceCode } = await submitRes.json();

    const reportRow = env.db.prepare('SELECT id, status FROM reports WHERE reference_code = ?').get(referenceCode);
    assert.equal(reportRow.status, 'RECEIVED');

    // 2. ILLEGAL TRANSITION: RECEIVED -> RESOLVED (Direct leap without review)
    const illegalRes = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'RESOLVED',
        publicMessage: 'Done.',
      }),
    });
    assert.equal(illegalRes.status, 422, 'Illegal transition must return 422 Unprocessable Entity');
    const illegalData = await illegalRes.json();
    assert.equal(illegalData.error, 'Illegal State Transition');
    assert.ok(Array.isArray(illegalData.allowedTransitions));
    assert.ok(illegalData.allowedTransitions.includes('IN_REVIEW'));
    assert.ok(!illegalData.allowedTransitions.includes('RESOLVED'));

    // 3. LEGAL TRANSITION 1: RECEIVED -> IN_REVIEW
    const step1Res = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'IN_REVIEW',
        publicMessage: 'Assigned to plumbing inspection team.',
        internalNote: 'Ticket dispatched to campus plumber Sharma.',
      }),
    });
    assert.equal(step1Res.status, 200);
    const step1Data = await step1Res.json();
    assert.equal(step1Data.status, 'IN_REVIEW');

    // 4. LEGAL TRANSITION 2: IN_REVIEW -> IN_PROGRESS
    const step2Res = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'IN_PROGRESS',
        publicMessage: 'Plumber on site repairing defective gasket.',
      }),
    });
    assert.equal(step2Res.status, 200);
    const step2Data = await step2Res.json();
    assert.equal(step2Data.status, 'IN_PROGRESS');

    // 5. LEGAL TRANSITION 3: IN_PROGRESS -> RESOLVED
    const step3Res = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'RESOLVED',
        publicMessage: 'Faucet gasket replaced. Flow test successful.',
      }),
    });
    assert.equal(step3Res.status, 200);
    const step3Data = await step3Res.json();
    assert.equal(step3Data.status, 'RESOLVED');

    // 6. ILLEGAL TRANSITION: RESOLVED -> IN_PROGRESS (Must reopen to IN_REVIEW first)
    const illegalFromResolved = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'IN_PROGRESS',
      }),
    });
    assert.equal(illegalFromResolved.status, 422);

    // 7. LEGAL REOPEN: RESOLVED -> IN_REVIEW
    const reopenRes = await fetch(`${baseUrl}/api/staff/reports/${reportRow.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        targetStatus: 'IN_REVIEW',
        publicMessage: 'Report reopened following secondary inspection.',
      }),
    });
    assert.equal(reopenRes.status, 200);
    const reopenData = await reopenRes.json();
    assert.equal(reopenData.status, 'IN_REVIEW');

    // Verify audit log has complete immutable trail
    assert.ok(reopenData.auditTrail.length >= 4, 'Should record full audit trail');
    assert.equal(reopenData.auditTrail[0].previousStatus, 'RECEIVED');
    assert.equal(reopenData.auditTrail[0].newStatus, 'IN_REVIEW');
  });
});
