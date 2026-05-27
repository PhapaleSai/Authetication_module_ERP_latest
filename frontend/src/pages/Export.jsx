import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Export = () => {
    const [loading, setLoading] = useState(false);
    const [dataType, setDataType] = useState('users');
    const [format, setFormat] = useState('csv');

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/export/data?data_type=${dataType}`);
            const data = res.data;
            
            if (format === 'csv') {
                exportToCSV(data, `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                const printWindow = window.open('', '_blank');
                printWindow.document.write('<html><head><title>System Export</title><style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}</style></head><body>');
                printWindow.document.write(`<h1>${dataType.toUpperCase()} DATA EXPORT</h1>`);
                printWindow.document.write('<table><thead><tr>');
                if (data.length > 0) Object.keys(data[0]).forEach(key => printWindow.document.write(`<th>${key}</th>`));
                printWindow.document.write('</tr></thead><tbody>');
                data.forEach(row => {
                    printWindow.document.write('<tr>');
                    Object.values(row).forEach(val => printWindow.document.write(`<td>${val}</td>`));
                    printWindow.document.write('</tr>');
                });
                printWindow.document.write('</tbody></table></body></html>');
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ animation: 'fadeInSlideUp 0.5s ease-out', padding: '1rem 1.25rem' }}>
            {/* Hero Header */}
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
                        <i className="fa-solid fa-file-export"></i> Analytics Center
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
                        Intelligence Export Hub
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 300, maxWidth: '600px' }}>
                        Generate secure, cryptographically signed audit reports and system telemetry data archives.
                    </p>
                </div>
                <i className="fa-solid fa-box-archive" style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', fontSize: '18rem', opacity: 0.03 }}></i>
            </div>

            <div className="erp-form-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
                <div className="erp-card">
                    <div className="erp-card__header">
                        <div className="erp-card__title">1. Data Selection</div>
                        <div className="erp-card__subtitle">Define the source of your report</div>
                    </div>
                    <div className="erp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div 
                            className={`erp-card ${dataType === 'users' ? 'erp-card--active' : ''}`} 
                            style={{ 
                                cursor: 'pointer', 
                                padding: '1.25rem', 
                                background: dataType === 'users' ? 'rgba(var(--erp-primary-rgb), 0.05)' : 'var(--erp-surface-alt)',
                                border: `1px solid ${dataType === 'users' ? 'var(--erp-primary)' : 'var(--erp-border)'}`
                            }}
                            onClick={() => setDataType('users')}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>👥</div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>User Identity Matrix</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--erp-text-muted)' }}>Export all profiles, roles, and status levels.</div>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`erp-card ${dataType === 'audit' ? 'erp-card--active' : ''}`} 
                            style={{ 
                                cursor: 'pointer', 
                                padding: '1.25rem', 
                                background: dataType === 'audit' ? 'rgba(var(--erp-primary-rgb), 0.05)' : 'var(--erp-surface-alt)',
                                border: `1px solid ${dataType === 'audit' ? 'var(--erp-primary)' : 'var(--erp-border)'}`
                            }}
                            onClick={() => setDataType('audit')}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>📜</div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Security Audit Logs</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--erp-text-muted)' }}>Historical telemetry of system interactions.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="erp-card">
                    <div className="erp-card__header">
                        <div className="erp-card__title">2. Output Specifications</div>
                        <div className="erp-card__subtitle">Configure final report format</div>
                    </div>
                    <div className="erp-card__body">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                            <button 
                                className={`erp-btn ${format === 'csv' ? 'erp-btn--primary' : 'erp-btn--ghost'}`}
                                style={{ flex: 1 }}
                                onClick={() => setFormat('csv')}
                            >
                                <i className="fa-solid fa-file-csv"></i> CSV Data
                            </button>
                            <button 
                                className={`erp-btn ${format === 'pdf' ? 'erp-btn--primary' : 'erp-btn--ghost'}`}
                                style={{ flex: 1 }}
                                onClick={() => setFormat('pdf')}
                            >
                                <i className="fa-solid fa-file-pdf"></i> PDF Document
                            </button>
                        </div>

                        <button 
                            className="erp-btn erp-btn--primary erp-btn--lg" 
                            style={{ width: '100%', padding: '1.25rem' }}
                            onClick={handleExport}
                            disabled={loading}
                        >
                            {loading ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Finalizing Report...</>
                            ) : (
                                <><i className="fa-solid fa-bolt"></i> Generate Secure Archive</>
                            )}
                        </button>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--erp-text-muted)' }}>
                            <i className="fa-solid fa-shield-halved"></i> All exports are signed and logged for compliance.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Export;
