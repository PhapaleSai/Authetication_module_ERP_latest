-- ============================================================
--  AUTH TABLE DDL
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    module_id   SERIAL PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
    feature_id   SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL,
    description  TEXT,
    module_id    INT REFERENCES modules(module_id),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id   SERIAL PRIMARY KEY,
    permission_name VARCHAR(150) NOT NULL,
    action          VARCHAR(50),
    feature_id      INT REFERENCES features(feature_id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id            INT REFERENCES roles(role_id),
    permission_id      INT REFERENCES permissions(permission_id),
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id),
    role_id      INT REFERENCES roles(role_id),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id      SERIAL PRIMARY KEY,
    user_id       INT REFERENCES users(user_id),
    refresh_token TEXT NOT NULL,
    expiry_time   TIMESTAMP,
    revoked       BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_log (
    login_log_id SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id),
    ip_address   VARCHAR(50),
    device_info  VARCHAR(255),
    status       VARCHAR(50),
    login_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- ============================================================
-- 1. MODULES
-- ============================================================
INSERT INTO modules (module_name, description) VALUES
  ('Authentication & Authorization', 'Handles user login, password management, roles and permissions'),
  ('Admission & Enrollment',         'Manages student applications, document uploads, review and enrollment'),
  ('Attendance System',              'Tracks and reports student and faculty attendance'),
  ('Timetable & Academic Planning',  'Creates, edits and allocates timetables and classrooms'),
  ('Student Information System',     'Maintains student profiles, records and department data'),
  ('Examination & Results',          'Handles mark entry, verification, result publishing and reports'),
  ('Fees & Billing',                 'Manages fee records, payments, receipts and reports'),
  ('Placement & Alumni',             'Manages company registration, job postings, applications and interviews'),
  ('Feedback System',                'Collects and views feedback at student and department level'),
  ('Notification System',            'Sends and views department and college-wide notices')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. FEATURES
-- ============================================================
INSERT INTO features (feature_name, description, module_id) VALUES
  -- Authentication & Authorization (module 1)
  ('User Login',            'Authenticate users into the system',                    1),
  ('Password Reset',        'Allow users to reset forgotten passwords',               1),
  ('Role Management',       'Create and manage system roles',                        1),
  ('Permission Assignment', 'Assign permissions to roles',                           1),

  -- Admission & Enrollment (module 2)
  ('Create Application',      'Student submits a new admission application',         2),
  ('Upload Documents',        'Upload supporting documents for admission',            2),
  ('View Application Status', 'Track the current status of an application',          2),
  ('Application Review',      'Staff reviews submitted applications',                2),
  ('Document Verification',   'Verify authenticity of uploaded documents',           2),
  ('Student Enrollment',      'Enroll an approved applicant as a student',           2),

  -- Attendance System (module 3)
  ('Mark Attendance',    'Record attendance for a session',                          3),
  ('View Attendance',    'View attendance records',                                  3),
  ('Attendance Reports', 'Generate attendance summary reports',                      3),

  -- Timetable & Academic Planning (module 4)
  ('Create Timetable',   'Create a new timetable schedule',                          4),
  ('Edit Timetable',     'Modify an existing timetable',                             4),
  ('View Timetable',     'View the timetable schedule',                              4),
  ('Classroom Allocation','Allocate classrooms to sessions',                         4),

  -- Student Information System (module 5)
  ('Student Profile',    'View and manage individual student profiles',              5),
  ('Student Records',    'Access academic and personal student records',             5),
  ('Department Students','View all students within a department',                    5),
  ('Student Documents',  'Manage documents linked to a student',                     5),

  -- Examination & Results (module 6)
  ('Enter Marks',    'Faculty enters student marks',                                 6),
  ('Verify Marks',   'HOD/Principal verifies entered marks',                         6),
  ('Publish Results','Publish final results to students',                            6),
  ('Result Reports', 'Generate result summary reports',                              6),

  -- Fees & Billing (module 7)
  ('Fee Records',  'View and manage fee records',                                    7),
  ('Fee Payment',  'Process student fee payments',                                   7),
  ('Fee Receipts', 'Generate and view payment receipts',                             7),
  ('Fee Reports',  'Generate fee collection reports',                                7),

  -- Placement & Alumni (module 8)
  ('Company Registration', 'Register a company on the placement portal',             8),
  ('Job Posting',          'Post job openings for students',                         8),
  ('Job Application',      'Student applies for a posted job',                       8),
  ('Interview Scheduling', 'Schedule interviews for shortlisted students',           8),

  -- Feedback System (module 9)
  ('Submit Feedback',    'Student submits feedback',                                 9),
  ('View Feedback',      'View feedback submitted by students',                      9),
  ('Department Feedback','View aggregated department-level feedback',                9),

  -- Notification System (module 10)
  ('Send Department Notice','Send a notice to a specific department',                10),
  ('Send College Notice',   'Broadcast a notice to the entire college',              10),
  ('View Notifications',    'View received notifications',                           10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. PERMISSIONS
--    Actions: VIEW | CREATE | EDIT | DELETE | APPROVE
--    Every feature gets VIEW; extra actions depend on semantics.
-- ============================================================
DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN SELECT feature_id, feature_name FROM features LOOP

    -- VIEW  – every feature
    INSERT INTO permissions (permission_name, action, feature_id)
    VALUES (f.feature_name || ' - VIEW', 'VIEW', f.feature_id)
    ON CONFLICT DO NOTHING;

    -- CREATE
    IF f.feature_name IN (
      'Role Management','Permission Assignment',
      'Create Application','Upload Documents','Student Enrollment',
      'Mark Attendance','Create Timetable','Classroom Allocation',
      'Enter Marks','Fee Payment','Fee Receipts',
      'Company Registration','Job Posting','Job Application','Interview Scheduling',
      'Submit Feedback','Send Department Notice','Send College Notice'
    ) THEN
      INSERT INTO permissions (permission_name, action, feature_id)
      VALUES (f.feature_name || ' - CREATE', 'CREATE', f.feature_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- EDIT
    IF f.feature_name IN (
      'Role Management','Permission Assignment',
      'Upload Documents','Application Review','Document Verification',
      'Edit Timetable','Classroom Allocation',
      'Student Profile','Student Records','Student Documents',
      'Enter Marks','Fee Records','Fee Payment',
      'Company Registration','Job Posting','Interview Scheduling'
    ) THEN
      INSERT INTO permissions (permission_name, action, feature_id)
      VALUES (f.feature_name || ' - EDIT', 'EDIT', f.feature_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- DELETE
    IF f.feature_name IN (
      'Role Management','Permission Assignment',
      'Upload Documents',
      'Create Timetable','Edit Timetable','Classroom Allocation',
      'Student Documents','Fee Records',
      'Company Registration','Job Posting',
      'Send Department Notice','Send College Notice'
    ) THEN
      INSERT INTO permissions (permission_name, action, feature_id)
      VALUES (f.feature_name || ' - DELETE', 'DELETE', f.feature_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- APPROVE
    IF f.feature_name IN (
      'Application Review','Document Verification','Student Enrollment',
      'Verify Marks','Publish Results',
      'Fee Payment','Job Application','Interview Scheduling'
    ) THEN
      INSERT INTO permissions (permission_name, action, feature_id)
      VALUES (f.feature_name || ' - APPROVE', 'APPROVE', f.feature_id)
      ON CONFLICT DO NOTHING;
    END IF;

  END LOOP;
END $$;

-- ============================================================
-- 4. ROLES
-- ============================================================
INSERT INTO roles (role_name, description) VALUES
  ('admin',             'System administrator with full access'),
  ('principal',         'Head of the institution'),
  ('vice_principal',    'Deputy head of the institution'),
  ('hod',               'Head of Department'),
  ('faculty',           'Teaching staff'),
  ('student',           'Enrolled student'),
  ('placement_officer', 'Manages placements and alumni relations')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================
-- 5. ROLE_PERMISSIONS
-- ============================================================

-- 5a. ADMIN — all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r, permissions p
WHERE  r.role_name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5b. PRINCIPAL — VIEW everything + APPROVE + publish + notices
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.action IN ('VIEW','APPROVE')
WHERE  r.role_name = 'principal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'Publish Results - APPROVE',
         'Send College Notice - CREATE',
         'Send Department Notice - CREATE',
         'Role Management - VIEW',
         'Attendance Reports - VIEW',
         'Result Reports - VIEW',
         'Fee Reports - VIEW',
         'Department Feedback - VIEW'
       )
WHERE  r.role_name = 'principal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5c. VICE PRINCIPAL — VIEW everything + key APPROVE + notices
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.action = 'VIEW'
WHERE  r.role_name = 'vice_principal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'Application Review - APPROVE',
         'Document Verification - APPROVE',
         'Student Enrollment - APPROVE',
         'Verify Marks - APPROVE',
         'Send Department Notice - CREATE',
         'Send College Notice - CREATE',
         'Department Feedback - VIEW'
       )
WHERE  r.role_name = 'vice_principal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5d. HOD
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.action = 'VIEW'
WHERE  r.role_name = 'hod'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'Enter Marks - CREATE',
         'Enter Marks - EDIT',
         'Verify Marks - APPROVE',
         'Create Timetable - CREATE',
         'Edit Timetable - EDIT',
         'Classroom Allocation - CREATE',
         'Classroom Allocation - EDIT',
         'Application Review - EDIT',
         'Document Verification - EDIT',
         'Send Department Notice - CREATE',
         'Department Feedback - VIEW'
       )
WHERE  r.role_name = 'hod'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5e. FACULTY
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'User Login - VIEW',
         'Password Reset - VIEW',
         'Mark Attendance - CREATE',
         'View Attendance - VIEW',
         'Attendance Reports - VIEW',
         'View Timetable - VIEW',
         'Enter Marks - CREATE',
         'Enter Marks - EDIT',
         'Student Profile - VIEW',
         'Student Records - VIEW',
         'Department Students - VIEW',
         'Student Documents - VIEW',
         'View Feedback - VIEW',
         'View Notifications - VIEW',
         'Interview Scheduling - CREATE',
         'Interview Scheduling - EDIT'
       )
WHERE  r.role_name = 'faculty'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5f. STUDENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'User Login - VIEW',
         'Password Reset - VIEW',
         'Create Application - CREATE',
         'Upload Documents - CREATE',
         'Upload Documents - EDIT',
         'View Application Status - VIEW',
         'View Attendance - VIEW',
         'View Timetable - VIEW',
         'Student Profile - VIEW',
         'Student Documents - VIEW',
         'Publish Results - VIEW',
         'Result Reports - VIEW',
         'Fee Records - VIEW',
         'Fee Payment - CREATE',
         'Fee Receipts - VIEW',
         'Job Posting - VIEW',
         'Job Application - CREATE',
         'Submit Feedback - CREATE',
         'View Notifications - VIEW'
       )
WHERE  r.role_name = 'student'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5g. PLACEMENT OFFICER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM   roles r
JOIN   permissions p ON p.permission_name IN (
         'User Login - VIEW',
         'Password Reset - VIEW',
         'Company Registration - CREATE',
         'Company Registration - EDIT',
         'Company Registration - VIEW',
         'Job Posting - CREATE',
         'Job Posting - EDIT',
         'Job Posting - DELETE',
         'Job Posting - VIEW',
         'Job Application - VIEW',
         'Job Application - APPROVE',
         'Interview Scheduling - CREATE',
         'Interview Scheduling - EDIT',
         'Interview Scheduling - VIEW',
         'Interview Scheduling - APPROVE',
         'Student Profile - VIEW',
         'Student Records - VIEW',
         'Send Department Notice - CREATE',
         'View Notifications - VIEW'
       )
WHERE  r.role_name = 'placement_officer'
ON CONFLICT (role_id, permission_id) DO NOTHING;
