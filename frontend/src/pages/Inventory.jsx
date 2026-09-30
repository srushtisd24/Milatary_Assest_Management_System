import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/inventory', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setInventory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };
    fetchInventory();
  }, [user.token]);

  return (
    <div>
      <h2 className="fw-bold mb-4">Inventory</h2>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover table-striped m-0">
            <thead className="table-dark">
              <tr>
                <th>Base</th>
                <th>Equipment Type</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No inventory records.</td></tr>
              ) : (
                inventory.map(item => (
                  <tr key={item.id}>
                    <td>{item.base?.name}</td>
                    <td>{item.equipmentType?.name}</td>
                    <td className="fw-bold">{item.quantity}</td>
                    <td><span className="badge bg-success">{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Inventory;
