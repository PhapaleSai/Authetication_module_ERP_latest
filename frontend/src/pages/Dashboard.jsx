import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';
import { useAuth } from '../AuthContext';

/* ── Mini Calendar ─────────────────────────────────────────── */
const MiniCalendar = () => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Month Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <button
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    style={{ background: 'var(--erp-surface-alt)', border: '1px solid var(--erp-border)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--erp-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.7rem' }}></i>
                </button>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{monthName}</span>
                <button
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    style={{ background: 'var(--erp-surface-alt)', border: '1px solid var(--erp-border)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--erp-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--erp-text-muted)', padding: '4px 0' }}>{d}</div>
                ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {cells.map((d, i) => (
                    <div key={i} style={{
                        textAlign: 'center', padding: '6px 2px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 500,
                        background: isToday(d) ? 'var(--erp-primary)' : 'transparent',
                        color: isToday(d) ? 'white' : d ? 'var(--erp-text)' : 'transparent',
                        cursor: d ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                    }}>{d || ''}</div>
                ))}
            </div>

            {/* Today's note */}
            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'var(--erp-surface-alt)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}></div>
                <span style={{ color: 'var(--erp-text-muted)' }}>
                    Today — {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};

/* ── Live Clock ────────────────────────────────────────────── */
const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
};

/* ── Custom Tooltip ────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'var(--erp-card)', border: '1px solid var(--erp-border)', borderRadius: '12px', padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '0.82rem' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color, margin: 0 }}>{p.name}: <strong>{p.value}</strong></p>
                ))}
            </div>
        );
    }
    return null;
};

/* ── Main Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [audit, setAudit] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [telemetry, setTelemetry] = useState([]);
    const [telemetryRange, setTelemetryRange] = useState('7d');

    const isAdmin = ['admin', 'vice_principal', 'hod', 'principal', 'accountant'].includes(user?.role?.toLowerCase());

    const fetchData = useCallback(async () => {
        setLoading(true);

        // Fetch stats independently for resilience
        api.get('/admin/stats').then(res => setStats(res.data)).catch(e => console.error('Stats fail:', e));
        api.get('/admin/audit').then(res => setAudit(res.data.slice(0, 6))).catch(e => console.error('Audit fail:', e));
        api.get(`/admin/telemetry?time_range=${telemetryRange}`).then(res => setTelemetry(res.data)).catch(e => console.error('Telemetry fail:', e));

        // Minor delay to ensure smooth transition
        setTimeout(() => setLoading(false), 800);
    }, [telemetryRange]);

    useEffect(() => {
        if (isAdmin) fetchData();
        else setLoading(false);
    }, [isAdmin, fetchData]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return ['Good Morning', 'fa-sun'];
        if (h < 17) return ['Good Afternoon', 'fa-cloud-sun'];
        if (h < 20) return ['Good Evening', 'fa-moon'];
        return ['Good Night', 'fa-moon-stars'];
    };
    const [greeting, greetIcon] = getGreeting();

    const sparkData = [
        { day: 'Mon', users: 3, sessions: 8 },
        { day: 'Tue', users: 7, sessions: 12 },
        { day: 'Wed', users: 5, sessions: 10 },
        { day: 'Thu', users: 10, sessions: 18 },
        { day: 'Fri', users: 8, sessions: 15 },
        { day: 'Sat', users: 4, sessions: 6 },
        { day: 'Sun', users: 6, sessions: 11 },
    ];

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/auth/register', newUser);
            setMessage({ type: 'success', text: 'User created successfully!' });
            setNewUser({ username: '', email: '', password: '', role: 'student' });
            setTimeout(() => { setIsModalOpen(false); setMessage({ type: '', text: '' }); fetchData(); }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create user.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && isAdmin) return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: '1.5rem' }}>
            <div className="erp-loader" style={{ width: '48px', height: '48px', border: '4px solid var(--erp-border)', borderTopColor: 'var(--erp-primary)', borderRadius: '50%', animation: 'erp-spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: 600, color: 'var(--erp-text-muted)', letterSpacing: '0.05em' }}>SYNCHRONIZING TELEMETRY...</p>
        </div>
    );

    if (isAdmin) {
        return (
            <div style={{ animation: 'fadeInSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)', padding: '0.5rem 0' }}>

                {/* ── Premium Hero ── */}
                <div style={{
                    marginBottom: '1.5rem', padding: '2.5rem',
                    background: 'linear-gradient(135deg, var(--erp-primary-dark) 0%, var(--erp-primary) 100%)',
                    borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {/* Decorative Background Elements */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--erp-primary) 0%, transparent 70%)', opacity: 0.15, pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', opacity: 0.1, pointerEvents: 'none' }}></div>

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 500, opacity: 0.7 }}>
                                <i className={`fa-solid ${greetIcon}`} style={{ color: 'var(--erp-accent)' }}></i>
                                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', opacity: 0.3 }}></span>
                                <span>System Status: <span style={{ color: '#4ade80', fontWeight: 700 }}>Optimal</span></span>
                            </div>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {greeting}, Admin
                            </h1>
                            <p style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: 400, margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                                Welcome to the PVG College of Science Command Center. Your administrative oversight covers <strong>{stats?.total_users || 0} enrolled users</strong> across <strong>{stats?.total_roles || 0} active RBAC policies</strong>.
                            </p>
                        </div>

                        {/* Glassmorphism Live Clock */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)',
                            borderRadius: '20px', padding: '1.5rem 2.5rem', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)', minWidth: '240px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1, fontFamily: 'var(--erp-font-mono)' }}>
                                <LiveClock />
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>IST · Server Time</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '1.5rem', alignItems: 'start' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Modern Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <PremiumStatCard
                                icon="fa-users" color="#3b82f6"
                                value={stats?.total_users || 0} label="Total Users"
                                trend="+12.5%" trendUp={true}
                                onClick={() => navigate('/users')}
                            />
                            <PremiumStatCard
                                icon="fa-fingerprint" color="#10b981"
                                value={stats?.active_sessions || 0} label="Live Sessions"
                                trend="System Active" trendUp={true}
                                onClick={() => navigate('/audit')}
                            />
                            <PremiumStatCard
                                icon="fa-shield-halved" color="#8b5cf6"
                                value={stats?.total_roles || 0} label="RBAC Policies"
                                trend="Secured" trendUp={true}
                                onClick={() => navigate('/roles')}
                            />
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                            <div className="erp-card" style={{ borderRadius: '28px', border: '1px solid var(--erp-border)', background: 'var(--erp-surface)' }}>
                                <div className="erp-card__header" style={{ padding: '1.75rem 2rem 1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--erp-primary)' }}>Registration Telemetry</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--erp-text-muted)', marginTop: '0.25rem' }}>Historical pattern of user on-boarding</div>
                                    </div>
                                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', border: '1px solid #e2e8f0' }}>
                                        {[
                                            { label: '24H', value: '24h' },
                                            { label: '7D', value: '7d' },
                                            { label: '30D', value: '30d' }
                                        ].map(r => (
                                            <button key={r.value} onClick={() => setTelemetryRange(r.value)}
                                                style={{
                                                    background: telemetryRange === r.value ? 'white' : 'transparent',
                                                    color: telemetryRange === r.value ? 'var(--erp-primary)' : 'var(--erp-text-muted)',
                                                    border: 'none', borderRadius: '10px', padding: '0.4rem 0.9rem', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                                    boxShadow: telemetryRange === r.value ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
                                                }}>
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="erp-card__body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <AreaChart data={telemetry.length ? telemetry : sparkData}>
                                            <defs>
                                                <linearGradient id="pvgGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--erp-primary)" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="var(--erp-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                            <XAxis dataKey={telemetryRange === '24h' ? 'time' : 'day'} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="users" stroke="#0c1e47" strokeWidth={4} fillOpacity={1} fill="url(#pvgGradient)" animationDuration={1500} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="erp-card" style={{ borderRadius: '28px', border: '1px solid var(--erp-border)' }}>
                                <div className="erp-card__header" style={{ padding: '1.75rem 2rem 1rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>Login Velocity</div>
                                </div>
                                <div className="erp-card__body" style={{ padding: '1rem 1.5rem 1.5rem' }}>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={telemetry.length ? telemetry : sparkData} barSize={12}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.03)" vertical={false} />
                                            <XAxis dataKey={telemetryRange === '24h' ? 'time' : 'day'} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="sessions" fill="#8b5cf6" radius={[6, 6, 0, 0]} animationDuration={1800} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        <div className="erp-card" style={{ borderRadius: '28px' }}>
                            <div className="erp-card__header" style={{ padding: '1.5rem 2rem' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--erp-dark)' }}>Security Audit Trail</div>
                                <button className="erp-btn erp-btn--outline erp-btn--sm" style={{ borderRadius: '12px' }} onClick={() => navigate('/audit')}>Full Report</button>
                            </div>
                            <div className="erp-card__body" style={{ padding: '0 1rem 1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: '1rem' }}>
                                    {audit.length > 0 ? audit.slice(0, 4).map((log, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '1rem', alignItems: 'center',
                                            border: '1px solid transparent', transition: 'all 0.3s'
                                        }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--erp-border)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; }}>
                                            <div style={{
                                                width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                                                background: log.status === 'Success' ? '#dcfce7' : '#fee2e2',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <i className={`fa-solid ${log.status === 'Success' ? 'fa-shield-check' : 'fa-triangle-exclamation'}`}
                                                    style={{ color: log.status === 'Success' ? '#16a34a' : '#ef4444', fontSize: '1.2rem' }}></i>
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.user}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--erp-text-muted)', marginTop: '0.2rem' }}>{log.ip_address} · {log.timestamp}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--erp-text-muted)' }}>
                                            No audit telemetry available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>


                        {/* Interactive Calendar */}
                        <div className="erp-card" style={{ borderRadius: '28px', overflow: 'hidden' }}>
                            <div style={{ padding: '1.75rem 2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--erp-surface-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-regular fa-calendar-star" style={{ color: 'var(--erp-primary)', fontSize: '1.1rem' }}></i>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--erp-dark)' }}>Academic Cycle</span>
                            </div>
                            <MiniCalendar />
                            <div style={{ padding: '0 2rem 2rem' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>Upcoming Node Events</div>
                                {[
                                    { color: '#3b82f6', label: 'Security Patch V2.4', time: 'Tomorrow' },
                                    { color: '#8b5cf6', label: 'Faculty Role Rotation', time: 'Apr 25' },
                                    { color: '#10b981', label: 'Semester Sync', time: 'May 02' }
                                ].map((ev, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ev.color }}></div>
                                        <div style={{ flex: 1, fontWeight: 600, fontSize: '0.88rem' }}>{ev.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{ev.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Health Card */}
                        <div className="erp-card" style={{ borderRadius: '28px', background: 'var(--erp-dark)', color: 'white', padding: '2rem', border: 'none', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px', background: 'var(--erp-primary)', filter: 'blur(60px)', opacity: 0.5 }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.25rem' }}>Node Status</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Infrastructure Monitor</div>
                                </div>
                                <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--erp-accent)', borderRadius: '10px', fontSize: '0.9rem' }}>
                                    <i className="fa-solid fa-bolt-lightning"></i>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                                {[
                                    { name: 'Auth Server', status: 'Healthy', val: 99 },
                                    { name: 'RBAC Engine', status: 'Healthy', val: 100 },
                                    { name: 'Database', status: 'Healthy', val: 98 }
                                ].map((s, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                                            <span style={{ color: '#94a3b8' }}>{s.name}</span>
                                            <span style={{ color: '#4ade80' }}>{s.status}</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px' }}>
                                            <div style={{ background: 'linear-gradient(to right, var(--erp-primary), var(--erp-primary-light))', width: `${s.val}%`, height: '100%', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* Student/Faculty View */
    return (
        <div style={{ animation: 'fadeInSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            <div style={{
                marginBottom: '2rem', padding: '3rem',
                background: 'linear-gradient(135deg, var(--erp-primary-dark) 0%, var(--erp-primary) 100%)',
                borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '3rem', alignItems: 'center' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '28px', background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', fontWeight: 800, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 500 }}>{greeting}</div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em', textTransform: 'capitalize' }}>
                            {user?.full_name || user?.username}
                        </h1>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <span style={{ background: 'var(--erp-primary)', color: 'white', borderRadius: '10px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                {user?.role?.toUpperCase()}
                            </span>
                            <span style={{ opacity: 0.6, fontSize: '0.95rem' }}>
                                <i className="fa-solid fa-envelope" style={{ marginRight: '0.6rem' }}></i>{user?.email}
                            </span>
                        </div>
                    </div>
                </div>
                <i className="fa-solid fa-user-graduate" style={{ position: 'absolute', right: '-3rem', bottom: '-4rem', fontSize: '20rem', opacity: 0.03 }}></i>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
                <div className="erp-card" style={{ borderRadius: '28px' }}>
                    <div className="erp-card__header" style={{ padding: '2rem 2.5rem' }}>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--erp-primary)' }}>System Privileges</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--erp-text-muted)', marginTop: '0.4rem' }}>{user?.permissions?.length || 0} active cross-module capabilities</div>
                        </div>
                    </div>
                    <div className="erp-card__body" style={{ padding: '0 2.5rem 2.5rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {user?.permissions?.length > 0 ? user.permissions.map(p => (
                                <span key={p} style={{
                                    background: 'var(--erp-surface-alt)', color: 'var(--erp-text)',
                                    border: '1px solid var(--erp-border)', borderRadius: '12px',
                                    padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700,
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.6rem'
                                }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--erp-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}>
                                    <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>
                                    {p.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            )) : (
                                <div style={{ textAlign: 'center', width: '100%', padding: '4rem', background: 'var(--erp-surface-alt)', borderRadius: '20px' }}>
                                    <i className="fa-solid fa-lock-keyhole" style={{ fontSize: '3rem', opacity: 0.1, display: 'block', marginBottom: '1.25rem' }}></i>
                                    No direct permissions listed.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div className="erp-card" style={{ borderRadius: '28px' }}>
                        <div style={{ padding: '1.5rem 2rem 0', fontWeight: 800, fontSize: '0.9rem', borderBottom: '1px solid var(--erp-border)', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(26,86,219,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-calendar" style={{ color: 'var(--erp-primary)', fontSize: '1rem' }}></i>
                            </div>
                            Academic Timeline
                        </div>
                        <MiniCalendar />
                    </div>
                    <div className="erp-card" style={{ borderRadius: '28px', background: 'var(--erp-surface-alt)', border: '1px solid var(--erp-border)', padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#dcfce7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-shield-halved" style={{ color: '#16a34a', fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Active Session</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--erp-text-muted)' }}>Secure Line · {new Date().getFullYear()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── New Premium Stat Card Component ── */
const PremiumStatCard = ({ icon, color, value, label, trend, trendUp, onClick }) => (
    <div onClick={onClick} style={{
        borderRadius: '28px', padding: '1.75rem', position: 'relative', overflow: 'hidden',
        background: 'var(--erp-surface)', border: '1px solid var(--erp-border)',
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = color + '40'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--erp-border)'; }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '52px', height: '52px', background: color + '12', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '1.4rem', color: color }}></i>
            </div>
            <span style={{ background: trendUp ? '#dcfce7' : '#fee2e2', color: trendUp ? '#16a34a' : '#ef4444', borderRadius: '10px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 800 }}>
                {trend}
            </span>
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--erp-dark)', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontWeight: 700, color: 'var(--erp-text-muted)', fontSize: '1rem' }}>{label}</div>

        {/* Decorative Background Icon */}
        <i className={`fa-solid ${icon}`} style={{ position: 'absolute', right: '-1rem', bottom: '-1rem', fontSize: '7rem', color: color, opacity: 0.03, pointerEvents: 'none' }}></i>
    </div>
);

export default Dashboard;
