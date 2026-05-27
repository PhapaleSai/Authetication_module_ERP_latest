import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ username: '', password: '' });

    // Set registered details if redirected from signup page
    useEffect(() => {
        if (location.state?.email) {
            setForm({
                username: location.state.email,
                password: location.state.password || ''
            });
        }
    }, [location.state]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-login if token exists
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const params = new URLSearchParams(window.location.search);
    const redirectUri = params.get('redirect_uri');

    useEffect(() => {
        // Auto-forwarding: If user is already logged in, seamlessly forward them!
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/users/me')
                .then((res) => {
                    const user = res.data;
                    if (redirectUri) {
                        const emailParam = encodeURIComponent(user.email || "");
                        const phoneParam = encodeURIComponent(user.phone || user.mobile || user.phone_number || user.mobile_number || "");
                        window.location.href = `${redirectUri}?user_id=${user.user_id}&name=${encodeURIComponent(user.full_name)}&role=${encodeURIComponent(user.role)}&email=${emailParam}&phone=${phoneParam}`;
                    } else {
                        const role = user.role?.toLowerCase() || '';
                        const staffRoles = ['admin', 'principal', 'vice principal', 'hod', 'accountant', 'it admins', 'principals & vice principals', 'teaching staff', 'non-teaching staff', 'accountants', 'teacher'];
                        
                        if (false) {
                            // Dummy block to maintain structure if needed, or just remove
                        } else {
                            navigate('/welcome');
                        }
                    }
                })
                .catch(() => {
                    // Token is invalid/expired, stay on login page
                    localStorage.removeItem('token');
                });
        }
    }, [navigate, redirectUri]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', form.username);
            formData.append('password', form.password);

            const res = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            localStorage.setItem('token', res.data.access_token);

            // Step 2: Automatic Redirect to the Admission Module if redirectUri exists
            // EXCEPTION: Primary 'admin' always stays in the Auth Portal first
            if (redirectUri && res.data.role?.toLowerCase() !== 'admin') {
                // Normalize role for external modules
                let targetRole = res.data.role;
                const adminRoles = ['admin', 'it admins', 'principal', 'principals & vice principals', 'hod'];
                if (adminRoles.includes(res.data.role?.toLowerCase())) {
                    targetRole = 'admin';
                }
                const emailParam = encodeURIComponent(res.data.email || "");
                const phoneParam = encodeURIComponent(res.data.phone || res.data.mobile || res.data.phone_number || res.data.mobile_number || "");
                window.location.href = `${redirectUri}?user_id=${res.data.user_id}&name=${encodeURIComponent(res.data.full_name)}&role=${targetRole}&email=${emailParam}&phone=${phoneParam}`;
            } else {
                const role = res.data.role?.toLowerCase() || '';
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
                    window.location.href = `${getModuleURL('FEES')}/admin?token=${res.data.access_token}&user_id=${res.data.user_id}&role=admin&name=${encodeURIComponent(res.data.full_name)}`;
                } else {
                    // Rule: Students/Users land on local welcome page
                    navigate('/welcome', { state: { user: res.data } });
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
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
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Security Credentials</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-key" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px', color: '#0f172a' }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                height: '56px',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'var(--erp-primary)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            disabled={loading}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Secure Sign In'}
                        </button>
                    </form>

                    <div className="divider" style={{
                        margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem',
                        color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        <span>Access Gateway</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                    </div>

                    <div className="switch-link" style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                        Don't have an account? {' '}
                        <Link to="/signup" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Create one here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
