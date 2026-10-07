/**
 * Health check endpoint reporting service availability
 * Strictly avoids exposing secrets, environment variables, or database paths.
 */
export function getHealth(req, res, db) {
  let dbStatus = 'disconnected';
  try {
    const row = db.prepare('SELECT 1 as alive').get();
    if (row && row.alive === 1) {
      dbStatus = 'connected';
    }
  } catch {
    dbStatus = 'error';
  }

  const responseBody = {
    status: dbStatus === 'connected' ? 'available' : 'degraded',
    service: 'campus-assist-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.end(JSON.stringify(responseBody));
}
