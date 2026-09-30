import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/audit-logs', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setLogs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLoading(false);
      }
    };
    if (user && user.role?.includes('ADMIN')) {
        fetchLogs();
    } else {
        setLoading(false);
    }
  }, [user]);

  if (!user || !user.role?.includes('ADMIN')) return <div className="alert alert-danger mt-4">Access Denied: Only Admins can view Audit Logs.</div>;

  return (
    <div>
      <h2 className="fw-bold mb-4">Audit Logs</h2>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
          <table className="table table-hover table-striped m-0" style={{fontSize: '0.85rem'}}>
            <thead className="table-dark">
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Entity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No logs recorded.</td></tr>
              ) : (
                [...logs].reverse().map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user?.username || 'System'}</td>
                    <td><span className={`badge ${log.httpMethod === 'POST' ? 'bg-primary' : 'bg-secondary'}`}>{log.httpMethod}</span></td>
                    <td>{log.apiEndpoint}</td>
                    <td>{log.entityType}</td>
                    <td><span className={`badge ${log.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}>{log.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
