import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ExeatRequest from './components/Exeat/ExeatRequest';
import ExeatDetails from './components/ExeatRequest/ExeatDetails';
import Navbar from './components/Layout/Navbar';
import LandingPage from './components/Auth/LandingPage';
import './styles/variables.css';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname) || 
                    location.pathname.startsWith('/login');
  
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
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
