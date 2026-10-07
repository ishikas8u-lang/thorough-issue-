import { handleCors } from './security/cors.mjs';
import { getHealth } from './controllers/healthController.mjs';
import {
  handleSignUp,
  handleSignIn,
  handleGetProfile,
  handleUpdateProfile,
  handleSignOut,
} from './controllers/authController.mjs';
import {
  handleCreateReport,
  handleLookupReport,
  handleStaffListReports,
  handleStaffUpdateReportStatus,
} from './controllers/reportController.mjs';
import { handleGetSafety } from './controllers/safetyController.mjs';
import { handleGetRoutes } from './controllers/transportController.mjs';

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let bodyStr = '';
    let bytes = 0;
    const maxBytes = 1024 * 1024; // 1MB limit

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error('Payload Too Large'));
        return;
      }
      bodyStr += chunk;
    });

    req.on('end', () => {
      if (!bodyStr.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(bodyStr));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

export function createRequestHandler(db) {
  return async function requestHandler(req, res) {
    // 1. CORS Preflight & Origin Verification
    const corsAllowed = handleCors(req, res);
    if (!corsAllowed) {
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    try {
      // 2. Health Check
      if (method === 'GET' && (pathname === '/health' || pathname === '/api/health')) {
        return getHealth(req, res, db);
      }

      // 3. Auth Routes
      if (method === 'POST' && pathname === '/api/auth/signup') {
        const body = await parseJsonBody(req);
        return handleSignUp(req, res, db, body);
      }

      if (method === 'POST' && pathname === '/api/auth/signin') {
        const body = await parseJsonBody(req);
        return handleSignIn(req, res, db, body);
      }

      if (method === 'GET' && pathname === '/api/auth/profile') {
        return handleGetProfile(req, res, db);
      }

      if (method === 'PUT' && pathname === '/api/auth/profile') {
        const body = await parseJsonBody(req);
        return handleUpdateProfile(req, res, db, body);
      }

      if (method === 'POST' && pathname === '/api/auth/signout') {
        return handleSignOut(req, res, db);
      }

      // 4. Report Routes
      if (method === 'POST' && pathname === '/api/reports') {
        const body = await parseJsonBody(req);
        return handleCreateReport(req, res, db, body);
      }

      if (method === 'GET' && pathname.startsWith('/api/reports/lookup/')) {
        const referenceCode = decodeURIComponent(pathname.replace('/api/reports/lookup/', '').trim());
        return handleLookupReport(req, res, db, referenceCode);
      }

      // 5. Staff Triage Routes
      if (method === 'GET' && pathname === '/api/staff/reports') {
        return handleStaffListReports(req, res, db);
      }

      if (
        method === 'PATCH' &&
        pathname.startsWith('/api/staff/reports/') &&
        pathname.endsWith('/status')
      ) {
        const parts = pathname.split('/');
        const reportId = parts[parts.length - 2];
        const body = await parseJsonBody(req);
        return handleStaffUpdateReportStatus(req, res, db, reportId, body);
      }

      // 6. Safety & Transport Directory
      if (method === 'GET' && pathname === '/api/safety') {
        return handleGetSafety(req, res, db);
      }

      if (method === 'GET' && pathname === '/api/routes') {
        return handleGetRoutes(req, res, db);
      }

      // 7. Route Not Found (404)
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Not Found',
          message: `Endpoint ${method} ${pathname} does not exist.`,
        })
      );
    } catch (err) {
      if (err.message === 'Payload Too Large') {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', message: 'Request exceeds 1MB.' }));
        return;
      }
      if (err.message === 'Invalid JSON') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request', message: 'Malformed JSON payload.' }));
        return;
      }

      // Internal Server Error (Sanitized - no internal traces leaked)
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An unexpected internal error occurred.',
        })
      );
    }
  };
}
