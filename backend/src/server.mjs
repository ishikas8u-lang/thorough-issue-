import http from 'node:http';
import { config } from './config.mjs';
import { getDb, runMigrations, getDbPath } from './db.mjs';
import { createRequestHandler } from './app.mjs';

console.log('==============================================');
console.log('Campus Assist Operational Backend Server');
console.log('Author: Vansh (Backend Owner)');
console.log('==============================================');

const db = getDb();
runMigrations(db);
console.log(`✓ SQLite Database connected: ${getDbPath()}`);

const requestHandler = createRequestHandler(db);
const server = http.createServer(requestHandler);

server.listen(config.port, config.host, () => {
  console.log(`✓ Server listening on http://${config.host}:${config.port}`);
  console.log(`✓ Environment: ${config.nodeEnv}`);
  console.log(`✓ Allowed CORS origins: ${config.allowedOrigins.join(', ')}`);
});

// Graceful shutdown
function shutdown() {
  console.log('\nClosing Campus Assist backend server...');
  server.close(() => {
    console.log('✓ HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
