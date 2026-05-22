import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';
import TypeWriter from '../components/TypeWriter';
import JwtDisplay from '../components/JwtDisplay';

function Welcome() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(location.state?.user || null);
    const [token] = useState(() => localStorage.getItem('token') || '');

    useEffect(() => {
        api.get('/users/me')
            .then((res) => setUser(res.data))
            .catch(() => {
                api.get('/me')
                    .then((res) => setUser(res.data))
                    .catch(() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    });
            });
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout failed on server", e);
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleEnterAdmission = () => {
        const ADMISSION_CALLBACK_URL = `${import.meta.env.VITE_ADMISSION_URL}/callback`;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${ADMISSION_CALLBACK_URL}?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterSIS = () => {
        const SIS_CALLBACK_URL = `${import.meta.env.VITE_SIS_URL}/callback`;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${SIS_CALLBACK_URL}?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterNotification = () => {
        const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${NOTIFICATION_URL}/login.html?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterAlumni = () => {
        const ALUMNI_URL = import.meta.env.VITE_ALUMNI_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${ALUMNI_URL}?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterAcademic = () => {
        const ACADEMIC_URL = import.meta.env.VITE_ACADEMIC_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${ACADEMIC_URL}/callback?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterFeedback = () => {
        const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${FEEDBACK_URL}/callback?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterExamination = () => {
        const EXAMINATION_URL = import.meta.env.VITE_EXAMINATION_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${EXAMINATION_URL}/callback?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    const handleEnterAttendance = () => {
        const ATTENDANCE_URL = import.meta.env.VITE_ATTENDANCE_URL;
        const currentToken = localStorage.getItem('token') || '';
        if (!user || !user.user_id) return;
        const redirectUrl = `${ATTENDANCE_URL}/callback?token=${currentToken}&user_id=${user.user_id}&role=${encodeURIComponent(user.role || 'student')}&name=${encodeURIComponent(user.full_name || '')}`;
        window.location.href = redirectUrl;
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--erp-bg)' }}>
                <div className="erp-loader"></div>
            </div>
        );
    }
    const isAlumniOrAdmin = ['admin', 'it admins', 'principal', 'principals & vice principals', 'hod'].includes(user?.role?.toLowerCase()) || user?.role?.toLowerCase() === 'alumni';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--erp-bg)', padding: '3rem 1rem', color: '#1e293b' }}>
            <div className="erp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="animate-premium" style={{
                    background: '#dcfce7', color: '#16a34a', padding: '1rem 1.5rem',
                    borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.1)'
                }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '1.2rem' }}></i>
                    <div style={{ fontWeight: 600 }}>Security Cleared: Your session is now active and protected.</div>
                </div>

                <div className="erp-auth-box animate-premium" style={{
                    maxWidth: '100%', padding: '3rem', textAlign: 'center', marginBottom: '2rem',
                    background: 'white', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '24px', margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--erp-primary), var(--erp-primary-dark))', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800,
                        boxShadow: '0 10px 20px rgba(12, 30, 71, 0.2)'
                    }}>
                        {(user.email || user.username)?.[0]?.toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        Welcome, {user.email || user.username}
                        <span style={{ color: 'var(--erp-primary)' }}>.</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', fontWeight: 400 }}>
                        Your unified campus profile is ready.
                    </p>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: '2rem',
                        textAlign: 'left', borderTop: '1.5px solid #f1f5f9', paddingTop: '2.5rem'
                    }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Digital Identity</label>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{user.email}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Portal Access</label>
                            <div>
                                <span style={{
                                    background: '#0c1e47', color: 'white', borderRadius: '8px',
                                    padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em'
                                }}>
                                    {user.role?.toUpperCase() || 'USER'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animationDelay: '0.1s' }}>
                    {['admin', 'vice_principal', 'hod'].includes(user.role) && (
                        <div style={{
                            background: '#0c1e47', borderRadius: '24px', padding: '1.75rem 2rem', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 15px 30px rgba(12, 30, 71, 0.15)'
                        }}>
                            <div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>Administrative Control</div>
                                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Full management oversight for campus modules.</div>
                            </div>
                            <button
                                className="erp-btn"
                                style={{ background: 'white', color: '#0c1e47', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                                onClick={() => window.location.href = '/admin/dashboard'}
                            >
                                Dashboard <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: '0.5rem' }}></i>
                            </button>
                        </div>
                    )}

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>SIS Module</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Access your academic profile, attendance, and results.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: '#0c1e47', color: 'white', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterSIS}
                        >
                            Enter SIS Module <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        opacity: 0.8
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Admission Portal</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Admission forms, document tracking, and final payment.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: 'transparent', color: '#0c1e47', border: '1.5px solid #0c1e47', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterAdmission}
                        >
                            Enter Admission Module <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>


                    {isAlumniOrAdmin && (
                        <div style={{
                            background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                            <div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Alumni Module</div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Stay connected with our global network of graduates.</div>
                            </div>
                            <button
                                className="erp-btn"
                                style={{ background: '#2dd4bf', color: 'white', border: 'none', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                                onClick={handleEnterAlumni}
                            >
                                Enter Alumni Module <i className="fa-solid fa-users-rectangle" style={{ marginLeft: '0.5rem' }}></i>
                            </button>
                        </div>
                    )}

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Academic Module</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your courses, curriculum, and academic progress.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: '#fb7185', color: 'white', border: 'none', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterAcademic}
                        >
                            Enter Academic Module <i className="fa-solid fa-book" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Feedback Module</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit your feedback, complaints, and suggestions.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: '#a855f7', color: 'white', border: 'none', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterFeedback}
                        >
                            Enter Feedback Module <i className="fa-solid fa-comments" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Examination Module</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>View exam schedules, results, and seating arrangements.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: '#6366f1', color: 'white', border: 'none', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterExamination}
                        >
                            Enter Examination <i className="fa-solid fa-pen-to-square" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '1.75rem 2rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1.5px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Attendance Module</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Track daily attendance, view leaves, and monitor presence.</div>
                        </div>
                        <button
                            className="erp-btn"
                            style={{ background: '#14b8a6', color: 'white', border: 'none', fontWeight: 700, borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                            onClick={handleEnterAttendance}
                        >
                            Enter Attendance <i className="fa-solid fa-calendar-check" style={{ marginLeft: '0.5rem' }}></i>
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button
                        style={{
                            background: 'transparent', border: 'none', color: '#94a3b8',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 auto'
                        }}
                        onClick={handleLogout}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <i className="fa-solid fa-right-from-bracket"></i> Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
