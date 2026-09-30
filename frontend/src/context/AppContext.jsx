import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchSharedData = useCallback(async () => {
    const user = AuthService.getCurrentUser();
    if (!user || !user.token) return;
    try {
      const [basesRes, eqRes] = await Promise.all([
        axios.get('http://localhost:8080/api/bases', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:8080/api/equipment-types', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (error) {
      console.error('Error fetching shared data:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedData();
  }, [fetchSharedData]);

  return (
    <AppContext.Provider value={{ bases, setBases, equipmentTypes, setEquipmentTypes, loadingData, refreshSharedData: fetchSharedData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
