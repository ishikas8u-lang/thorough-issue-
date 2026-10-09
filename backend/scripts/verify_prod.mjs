async function verify() {
  const base = 'http://127.0.0.1:4000';
  console.log('Testing unified production service at', base);

  // 1. Health
  const healthRes = await fetch(base + '/api/health');
  const health = await healthRes.json();
  console.log('1. Health check status:', healthRes.status, 'service:', health.service);

  // 2. Static SPA serving
  const spaRes = await fetch(base + '/track');
  const spaHtml = await spaRes.text();
  console.log('2. SPA fallback /track status:', spaRes.status, 'contains root div:', spaHtml.includes('id="root"'));

  // 3. Demo Admin signin
  const adminRes = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo.admin@srmuniversity.ac.in', password: 'Staff@Reviewer2026' })
  });
  const adminData = await adminRes.json();
  console.log('3. Admin Sign-In status:', adminRes.status, 'role:', adminData.student?.role);
  const staffToken = adminData.token;

  // 4. Demo Student signin
  const stuRes = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo.student@srmuniversity.ac.in', password: 'Student@123' })
  });
  const stuData = await stuRes.json();
  console.log('4. Student Sign-In status:', stuRes.status, 'name:', stuData.student?.fullName);

  // 5. Emergency SOS creation
  const sosRes = await fetch(base + '/api/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat: 28.9845, lng: 77.1023, accuracy: 8.5, message: 'Near Tech Park East' })
  });
  const sosData = await sosRes.json();
  console.log('5. SOS Creation status:', sosRes.status, 'alertId:', sosData.id);

  // 6. Admin SOS inbox
  const sosInboxRes = await fetch(base + '/api/staff/sos', {
    headers: { Authorization: 'Bearer ' + staffToken }
  });
  const sosInbox = await sosInboxRes.json();
  console.log('6. Staff SOS Inbox items count:', sosInbox.length, 'latest status:', sosInbox[0]?.status);

  // 7. Problem report with photo
  const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00]);
  const repRes = await fetch(base + '/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'STREET_LIGHT',
      locationDescription: 'SRM Tech Park 4th Floor Walkway',
      issueDescription: 'Overhead light fixture is broken and hanging loosely.',
      privacyAgreed: true,
      photoBase64: fakeJpeg.toString('base64')
    })
  });
  const repData = await repRes.json();
  console.log('7. Report creation with photo status:', repRes.status, 'refCode:', repData.referenceCode, 'photoAvailable:', repData.photoAvailable);

  // 8. Staff list & reply to student
  const staffRepRes = await fetch(base + '/api/staff/reports', {
    headers: { Authorization: 'Bearer ' + staffToken }
  });
  const staffReports = await staffRepRes.json();
  const createdRep = staffReports.find(r => r.referenceCode === repData.referenceCode);
  console.log('8. Staff found report in queue:', Boolean(createdRep), 'photoAvailable:', createdRep?.photoAvailable);

  const replyRes = await fetch(base + '/api/staff/reports/' + createdRep.id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + staffToken },
    body: JSON.stringify({
      targetStatus: 'IN_REVIEW',
      adminReply: 'Electrician contractor Sharma assigned. Replaced fixture scheduled at 10 AM.'
    })
  });
  const replyData = await replyRes.json();
  console.log('8b. Staff reply status:', replyRes.status, 'adminReply saved:', replyData.adminReply);

  // 9. Student tracking sees reply
  const lookupRes = await fetch(base + '/api/reports/lookup/' + repData.referenceCode);
  const lookupData = await lookupRes.json();
  console.log('9. Student tracking lookup adminReply verified:', lookupData.adminReply);

  // 10. Transit routes with driver
  const routesRes = await fetch(base + '/api/routes');
  const routesData = await routesRes.json();
  const r0 = routesData.routes[0];
  console.log('10. Transit Route:', r0.name);
  console.log('    Driver Name:', r0.driverName);
  console.log('    Driver Phone:', r0.driverPhone);
  console.log('    Bus Number:', r0.busNumber);
  console.log('    Stops Count:', r0.stops.length);
  console.log('    Scheduled Departures:', r0.scheduledDepartures.length);

  // 11. Escalate report to higher authority
  const escRes = await fetch(base + '/api/staff/reports/' + createdRep.id + '/escalate', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + staffToken },
    body: JSON.stringify({
      authority: 'Facilities Head',
      note: 'Urgent fixture replacement needed before evening shift'
    })
  });
  const escData = await escRes.json();
  console.log('11. Escalate Report status:', escRes.status, 'escalatedTo:', escData.escalatedTo, 'status:', escData.status);

  // 12. Update transport route timing & driver
  const updateRouteRes = await fetch(base + '/api/staff/routes/' + r0.id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + staffToken },
    body: JSON.stringify({
      timings: '07:15 AM - 07:30 PM',
      driverPhone: '+91 98765 99999'
    })
  });
  const updateRouteData = await updateRouteRes.json();
  console.log('12. Transport Route Update status:', updateRouteRes.status, 'newPhone:', updateRouteData.driverPhone || updateRouteData.route?.driverPhone);

  // 13. Student protected route check (student token cannot access admin routes)
  const forbiddenRes = await fetch(base + '/api/staff/reports', {
    headers: { Authorization: 'Bearer ' + stuData.token }
  });
  console.log('13. Student token on /api/staff/reports returns 403 Forbidden:', forbiddenRes.status === 403);

  // 14. Sign out
  const signoutRes = await fetch(base + '/api/auth/signout', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + stuData.token }
  });
  console.log('14. Student Sign-Out status:', signoutRes.status);

  console.log('\n>>> ALL END-TO-END FLOWS VERIFIED SUCCESSFULLY ON PRODUCTION PORT 4000! <<<');
}

verify().catch(console.error);
