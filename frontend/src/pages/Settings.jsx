import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { Card, Button, Form, Nav, Row, Col } from 'react-bootstrap';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const user = AuthService.getCurrentUser();
  const token = user?.token;

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Military Asset Management System',
    organizationName: 'Department of Defense',
    defaultCurrency: 'INR (₹)',
    theme: 'Light',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour (AM/PM)',
    timezone: 'Eastern Time (ET)',
    emailNotifications: true
  });

  // Asset Types State
  const [assetTypes, setAssetTypes] = useState([]);
  const [newAssetType, setNewAssetType] = useState('');

  // Bases State
  const [bases, setBases] = useState([]);
  const [newBase, setNewBase] = useState('');

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    version: '1.0.0',
    lastUpdated: '8/7/2025',
    dbStatus: 'Connected',
    apiStatus: 'Operational'
  });

  useEffect(() => {
    // Load local storage settings
    const storedGeneral = localStorage.getItem('generalSettings');
    if (storedGeneral) setGeneralSettings(JSON.parse(storedGeneral));

    const storedSystem = localStorage.getItem('systemSettings');
    if (storedSystem) setSystemSettings(JSON.parse(storedSystem));

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eqRes, basesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/equipment-types', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:8080/api/bases', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAssetTypes(eqRes.data);
      setBases(basesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSaveGeneral = () => {
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
    
    // Apply theme globally
    if (generalSettings.theme === 'Dark') {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else if (generalSettings.theme === 'Light') {
      document.documentElement.setAttribute('data-bs-theme', 'light');
    } else {
      // System Default
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
      }
    }
  };

  const handleToggleMaintenance = () => {
    const updated = { ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode };
    setSystemSettings(updated);
    localStorage.setItem('systemSettings', JSON.stringify(updated));
  };

  const handleAddAssetType = async () => {
    if (!newAssetType) return;
    try {
      const response = await axios.post('http://localhost:8080/api/equipment-types', 
        { name: newAssetType, category: 'General', description: '', active: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssetTypes([...assetTypes, response.data]);
      setNewAssetType('');
    } catch (error) {
      alert('Error adding asset type');
    }
  };

  const handleRemoveAssetType = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/equipment-types/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAssetTypes(assetTypes.filter(a => a.id !== id));
    } catch (error) {
      alert(error.response?.data || 'Error removing asset type');
    }
  };

  const handleAddBase = async () => {
    if (!newBase) return;
    try {
      const response = await axios.post('http://localhost:8080/api/bases', 
        { name: newBase, code: newBase.substring(0,3).toUpperCase(), location: 'Unknown', active: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBases([...bases, response.data]);
      setNewBase('');
    } catch (error) {
      alert('Error adding base');
    }
  };

  const handleRemoveBase = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/bases/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBases(bases.filter(b => b.id !== id));
    } catch (error) {
      alert(error.response?.data || 'Error removing base');
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-4">Settings</h3>
      
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link active={activeTab === 'general'} onClick={() => setActiveTab('general')}>General</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'asset_types'} onClick={() => setActiveTab('asset_types')}>Asset Types</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'bases'} onClick={() => setActiveTab('bases')}>Bases</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'system'} onClick={() => setActiveTab('system')}>System</Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'general' && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="mb-4 fw-bold">General Settings</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">System Name</Form.Label>
                  <Form.Control type="text" value={generalSettings.systemName} onChange={e => setGeneralSettings({...generalSettings, systemName: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Default Currency</Form.Label>
                  <Form.Select value={generalSettings.defaultCurrency} onChange={e => setGeneralSettings({...generalSettings, defaultCurrency: e.target.value})}>
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Date Format</Form.Label>
                  <Form.Select value={generalSettings.dateFormat} onChange={e => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small">Timezone</Form.Label>
                  <Form.Select value={generalSettings.timezone} onChange={e => setGeneralSettings({...generalSettings, timezone: e.target.value})}>
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Pacific Time (PT)</option>
                    <option>UTC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Organization Name</Form.Label>
                  <Form.Control type="text" value={generalSettings.organizationName} onChange={e => setGeneralSettings({...generalSettings, organizationName: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Theme</Form.Label>
                  <Form.Select value={generalSettings.theme} onChange={e => setGeneralSettings({...generalSettings, theme: e.target.value})}>
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System Default</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small">Time Format</Form.Label>
                  <Form.Select value={generalSettings.timeFormat} onChange={e => setGeneralSettings({...generalSettings, timeFormat: e.target.value})}>
                    <option>12-hour (AM/PM)</option>
                    <option>24-hour</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end mt-2">
              <Button variant="primary" onClick={handleSaveGeneral}>Save Settings</Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'asset_types' && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="mb-4 fw-bold">Asset Types</h5>
            <div className="d-flex mb-4">
              <Form.Control type="text" placeholder="Add new asset type..." value={newAssetType} onChange={e => setNewAssetType(e.target.value)} className="me-2 rounded-0 border-dark" />
              <Button variant="primary" className="rounded-0 px-4" onClick={handleAddAssetType}>Add</Button>
            </div>
            <Row>
              {assetTypes.map(type => (
                <Col md={6} className="mb-3" key={type.id}>
                  <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                    <span>{type.name}</span>
                    <span className="text-danger" style={{cursor: 'pointer'}} onClick={() => handleRemoveAssetType(type.id)}>Remove</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'bases' && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="mb-4 fw-bold">Bases</h5>
            <div className="d-flex mb-4">
              <Form.Control type="text" placeholder="Add new base..." value={newBase} onChange={e => setNewBase(e.target.value)} className="me-2 rounded-0 border-dark" />
              <Button variant="primary" className="rounded-0 px-4" onClick={handleAddBase}>Add</Button>
            </div>
            <Row>
              {bases.map(base => (
                <Col md={6} className="mb-3" key={base.id}>
                  <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                    <span>{base.name}</span>
                    <span className="text-danger" style={{cursor: 'pointer'}} onClick={() => handleRemoveBase(base.id)}>Remove</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'system' && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="mb-4 fw-bold">System Settings</h5>
            
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <div>
                <h6 className="fw-bold mb-1">Maintenance Mode</h6>
                <div className="text-muted small">When enabled, only administrators can access the system</div>
              </div>
              <Button variant={systemSettings.maintenanceMode ? "success" : "secondary"} onClick={handleToggleMaintenance}>
                {systemSettings.maintenanceMode ? "Enabled" : "Enable"}
              </Button>
            </div>

            <h6 className="fw-bold mb-3">System Information</h6>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Version</div>
                <div>{systemSettings.version}</div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Last Updated</div>
                <div>{systemSettings.lastUpdated}</div>
              </Col>
              <Col md={6}>
                <div className="text-muted small mb-1">Database Status</div>
                <div><span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3">{systemSettings.dbStatus}</span></div>
              </Col>
              <Col md={6}>
                <div className="text-muted small mb-1">API Status</div>
                <div><span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3">{systemSettings.apiStatus}</span></div>
              </Col>
            </Row>
            
            <div className="text-end mt-4">
              <Button variant="primary" onClick={() => alert('System settings saved')}>Save Settings</Button>
            </div>
          </Card.Body>
        </Card>
      )}

    </div>
  );
};

export default Settings;
