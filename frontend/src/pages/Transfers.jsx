import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [bases, setBases] = useState([]);
  const user = AuthService.getCurrentUser();
  const [formData, setFormData] = useState({ equipmentTypeId: 1, fromBaseId: user?.baseId || 1, toBaseId: 1, quantity: 1, remarks: '' });
  const canAdd = user && user.role && (user.role.includes('ADMIN') || user.role.includes('LOGISTICS') || user.role.includes('COMMANDER'));

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/transfers', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setTransfers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transfers:', error);
        setLoading(false);
      }
    };
    const fetchData = async () => {
      try {
        const [eqRes, baseRes] = await Promise.all([
          axios.get('http://localhost:8080/api/equipment-types', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:8080/api/bases', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setEquipmentTypes(eqRes.data);
        setBases(baseRes.data);
        if (eqRes.data.length > 0 && baseRes.data.length > 0) {
          setFormData(prev => ({ ...prev, equipmentTypeId: eqRes.data[0].id, fromBaseId: user?.role?.includes('ADMIN') ? baseRes.data[0].id : user.baseId, toBaseId: baseRes.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchTransfers();
    fetchData();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.fromBaseId) === parseInt(formData.toBaseId)) {
      alert("Source and destination base cannot be the same.");
      return;
    }
    try {
      const newTransfer = {
        equipmentType: { id: parseInt(formData.equipmentTypeId) },
        fromBase: { id: parseInt(formData.fromBaseId) },
        toBase: { id: parseInt(formData.toBaseId) },
        quantity: parseInt(formData.quantity),
        transferDate: new Date().toISOString().split('T')[0],
        remarks: formData.remarks,
        status: 'PENDING',
        initiatedBy: { id: user.id }
      };
      
      const response = await axios.post('http://localhost:8080/api/transfers', newTransfer, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setTransfers([...transfers, response.data]);
      setShowModal(false);
      setFormData({ equipmentTypeId: equipmentTypes.length ? equipmentTypes[0].id : 1, fromBaseId: user?.role?.includes('ADMIN') ? (bases.length ? bases[0].id : 1) : user.baseId, toBaseId: bases.length ? bases[0].id : 1, quantity: 1, remarks: '' });
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert(error.response?.data || 'Failed to initiate transfer');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Transfers</h2>
        {canAdd && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-arrow-left-right me-2"></i>Initiate Transfer
          </button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No transfers found.</td></tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.equipmentType?.name || 'N/A'}</td>
                    <td>{t.fromBase?.name || 'N/A'}</td>
                    <td>{t.toBase?.name || 'N/A'}</td>
                    <td>{t.quantity}</td>
                    <td>{t.transferDate}</td>
                    <td><span className={`badge ${t.status === 'COMPLETED' ? 'bg-success' : t.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{t.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Initiate Transfer</Modal.Title>
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
            
            {user && user.role?.includes('ADMIN') && (
              <Form.Group className="mb-3">
                <Form.Label>From Base</Form.Label>
                <Form.Select value={formData.fromBaseId} onChange={e => setFormData({...formData, fromBaseId: e.target.value})}>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>To Base</Form.Label>
              <Form.Select value={formData.toBaseId} onChange={e => setFormData({...formData, toBaseId: e.target.value})}>
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="1" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Transfer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Transfers;
