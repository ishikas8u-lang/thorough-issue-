import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
  handleStudentListReports,
  handleStaffListReports,
  handleStaffUpdateReportStatus,
  handleStaffEscalateReport,
  handleStaffGetReportPhoto,
} from './controllers/reportController.mjs';
import {
  handleCreateSos,
  handleStaffListSos,
  handleStaffUpdateSos,
} from './controllers/sosController.mjs';
import { handleGetSafety } from './controllers/safetyController.mjs';
import { handleGetRoutes, handleStaffUpdateRoute } from './controllers/transportController.mjs';
import { parseMultipartBuffer, extractBoundary } from './utils/multipart.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../../dist');

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    const maxBytes = 5 * 1024 * 1024; // 5MB limit for photo payloads

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error('Payload Too Large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) {
        resolve({});
        return;
      }

      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('multipart/form-data')) {
        const boundary = extractBoundary(contentType);
        if (!boundary) {
          reject(new Error('Missing multipart boundary'));
          return;
        }
        try {
          const parsed = parseMultipartBuffer(buffer, boundary);
          resolve(parsed);
        } catch {
          reject(new Error('Malformed multipart payload'));
        }
        return;
      }

      const bodyStr = buffer.toString('utf8');
      if (!bodyStr.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(bodyStr));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function serveStaticFile(req, res, pathname) {
  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Not Found',
        message: 'Frontend bundle not yet built. Run npm run build.',
      })
    );
    return;
  }

  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If directory, check for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist, fallback to index.html (SPA routing)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
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

    // Set baseline security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

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
        const body = await parseRequestBody(req);
        return handleSignUp(req, res, db, body);
      }

      if (method === 'POST' && pathname === '/api/auth/signin') {
        const body = await parseRequestBody(req);
        return handleSignIn(req, res, db, body);
      }

      if (method === 'GET' && pathname === '/api/auth/profile') {
        return handleGetProfile(req, res, db);
      }

      if (method === 'PUT' && pathname === '/api/auth/profile') {
        const body = await parseRequestBody(req);
        return handleUpdateProfile(req, res, db, body);
      }

      if (method === 'POST' && pathname === '/api/auth/signout') {
        return handleSignOut(req, res, db);
      }

      // 4. Report Routes
      if (method === 'POST' && pathname === '/api/reports') {
        const body = await parseRequestBody(req);
        return handleCreateReport(req, res, db, body);
      }

      if (method === 'GET' && pathname === '/api/student/reports') {
        return handleStudentListReports(req, res, db);
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
        const body = await parseRequestBody(req);
        return handleStaffUpdateReportStatus(req, res, db, reportId, body);
      }

      if (
        method === 'PATCH' &&
        pathname.startsWith('/api/staff/reports/') &&
        pathname.endsWith('/escalate')
      ) {
        const parts = pathname.split('/');
        const reportId = parts[parts.length - 2];
        const body = await parseRequestBody(req);
        return handleStaffEscalateReport(req, res, db, reportId, body);
      }

      if (
        method === 'GET' &&
        pathname.startsWith('/api/staff/reports/') &&
        pathname.endsWith('/photo')
      ) {
        const parts = pathname.split('/');
        const reportId = parts[parts.length - 2];
        return handleStaffGetReportPhoto(req, res, db, reportId);
      }

      // 6. SOS Routes
      if (method === 'POST' && pathname === '/api/sos') {
        const body = await parseRequestBody(req);
        return handleCreateSos(req, res, db, body);
      }

      if (method === 'GET' && pathname === '/api/staff/sos') {
        return handleStaffListSos(req, res, db);
      }

      if (method === 'PATCH' && pathname.startsWith('/api/staff/sos/')) {
        const parts = pathname.split('/');
        const alertId = parts[parts.length - 1];
        const body = await parseRequestBody(req);
        return handleStaffUpdateSos(req, res, db, alertId, body);
      }

      // 7. Safety & Transport Directory
      if (method === 'GET' && pathname === '/api/safety') {
        return handleGetSafety(req, res, db);
      }

      if (method === 'GET' && pathname === '/api/routes') {
        return handleGetRoutes(req, res, db);
      }

      if (method === 'PATCH' && pathname.startsWith('/api/staff/routes/')) {
        const parts = pathname.split('/');
        const routeId = parts[parts.length - 1];
        const body = await parseRequestBody(req);
        return handleStaffUpdateRoute(req, res, db, routeId, body);
      }

      // 8. Serve Frontend Static Assets or SPA fallback for non-API routes
      if (!pathname.startsWith('/api/')) {
        if (method === 'GET' || method === 'HEAD') {
          return serveStaticFile(req, res, pathname);
        }
      }

      // 9. API Route Not Found (404)
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
        res.end(JSON.stringify({ error: 'Payload Too Large', message: 'Request exceeds 5MB limit.' }));
        return;
      }
      if (err.message === 'Invalid JSON' || err.message === 'Malformed multipart payload') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Request', message: err.message }));
        return;
      }

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
