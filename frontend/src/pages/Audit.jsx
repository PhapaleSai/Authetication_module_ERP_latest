import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Audit = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/audit')
            .then(res => setLogs(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const stats = {
        total: logs.length,
        alerts: logs.filter(l => l.action.toLowerCase().includes('failed') || l.action.toLowerCase().includes('restriction')).length,
        users: new Set(logs.map(l => l.user)).size
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="erp-loader"></div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeInSlideUp 0.5s ease-out', padding: '1rem 0' }}>
            <div style={{
                marginBottom: '1rem', padding: '1.25rem 2rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(255,255,255,0.1)', borderRadius: '50px',
                        padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                        marginBottom: '1rem', backdropFilter: 'blur(10px)'
                    }}>
                        <i className="fa-solid fa-shuttle-space"></i> System Telemetry
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                        Digital Audit Ledger
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>
                        Immutable record of system interactions, authentication attempts, and real-time session telemetry.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem 1.75rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.total}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Events</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', padding: '1.25rem 1.75rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171' }}>{stats.alerts}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Alerts</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem 1.75rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.users}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identifiers</div>
                    </div>
                </div>

                <i className="fa-solid fa-fingerprint" style={{ position: 'absolute', right: '-2rem', bottom: '-3rem', fontSize: '20rem', opacity: 0.03 }}></i>
            </div>

            {/* Audit Table */}
            <div className="erp-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div className="erp-card__header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--erp-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                            <div className="erp-card__title">Security Timeline</div>
                            <div className="erp-card__subtitle">Showing latest cryptographically verified system events</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="erp-btn erp-btn--outline erp-btn--sm" onClick={() => window.location.reload()}>
                                <i className="fa-solid fa-rotate"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
                <div className="erp-card__body" style={{ padding: 0 }}>
                    <div className="erp-table-responsive">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '2rem' }}>Temporal Stamp</th>
                                    <th>Subject (Identity)</th>
                                    <th>Operation</th>
                                    <th>Telemetry Detail</th>
                                    <th>Origin IP</th>
                                    <th style={{ paddingRight: '2rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => {
                                    const isError = log.action.toLowerCase().includes('failed') || log.action.toLowerCase().includes('invalid');
                                    return (
                                        <tr key={i} style={{ transition: 'background 0.2s' }}>
                                            <td style={{ paddingLeft: '2rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--erp-text-muted)' }}>
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        background: 'var(--erp-surface-alt)', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontWeight: 700, color: 'var(--erp-primary)'
                                                    }}>
                                                        {log.user[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.user.split('@')[0]}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--erp-text-muted)' }}>{log.user}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: isError ? '#ef4444' : '#10b981',
                                                    padding: '0.35rem 0.75rem', borderRadius: '8px',
                                                    fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em'
                                                }}>
                                                    {log.action.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                    <i className="fa-solid fa-circle-info" style={{ marginTop: '0.2rem', opacity: 0.3 }}></i>
                                                    <span style={{ color: 'var(--erp-text)' }}>{log.detail}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--erp-text-muted)' }}>
                                                {log.ip}
                                            </td>
                                            <td style={{ paddingRight: '2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isError ? '#ef4444' : '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                                                    <i className={`fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
                                                    {isError ? 'FLAGGED' : 'VERIFIED'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {logs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--erp-text-muted)' }}>
                            <i className="fa-solid fa-database" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1.5rem', display: 'block' }}></i>
                            No telemetry logs recovered from the ledger.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Audit;
