# Campus Assist — Backend REST API Specification & Endpoint Guide

**Version:** 1.0.0  
**Backend Architecture Owner:** Vansh  
**Base URL (Local Development):** `http://127.0.0.1:4000`  
**OpenAPI Specification:** [`docs/openapi.yaml`](file:///c:/Users/ishuv/ProjectWork/docs/openapi.yaml)

---

## 1. Overview & Security Architecture

The Campus Assist backend provides high-performance, privacy-first services for university operations:
1. **Zero Plain-Text Credentials:** Student passwords are never stored in plain text. Salting and SHA-256 digests are computed via standard Web Crypto and Node.js native crypto.
2. **Session Security:** Supports dual authentication via `Authorization: Bearer <token>` or `HttpOnly; SameSite=Strict; Path=/` session cookies.
3. **Privacy Projection:** Public problem lookup endpoints strictly decouple and redact internal database identifiers, staff reviewer identities, and private internal notes.
4. **CORS Governance:** Explicitly checks request origin against `ALLOWED_ORIGINS`. Wildcards (`*`) are disallowed in production mode.
5. **Rate Limiting:** Sliding-window rate limiters prevent brute-force attacks on sign-in (5 req/min), report submission spam (10 req/min), and reference code scraping (30 req/min).

---

## 2. Authentication Modes

| Role | Mechanism | Header / Cookie Example |
|---|---|---|
| **Student** | Bearer Token or Session Cookie | `Authorization: Bearer tok_84d7a8f...` or `Cookie: session_token=tok_...` |
| **Staff Reviewer** | Staff Credential Header | `X-Staff-User: staff_vansh` |
| **Public / Anonymous** | None (Unauthenticated) | None |

---

## 3. Endpoints Directory

### 3.1 Health Check

#### `GET /api/health` (or `GET /health`)
Reports server availability and database connectivity without leaking configuration, secrets, or file paths.

* **Authentication:** None (Public)
* **Response `200 OK`:**
```json
{
  "status": "available",
  "service": "campus-assist-backend",
  "timestamp": "2026-10-07T15:45:00.000Z",
  "uptimeSeconds": 142,
  "database": "connected"
}
```

---

### 3.2 Student Authentication & Profile

#### `POST /api/auth/signup`
Registers a new student profile and generates an active session.

* **Authentication:** None (Public)
* **Rate Limit:** 5 requests / minute
* **Request Body:**
```json
{
  "fullName": "Sample Student",
  "email": "sample.student@srmist.edu.in",
  "contactNumber": "+91 98765 43210",
  "course": "B.Tech",
  "branch": "Computer Science & Engineering",
  "password": "SamplePassword123"
}
```
* **Validation Rules:**
  - `email`: Valid university email format.
  - `contactNumber`: Validated for 7–15 digits without country-code bias.
  - `password`: Minimum 6 characters.
* **Response `201 Created`:**
```json
{
  "token": "tok_94a7e28b10f845c1a89e02",
  "expiresAt": "2026-10-08T15:45:00.000Z",
  "student": {
    "id": "stu-1728315900000-a1b2c3",
    "fullName": "Sample Student",
    "email": "sample.student@srmist.edu.in",
    "contactNumber": "+91 98765 43210",
    "course": "B.Tech",
    "branch": "Computer Science & Engineering",
    "updatedAt": "2026-10-07T15:45:00.000Z"
  }
}
```

---

#### `POST /api/auth/signin`
Authenticates an existing student.

* **Authentication:** None (Public)
* **Rate Limit:** 5 requests / minute
* **Request Body:**
```json
{
  "email": "ananya.s@srmist.edu.in",
  "password": "Student@123"
}
```
* **Response `200 OK`:** Returns `token`, `expiresAt`, and `student` profile. Sets `session_token` cookie.
* **Error `401 Unauthorized`:** Invalid credentials.
* **Error `429 Too Many Requests`:** Rate limit exceeded.

---

#### `GET /api/auth/profile`
Retrieves the currently authenticated student's profile.

* **Authentication:** Required (`Bearer <token>` or session cookie)
* **Response `200 OK`:**
```json
{
  "token": "tok_94a7e28b10f845c1a89e02",
  "expiresAt": "2026-10-08T15:45:00.000Z",
  "student": {
    "id": "stu-demo-fictional-01",
    "fullName": "Demo Student (Sample Evaluation Account)",
    "email": "ananya.s@srmist.edu.in",
    "contactNumber": "+91 99999 00001",
    "course": "B.Tech (Sample Course)",
    "branch": "Computer Science (Sample Branch)",
    "updatedAt": "2026-10-07T15:45:00.000Z"
  }
}
```
* **Error `401 Unauthorized`:** Token missing or expired.

---

#### `PUT /api/auth/profile`
Updates editable student profile fields.

* **Authentication:** Required (`Bearer <token>` or session cookie)
* **Request Body:**
```json
{
  "fullName": "Updated Student Name",
  "contactNumber": "+44 20 7946 0991",
  "course": "M.Tech",
  "branch": "Artificial Intelligence"
}
```
* **Response `200 OK`:** Returns updated profile object.

---

#### `POST /api/auth/signout`
Revokes the session token and clears cookies.

* **Authentication:** Required (`Bearer <token>` or session cookie)
* **Response `200 OK`:**
```json
{
  "message": "Successfully signed out."
}
```

---

### 3.3 Facilities Problem Reporting

#### `POST /api/reports`
Submits a campus defect ticket anonymously.

* **Authentication:** None (Public / Anonymous)
* **Rate Limit:** 10 requests / minute
* **Request Body:**
```json
{
  "category": "LIGHTING_ELECTRICAL",
  "locationDescription": "North Quad Walkway near Library",
  "issueDescription": "Overhead luminaire lamp #14 is flickering and dark at night.",
  "privacyAgreed": true
}
```
* **Response `201 Created`:**
```json
{
  "referenceCode": "CA-4912-K7",
  "status": "RECEIVED",
  "createdAt": "2026-10-07T15:45:00.000Z",
  "message": "Report received and queued for review. Save your reference code."
}
```

---

#### `GET /api/reports/lookup/:referenceCode`
Public status lookup. Returns safe public projection only.

* **Authentication:** None (Public)
* **Rate Limit:** 30 requests / minute
* **Response `200 OK`:**
```json
{
  "referenceCode": "CA-4912-K7",
  "category": "LIGHTING_ELECTRICAL",
  "locationDescription": "North Quad Walkway near Library",
  "status": "IN_PROGRESS",
  "createdAt": "2026-10-06T08:30:00Z",
  "updates": [
    {
      "status": "IN_REVIEW",
      "message": "Report acknowledged by electrical maintenance dispatch.",
      "timestamp": "2026-10-06T09:00:00Z"
    },
    {
      "status": "IN_PROGRESS",
      "message": "Maintenance team on site with replacement LED bulb and driver.",
      "timestamp": "2026-10-06T10:15:00Z"
    }
  ]
}
```
* **Privacy Isolation:** Internal UUIDs, staff identities, and private staff notes are strictly redacted from this endpoint.

---

### 3.4 Admin Block / Staff Operations Triage

#### `GET /api/staff/reports`
Lists all submitted reports with complete audit trail history for facility reviewers.

* **Authentication:** Staff Only (`X-Staff-User: staff_vansh`)
* **Response `200 OK`:** Array of complete reports with audit history.
* **Error `401 Unauthorized`:** If accessed without staff credentials.

---

#### `PATCH /api/staff/reports/:id/status`
Executes an auditable status transition governed by `ReportStatusPolicy`.

* **Authentication:** Staff Only (`X-Staff-User: staff_vansh`)
* **Request Body:**
```json
{
  "targetStatus": "IN_PROGRESS",
  "publicMessage": "Electrician team dispatched with replacement fixture.",
  "internalNote": "Assigned to contractor Verma Electricals, work order #E-401."
}
```
* **State Machine Rules:**
  - `RECEIVED` &rarr; `IN_REVIEW`, `DUPLICATE`, `REJECTED`
  - `IN_REVIEW` &rarr; `IN_PROGRESS`, `DUPLICATE`, `REJECTED`
  - `IN_PROGRESS` &rarr; `RESOLVED`, `IN_REVIEW`
  - `RESOLVED` &rarr; `IN_REVIEW` (Reopen)
* **Response `200 OK`:** Returns updated report and appended audit log entry.
* **Error `422 Unprocessable Entity`:** If transition violates state machine rules.

---

### 3.5 Safety & Transport Directory

#### `GET /api/safety`
Returns verified 24/7 security hotline and safe assembly points.
* **Response `200 OK`:** Contains `emergencyHelpline`, `contacts`, and `locations` (all flagged `isDemo: true`).

#### `GET /api/routes`
Returns scheduled departure timetables for the Delhi NCR ⇄ Sonipat corridor (Rohini, Burari, Manglapuri, Panipat, Rohtak, Sonipat operating between 7:30 AM and 7:00 PM IST).
* **Response `200 OK`:** Contains `routes`, `stops`, and active service notices.
