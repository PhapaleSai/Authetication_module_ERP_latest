export const SUPER_ADMIN_ROLES = ['admin', 'vice_principal'];
export const ADMIN_ROLES = ['admin', 'vice_principal', 'hod', 'principal', 'it admins', 'principals & vice principals'];
export const STAFF_ROLES = ['principal', 'vice principal', 'hod', 'accountant', 'it admins', 'principals & vice principals', 'teaching staff', 'non-teaching staff', 'accountants', 'teacher'];

export const getModuleURL = (type) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Fallback to local ports if env vars are missing during local development
    if (type === 'ADMISSION') return import.meta.env.VITE_ADMISSION_URL || (isLocal ? 'http://localhost:3000' : '');
    if (type === 'SIS') return import.meta.env.VITE_SIS_URL || (isLocal ? 'http://localhost:5174' : '');
    if (type === 'FEES') return import.meta.env.VITE_FEES_URL || (isLocal ? 'http://localhost:5176' : '');
    if (type === 'PLACEMENT') return import.meta.env.VITE_PLACEMENT_URL || (isLocal ? 'http://localhost:5177' : '');
    if (type === 'TIMETABLE') return import.meta.env.VITE_TIMETABLE_URL || (isLocal ? 'http://localhost:5178' : '');
    if (type === 'NOTIFICATION') return import.meta.env.VITE_NOTIFICATION_URL || (isLocal ? 'http://localhost:5179' : '');
    if (type === 'ALUMNI') return import.meta.env.VITE_ALUMNI_URL || (isLocal ? 'http://localhost:5180' : '');
    if (type === 'ACADEMIC') return import.meta.env.VITE_ACADEMIC_URL || (isLocal ? 'http://localhost:5181' : '');
    if (type === 'FEEDBACK') return import.meta.env.VITE_FEEDBACK_URL || (isLocal ? 'http://localhost:5182' : '');
    if (type === 'EXAMINATION') return import.meta.env.VITE_EXAMINATION_URL || (isLocal ? 'http://localhost:5183' : '');
    if (type === 'ATTENDANCE') return import.meta.env.VITE_ATTENDANCE_URL || (isLocal ? 'http://localhost:5184' : '');
    
    return '';
};
