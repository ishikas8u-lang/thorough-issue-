# Campus Assist — Backend Service

**Architectural Owner:** Vansh  
**Runtime:** Node.js (v24.21+) Native ESM  
**Database:** SQLite via native `node:sqlite`  
**Security:** Web Crypto / Native `node:crypto` SHA-256 salted hashing  

---

## Quickstart

```bash
# 1. Run database migrations
npm run backend:migrate

# 2. Seed fictional evaluation data
npm run backend:seed

# 3. Start local development server
npm run backend:start

# 4. Run automated checks
npm test
```

Server starts on `http://127.0.0.1:4000`.

---

## Health Check
- `GET http://127.0.0.1:4000/api/health` returns `200 OK` with service uptime and database status.

## Documentation
- Complete OpenAPI 3.1 Spec: `docs/openapi.yaml`
- Markdown API Guide: `docs/API-DOCUMENTATION.md`
