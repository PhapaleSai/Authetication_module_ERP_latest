# 👥 PVG Auth Module — Team Work Division Plan

This plan documents the actual distribution of development, requirement gathering, and project management tasks of the **Authentication & RBAC Module** among the three team members (**Sai**, **Varad**, and **Swaraj**).

---

## 📊 Summary of Division Matrix

| Team Member | Core Focus Area | Backend & DB Tasks | Frontend Tasks | PM, Coordination & Docs |
| :--- | :--- | :--- | :--- | :--- |
| **Sai** | **Backend Dev** | FastAPI endpoints, token validation, rate-limiting, models & schemas | Assisted with local API integration testing | Contributed to feature checklist definition |
| **Varad** | **Backend & Frontend Lead** | JWT logic, RBAC checks, database migrations, security scan fixes | Admin Dashboard interface, policy editor, chart components, state | Developed technical diagrams (UML/ERD) |
| **Swaraj** | **Coordination, Docs & Frontend** | Database query testing, database cleanup verification | Student Login/Signup layouts, password visibility eye toggle, grid alignment | Led **requirement gathering**, document preparation, and **inter-team coordination** with external modules |

---

## 👤 Member 1: Sai — Backend Developer

Sai focused primarily on building and securing the backend infrastructure of the authentication system.

### 📝 Responsibilities & Contributions:
1. **Backend & DB Engineering**:
   * Developed core FastAPI routing controllers (`/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`).
   * Configured security measures including endpoint rate limiting (using `Slowapi`) and CORS configurations.
   * Defined user database models and schemas to support student credentials and legacy JIT migration.
2. **System Testing**:
   * Assisted with testing backend API responsiveness locally and verified password hashing algorithms.

---

## 👤 Member 2: Varad — Backend & Frontend Lead

Varad contributed extensively across both the backend logic and the design of the administrative frontend portals.

### 📝 Responsibilities & Contributions:
1. **Backend & Security Engine**:
   * Designed the granular Role-Based Access Control (RBAC) catalog and privilege hierarchy check logic.
   * Created JWT session token payloads (integrating unique identifiers like `jti`).
   * Resolved package vulnerabilities and static security scan (Bandit) issues.
2. **Frontend Engineering**:
   * Architected the main Admin Dashboard interface including telemetry graphs, user lists, and active session tables.
   * Created the interactive **Role Assign Modal** and policies catalog panel.
3. **Documentation**:
   * Designed the database **ER Diagrams** and structural **UML Class Diagrams** representing the authentication flow.

---

## 👤 Member 3: Swaraj — Requirement Gathering, Coordination & Frontend Developer

Swaraj managed the critical task of aligning requirements with teachers and coordinating integration handshakes with other module teams, while also building parts of the user-facing frontend.

### 📝 Responsibilities & Contributions:
1. **Requirement Gathering & PM**:
   * Led alignment sessions with teachers and mentors to capture feedback and feature lists.
   * Compiled global lists of canonical roles and system features to build the RBAC catalog.
2. **Inter-Team Coordination**:
   * Coordinated integration handshakes with the other module teams (SIS, Admission, Fees) to sync the shared `JWT_SECRET` key.
   * Defined callback parameters (`?token=...&role=...`) for cross-module SSO redirection.
3. **Frontend Development**:
   * Built and refined the **Student Portal** signup and login form layouts.
   * Integrated the password visibility toggle (eye button) on the login and signup forms.
   * Resolved CSS grid alignment bugs to prevent cards from clipping.
