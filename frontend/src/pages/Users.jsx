import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', fullName: '', email: '', role: 'ROLE_LOGISTICS_OFFICER', password: '' });
  const currentUser = AuthService.getCurrentUser();
  const canAdd = currentUser && currentUser.role && currentUser.role.includes('ADMIN');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        active: true,
        base: { id: currentUser.baseId }
      };
      
      const response = await axios.post('http://localhost:8080/api/users', newUser, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      setUsers([...users, response.data]);
      setShowModal(false);
      setFormData({ username: '', fullName: '', email: '', role: 'ROLE_LOGISTICS_OFFICER', password: '' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data || 'Failed to add user');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Users</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-2"></i>Add User
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-info">{u.role.replace('ROLE_', '')}</span></td>
                    <td>
                      <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="ROLE_LOGISTICS_OFFICER">Logistics Officer</option>
                <option value="ROLE_BASE_COMMANDER">Base Commander</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Temporary Password</Form.Label>
              <Form.Control type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add User</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Users;
