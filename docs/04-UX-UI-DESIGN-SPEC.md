# Campus Assist — UX & Interface Design Specification

**Document Status:** Phase 0 Baseline  
**Document Version:** 1.0.0  
**Design Leads & Team:** Ishika (Frontend Shell & UX Lead), Tishya, Krisha, Vansh  
**Target Implementation Engine:** Antigravity AI Engineering Pair  
**Companion Documents:**
- PRD: [`01-PRD-product-requirements.md`](file:///c:/Users/ishuv/ProjectWork/docs/01-PRD-product-requirements.md)
- SRD: [`02-SRD-system-requirements.md`](file:///c:/Users/ishuv/ProjectWork/docs/02-SRD-system-requirements.md)
- Architecture & SOLID Design: [`03-ARCHITECTURE-AND-SOLID-DESIGN.md`](file:///c:/Users/ishuv/ProjectWork/docs/03-ARCHITECTURE-AND-SOLID-DESIGN.md)
- Phase Plan & Engineering Guide: [`05-PHASE-PLAN-AND-ENGINEERING-GUIDE.md`](file:///c:/Users/ishuv/ProjectWork/docs/05-PHASE-PLAN-AND-ENGINEERING-GUIDE.md)

---

## 1. User Experience Principles & Aesthetic Direction

Campus Assist delivers a modern, civic, high-trust digital utility for university students and staff. To avoid generic, uninspiring layouts, the visual design pairs **modern glassmorphism accents**, **vibrant semantic color palettes**, and **crisp typography** with absolute utilitarian clarity.

### 1.1 Core Experience Principles
1. **Urgent Help is Unmissable:** Emergency contacts and dialer actions sit at the top level of the visual hierarchy. A student in distress must never hunt through menus or scroll past non-essential content.
2. **Truth in Capability & Freshness:** Every piece of information indicates its authoritative verification timestamp and freshness. Scheduled buses are labeled as *scheduled timetables*, never masquerading as real-time GPS feeds.
3. **One Primary Action per View:** Cognitive overload is eliminated by providing one clear primary call-to-action per screen, supported by obvious back-navigation and recovery mechanisms.
4. **Student Privacy Protection:** The interface never demands student registration, roll numbers, or intrusive personal identifiers to access timetables or report defective campus fixtures.
5. **Mobile-First Ergonomics:** Designed from the ground up for single-thumb smartphone operation (minimum 360 CSS pixels viewport), with comfortable tap targets (48x48px) and accessible touch zones.

---

## 2. Information Architecture & Navigation Map

```mermaid
graph TD
    Root((Campus Assist)) --> Nav[Global Shell Navigation]
    Nav --> Home[Home / Overview]
    Nav --> Safety[Safety & Emergency]
    Nav --> Transport[Transport Schedules]
    Nav --> Report[Report a Problem]
    Nav --> Lookup[Track My Report]
    Nav -.-> Staff[Staff Triage Portal (Protected)]

    Home --> QuickCall[Quick Call Security]
    Home --> Card1[Safety Directory Card]
    Home --> Card2[Transport Schedules Card]
    Home --> Card3[Report Problem Card]

    Safety --> SecCall[24/7 Security Dialer]
    Safety --> Directory[Emergency Contacts List]
    Safety --> Locations[Safe Assembly Zones]

    Transport --> RouteList[Route Selector Tabs]
    Transport --> Timetable[Stops & Departure Timetable]
    Transport --> Notices[Active Service Disruption Alerts]

    Report --> UrgencyWarning[Emergency Intercept Callout]
    Report --> Form[Submission Form: Category, Landmark, Details]
    Report --> Confirmation[Success Screen: Copy Reference Code]

    Lookup --> SearchBar[Enter Reference Code CA-XXXX-XX]
    Lookup --> Timeline[Safe Public Status Timeline]

    Staff --> Queue[Triage Queue: Filter by Status]
    Staff --> Detail[Ticket Detail & Photo Inspection]
    Staff --> Transition[Status Change & Public Update Form]
```

---

## 3. Detailed Page Blueprints & Wireframes

### 3.1 Global Shell & Navigation
* **Desktop Viewport (&ge; 768px):** Clean header with the Campus Assist wordmark, navigation tabs (Home, Safety, Transport, Report, Track), and a high-contrast **Emergency Call** pill button pinned to the right.
* **Mobile Viewport (&lt; 768px):** Fixed top header with brand logo and an emergency quick-action icon. A persistent bottom navigation bar provides thumbs-friendly access to Home, Safety, Transport, and Report.

```text
+-----------------------------------------------------------------------+
|  [Logo] Campus Assist       [Home]  [Safety]  [Transport]  [Report]  |  [CALL SECURITY (24/7)]
+-----------------------------------------------------------------------+
|  DEMO NOTICE: This system uses sample data for university evaluation. |
+-----------------------------------------------------------------------+
|                                                                       |
|                          < PAGE CONTENT >                             |
|                                                                       |
+-----------------------------------------------------------------------+
|  (C) 2026 Campus Assist Project - Ishika, Tishya, Krisha, Vansh       |
+-----------------------------------------------------------------------+
```

---

### 3.2 Home Page (`/`)
The homepage establishes instant reassurance and directs students to one of the three core services within milliseconds.

```text
+-----------------------------------------------------------------------+
|  ! NEED URGENT HELP ON CAMPUS?                                        |
|    For immediate threats, medical trauma, or fire, call security now: |
|    [ (Phone Icon) Call Campus Security: +91-11-2659-1000 ]            |
|    Note: This website is an informational directory, not 911 dispatch.|
+-----------------------------------------------------------------------+
|                                                                       |
|   CAMPUS ASSIST ESSENTIAL SERVICES                                    |
|                                                                       |
|   +-----------------------+ +-----------------------+ +-------------+ |
|   | (Shield Icon)         | | (Bus Icon)            | | (Wrench)    | |
|   | Emergency & Safety    | | Campus Transport      | | Report an   | |
|   | Verified hotlines and | | Scheduled shuttle     | | Issue       | |
|   | safe physical zones   | | timings & notices     | | Fast,       | |
|   | on campus.            | | for all routes.       | | trackable   | |
|   |                       | |                       | | repairs.    | |
|   | [ View Directory -> ] | | [ View Schedules -> ] | | [ Report ->]| |
|   +-----------------------+ +-----------------------+ +-------------+ |
|                                                                       |
|   HAVE AN EXISTING REPORT REFERENCE CODE?                             |
|   [ Enter Reference Code (e.g. CA-4912-K7) ] [ Check Status ]         |
+-----------------------------------------------------------------------+
```

---

### 3.3 Safety & Emergency Directory Page (`/safety`)
Presents canonical contacts and physical safe zones with transparent source verification.

```text
+-----------------------------------------------------------------------+
|  CAMPUS SAFETY & EMERGENCY DIRECTORY                                  |
|  Verified official emergency phone numbers and staffed safety points. |
+-----------------------------------------------------------------------+
|                                                                       |
|  [!] 24/7 PRIMARY EMERGENCY HOTLINE                                   |
|      Campus Security Control Room                                     |
|      Telephone: +91-11-2659-1000                                      |
|      [ CALL NOW (tel:) ]   [ COPY NUMBER ]                            |
|      Source: Office of Campus Security | Last Verified: 01 Oct 2026   |
|                                                                       |
|  SUPPORT HELPLINES                                                    |
|  +------------------------------------------------------------------+ |
|  | Campus Health & First Aid Clinic | Tel: +91-11-2659-1111          | |
|  | Ambulance Dispatch & Outpatient  | [ Call ] [ Copy ]             | |
|  | Source: Chief Medical Officer    | Verified: 01 Oct 2026         | |
|  +------------------------------------------------------------------+ |
|  | Women's Safety & Counseling Desk | Tel: +91-11-2659-1222          | |
|  | Confidential Student Support     | [ Call ] [ Copy ]             | |
|  +------------------------------------------------------------------+ |
|                                                                       |
|  PHYSICAL SAFE LOCATIONS & ASSEMBLY POINTS                            |
|  +------------------------------------------------------------------+ |
|  | Main Gate 24/7 Security Booth                                    | |
|  | Location: Gate 1, North Avenue (Opposite Administration Block)     | |
|  | Description: Staffed round-the-clock; AED and first-aid equipped.  | |
|  +------------------------------------------------------------------+ |
|  | Central Library Night Safe Haven                                 | |
|  | Location: Ground Floor Foyer, Central Library                      | |
|  | Description: Monitored security checkpoint and emergency intercom. | |
|  +------------------------------------------------------------------+ |
+-----------------------------------------------------------------------+
```

---

### 3.4 Transport Schedules Page (`/transport`)
Displays truthful scheduled transit info, stop sequences, and service notices.

```text
+-----------------------------------------------------------------------+
|  CAMPUS TRANSPORT TIMETABLES                                          |
|  [ Scheduled Times — Not Live Vehicle Tracking ]                      |
+-----------------------------------------------------------------------+
|  ACTIVE SERVICE ALERT                                                 |
|  [!] Hostel Loop: Stop 3 relocated to Main Gate due to road repairs.  |
|      Effective: 05 Oct 2026 - 12 Oct 2026                             |
+-----------------------------------------------------------------------+
|                                                                       |
|  SELECT ROUTE:                                                        |
|  [ Route 1: North Loop ]  [ Route 2: Hostel Express ]  [ Metro Link ] |
|                                                                       |
|  ROUTE 1: NORTH CAMPUS LOOP                                           |
|  Operating Days: Mon - Sat | Timezone: Asia/Kolkata (IST)             |
|  Last Timetable Update: 01 Oct 2026 (Demo Data)                       |
|                                                                       |
|  STOP SEQUENCE & TIMETABLE DEPARTURES:                                |
|  O-- 1. Main Academic Complex (Departure: 08:00, 08:30, 09:00, ...)   |
|  |                                                                    |
|  O-- 2. Science Library Foyer (Departure: 08:10, 08:40, 09:10, ...)   |
|  |                                                                    |
|  O-- 3. Sports Pavilion & Gym (Departure: 08:18, 08:48, 09:18, ...)   |
|  |                                                                    |
|  O-- 4. Hostel Quadrangle     (Departure: 08:25, 08:55, 09:25, ...)   |
|                                                                       |
|  [!] Need weekend or holiday schedules? [ View Special Timetables ]   |
+-----------------------------------------------------------------------+
```

---

### 3.5 Facilities Problem Reporting (`/report`)
Zero-login reporting form with strict guardrails and clear privacy terms.

```text
+-----------------------------------------------------------------------+
|  REPORT A CAMPUS INFRASTRUCTURE PROBLEM                               |
+-----------------------------------------------------------------------+
|  [!] EMERGENCY WARNING:                                               |
|      DO NOT report fires, gas leaks, medical emergencies, or threats  |
|      here. For immediate response: [ Call Campus Security Now ]       |
+-----------------------------------------------------------------------+
|                                                                       |
|  1. Category *                                                        |
|     ( ) Lighting & Electrical     ( ) Building & Plumbing             |
|     ( ) Cleanliness & Sanitation  ( ) Accessibility & Ramps           |
|     ( ) Transport Stop / Shelter  ( ) Other Facility Issue            |
|                                                                       |
|  2. Campus Landmark / Location *                                      |
|     [ e.g., 3rd Floor Academic Block B, Corridor near Room 304      ] |
|     Hint: Provide building name, floor, and nearest room number.      |
|                                                                       |
|  3. Issue Description *                                               |
|     +---------------------------------------------------------------+ |
|     | The overhead fluorescent fixture is buzzing and flickering...  | |
|     +---------------------------------------------------------------+ |
|     42 / 500 characters (minimum 15 characters required)              |
|                                                                       |
|  4. Photo Attachment (Optional)                                       |
|     [ Upload Photo (Max 3MB, JPG/PNG) ]  (Privacy: No faces/people)   |
|     (Note: Attachment uploads are securely sandboxed)                 |
|                                                                       |
|  [X] Privacy Notice: I understand this report will be reviewed by     |
|      campus facilities staff. No personal identity is collected.      |
|                                                                       |
|  [ SUBMIT REPORT -> ]                                                 |
+-----------------------------------------------------------------------+
```

---

### 3.6 Submission Confirmation & Public Status Lookup (`/lookup`)
Immediate feedback with reference code generation, copy action, and safe public tracking.

```text
+-----------------------------------------------------------------------+
|  REPORT SUBMITTED SUCCESSFULLY!                                       |
|                                                                       |
|  Your Reference Code is:                                              |
|  +---------------------------------------+                            |
|  |             CA-4912-K7                |   [ COPY CODE ]            |
|  +---------------------------------------+                            |
|                                                                       |
|  Initial Status: [ RECEIVED ]                                         |
|  Submitted At: 07 Oct 2026, 12:45 PM                                  |
|                                                                       |
|  Please save this reference code. You can check the progress of your  |
|  report at any time without logging in.                               |
|                                                                       |
|  [ TRACK REPORT STATUS NOW ]      [ RETURN TO HOMEPAGE ]              |
+-----------------------------------------------------------------------+
|                                                                       |
|  PUBLIC STATUS TIMELINE FOR: CA-4912-K7                               |
|  Category: Lighting & Electrical                                      |
|  Location: 3rd Floor Academic Block B, Corridor near Room 304         |
|  Current Status: [ IN_PROGRESS ]                                      |
|                                                                       |
|  Timeline:                                                            |
|  - 07 Oct 2026, 02:15 PM : Status changed to IN_PROGRESS               |
|    Note: "Facilities electrician assigned; replacement tube en route."|
|  - 07 Oct 2026, 12:45 PM : Status set to RECEIVED                     |
|    Note: "Report logged in campus maintenance queue."                 |
+-----------------------------------------------------------------------+
```

---

### 3.7 Staff Review & Triage Dashboard (`/staff`)
Authenticated, uncluttered queue with role-based state machine controls.

```text
+-----------------------------------------------------------------------+
|  STAFF REVIEW DASHBOARD               [ Logged in as: vansh_ops ]     |
|  Queue Filters: [ All ] [ RECEIVED (3) ] [ IN_PROGRESS (2) ] [ Resolved]
+-----------------------------------------------------------------------+
|  REF CODE    | CATEGORY       | LOCATION        | SUBMITTED | STATUS  |
|  CA-4912-K7  | LIGHTING       | Block B, Fl 3   | 2 hrs ago | RECEIVED|
|  CA-8193-M2  | CLEANLINESS    | Science Lib B1  | 4 hrs ago | IN_PROG |
|  CA-3012-P9  | ACCESSIBILITY  | Admin Ramp      | Yesterday | RECEIVED|
+-----------------------------------------------------------------------+
|                                                                       |
|  TRIAGE PANEL FOR: CA-4912-K7                                         |
|  Description: "The overhead fluorescent fixture is flickering..."      |
|                                                                       |
|  Update Status:                                                       |
|  [ Select New Status v ]  (Allowed: IN_REVIEW, DUPLICATE, REJECTED)   |
|                                                                       |
|  Public Update Message (Visible to student on lookup):                |
|  [ Electrician team dispatched to replace fixture.                  ] |
|                                                                       |
|  Internal Staff Note (STRICTLY PRIVATE - Never visible to student):   |
|  [ Work order issued to vendor Sharma Electricals.                  ] |
|                                                                       |
|  [ CONFIRM STATUS UPDATE ]                                            |
+-----------------------------------------------------------------------+
```

---

## 4. Visual Design System & Design Tokens

### 4.1 Color Palette & Contrast Tokens
The palette features high-contrast, civic tones paired with modern accents. Every pairing satisfies WCAG 2.2 AA contrast standards (&ge; 4.5:1).

| Token Name | Hex Value | Semantic Usage | Minimum Contrast Ratio |
|---|---|---|---|
| `--color-brand-primary` | `#024873` | Main header, primary action buttons, key brand elements | 8.2:1 against white |
| `--color-brand-accent` | `#088395` | Secondary links, interactive focus states, tab highlights | 4.8:1 against white |
| `--color-urgent-bg` | `#DC2626` | Emergency call banner, critical dialer button | 5.1:1 against white |
| `--color-urgent-text` | `#FFFFFF` | Text rendered on emergency background | 5.1:1 against red |
| `--color-warning-bg` | `#FEF3C7` | Service disruption notices, report emergency caution banner | 10.5:1 against dark amber |
| `--color-warning-border`| `#F59E0B` | Alert border accents | 3.2:1 against light bg |
| `--color-warning-text` | `#92400E` | Warning copy | 5.2:1 against amber bg |
| `--color-success-bg` | `#DCFCE7` | Resolved status badges, submission confirmation | 9.8:1 against dark green |
| `--color-success-text` | `#166534` | Confirmation text | 5.1:1 against success bg |
| `--color-surface-bg` | `#F8FAFC` | Page background (slate neutral) | N/A |
| `--color-surface-card` | `#FFFFFF` | Elevated cards, forms, content panels | N/A |
| `--color-text-main` | `#0F172A` | Primary typography | 14.1:1 against white |
| `--color-text-muted` | `#475569` | Secondary captions, timestamps, instructions | 6.5:1 against white |
| `--color-border-subtle`| `#E2E8F0` | Structural card dividers, input borders | 1.8:1 against white |

### 4.2 Typography System
* **Font Family:** Inter, Roboto, or Outfit (System fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
* **Scale:**
  - `Display / H1`: `28px` (Mobile) / `36px` (Desktop), `font-weight: 700`, line-height: `1.2`.
  - `Section / H2`: `22px` (Mobile) / `26px` (Desktop), `font-weight: 600`, line-height: `1.3`.
  - `Subhead / H3`: `18px`, `font-weight: 600`, line-height: `1.4`.
  - `Body Main`: `16px`, `font-weight: 400`, line-height: `1.5`.
  - `Body Small / Caption`: `14px`, `font-weight: 400`, line-height: `1.4`.
  - `Mono / Reference Code`: `18px`, `font-weight: 700`, `letter-spacing: 0.08em` (Courier / Monospace).

### 4.3 Spacing & Layout Tokens
* **Base Grid:** `4px` grid system.
  - Spacing scale: `4px` (`--space-1`), `8px` (`--space-2`), `12px` (`--space-3`), `16px` (`--space-4`), `24px` (`--space-6`), `32px` (`--space-8`), `48px` (`--space-12`).
* **Border Radii:**
  - Small elements (Tags, badges): `6px` (`--radius-sm`).
  - Inputs & Buttons: `8px` (`--radius-md`).
  - Cards & Modals: `12px` (`--radius-lg`).
  - Pills: `9999px` (`--radius-pill`).
* **Elevation & Shadows:**
  - Card Shadow: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
  - Elevated Modal: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

---

## 5. UI States Matrix & Micro-Interactions

| View / Component | Default State | Loading State | Empty State | Error State |
|---|---|---|---|---|
| **Emergency Contact** | High-visibility red/navy card with direct `tel:` link | Skeleton pulsing card (retains static fallback) | N/A (Always seeded) | Fallback to baked emergency phone string |
| **Transport Routes** | Accordion/Card list with departure times | 3-row skeleton loader | “No routes scheduled for this day” with office link | “Unable to load schedules” + [Retry Button] |
| **Service Notices** | Amber alert card with valid date range | Hidden until fetched | Notice container collapses | Hidden gracefully |
| **Report Form** | Clean form with live character counter | Disabled submit button with loading spinner | N/A | Inline red error below invalid fields |
| **Report Confirmation** | Large Reference Code with Copy button | N/A | N/A | “Submission failed, form saved” + [Retry] |
| **Status Lookup** | Input box + Check button | Skeleton progress bar | “Reference code not found” (Non-leaking) | “Service unavailable” + [Retry] |
| **Staff Queue** | Paginated table with status pills | Table skeleton rows | “Queue is clear. No pending reports.” | “Failed to fetch queue” + Auth check |

---

## 6. Accessibility & Inclusivity Specifications (WCAG 2.2 AA)

1. **Keyboard Operability:**
   - Logical tab order matching visual flow: Skip to main content &rarr; Global Navigation &rarr; Emergency Banner &rarr; Content.
   - High-contrast visual focus ring: `outline: 3px solid #088395; outline-offset: 2px;` on all interactive `:focus-visible` elements.
2. **Screen Reader Optimizations (ARIA):**
   - Live regions (`aria-live="polite"`) for submission confirmation, clipboard copy success, and character counter limits.
   - Form fields bound with explicit `<label for="...">` and `<span id="...-error" role="alert">` mapped via `aria-describedby`.
3. **Non-Color Reliance:**
   - Status indicators (e.g. `RECEIVED`, `IN_PROGRESS`, `RESOLVED`) must never rely on color alone. Each status badge combines an explicit textual label, distinct shape, and an icon.
4. **Touch Target Sizing:**
   - Every interactive button, pill, tab, and form control has a bounding box of at least **48 &times; 48 CSS pixels** on mobile touch devices.
