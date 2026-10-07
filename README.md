# Campus Assist — Phase 0 Project Documentation & Engineering Blueprint

Welcome to the **Campus Assist** project repository. This project provides a unified, mobile-first web platform addressing three everyday campus operational challenges: emergency safety access, scheduled campus shuttle timetables, and transparent facilities issue reporting.

---

## 📚 Master Phase 0 Documentation Suite

The complete Phase 0 specification suite has been designed specifically for the team (**Ishika, Tishya, Krisha, Vansh**) and implementation agent **Antigravity**. It consists of five foundational documents located in the [`docs/`](file:///c:/Users/ishuv/ProjectWork/docs) directory:

| Document | File Link | Focus & Key Contents |
|---|---|---|
| **01. PRD (Product Requirements Document)** | [`01-PRD-product-requirements.md`](file:///c:/Users/ishuv/ProjectWork/docs/01-PRD-product-requirements.md) | Executive summary, user personas, in-scope MVP vs anti-goals (no fake live GPS, no dispatch claims), core user journeys, data privacy boundaries. |
| **02. SRD (System Requirements Document)** | [`02-SRD-system-requirements.md`](file:///c:/Users/ishuv/ProjectWork/docs/02-SRD-system-requirements.md) | RFC 2119 functional requirements (`SAF-01` to `SAF-06`, `TRN-01` to `TRN-07`, `RPT-01` to `RPT-14`), entity schemas, state machine transition rules, REST API contracts, and non-functional requirements (NFRs). |
| **03. Architecture & SOLID Design** | [`03-ARCHITECTURE-AND-SOLID-DESIGN.md`](file:///c:/Users/ishuv/ProjectWork/docs/03-ARCHITECTURE-AND-SOLID-DESIGN.md) | 4-tier Clean Architecture (Presentation, Application, Domain, Infrastructure), deep research and concrete code blueprints for **SOLID principles** (SRP, OCP, LSP, ISP, DIP), data flow sequence diagrams, and Architecture Decision Records (ADRs). |
| **04. UX & Interface Design Spec** | [`04-UX-UI-DESIGN-SPEC.md`](file:///c:/Users/ishuv/ProjectWork/docs/04-UX-UI-DESIGN-SPEC.md) | Complete information architecture, page-by-page wireframe blueprints (Home, Safety, Transport, Report, Lookup, Staff Review), semantic design tokens, UI states matrix, and WCAG 2.2 AA accessibility standards. |
| **05. Phase Plan & Engineering Guide** | [`05-PHASE-PLAN-AND-ENGINEERING-GUIDE.md`](file:///c:/Users/ishuv/ProjectWork/docs/05-PHASE-PLAN-AND-ENGINEERING-GUIDE.md) | Team RACI matrix, collaboration rhythm, Phase 0 to Phase 4 roadmap with hard exit gates, strict Antigravity implementation directives, and SOLID verification checklists. |

---

## 🏛️ Core Architectural Principles & SOLID Compliance

The system enforces strict modular separation and Clean Architecture principles:

1. **Single Responsibility Principle (SRP):** Distinct classes for persistence (`ReportRepository`), transition policy (`ReportStatusPolicy`), and safe student view projection (`PublicReportPresenter`).
2. **Open/Closed Principle (OCP):** Transport schedule sources (`ITransportScheduleProvider`) and incident category handlers are extensible without modifying core use-case pipelines.
3. **Liskov Substitution Principle (LSP):** Mock fixture providers, database repositories, and any future live GTFS transit adapters satisfy identical interface contracts and error behaviors.
4. **Interface Segregation Principle (ISP):** Highly cohesive, role-specific interfaces (`ISafetyReader`, `ITransportScheduleReader`, `IReportSubmitter`, `IStaffTriageManager`) prevent clients from depending on methods they do not invoke.
5. **Dependency Inversion Principle (DIP):** Domain entities and application use cases depend exclusively on abstract contracts, with all database drivers, HTTP servers, and storage adapters injected at the system boundary.

---

## 👥 Team Ownership & RACI

* **Ishika:** Frontend Shell, Navigation, Accessible Layouts, Design System Tokens.
* **Tishya:** Campus Transport Feature, Timetables, Stoppage Sequences, Service Alert Notices.
* **Krisha:** Problem Reporting Flow, Reference Code Generation, Status Lookup, Staff Triage UI.
* **Vansh:** Backend Architecture, Data Modeling, API Contracts, State Machine Guard, Security & RBAC.
* **Antigravity AI:** Pair programming engine adhering strictly to Phase 0 specifications.

---

---

## 🎓 SRM University Branding & Student Portal Features

The platform is customized for **SRM University** with a dedicated student account area:

1. **SRM University Institutional Branding:**
   - Displayed in the top corner of the site header on every page (`SRM UNIVERSITY`).
   - Polished pastel-pink accent palette (`--color-pink-*`, `.btn-pink`, `.btn-pink-primary`, `.card-pastel-pink`, `.badge-pastel-pink`) providing high contrast and full WCAG 2.2 AA/AAA readability.
   - Responsive layout adapting seamlessly across mobile phones, tablets, and desktop displays.

2. **Student Account & Profile:**
   - **Student Sign In & Registration (`SignInView`):** Supports authenticated access and account registration with validation for email, password, and international contact numbers.
   - **Student Profile Area (`ProfileView`):** Collects, displays, and allows students to edit the five verified profile fields:
     - Full Name
     - Email Address (permanent institutional identity)
     - Contact Number (validated for 7–15 digits without country-code bias)
     - Course / Program (editable text entry, e.g. B.Tech, M.Tech, MBA)
     - Branch / Specialization (editable text entry, e.g. Computer Science, Mechanical)
   - **Sign Out Action:** Session termination available directly from the top header and profile view, redirecting safely to the sign-in/home view.

3. **Authentication & Privacy Security Architecture:**
   - **Interface Segregation & DIP:** High-level code depends on `IStudentAuthService`, implemented by `LocalStorageStudentAuthService`.
   - **Zero Plain-Text Password Storage:** Password hashes are computed client-side using standard Web Crypto API (`window.crypto.subtle.digest('SHA-256')`) with per-user cryptographic salts. No plain-text passwords or secret keys are stored or hardcoded.
   - **Route Protection:** Access to the Student Profile route is strictly guarded. Unauthenticated access immediately redirects to the Sign In page with an explanatory notice.
   - **Privacy Guarantee:** Student contact numbers, courses, and branches are strictly isolated and never exposed on public problem tickets, lookup screens, or transport views.
   - **Demo Credentials:** Pre-seeded for evaluation:
     - **Email:** `ananya.s@srmist.edu.in`
     - **Password:** `Student@123` (Quick "Auto-Fill Demo" button provided on Sign In page).

---

## 🚀 Current Milestone Status

- [x] **Phase 0:** Requirements, Architecture, UX, and SOLID Baseline — **COMPLETE**
- [x] **Phase 1:** Repository Foundation, Design Tokens & Vertical Skeleton — **COMPLETE**
- [x] **Phase 2:** Student-Facing Core MVP Flows (Safety, Transport, Reporting, Public Status Lookup) — **COMPLETE**
- [x] **Phase 3:** Admin Block Operations, State Machine Triage & Audit History — **COMPLETE**
- [x] **Phase 4:** SRM University Branding, Student Sign-In/Sign-Out, Profile Management & Security Hardening — **COMPLETE**

