import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// This finds the <div> with id="root" in your HTML and puts your App inside it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
