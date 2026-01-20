import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Admin from './pages/Admin';
import DeviceManager from './pages/DeviceManager';
import { Wifi } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Mobile-Friendly Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-2">
            <Wifi className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              AthanSaut Control
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow p-4">
          <div className="max-w-lg mx-auto">
            <Routes>
              {/* Blank Home Page */}
              <Route path="/" element={null} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/:macSuffix" element={<DeviceManager />} /> 
            </Routes>
          </div>
        </main>
        
        {/* Toast Notifications */}
        <Toaster position="bottom-center" toastOptions={{ duration: 4000 }} />
      </div>
    </Router>
  );
}

export default App;
