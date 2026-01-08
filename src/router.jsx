// src/router.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OperatorDashboard from './pages/dashboards/operator/OperatorDashboard';
import HQDashboard from './pages/dashboards/hq/HQDashboard';
import SachivDashboard from './pages/dashboards/sachiv/SachivDashboard';
import PMDashboard from './pages/dashboards/pm/PMDashboard';
import DPRODashboard from "./pages/dashboards/dpro/DPRODashboard";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard routes */}
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/pm/dashboard" element={<PMDashboard />} />
        <Route path="/sachiv/dashboard" element={<SachivDashboard />} />
        <Route path="/ado/dashboard" element={<div>ADO Dashboard</div>} />
        <Route path="/hq/dashboard" element={<HQDashboard />} />
        <Route path="/dpro/dashboard" element={<DPRODashboard/>} />
        <Route path="/dd/dashboard" element={<div>DD Dashboard</div>} />
        <Route path="/tl/dashboard" element={<div>TL Dashboard</div>} />
        <Route path="/director/dashboard" element={<div>Director Dashboard</div>} />
        <Route path="/supervisor-sc/dashboard" element={<div>Supervisor SC Dashboard</div>} />
        <Route path="/supervisor-de/dashboard" element={<div>Supervisor DE Dashboard</div>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;