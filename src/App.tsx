import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { Auth } from './Auth';
import { supabase } from './supabaseClient';
import './App.css'; 

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for changes (login, logout, auto-refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return <Dashboard session={session} onLogout={handleLogout} />;
  }

  return <Auth onLoginSuccess={(s) => setSession(s)} />;
}

export default App;
