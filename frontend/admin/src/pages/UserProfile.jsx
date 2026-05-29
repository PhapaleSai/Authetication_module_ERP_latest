import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [audit, setAudit] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const [uRes, aRes] = await Promise.all([
                    api.get(`/admin/users/${id}`),
                    api.get('/admin/audit')
                ]);
                setUser(uRes.data);
                setAudit(aRes.data.filter(log => log.user === uRes.data.email));
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) navigate('/users');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [id, navigate]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="erp-loader"></div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeInSlideUp 0.5s ease-out', padding: '1rem 0' }}>
            {/* Hero Header */}
            <div style={{
                marginBottom: '1rem', padding: '1.25rem 2rem',
                background: 'linear-gradient(135deg, var(--erp-primary) 0%, var(--erp-primary-dark) 100%)',
                borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(255,255,255,0.12)', borderRadius: '50px',
                            padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                            marginBottom: '1rem', backdropFilter: 'blur(10px)'
                        }}>
                            < i className="fa-solid fa-fingerprint"></i> Identity Analysis
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                            Profile Intelligence
                        </h1>
                        <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>
                            Deep-dive into identity security patterns and historical interaction telemetry.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate('/users')}
                            className="erp-btn"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', backdropFilter: 'blur(10px)', borderRadius: '12px', fontWeight: 700 }}
                        >
                            <i className="fa-solid fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Directory
                        </button>
                    </div>
                </div>
                <i className="fa-solid fa-address-card" style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', fontSize: '18rem', opacity: 0.04 }}></i>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className={`erp-pill ${user.status ? 'erp-pill--active' : 'erp-pill--inactive'}`} style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}>
                    <i className={`fa-solid ${user.status ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '0.6rem' }}></i>
                    {user.status ? 'Identity Active' : 'Access Restricted'}
                </div>
                {audit.length > 0 && (
                    <div style={{ background: 'var(--erp-surface)', border: '1px solid var(--erp-border)', borderRadius: '12px', padding: '0.6rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-clock-rotate-left" style={{ opacity: 0.5 }}></i>
                        LAST SEEN: {new Date(audit[0].timestamp).toLocaleString()}
                    </div>
                )}
            </div>

            <div className="erp-form-grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="erp-card erp-card--accent-top">
                    <div className="erp-card__body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                        <div className="erp-avatar erp-avatar--lg" style={{ width: '100px', height: '100px', fontSize: '2.5rem', margin: '0 auto 1.5rem', background: 'var(--erp-primary)' }}>
                            {user.username[0].toUpperCase()}
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem' }}>{user.username}</h2>
                        <span className="erp-badge erp-badge--primary" style={{ textTransform: 'uppercase', padding: '0.4rem 1rem' }}>{user.role}</span>
                        
                        <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', fontWeight: 700, display: 'block' }}>System Identifier</label>
                                <div style={{ fontWeight: 700 }}>UID-{user.user_id}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', fontWeight: 700, display: 'block' }}>Communication Channel</label>
                                <div style={{ fontWeight: 700 }}>{user.email}</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', fontWeight: 700, display: 'block' }}>Enrollment Timestamp</label>
                                <div style={{ fontWeight: 700 }}>{new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                            </div>
                        </div>

                        <button className="erp-btn erp-btn--danger erp-btn--sm" style={{ width: '100%', marginTop: '2rem' }}>
                            <i className="fa-solid fa-user-slash"></i> Restrict Access
                        </button>
                    </div>
                </div>

                <div className="erp-card">
                    <div className="erp-card__header">
                        <div className="erp-card__title">Authentication & Security Log</div>
                        <div className="erp-card__subtitle">Showing last {audit.length} significant events</div>
                    </div>
                    <div className="erp-card__body">
                        {audit.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {audit.map((log, i) => (
                                    <div key={i} style={{ 
                                        padding: '1.25rem', 
                                        background: 'var(--erp-surface-alt)', 
                                        borderRadius: '12px', 
                                        border: '1px solid var(--erp-border)', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center' 
                                    }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '10px', 
                                                background: log.action.includes('Login') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: log.action.includes('Login') ? 'var(--erp-success)' : 'var(--erp-danger)'
                                            }}>
                                                <i className={`fa-solid ${log.action.includes('Login') ? 'fa-right-to-bracket' : 'fa-shield-heart'}`}></i>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{log.action.toUpperCase()}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--erp-text-muted)' }}>{log.detail}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--erp-text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed var(--erp-border)', borderRadius: '16px' }}>
                                <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1.5rem', display: 'block' }}></i>
                                <div style={{ color: 'var(--erp-text-muted)', fontWeight: 600 }}>No security events found for this identity.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
