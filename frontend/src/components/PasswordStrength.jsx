export default function PasswordStrength({ password }) {
    const getStrength = (pw) => {
        let score = 0;
        if (!pw) return { score: 0, label: '', color: '' };
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
        if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
        if (score <= 3) return { score: 3, label: 'Good', color: '#eab308' };
        if (score <= 4) return { score: 4, label: 'Strong', color: '#10b981' };
        return { score: 5, label: 'Excellent', color: '#06d6a0' };
    };

    const strength = getStrength(password);
    if (!password) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '4px',
                            background: i <= strength.score ? strength.color : 'var(--erp-border)',
                            boxShadow: i <= strength.score ? `0 0 10px ${strength.color}44` : 'none',
                            transition: 'all 0.4s ease'
                        }}
                    />
                ))}
            </div>
            <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: strength.color,
                minWidth: '60px',
                textAlign: 'right'
            }}>
                {strength.label}
            </span>
        </div>
    );
}
