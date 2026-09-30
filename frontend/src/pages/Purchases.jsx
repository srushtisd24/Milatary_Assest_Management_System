import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [formData, setFormData] = useState({ referenceNumber: '', quantity: 0, equipmentTypeId: 1, supplier: '', totalCost: 0 });
  const user = AuthService.getCurrentUser();
  const canAdd = user && user.role && (user.role.includes('ADMIN') || user.role.includes('LOGISTICS'));

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/purchases', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPurchases(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching purchases:', error);
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
    fetchPurchases();
    fetchEquipmentTypes();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPurchase = {
        referenceNumber: formData.referenceNumber,
        quantity: parseInt(formData.quantity),
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: formData.supplier,
        totalCost: parseFloat(formData.totalCost),
        base: { id: user.baseId },
        equipmentType: { id: parseInt(formData.equipmentTypeId) },
        createdBy: { id: user.id }
      };
      
      const response = await axios.post('http://localhost:8080/api/purchases', newPurchase, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setPurchases([...purchases, response.data]);
      setShowModal(false);
      setFormData({ referenceNumber: '', quantity: 0, equipmentTypeId: 1, supplier: '', totalCost: 0 });
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to save purchase');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Purchases</h2>
        {canAdd && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>New Purchase
          </button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Reference #</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Date</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No purchases found.</td></tr>
              ) : (
                purchases.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.referenceNumber}</td>
                    <td>{p.equipmentType?.name || 'N/A'}</td>
                    <td>{p.quantity}</td>
                    <td>₹{p.totalCost || 0}</td>
                    <td>{p.purchaseDate}</td>
                    <td>{p.supplier}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control type="text" placeholder="PO-12345" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} required />
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
            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Control type="text" placeholder="Supplier Name" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Cost (₹)</Form.Label>
              <Form.Control type="number" step="0.01" placeholder="0.00" value={formData.totalCost} onChange={e => setFormData({...formData, totalCost: e.target.value})} required min="0" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Purchases;
