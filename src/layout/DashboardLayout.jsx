import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Calculator, LogOut, Factory, Box, Database, Hammer, Zap, Layout } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', padding: '1.5rem', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', color: 'var(--text-primary)' }}>
          <Factory size={28} color="var(--accent-color)" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Shoeco Cost</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <NavLink 
            to="/estimation" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Calculator size={20} />
            Cost Estimation
          </NavLink>
          <NavLink 
            to="/raw-materials" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Database size={20} />
            Raw Materials
          </NavLink>
          <NavLink 
            to="/variants" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Layout size={20} />
            Shoe Models
          </NavLink>
          <NavLink 
            to="/cost-config" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Box size={20} />
            Cost Config
          </NavLink>
          <NavLink 
            to="/manpower" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Hammer size={20} />
            Manpower Rates
          </NavLink>
          <NavLink 
            to="/utilities" 
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: '500'
            })}
          >
            <Zap size={20} />
            Utility Rates
          </NavLink>

        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', color: 'var(--text-secondary)', backgroundColor: 'transparent', textAlign: 'left' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.username || 'System User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email || 'admin@factory.com'}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(user.username || 'U').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
