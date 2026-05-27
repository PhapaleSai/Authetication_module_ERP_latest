import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Set registered details if redirected from signup page
    useEffect(() => {
        if (location.state?.email) {
            setCredentials({
                username: location.state.email,
                password: location.state.password || ''
            });
        }
    }, [location.state]);
    const { setUser } = useAuth();


    const params = new URLSearchParams(window.location.search);
    const redirectUri = params.get('redirect_uri');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        try {
            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const data = response.data;

            // Store token in localStorage
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
                user_id: data.user_id,
                username: data.username,
                full_name: data.full_name,
                email: data.email || '',
                role: data.role,
                permissions: data.permissions || [],
            }));

            // Step 2: Automatic Redirect to the calling Module if redirectUri exists
            // EXCEPTION: Primary 'admin' always stays in the Auth Portal first
            if (redirectUri && data.role?.toLowerCase() !== 'admin') {
                // Normalize role for external modules (Admission/SIS/Fees)
                let targetRole = data.role;
                const adminRoles = ['admin', 'it admins', 'principal', 'principals & vice principals', 'hod'];
                if (adminRoles.includes(data.role?.toLowerCase())) {
                    targetRole = 'admin';
                }
                const emailParam = encodeURIComponent(data.email || "");
                const phoneParam = encodeURIComponent(data.phone || data.mobile || data.phone_number || data.mobile_number || "");
                window.location.href = `${redirectUri}?user_id=${data.user_id}&name=${encodeURIComponent(data.full_name)}&role=${targetRole}&email=${emailParam}&phone=${phoneParam}`;
            } else {
                // Unified Role-based Redirect
                const role = data.role?.toLowerCase() || '';
                const staffRoles = ['principal', 'vice principal', 'hod', 'accountant', 'it admins', 'principals & vice principals', 'teaching staff', 'non-teaching staff', 'accountants', 'teacher'];
                
                const getModuleURL = (type) => {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    if (isLocal) {
                        if (type === 'SIS') return 'http://localhost:5174';
                        if (type === 'FEES') return 'http://localhost:5176';
                        if (type === 'ADMISSION') return 'http://localhost:3000';
                    }
                    if (type === 'SIS') return import.meta.env.VITE_SIS_URL;
                    if (type === 'FEES') return import.meta.env.VITE_FEES_URL;
                    if (type === 'ADMISSION') return import.meta.env.VITE_ADMISSION_URL;
                    return '';
                };

                if (role === 'fees admin') {
                    // Rule 4: Fees Admin teleportation (with SSO Token)
                    window.location.href = `${getModuleURL('FEES')}/admin?token=${data.access_token}&user_id=${data.user_id}&role=admin&name=${encodeURIComponent(data.full_name)}`;
                } else if (role === 'student' || role === 'students') {
                    // Rule: Students land on local profile/dashboard for now (SIS redirection disabled)
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-auth-page">
            <div className="erp-auth-page__brand">
                <div style={{ 
                    width: '180px', 
                    height: '180px', 
                    background: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '4px solid rgba(255,255,255,0.1)',
                    zIndex: 2
                }}>
                    <img 
                        src="/assets/pvg_logo.png" 
                        alt="PVG Logo" 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                        }} 
                    />
                </div>
                <div style={{ zIndex: 2, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Portal.</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.7, marginTop: '1rem', fontWeight: 300, maxWidth: '300px' }}>
                        Unified Student & Applicant Gateway for PVG College of Science
                    </p>
                </div>
                
                <div style={{ position: 'absolute', bottom: '3rem', opacity: 0.3, fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em' }}>
                    &copy; {new Date().getFullYear()} PUNE VIDYARTHI GRIHA
                </div>
            </div>

            <div className="erp-auth-page__form">
                <div className="erp-auth-box animate-premium" style={{ animationDelay: '0.1s' }}>
                    <div className="erp-auth-box__header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Welcome Back</h2>
                        <p style={{ marginTop: '0.5rem', opacity: 0.6, color: '#64748b' }}>Access your academic and admission profile</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#ef4444', padding: '1rem',
                            borderRadius: '12px', marginBottom: '2rem', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
                            border: '1px solid rgba(239, 68, 68, 0.1)'
                        }} className="animate-premium">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="username" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>REGISTERED EMAIL-ID</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="username"
                                    type="email"
                                    name="username"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px', color: '#0f172a' }}
                                    placeholder="Your registered email address"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Secret Key</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-fingerprint" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', paddingRight: '3.2rem', height: '56px', borderRadius: '16px', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                                    placeholder="•••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: 0.5,
                                        color: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 0
                                    }}
                                >
                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '1.1rem' }}></i>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="erp-btn erp-btn--primary erp-btn--lg glow-btn" 
                            style={{ 
                                width: '100%', 
                                marginTop: '1.5rem', 
                                height: '56px', 
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'var(--erp-primary)',
                                color: 'white'
                            }} 
                            disabled={loading}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Authenticate Account'}
                        </button>
                    </form>

                    <div className="erp-auth-box__footer" style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
                        <span style={{ opacity: 0.6 }}>New to the portal?</span> {' '}
                        <Link to="/signup" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
