import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import JobAlerts from './pages/JobAlerts';
import JobOffers from './pages/JobOffers';
import Documents from './pages/Documents';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Redirect root to home or login */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          } 
        />

        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Register />
          } 
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-alerts"
          element={
            <ProtectedRoute>
              <JobAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-offers"
          element={
            <ProtectedRoute>
              <JobOffers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;