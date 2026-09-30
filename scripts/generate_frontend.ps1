$baseDir = "d:/new project/military-asset-management/frontend/src"

New-Item -ItemType Directory -Force -Path "$baseDir/components"
New-Item -ItemType Directory -Force -Path "$baseDir/pages"
New-Item -ItemType Directory -Force -Path "$baseDir/services"

$authService = @"
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + 'login', { username, password })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService();
"@
Set-Content -Path "$baseDir/services/auth.service.js" -Value $authService -Encoding UTF8

$appJs = @"
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthService from './services/auth.service';

const PrivateRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        {/* We will add more routes here later */}
      </Routes>
    </Router>
  );
}

export default App;
"@
Set-Content -Path "$baseDir/App.jsx" -Value $appJs -Encoding UTF8

$loginPage = @"
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage('');
    
    AuthService.login(username, password).then(
      () => {
        navigate('/');
        window.location.reload();
      },
      (error) => {
        const resMessage =
          (error.response && error.response.data) || error.message || error.toString();
        setMessage(resMessage);
      }
    );
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="card login-card shadow">
        <div className="card-body p-5">
          <h2 className="text-center mb-4">Military Logistics</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-4">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-primary btn-block" type="submit">
                Login
              </button>
            </div>
            {message && (
              <div className="alert alert-danger mt-3" role="alert">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
"@
Set-Content -Path "$baseDir/pages/Login.jsx" -Value $loginPage -Encoding UTF8

$loginCss = @"
.login-container {
  height: 100vh;
  background-color: #f4f6f9;
}
.login-card {
  width: 100%;
  max-width: 400px;
  border: none;
  border-radius: 10px;
}
"@
Set-Content -Path "$baseDir/pages/Login.css" -Value $loginCss -Encoding UTF8

$dashboardPage = @"
import React from 'react';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const currentUser = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Asset Dashboard</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
      <div className="alert alert-info">
        <strong>Welcome, {currentUser.username}!</strong> 
        <br />
        Role: {currentUser.role}
        <br />
        Base ID: {currentUser.baseId}
      </div>
    </div>
  );
};

export default Dashboard;
"@
Set-Content -Path "$baseDir/pages/Dashboard.jsx" -Value $dashboardPage -Encoding UTF8

$mainJsx = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@
Set-Content -Path "$baseDir/main.jsx" -Value $mainJsx -Encoding UTF8

Write-Host "Frontend Logic generated."
