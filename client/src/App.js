import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ExeatRequest from './components/Exeat/ExeatRequest';
import ExeatDetails from './components/Exeat/ExeatDetails';
import ParentApproval from './components/Parent/ParentApproval';
import QRScanner from './components/Security/QRScanner';
import Navbar from './components/Layout/Navbar';
import LandingPage from './components/Auth/LandingPage';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname) || 
                    location.pathname.startsWith('/login') ||
                    location.pathname.startsWith('/parent-approval');
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Parent approval route (public, no auth required) */}
          <Route path="/parent-approval/:exeatId/:token" element={<ParentApproval />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/exeat-request"
            element={
              <PrivateRoute>
                <ExeatRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/exeat/:id"
            element={
              <PrivateRoute>
                <ExeatDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/qr-scanner"
            element={
              <PrivateRoute>
                <QRScanner />
              </PrivateRoute>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
