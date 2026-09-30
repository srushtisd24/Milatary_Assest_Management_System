import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [formData, setFormData] = useState({ personnelId: '', quantity: 1, equipmentTypeId: 1 });
  const user = AuthService.getCurrentUser();
  const canAdd = user && user.role && (user.role.includes('ADMIN') || user.role.includes('COMMANDER'));

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/assignments', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAssignments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setLoading(false);
      }
    };
    const fetchEquipmentTypes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/equipment-types', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setEquipmentTypes(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, equipmentTypeId: response.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching equipment types:', error);
      }
    };
    fetchAssignments();
    fetchEquipmentTypes();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newAssignment = {
        personnelId: formData.personnelId,
        quantity: parseInt(formData.quantity),
        assignmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        base: { id: user.baseId },
        equipmentType: { id: parseInt(formData.equipmentTypeId) },
        assignedBy: { id: user.id }
      };
      
      const response = await axios.post('http://localhost:8080/api/assignments', newAssignment, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setAssignments([...assignments, response.data]);
      setShowModal(false);
      setFormData({ personnelId: '', quantity: 1, equipmentTypeId: 1 });
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(error.response?.data || 'Failed to create assignment');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Assignments</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-2"></i>New Assignment
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Personnel ID</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No assignments found.</td></tr>
              ) : (
                assignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.personnelId}</td>
                    <td>{a.equipmentType?.name || 'N/A'}</td>
                    <td>{a.quantity}</td>
                    <td>{a.assignmentDate}</td>
                    <td><span className={`badge ${a.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>{a.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Equipment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Personnel ID / Name</Form.Label>
              <Form.Control type="text" placeholder="e.g. SOL-994" value={formData.personnelId} onChange={e => setFormData({...formData, personnelId: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Equipment Type</Form.Label>
              <Form.Select value={formData.equipmentTypeId} onChange={e => setFormData({...formData, equipmentTypeId: e.target.value})}>
                {equipmentTypes.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="1" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Assign</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Assignments;
