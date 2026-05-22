import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AVATAR_COLORS = [
    '#1a56db', '#7e3af2', '#0694a2', '#e3a008',
    '#057a55', '#e02424', '#f05252', '#6875f5'
];

const ROLE_COLORS = {
    admin: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    vice_principal: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    principal: { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
    hod: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    faculty: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    student: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    guest: { bg: '#f9fafb', text: '#4b5563', border: '#e5e7eb' },
};

const getRoleStyle = (role) => ROLE_COLORS[role?.toLowerCase()] || { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = async () => {
        try {
            const [uRes, rRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/roles')
            ]);
            setUsers(uRes.data);
            setRoles(rRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(userId);
        try {
            await api.post('/roles/assign', { user_id: userId, role: newRole });
            await loadData();
            showToast(`Role updated successfully.`);
        } catch (err) {
            showToast('Failed to update role.', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(search.toLowerCase());
        const matchRole = !filterRole || u.role?.toLowerCase() === filterRole.toLowerCase();
        return matchSearch && matchRole;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="erp-loader"></div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeInSlideUp 0.5s ease-out', padding: '1rem 0' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 600,
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    animation: 'fadeInSlideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                    <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
                    {toast.msg}
                </div>
            )}

            {/* Hero Header */}
            <div style={{
                marginBottom: '1rem', padding: '1.25rem 2rem',
                background: 'linear-gradient(135deg, var(--erp-primary) 0%, var(--erp-primary-dark) 100%)',
                borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(255,255,255,0.12)', borderRadius: '50px',
                        padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                        marginBottom: '1rem', backdropFilter: 'blur(10px)'
                    }}>
                        <i className="fa-solid fa-users"></i> Identity Management
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                        User Directory
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>
                        Manage all {users.length} campus identities and their access privileges
                    </p>
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Users', value: users.length, icon: 'fa-users' },
                        { label: 'Admins', value: users.filter(u => ['admin','vice_principal'].includes(u.role?.toLowerCase())).length, icon: 'fa-crown' },
                        { label: 'Faculty', value: users.filter(u => ['faculty','hod'].includes(u.role?.toLowerCase())).length, icon: 'fa-chalkboard-user' },
                        { label: 'Students', value: users.filter(u => u.role?.toLowerCase() === 'student').length, icon: 'fa-user-graduate' },
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem 1.5rem', backdropFilter: 'blur(10px)', minWidth: '110px' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                                <i className={`fa-solid ${stat.icon}`} style={{ marginRight: '0.4rem' }}></i>{stat.label}
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
                <i className="fa-solid fa-users" style={{ position: 'absolute', right: '-2rem', top: '-1rem', fontSize: '18rem', opacity: 0.04 }}></i>
            </div>

            {/* Filters */}
            <div className="erp-card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
                <div className="erp-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1rem 1.5rem' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '0.9rem' }}></i>
                        <input
                            type="text"
                            className="erp-form-control"
                            placeholder="Search by name, username or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.8rem', height: '44px', borderRadius: '12px' }}
                        />
                    </div>
                    <select
                        className="erp-form-control"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        style={{ height: '44px', borderRadius: '12px', maxWidth: '180px' }}
                    >
                        <option value="">All Roles</option>
                        {roles.map(r => <option key={r.role_id} value={r.role_name}>{r.role_name.toUpperCase()}</option>)}
                    </select>
                    <div style={{ color: 'var(--erp-text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        Showing <strong>{filtered.length}</strong> of {users.length}
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="erp-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div className="erp-card__body" style={{ padding: 0 }}>
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th style={{ paddingRight: '1.5rem' }}>Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => {
                                const roleStyle = getRoleStyle(u.role);
                                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                return (
                                    <tr
                                        key={u.user_id}
                                        onClick={(e) => { if (e.target.tagName !== 'SELECT') navigate(`/users/${u.user_id}`); }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: avatarColor, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', color: 'white', fontWeight: 700,
                                                    fontSize: '1rem', flexShrink: 0
                                                }}>
                                                    {u.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                                        {u.full_name || u.username}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--erp-text-muted)' }}>
                                                        @{u.username} · #{u.user_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--erp-text-muted)', fontSize: '0.9rem' }}>
                                                <i className="fa-regular fa-envelope" style={{ opacity: 0.5 }}></i>
                                                {u.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: roleStyle.bg, color: roleStyle.text,
                                                border: `1px solid ${roleStyle.border}`,
                                                borderRadius: '8px', padding: '0.3rem 0.8rem',
                                                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {u.role || 'Guest'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--erp-text-muted)', fontSize: '0.85rem' }}>
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '---'}
                                        </td>
                                        <td style={{ paddingRight: '1.5rem' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <select
                                                    className="erp-form-control"
                                                    style={{ height: '36px', borderRadius: '10px', fontSize: '0.8rem', maxWidth: '150px', paddingRight: '2rem' }}
                                                    value={u.role || ''}
                                                    disabled={updating === u.user_id}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => handleRoleChange(u.user_id, e.target.value)}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r.role_id} value={r.role_name}>{r.role_name.replace('_', ' ').toUpperCase()}</option>
                                                    ))}
                                                </select>
                                                {updating === u.user_id && (
                                                    <i className="fa-solid fa-spinner fa-spin" style={{
                                                        position: 'absolute', right: '-1.5rem', top: '50%',
                                                        transform: 'translateY(-50%)', color: 'var(--erp-primary)'
                                                    }}></i>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--erp-text-muted)' }}>
                            <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
                            <p>No users match your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
