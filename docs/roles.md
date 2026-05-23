# PVG ERP Role Taxonomy

This document outlines the canonical role strings used across all modules in the PVG ERP system. The Auth Module is the absolute source of truth for these strings.

## Canonical Roles

| Role String | Description | Cross-Module Access |
|---|---|---|
| `admin` | System Administrator | Full access to all modules, RBAC, users, and logs. |
| `principal` | College Principal | Read-all across modules, can assign roles up to HOD level. |
| `vice_principal`| Vice Principal | Same as Principal. |
| `hod` | Head of Department | Read users in own department. Can assign Faculty/Student roles within department. |
| `faculty` | Teaching Faculty | Read-only access to own classes in Attendance and Academic Planning modules. |
| `accountant` | Fees & Finance | Access to Fees module. Read-only user lookup in Auth module. |
| `tpo` | Placement Officer | Access to Placement module. |
| `student` | Enrolled Student | Access to SIS, own attendance, own fees, own exam results. |
| `guest` | Unenrolled / Pre-signup| Used strictly for Admission module applicants prior to formal enrollment. |

## Role Hierarchy

When assigning roles via `POST /api/roles/assign`, a user cannot assign a role higher or equal to their own level (with the exception of `admin`).

`admin` (100) > `principal` (90) > `vice_principal` (80) > `hod` (70) > `faculty` (60) > `accountant` / `tpo` (50) > `student` (10) > `guest` (0)
