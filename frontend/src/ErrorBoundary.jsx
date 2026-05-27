import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('App crashed:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh',
                    background: '#0f172a', color: '#f8fafc', fontFamily: 'Outfit, sans-serif', padding: '2rem', textAlign: 'center'
                }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
                    <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#f87171', maxWidth: '90vw', overflow: 'auto', marginTop: '1rem' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }}
                        style={{ marginTop: '2rem', padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Clear Session & Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
