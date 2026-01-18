import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import DeviceManager from './pages/DeviceManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        {/* Captures the 4-char suffix (e.g., /d4bc) */}
        <Route path="/:macSuffix" element={<DeviceManager />} /> 
      </Routes>
    </Router>
  );
}

export default App;
