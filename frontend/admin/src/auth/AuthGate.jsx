import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api';

const AuthGate = ({ children, allowedRoles = [] }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthorized(false);
                return;
            }
            try {
                // Call our own backend to verify JWT and get roles
                const res = await api.get('/auth/me');
                const userRole = res.data.role?.toLowerCase();
                
                if (allowedRoles.length === 0) {
                    setIsAuthorized(true); // No specific roles required, just needs to be logged in
                } else if (allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false); // Valid token, but wrong role
                }
            } catch (err) {
                // Token invalid or expired
                setIsAuthorized(false);
                localStorage.removeItem('token');
            }
        };

        verifyAuth();
    }, [allowedRoles, location.pathname]);

    if (isAuthorized === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
                <div style={{ color: 'white', fontSize: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Verifying Credentials...
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        // Encode the current path so the login page can redirect back after successful auth
        const currentUrl = encodeURIComponent(window.location.href);
        // We use window.location.href instead of Navigate to fully reset the app state and hit the Auth portal correctly
        window.location.href = `/login?redirect_uri=${currentUrl}`;
        return null;
    }

    return children;
};

export default AuthGate;
