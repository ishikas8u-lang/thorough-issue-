export async function handleGetSafety(req, res, db) {
  const contacts = db.prepare('SELECT id, label, phone, instructions, source, verified_at, is_demo FROM safety_contacts').all();
  const locations = db.prepare('SELECT id, name, kind, campus_location, description, verified_at, is_demo FROM safety_locations').all();

  const primaryContact = contacts.find((c) => c.id.includes('sec')) || contacts[0] || null;

  const response = {
    emergencyHelpline: primaryContact
      ? {
          label: primaryContact.label,
          phone: primaryContact.phone,
          instructions: primaryContact.instructions,
          source: primaryContact.source,
          verifiedAt: primaryContact.verified_at,
          isDemo: Boolean(primaryContact.is_demo),
        }
      : null,
    contacts: contacts.map((c) => ({
      id: c.id,
      label: c.label,
      phone: c.phone,
      instructions: c.instructions,
      source: c.source,
      verifiedAt: c.verified_at,
      isDemo: Boolean(c.is_demo),
    })),
    locations: locations.map((l) => ({
      id: l.id,
      name: l.name,
      kind: l.kind,
      campusLocation: l.campus_location,
      description: l.description,
      verifiedAt: l.verified_at,
      isDemo: Boolean(l.is_demo),
    })),
    disclaimer:
      'In an emergency, also call Campus Security: +91-11-2659-1000.',
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));
}
