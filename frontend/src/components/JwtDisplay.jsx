export default function JwtDisplay({ token }) {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return <span style={{ fontFamily: 'var(--erp-font-mono)', fontSize: '0.85rem', opacity: 0.8 }}>{token}</span>;

    const colors = {
        header: '#ef4444',  // Ruby red
        payload: '#8b5cf6',  // Violet
        signature: '#06b6d4',  // Cyan
    };

    const labels = ['Header', 'Payload', 'Signature'];

    return (
        <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                {labels.map((label, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: Object.values(colors)[i], boxShadow: `0 0 10px ${Object.values(colors)[i]}44` }} />
                        <span style={{ color: Object.values(colors)[i] }}>{label}</span>
                    </div>
                ))}
            </div>
            <div style={{ 
                background: 'rgba(0,0,0,0.4)', 
                border: '1px solid var(--erp-border)', 
                borderRadius: '12px', 
                padding: '1.25rem', 
                fontFamily: 'var(--erp-font-mono)', 
                fontSize: '0.75rem', 
                lineHeight: 1.6, 
                wordBreak: 'break-all',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <span style={{ color: colors.header }}>{parts[0]}</span>
                <span style={{ color: 'var(--erp-text-muted)', margin: '0 2px' }}>.</span>
                <span style={{ color: colors.payload }}>{parts[1]}</span>
                <span style={{ color: 'var(--erp-text-muted)', margin: '0 2px' }}>.</span>
                <span style={{ color: colors.signature }}>{parts[2]}</span>
            </div>
        </div>
    );
}
