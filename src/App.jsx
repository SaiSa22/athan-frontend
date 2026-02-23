import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Admin from './pages/Admin';
import DeviceManager from './pages/DeviceManager';
import { Home, Settings, HelpCircle, Search } from 'lucide-react';
import { supabase } from './supabaseClient';

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
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearchDevice = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    
    setSearching(true);
    
    // Search by device name (exact match, case insensitive)
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .ilike('name', searchName.trim())
      .limit(1)
      .single();
    
    setSearching(false);
    
    if (error || !data) {
      toast.error('Device not found. Check the name and try again.');
    } else {
      const macSuffix = data.mac_suffix || data.mac_address.replace(/:/g, '').slice(-6).toLowerCase();
      toast.success(`Found: ${data.name}`);
      navigate(`/device/${macSuffix}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 flex justify-center">
      <div className="w-full max-w-lg bg-white border-2 border-[#d4cfc0] rounded-2xl p-6 shadow-md">
        {/* Header - No Icon */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3d3225] mb-2">Smart Adhan</h1>
          <p className="text-[#6b5c4a]">Prayer reminder device manager</p>
        </div>

        {/* Search Device Card */}
        <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8] mb-5">
          <h2 className="text-lg font-bold text-[#3d3225] mb-4">Find Your Device</h2>
          <form onSubmit={handleSearchDevice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                Device Name
              </label>
              <input 
                type="text"
                placeholder="Enter device name..." 
                className="w-full px-4 py-3 bg-white border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] transition-all"
                value={searchName} 
                onChange={e => setSearchName(e.target.value)} 
              />
            </div>
            <button 
              type="submit" 
              disabled={searching || !searchName.trim()}
              className="w-full bg-[#5c4d3c] hover:bg-[#4a3d2f] disabled:bg-[#a89a7d] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Searching...
                </span>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Go
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8]">
            <h3 className="text-lg font-bold text-[#3d3225] mb-2">🕌 Automatic Prayer Calls</h3>
            <p className="text-[#6b5c4a] text-sm leading-relaxed">
              Your device automatically plays the Adhan at each prayer time based on your location.
            </p>
          </div>

          <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8]">
            <h3 className="text-lg font-bold text-[#3d3225] mb-2">📱 Easy Configuration</h3>
            <p className="text-[#6b5c4a] text-sm leading-relaxed">
              Set your location, timezone, and preferred Adhan sound. Changes sync to your device instantly.
            </p>
          </div>

          <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8]">
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
