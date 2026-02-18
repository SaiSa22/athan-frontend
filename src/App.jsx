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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around max-w-md mx-auto py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link 
          to="/admin" 
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/admin') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </Link>
        <a 
          href="https://github.com/SaiSa22/athan-frontend" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white">
      {/* Decorative Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="islamic-home" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="white" strokeWidth="0.5"/>
              <circle cx="10" cy="10" r="4" fill="none" stroke="white" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-home)"/>
        </svg>
      </div>

      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-5 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3C9.5 6 8 8.5 8 10.5C8 12.5 9 14 10.5 15C9 16 8 17 8 19C8 20.5 9 21 12 21C15 21 16 20.5 16 19C16 17 15 16 13.5 15C15 14 16 12.5 16 10.5C16 8.5 14.5 6 12 3Z"/>
              <path d="M4 21H20"/>
              <path d="M6 21V15C6 13.5 7 12 9 12"/>
              <path d="M18 21V15C18 13.5 17 12 15 12"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
              Smart Adhan
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Prayer reminder device manager</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[24px] p-6 border border-white/[0.08] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">🕌 Automatic Prayer Calls</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your device automatically plays the Adhan at each prayer time based on your location.
            </p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[24px] p-6 border border-white/[0.08] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">📱 Easy Configuration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Set your location, timezone, and preferred Adhan sound. Changes sync to your device instantly.
            </p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[24px] p-6 border border-white/[0.08] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-3">🎛️ Button Controls</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1×</span>
                <span className="text-slate-300">Download new configuration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold">2×</span>
                <span className="text-slate-300">Play Adhan manually</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">3×</span>
                <span className="text-slate-300">Enter WiFi setup mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started */}
        <div className="mt-8">
          <Link 
            to="/admin"
            className="block w-full py-5 rounded-2xl font-bold text-lg text-center bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all active:scale-[0.98]"
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
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
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
