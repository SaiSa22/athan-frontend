import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Auth } from './Auth';
import './App.css'; 

function App() {
  // Simple state to track if user is logged in
  // In a real app, you might check LocalStorage here to persist login across refreshes
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    setUser(email);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // CONDITIONAL RENDERING:
  // If we have a user, show Dashboard. Otherwise, show Auth.
  if (user) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <Auth onLoginSuccess={handleLogin} />;
}

export default App;
