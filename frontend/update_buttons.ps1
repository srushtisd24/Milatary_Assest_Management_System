$pagesDir = "d:/new project/military-asset-management/frontend/src/pages"

$purchases = @"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const user = AuthService.getCurrentUser();
  const canAdd = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_LOGISTICS_OFFICER';

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/purchases', {
          headers: { Authorization: \`Bearer \${user.token}\` }
        });
        setPurchases(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user.token]);

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
                    <td>\${p.totalCost}</td>
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control type="text" placeholder="PO-12345" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Purchases;
"@
Set-Content -Path "$pagesDir/Purchases.jsx" -Value $purchases -Encoding UTF8

$transfers = @"
import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Transfers = () => {
  const [showModal, setShowModal] = useState(false);
  const user = AuthService.getCurrentUser();
  const canAdd = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_LOGISTICS_OFFICER' || user.role === 'ROLE_BASE_COMMANDER';

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
      <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No transfers found.</div></div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Initiate Transfer</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Destination Base</Form.Label><Form.Control type="text" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Quantity</Form.Label><Form.Control type="number" /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>Transfer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Transfers;
"@
Set-Content -Path "$pagesDir/Transfers.jsx" -Value $transfers -Encoding UTF8

$assignments = @"
import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Assignments = () => {
  const [showModal, setShowModal] = useState(false);
  const user = AuthService.getCurrentUser();
  const canAdd = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_BASE_COMMANDER';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Assignments</h2>
        {canAdd && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2"></i>New Assignment
          </button>
        )}
      </div>
      <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No assignments found.</div></div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Assign Equipment</Modal.Title></Modal.Header>
        <Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Personnel ID</Form.Label><Form.Control type="text" /></Form.Group></Form></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={() => setShowModal(false)}>Assign</Button></Modal.Footer>
      </Modal>
    </div>
  );
};
export default Assignments;
"@
Set-Content -Path "$pagesDir/Assignments.jsx" -Value $assignments -Encoding UTF8

$expenditures = @"
import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Expenditures = () => {
  const [showModal, setShowModal] = useState(false);
  const user = AuthService.getCurrentUser();
  const canAdd = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_LOGISTICS_OFFICER';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Expenditures</h2>
        {canAdd && (
          <button className="btn btn-danger" onClick={() => setShowModal(true)}>
            <i className="bi bi-dash-circle me-2"></i>Record Expenditure
          </button>
        )}
      </div>
      <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No expenditures found.</div></div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Record Expenditure</Modal.Title></Modal.Header>
        <Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Reason</Form.Label><Form.Control as="textarea" rows={3} /></Form.Group></Form></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="danger" onClick={() => setShowModal(false)}>Record</Button></Modal.Footer>
      </Modal>
    </div>
  );
};
export default Expenditures;
"@
Set-Content -Path "$pagesDir/Expenditures.jsx" -Value $expenditures -Encoding UTF8

$users = @"
import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import { Modal, Button, Form } from 'react-bootstrap';

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const user = AuthService.getCurrentUser();
  const canAdd = user.role === 'ROLE_ADMIN';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Users Management</h2>
        {canAdd && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2"></i>Add User
          </button>
        )}
      </div>
      <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">System users list.</div></div>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Add New User</Modal.Title></Modal.Header>
        <Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" /></Form.Group></Form></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={() => setShowModal(false)}>Add</Button></Modal.Footer>
      </Modal>
    </div>
  );
};
export default Users;
"@
Set-Content -Path "$pagesDir/Users.jsx" -Value $users -Encoding UTF8

Write-Host "Modals and RBAC applied!"
