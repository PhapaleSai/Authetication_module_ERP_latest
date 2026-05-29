import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ROLE_ICONS = {
    admin: 'fa-crown',
    vice_principal: 'fa-building-columns',
    principal: 'fa-user-tie',
    hod: 'fa-chalkboard-teacher',
    faculty: 'fa-graduation-cap',
    student: 'fa-user-graduate',
    guest: 'fa-user-clock',
    default: 'fa-shield-halved'
};

const ROLE_GRADIENTS = {
    admin: 'linear-gradient(135deg, #1a56db 0%, #0c356a 100%)',
    vice_principal: 'linear-gradient(135deg, #7e3af2 0%, #4a1d96 100%)',
    principal: 'linear-gradient(135deg, #0694a2 0%, #164e63 100%)',
    hod: 'linear-gradient(135deg, #e3a008 0%, #92400e 100%)',
    faculty: 'linear-gradient(135deg, #057a55 0%, #064e3b 100%)',
    student: 'linear-gradient(135deg, #e02424 0%, #7f1d1d 100%)',
    guest: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    default: 'linear-gradient(135deg, #374151 0%, #111827 100%)'
};

const Roles = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPerms, setSelectedPerms] = useState([]);
    const [saving, setSaving] = useState(false);
    const [searchPerm, setSearchPerm] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/admin/roles'),
                api.get('/permissions')
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openModal = (role) => {
        if (!role) return;
        setEditingRole(role);
        setSelectedPerms(role.permissions || []);
        setSearchPerm('');
    };

    const togglePermission = (permName) => {
        setSelectedPerms(prev =>
            prev.includes(permName)
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/roles/${editingRole.role_id}/permissions`, selectedPerms);
            await loadData();
            setEditingRole(null);
            showToast(`Permissions updated for "${editingRole.role_name}" role.`);
        } catch (err) {
            showToast('Failed to update permissions.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getRoleKey = (name) => name?.toLowerCase().replace(' ', '_');
    const getIcon = (name) => ROLE_ICONS[getRoleKey(name)] || ROLE_ICONS.default;
    const getGradient = (name) => ROLE_GRADIENTS[getRoleKey(name)] || ROLE_GRADIENTS.default;

    const filteredPerms = permissions.filter(p =>
        p.permission_name?.toLowerCase().includes(searchPerm.toLowerCase()) ||
        p.action?.toLowerCase().includes(searchPerm.toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="erp-loader"></div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeInSlideUp 0.5s ease-out' }}>
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
                        <i className="fa-solid fa-lock"></i> RBAC Engine v2
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                        Role & Permission Matrix
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>
                        Configure granular access control for all {roles.length} system roles
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem 1.5rem', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{roles.length}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Active Roles</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem 1.5rem', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{permissions.length}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Permissions</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem 1.5rem', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                            {roles.reduce((acc, r) => acc + (r.permissions?.length || 0), 0)}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Permission Links</div>
                    </div>
                </div>
                <i className="fa-solid fa-network-wired" style={{ position: 'absolute', right: '-2rem', top: '-2rem', fontSize: '18rem', opacity: 0.04 }}></i>
            </div>

            {/* Role Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {roles.map((role) => {
                    const icon = getIcon(role.role_name);
                    const gradient = getGradient(role.role_name);
                    const permCount = role.permissions?.length || 0;

                    return (
                        <div key={role.role_id} className="erp-card" style={{
                            overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer', borderRadius: '20px', border: '1px solid var(--erp-border)'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                        >
                            {/* Role Header Strip */}
                            <div style={{ background: gradient, padding: '1.5rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.3rem', color: 'white', backdropFilter: 'blur(10px)'
                                    }}>
                                        <i className={`fa-solid ${icon}`}></i>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.15)', borderRadius: '50px',
                                        padding: '0.3rem 0.8rem', fontSize: '0.7rem', fontWeight: 700,
                                        color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em'
                                    }}>
                                        {permCount} perms
                                    </div>
                                </div>
                                <i className={`fa-solid ${icon}`} style={{
                                    position: 'absolute', right: '-0.5rem', bottom: '-0.5rem',
                                    fontSize: '7rem', opacity: 0.07, color: 'white'
                                }}></i>
                            </div>

                            {/* Pull-up Info Card */}
                            <div style={{ background: 'var(--erp-card)', padding: '1rem 1.5rem 0', marginTop: '-2rem', borderRadius: '20px 20px 0 0', position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem', textTransform: 'capitalize' }}>
                                    {role.role_name.replace('_', ' ')}
                                </h3>
                                <p style={{ color: 'var(--erp-text-muted)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                                    {role.description || `System role with ${permCount} access privileges`}
                                </p>

                                {/* Permission Pills Preview */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', minHeight: '28px' }}>
                                    {(role.permissions || []).slice(0, 4).map(p => (
                                        <span key={p} style={{
                                            background: 'var(--erp-surface-alt)', borderRadius: '6px',
                                            padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 600,
                                            color: 'var(--erp-text-muted)', border: '1px solid var(--erp-border)'
                                        }}>
                                            {p.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                    {permCount > 4 && (
                                        <span style={{
                                            background: 'var(--erp-primary)', color: 'white',
                                            borderRadius: '6px', padding: '0.2rem 0.6rem',
                                            fontSize: '0.65rem', fontWeight: 700
                                        }}>
                                            +{permCount - 4} more
                                        </span>
                                    )}
                                    {permCount === 0 && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--erp-text-muted)', fontStyle: 'italic' }}>
                                            No permissions assigned
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="erp-btn erp-btn--outline"
                                    style={{ width: '100%', borderRadius: '12px', marginBottom: '1.25rem', fontWeight: 700 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(role);
                                    }}
                                >
                                    <i className="fa-solid fa-key" style={{ marginRight: '0.5rem', color: 'var(--erp-primary)' }}></i>
                                    Configure Permissions
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Permissions Modal */}
            {editingRole && (
                <div 
                    className={`erp-modal-overlay ${editingRole ? 'erp-modal-overlay--active erp-modal--open' : ''}`}
                    onClick={(e) => e.target === e.currentTarget && setEditingRole(null)}
                >
                    <div className="erp-modal" style={{ maxWidth: '700px', borderRadius: '24px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '2rem', background: getGradient(editingRole.role_name),
                            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Editing Policy For</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'capitalize' }}>
                                    <i className={`fa-solid ${getIcon(editingRole.role_name)}`} style={{ marginRight: '0.75rem' }}></i>
                                    {editingRole.role_name.replace('_', ' ')}
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                                    {selectedPerms.length} of {permissions.length} permissions active
                                </div>
                            </div>
                            <button onClick={() => setEditingRole(null)}
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Search Permissions */}
                        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--erp-border)' }}>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
                                <input
                                    type="text"
                                    className="erp-form-control"
                                    placeholder="Search permissions..."
                                    value={searchPerm}
                                    onChange={e => setSearchPerm(e.target.value)}
                                    style={{ paddingLeft: '2.8rem', height: '44px', borderRadius: '12px' }}
                                />
                            </div>
                        </div>

                        {/* Permissions List */}
                        <div style={{ overflow: 'auto', flex: 1, padding: '1rem 2rem' }}>
                            <div className="erp-permissions-grid">
                                {filteredPerms.map(perm => {
                                    const isActive = selectedPerms.includes(perm.permission_name);
                                    return (
                                        <div
                                            key={perm.permission_id}
                                            onClick={() => togglePermission(perm.permission_name)}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                                                border: `1.5px solid ${isActive ? 'var(--erp-primary)' : 'var(--erp-border)'}`,
                                                background: isActive ? 'rgba(26, 86, 219, 0.06)' : 'var(--erp-surface)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 700, fontSize: '0.8rem',
                                                    color: isActive ? 'var(--erp-primary)' : 'inherit',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {perm.permission_name.replace(/_/g, ' ')}
                                                </div>
                                                {perm.action && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--erp-text-muted)', marginTop: '0.1rem' }}>
                                                        {perm.action}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Toggle Switch */}
                                            <div style={{
                                                width: '36px', height: '20px', flexShrink: 0, marginLeft: '0.75rem',
                                                background: isActive ? 'var(--erp-primary)' : 'var(--erp-border)',
                                                borderRadius: '10px', position: 'relative', transition: 'background 0.3s'
                                            }}>
                                                <div style={{
                                                    width: '14px', height: '14px', background: 'white',
                                                    borderRadius: '50%', position: 'absolute', top: '3px',
                                                    left: isActive ? '19px' : '3px', transition: 'left 0.25s'
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {filteredPerms.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--erp-text-muted)' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
                                    No permissions match your search.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '1.25rem 2rem', borderTop: '1px solid var(--erp-border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'var(--erp-surface-alt)'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--erp-text-muted)' }}>
                                <strong style={{ color: 'var(--erp-primary)' }}>{selectedPerms.length}</strong> permissions selected
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="erp-btn erp-btn--ghost" onClick={() => setEditingRole(null)}>Discard</button>
                                <button className="erp-btn erp-btn--primary" style={{ padding: '0 2rem' }} onClick={handleSave} disabled={saving}>
                                    {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : 'Apply Policy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
