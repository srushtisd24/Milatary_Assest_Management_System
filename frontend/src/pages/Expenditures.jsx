import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Expenditures = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [formData, setFormData] = useState({ equipmentTypeId: 1, quantity: 1, reason: 'Damaged', remarks: '' });
  const user = AuthService.getCurrentUser();
  const canAdd = user && user.role && (user.role.includes('ADMIN') || user.role.includes('LOGISTICS') || user.role.includes('COMMANDER'));

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/expenditures', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExpenditures(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching expenditures:', error);
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
    fetchExpenditures();
    fetchEquipmentTypes();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newExpenditure = {
        equipmentType: { id: parseInt(formData.equipmentTypeId) },
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        remarks: formData.remarks,
        expenditureDate: new Date().toISOString().split('T')[0],
        base: { id: user.baseId },
        recordedBy: { id: user.id }
      };
      
      const response = await axios.post('http://localhost:8080/api/expenditures', newExpenditure, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setExpenditures([...expenditures, response.data]);
      setShowModal(false);
      setFormData({ equipmentTypeId: 1, quantity: 1, reason: 'Damaged', remarks: '' });
    } catch (error) {
      console.error('Error creating expenditure:', error);
      alert(error.response?.data || 'Failed to record expenditure');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Expenditures</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-x-circle me-2"></i>Record Expenditure
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : expenditures.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No expenditures found.</td></tr>
              ) : (
                expenditures.map(e => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.equipmentType?.name || 'N/A'}</td>
                    <td className="fw-bold">{e.quantity}</td>
                    <td>{e.expenditureDate}</td>
                    <td><span className="badge bg-danger">{e.reason}</span></td>
                    <td>{e.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Record Expenditure</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
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
              <Form.Control type="number" placeholder="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="1" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Select value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Consumed">Consumed</option>
                <option value="Decommissioned">Decommissioned</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control as="textarea" rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit}>Expend Asset</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Expenditures;
