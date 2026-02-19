import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Admin from './pages/Admin';
import DeviceManager from './pages/DeviceManager';
import { Home, Settings, HelpCircle } from 'lucide-react';

function NavBar() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#e8e4d4] border-t border-[#d4cfc0] shadow-lg" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around max-w-md mx-auto py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/') ? 'text-[#5c4d3c] bg-[#d4cfc0]' : 'text-[#8b7355] hover:text-[#5c4d3c]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link 
          to="/admin" 
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/admin') ? 'text-[#5c4d3c] bg-[#d4cfc0]' : 'text-[#8b7355] hover:text-[#5c4d3c]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </Link>
        <a 
          href="https://github.com/SaiSa22/athan-frontend" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-[#8b7355] hover:text-[#5c4d3c] transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Help</span>
        </a>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-[#5c4d3c] shadow-lg">
            <svg className="w-10 h-10 text-[#f5f5dc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3C9.5 6 8 8.5 8 10.5C8 12.5 9 14 10.5 15C9 16 8 17 8 19C8 20.5 9 21 12 21C15 21 16 20.5 16 19C16 17 15 16 13.5 15C15 14 16 12.5 16 10.5C16 8.5 14.5 6 12 3Z"/>
              <path d="M4 21H20"/>
              <path d="M6 21V15C6 13.5 7 12 9 12"/>
              <path d="M18 21V15C18 13.5 17 12 15 12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#3d3225] mb-2">Smart Adhan</h1>
          <p className="text-[#6b5c4a]">Prayer reminder device manager</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#e0dcc8] shadow-sm">
            <h3 className="text-lg font-bold text-[#3d3225] mb-2">🕌 Automatic Prayer Calls</h3>
            <p className="text-[#6b5c4a] text-sm leading-relaxed">
              Your device automatically plays the Adhan at each prayer time based on your location.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e0dcc8] shadow-sm">
            <h3 className="text-lg font-bold text-[#3d3225] mb-2">📱 Easy Configuration</h3>
            <p className="text-[#6b5c4a] text-sm leading-relaxed">
              Set your location, timezone, and preferred Adhan sound. Changes sync to your device instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e0dcc8] shadow-sm">
            <h3 className="text-lg font-bold text-[#3d3225] mb-3">🎛️ Button Controls</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1×</span>
                <span className="text-[#5c4d3c]">Download new configuration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">2×</span>
                <span className="text-[#5c4d3c]">Play Adhan manually</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">3×</span>
                <span className="text-[#5c4d3c]">Enter WiFi setup mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started */}
        <div className="mt-8">
          <Link 
            to="/admin"
            className="block w-full py-4 rounded-xl font-bold text-lg text-center bg-[#5c4d3c] text-white shadow-md hover:bg-[#4a3d2f] transition-all active:scale-[0.98]"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#5c4d3c',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/device/:macSuffix" element={<DeviceManager />} />
      </Routes>
      <NavBar />
    </Router>
  );
}
