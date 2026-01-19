// 1. Use HashRouter instead of BrowserRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import DeviceManager from './pages/DeviceManager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Path "/" renders 'null', which effectively renders nothing (a blank page).
            You can replace {null} with {<div>Welcome</div>} if you want text later.
        */}
        <Route path="/" element={null} />
        
        <Route path="/admin" element={<Admin />} />
        
        {/* Captures the 4-char suffix (e.g., /#/d4bc) */}
        <Route path="/:macSuffix" element={<DeviceManager />} /> 
      </Routes>
    </Router>
  );
}

export default App;
