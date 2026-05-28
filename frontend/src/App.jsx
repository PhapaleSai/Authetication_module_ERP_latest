import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import api from './api';
import { AuthContext, useAuth } from './AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Audit from './pages/Audit';
import UserProfile from './pages/UserProfile';
import Export from './pages/Export';
import Welcome from './pages/student/Welcome';
import { ADMIN_ROLES, SUPER_ADMIN_ROLES, getModuleURL } from './utils/config';

// AuthContext is imported from ./AuthContext.js

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
        }
        // Refresh user data from API in background
        api.get('/users/me')
            .then(res => {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        api.post('/auth/logout').finally(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
        });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--erp-bg)' }}>
            <div className="erp-loader"></div>
        </div>
    );

    if (!localStorage.getItem('token') || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!user.role || !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase()))) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// ── Sidebar Nav Link ─────────────────────────────────────────────────────────
function SidebarLink({ to, icon, label, badge }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            className={`erp-nav-item ${isActive ? 'active' : ''}`}
        >
            <i className={`fa-solid ${icon}`}></i>
            <span className="erp-nav-item__text">{label}</span>
            {badge && <span className="erp-badge">{badge}</span>}
        </Link>
    );
}

// ── Sidebar Layout ────────────────────────────────────────────────────────────
function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        document.documentElement.setAttribute('data-erp-theme', 'light');
        localStorage.setItem('admin_theme', 'light');
    }, []);

    if (!user) return null;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/users') return 'User Management';
        if (path.startsWith('/users/')) return 'User Profile';
        if (path === '/roles') return 'Roles & RBAC';
        if (path === '/audit') return 'Audit Log';
        if (path === '/export') return 'Export Hub';
        return 'Portal';
    };

    const isAdminRole = user.role ? ADMIN_ROLES.includes(user.role.toLowerCase()) : false;
    const isSuperAdmin = user.role ? SUPER_ADMIN_ROLES.includes(user.role.toLowerCase()) : false;

    return (
        <div className="erp-layout">
            <aside className="erp-sidebar">
                {/* No decorative shapes — clean sidebar */}

                <div className="erp-sidebar__brand">
                    <img src="/assets/pvg_logo.png" alt="PVG Logo" className="erp-sidebar__logo" />
                    <div className="erp-sidebar__brand-text">
                        <h2>PVG College of Science</h2>
                        <span>Campus Portal</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="erp-sidebar__nav">
                    {/* General */}
                    <div className="erp-nav-label">General</div>
                    <SidebarLink to="/dashboard" icon="fa-gauge-high" label="Dashboard" />

                    {isAdminRole && (
                        <>
                            <div className="erp-nav-label">Administration</div>
                            {isSuperAdmin && (
                                <>
                                    <SidebarLink to="/users" icon="fa-users" label="User Management" />
                                    <SidebarLink to="/roles" icon="fa-shield-halved" label="Roles & RBAC" />
                                </>
                            )}
                            <div className="erp-nav-label">System</div>
                            <SidebarLink to="/audit" icon="fa-clipboard-list" label="Audit Log" />
                            <SidebarLink to="/export" icon="fa-file-export" label="Export Hub" />

                        </>
                    )}

                    <div className="erp-nav-label">Integrations</div>
                            {(() => {
                                const uid = user?.user_id || '';
                                const name = encodeURIComponent(user?.full_name || user?.username || '');
                                const isAdmin = user?.role ? ADMIN_ROLES.includes(user.role.toLowerCase()) : false;
                                const roleParam = isAdmin ? 'admin' : (user?.role || 'staff');
                                const currentToken = localStorage.getItem('token') || '';
                                
                                const modules = [
                                    { key: 'ADMISSION', label: 'Admission Module', icon: 'fa-graduation-cap', iconColor: '#fbbf24', href: `${getModuleURL('ADMISSION')}/callback?token=${currentToken}&user_id=${uid}&name=${name}&role=${roleParam}` },
                                    { key: 'SIS', label: 'SIS Module', icon: 'fa-book-open', iconColor: '#60a5fa', href: `${getModuleURL('SIS')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'FEES', label: 'Fees Module', icon: 'fa-indian-rupee-sign', iconColor: '#34d399', href: `${getModuleURL('FEES')}/admin?token=${currentToken}&user_id=${uid}&role=${roleParam}&name=${name}` },
                                    { key: 'PLACEMENT', label: 'Placement Module', icon: 'fa-briefcase', iconColor: '#a78bfa', href: `${getModuleURL('PLACEMENT')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'TIMETABLE', label: 'TimeTable Module', icon: 'fa-calendar-days', iconColor: '#f472b6', href: `${getModuleURL('TIMETABLE')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    isAdmin && { key: 'NOTIFICATION', label: 'Notification Module', icon: 'fa-bell', iconColor: '#fb923c', href: `${getModuleURL('NOTIFICATION')}/index.html?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'ALUMNI', label: 'Alumni Module', icon: 'fa-users-rectangle', iconColor: '#2dd4bf', href: `${getModuleURL('ALUMNI')}?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'ACADEMIC', label: 'Academic Module', icon: 'fa-book', iconColor: '#fb7185', href: `${getModuleURL('ACADEMIC')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'FEEDBACK', label: 'Feedback Module', icon: 'fa-comments', iconColor: '#a855f7', href: `${getModuleURL('FEEDBACK')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'EXAMINATION', label: 'Examination Module', icon: 'fa-pen-to-square', iconColor: '#6366f1', href: `${getModuleURL('EXAMINATION')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                    { key: 'ATTENDANCE', label: 'Attendance Module', icon: 'fa-calendar-check', iconColor: '#14b8a6', href: `${getModuleURL('ATTENDANCE')}/callback?token=${currentToken}&user_id=${uid}&role=${roleParam}` },
                                ].filter(Boolean);

                                return modules.map(m => (
                                    <div
                                        key={m.key}
                                        onClick={() => window.location.href = m.href}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="erp-nav-item" style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.6rem 0.75rem', borderRadius: '12px', marginBottom: '4px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}
                                        >
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                                                background: 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <i className={`fa-solid ${m.icon}`} style={{ fontSize: '0.8rem', color: m.iconColor }}></i>
                                            </div>
                                            <span className="erp-nav-item__text" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                                                {m.label}
                                            </span>
                                            <i className="fa-solid fa-arrow-up-right-from-square erp-nav-item__text" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}></i>
                                        </div>
                                    </div>
                                ));
                            })()}
                </nav>

                {/* User Footer */}
                <div className="erp-sidebar__footer">
                    <div className="erp-avatar">{(user.email || user.username)?.[0]?.toUpperCase()}</div>
                    <div className="erp-sidebar__user-info">
                        <p>{user.email || user.username}</p>
                        <span>{user.role}</span>
                    </div>
                    <div className="erp-sidebar__logout" onClick={logout} title="Logout">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </div>
                </div>
            </aside>

            <div className="erp-content">
                <header className="erp-topbar" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="erp-topbar__btn" onClick={() => {
                            document.querySelector('.erp-sidebar').classList.toggle('erp-sidebar--collapsed');
                        }}>
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <nav className="erp-topbar__breadcrumb">
                            <Link to="/dashboard">Portal</Link>
                            <i className="fa-solid fa-chevron-right"></i>
                            <span className="current">{getPageTitle()}</span>
                        </nav>
                    </div>

                    <div className="erp-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Removed Topbar Quick-Launch buttons - moved to sidebar */}

                        <div style={{ height: '24px', width: '1px', background: 'var(--erp-border)' }}></div>
                        <div className="erp-topbar__user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => isAdminRole ? navigate(`/users/${user.user_id}`) : navigate('/dashboard')}>
                            <div className="erp-avatar erp-avatar--sm" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>{(user.email || user.username)?.[0]?.toUpperCase()}</div>
                            <span className="erp-topbar__user-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.email || user.username}</span>
                        </div>
                    </div>
                </header>

                <main className="erp-main">
                    <div className="erp-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// ── Smart Root Redirect ───────────────────────────────────────────────────────
// Restores session persistence: if a token exists, go straight to dashboard.
// This runs at '/' and '*' so reopening the browser auto-logs the user in.
function SmartRedirect() {
    const token = localStorage.getItem('token');
    return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/welcome" element={
                <ProtectedRoute>
                    <Welcome />
                </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Users /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><UserProfile /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/roles" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Roles /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Audit /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/export" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Export /></Layout>
                </ProtectedRoute>
            } />

            {/* Smart root: token present → dashboard, else → login */}
            <Route path="/" element={<SmartRedirect />} />
            <Route path="*" element={<SmartRedirect />} />
        </Routes>
    );
}

// ── Root Component ────────────────────────────────────────────────────────────
// Pages like Dashboard need the user — they'll use the useAuth() hook
export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
