import { config } from '../config.mjs';

/**
 * CORS Middleware:
 * Protects APIs from unauthorized cross-origin requests.
 * Never allows '*' (wildcard) in production environments.
 */
export function handleCors(req, res) {
  const origin = req.headers['origin'];

  // Requests without Origin header (e.g., same-origin, curl, server-to-server)
  if (!origin) {
    return true;
  }

  const host = req.headers['host'];
  const isSameHost = Boolean(host && (origin.endsWith(`://${host}`) || origin.includes(host)));
  const isAllowed = isSameHost || config.allowedOrigins.includes(origin) || config.allowedOrigins.includes('*');

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Staff-User, X-Staff-Id, Idempotency-Key'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    return true;
  }

  // Reject unallowed origin in production
  if (config.isProd) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Origin not allowed by CORS security policy.',
      })
    );
    return false;
  }

  // In non-production development, allow for testing but do not emit credentials wildcard
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Staff-User, X-Staff-Id, Idempotency-Key'
  );
  return true;
}
