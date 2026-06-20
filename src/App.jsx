import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layout/DashboardLayout';
import CostEstimation from './pages/CostEstimation';
import Settings from './pages/Settings';
import CostConfig from './pages/CostConfig';
import RawMaterials from './pages/RawMaterials';
import ManpowerConfig from './pages/ManpowerConfig';
import UtilityRates from './pages/UtilityRates';
import ManageVariants from './pages/ManageVariants';
import { AppProvider } from './context/AppContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/estimation" replace />} />
            <Route path="estimation" element={<CostEstimation />} />
            <Route path="raw-materials" element={<RawMaterials />} />
            <Route path="variants" element={<ManageVariants />} />
            <Route path="cost-config" element={<CostConfig />} />
            <Route path="manpower" element={<ManpowerConfig />} />
            <Route path="utilities" element={<UtilityRates />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
