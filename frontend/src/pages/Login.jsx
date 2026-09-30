import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/auth.service';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await AuthService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: '#fff'
      }}>
        <div className="text-center mb-5">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
            transform: 'rotate(-5deg)'
          }}>
            <i className="bi bi-shield-check" style={{ fontSize: '2.5rem', color: '#fff', transform: 'rotate(5deg)' }}></i>
          </div>
          <h2 className="fw-bold m-0" style={{ letterSpacing: '1px' }}>MILITARY OPS</h2>
          <p className="text-muted mt-2" style={{ color: 'rgba(255, 255, 255, 0.6) !important' }}>Asset Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: '10px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '0.8rem 1rem',
                borderRadius: '10px'
              }}
            />
          </div>
          <div className="mb-5">
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
            <input 
              type="password" 
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '0.8rem 1rem',
                borderRadius: '10px'
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn w-100 fw-bold"
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Authenticate Identity
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
