import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (saved && lastActivity) {
      if (Date.now() - parseInt(lastActivity, 10) > 5 * 60 * 1000) {
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        return null;
      }
      return JSON.parse(saved);
    }
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lastActivity');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
