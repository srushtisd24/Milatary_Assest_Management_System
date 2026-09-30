import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.role?.includes('ADMIN');
  const isCommander = currentUser?.role?.includes('COMMANDER');
  const isLogistics = currentUser?.role?.includes('LOGISTICS');

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="bg-dark text-white p-3" style={{ width: '250px', position: 'fixed', height: '100vh' }}>
        <h4 className="text-primary fw-bold mb-4 mt-2">MILITARY OPS</h4>
        <div className="nav flex-column gap-2 mt-4">
          <Link to="/dashboard" className={`nav-link text-white rounded ${location.pathname === '/dashboard' ? 'bg-primary' : ''}`}>
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
          <Link to="/inventory" className={`nav-link text-white rounded ${location.pathname === '/inventory' ? 'bg-primary' : ''}`}>
            <i className="bi bi-box-seam me-2"></i> Inventory
          </Link>
          <Link to="/purchases" className={`nav-link text-white rounded ${location.pathname === '/purchases' ? 'bg-primary' : ''}`}>
            <i className="bi bi-cart me-2"></i> Purchases
          </Link>
          <Link to="/transfers" className={`nav-link text-white rounded ${location.pathname === '/transfers' ? 'bg-primary' : ''}`}>
            <i className="bi bi-arrow-left-right me-2"></i> Transfers
          </Link>

          {(isAdmin || isCommander) && (
            <>
              <Link to="/assignments" className={`nav-link text-white rounded ${location.pathname === '/assignments' ? 'bg-primary' : ''}`}>
                <i className="bi bi-person-badge me-2"></i> Assignments
              </Link>
              <Link to="/expenditures" className={`nav-link text-white rounded ${location.pathname === '/expenditures' ? 'bg-primary' : ''}`}>
                <i className="bi bi-dash-circle me-2"></i> Expenditures
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <hr className="bg-secondary" />
              <Link to="/audit-logs" className={`nav-link text-white rounded ${location.pathname === '/audit-logs' ? 'bg-primary' : ''}`}>
                <i className="bi bi-journal-text me-2"></i> Audit Logs
              </Link>
              <Link to="/users" className={`nav-link text-white rounded ${location.pathname === '/users' ? 'bg-primary' : ''}`}>
                <i className="bi bi-people me-2"></i> Users
              </Link>
              <Link to="/settings" className={`nav-link text-white rounded ${location.pathname === '/settings' ? 'bg-primary' : ''}`}>
                <i className="bi bi-gear me-2"></i> Settings
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ marginLeft: '250px', width: '100%' }}>
        <nav className="navbar navbar-light bg-white border-bottom px-4 shadow-sm py-3">
          <span className="navbar-brand mb-0 h1 fs-5 text-secondary">Asset Management Portal</span>
          {currentUser && (
            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="fw-bold">{currentUser.username}</div>
                <div className="text-muted small">{currentUser.role} | Base: {currentUser.baseId}</div>
              </div>
              <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
        <div className="p-4" style={{ maxWidth: '1200px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;
