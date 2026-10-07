export async function handleGetRoutes(req, res, db) {
  const routes = db.prepare('SELECT id, name, description, operating_days, timezone, last_updated, is_demo, scheduled_departures_json FROM transit_routes').all();
  const stops = db.prepare('SELECT id, route_id, name, sequence, campus_location FROM transit_stops ORDER BY sequence ASC').all();

  const formatted = routes.map((r) => {
    let departures = [];
    try {
      departures = JSON.parse(r.scheduled_departures_json);
    } catch {
      departures = [];
    }

    const routeStops = stops
      .filter((s) => s.route_id === r.id)
      .map((s) => ({
        id: s.id,
        name: s.name,
        sequence: s.sequence,
        campusLocation: s.campus_location,
      }));

    return {
      id: r.id,
      name: r.name,
      description: r.description,
      operatingDays: r.operating_days,
      timezone: r.timezone,
      lastUpdated: r.last_updated,
      isDemo: Boolean(r.is_demo),
      scheduledDepartures: departures,
      stops: routeStops,
    };
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      routes: formatted,
      activeNotices: [
        {
          id: 'notice-demo-01',
          title: 'Truthful Scheduled Transit Notice',
          body: 'Shuttles follow published schedules (7:30 AM to 7:00 PM). Real-time GPS tracking is not simulated.',
          isDemo: true,
        },
      ],
      disclaimer: 'NOTICE: Fictional timetable schedules for class demonstration.',
    })
  );
}
