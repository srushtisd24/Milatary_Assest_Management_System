import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Modal, Button, Spinner } from 'react-bootstrap';
import AuthService from '../services/auth.service';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  
  const [filters, setFilters] = useState({ startDate: '', endDate: '', baseId: '', equipmentTypeId: '' });
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const user = AuthService.getCurrentUser();

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.baseId) params.baseId = filters.baseId;
      else if (!user.role.includes('ADMIN')) params.baseId = user.baseId;
      
      if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [summaryRes, inventoryRes, purchasesRes, transfersRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/dashboard/summary', { headers: { Authorization: `Bearer ${user.token}` }, params }),
        axios.get('http://localhost:8080/api/inventory', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:8080/api/purchases', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:8080/api/transfers', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:8080/api/assignments', { headers: { Authorization: `Bearer ${user.token}` } }),
      ]);
      setStats(summaryRes.data);

      // Build live pie chart from inventory grouped by equipment type
      const invByType = {};
      (inventoryRes.data || []).forEach(item => {
        const typeName = item.equipmentType?.name || 'Unknown';
        invByType[typeName] = (invByType[typeName] || 0) + (item.quantity || 0);
      });
      const livePieData = Object.entries(invByType).map(([name, value]) => ({ name, value }));
      setPieData(livePieData.length > 0 ? livePieData : []);

      // Build bar chart: last 6 months of activity
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({ label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
      }
      const liveBarData = months.map(({ label, year, month }) => {
        const pCount = (purchasesRes.data || []).filter(p => {
          const pd = new Date(p.purchaseDate);
          return pd.getFullYear() === year && pd.getMonth() === month;
        }).reduce((s, p) => s + (p.quantity || 0), 0);
        const tCount = (transfersRes.data || []).filter(t => {
          const td = new Date(t.transferDate);
          return td.getFullYear() === year && td.getMonth() === month;
        }).reduce((s, t) => s + (t.quantity || 0), 0);
        const aCount = (assignmentsRes.data || []).filter(a => {
          const ad = new Date(a.assignedDate || a.assignmentDate);
          return ad.getFullYear() === year && ad.getMonth() === month;
        }).reduce((s, a) => s + (a.quantity || 0), 0);
        return { name: label, Purchases: pCount, Transfers: tCount, Assigned: aCount };
      });
      setBarData(liveBarData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [basesRes, eqTypesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/bases', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:8080/api/equipment-types', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setBases(basesRes.data);
        setEquipmentTypes(eqTypesRes.data);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };
    fetchDropdowns();
    fetchDashboardStats();
  }, []); // Initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchDashboardStats();
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', baseId: '', equipmentTypeId: '' });
    // We need to wait for state to update, but since fetchDashboardStats uses current state in closure,
    // we just fetch without the filters.
    setTimeout(() => {
        window.location.reload();
    }, 100);
  };

  const netMovementDetails = {
    purchases: stats?.purchases || 0,
    transferIn: stats?.transferIn || 0,
    transferOut: stats?.transferOut || 0,
    netMovement: stats?.netMovement || 0
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#f97316'];

  return (
    <div>
      <h2 className="mb-4 fw-bold">Dashboard</h2>

      {/* Filter Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-muted small mb-1">Start Date</label>
              <input type="date" className="form-control form-control-sm" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small mb-1">End Date</label>
              <input type="date" className="form-control form-control-sm" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
            {user && user.role.includes('ADMIN') && (
              <div className="col-md-2">
                <label className="form-label text-muted small mb-1">Base</label>
                <select className="form-select form-select-sm" name="baseId" value={filters.baseId} onChange={handleFilterChange}>
                  <option value="">All Bases</option>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-2">
              <label className="form-label text-muted small mb-1">Equipment Type</label>
              <select className="form-select form-select-sm" name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange}>
                <option value="">All Types</option>
                {equipmentTypes.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end gap-2">
              <button className="btn btn-primary btn-sm w-100" onClick={applyFilters}>Apply</button>
              <button className="btn btn-outline-secondary btn-sm w-100" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? <div className="text-center mt-5"><Spinner animation="border" /></div> : (
      <>
      {/* Metric Cards */}
      <div className="row mb-4">
        <div className="col-md">
          <div className="card text-white bg-secondary mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-uppercase">Opening Balance</h6>
              <h2 className="m-0 fw-bold">{stats?.openingBalance || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md" onClick={() => setShowModal(true)} style={{cursor: 'pointer'}}>
          <div className="card text-white bg-primary mb-3 shadow-sm" title="Click for details">
            <div className="card-body">
              <h6 className="card-title text-uppercase">Net Movement <i className="bi bi-info-circle ms-1"></i></h6>
              <h2 className="m-0 fw-bold">+{stats?.netMovement || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md">
          <div className="card text-white bg-success mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-uppercase">Closing Balance</h6>
              <h2 className="m-0 fw-bold">{stats?.closingBalance || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md">
          <div className="card text-white bg-warning mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-uppercase text-dark">Assigned</h6>
              <h2 className="m-0 fw-bold text-dark">{stats?.assigned || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md">
          <div className="card text-white bg-danger mb-3 shadow-sm">
            <div className="card-body">
              <h6 className="card-title text-uppercase">Expended</h6>
              <h2 className="m-0 fw-bold">{stats?.expended || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Movement Over Time</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Purchases" fill="#0088FE" />
                    <Bar dataKey="Transfers" fill="#00C49F" />
                    <Bar dataKey="Assigned" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Equipment Distribution</h5>
              <div style={{ width: '100%', height: 300 }}>
                {pieData.length === 0 ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No inventory data</div>
                ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Movement Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Net Movement Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group list-group-flush fs-5">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Purchases
              <span className="badge bg-primary rounded-pill">{netMovementDetails.purchases}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Transfer In
              <span className="badge bg-success rounded-pill">{netMovementDetails.transferIn}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Transfer Out
              <span className="badge bg-danger rounded-pill">{netMovementDetails.transferOut}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center fw-bold bg-light mt-2">
              Net Movement
              <span className="text-primary">+{netMovementDetails.netMovement}</span>
            </li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      </>
      )}
    </div>
  );
};

export default Dashboard;
