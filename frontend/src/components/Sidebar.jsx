import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">PVG Portal</div>
      
      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        
        {(role === 'admin' || role === 'vice_principal') && (
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">👥</span> Users
          </NavLink>
        )}
        
        {role === 'admin' && (
          <NavLink to="/admin/roles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="icon">🛡️</span> RBAC
          </NavLink>
        )}
        
        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="icon">⚙️</span> Settings
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item" onClick={() => navigate('/welcome')}>
           <span className="icon">🏠</span> Main App
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ color: '#fb7185' }}>
          <span className="icon">🚪</span> Logout
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
