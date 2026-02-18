import React, { useState, useEffect } from 'react';

// Smart Adhan Clock - Modern Mobile-First Design
export default function AdhanClockApp() {
  const [deviceId, setDeviceId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [config, setConfig] = useState({
    latitude: '',
    longitude: '',
    timezone: 'America/Chicago',
    method: 2,
    audio_url: ''
  });
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const methods = [
    { id: 0, name: 'Shia Ithna-Ashari' },
    { id: 1, name: 'University of Islamic Sciences, Karachi' },
    { id: 2, name: 'Islamic Society of North America (ISNA)' },
    { id: 3, name: 'Muslim World League' },
    { id: 4, name: 'Umm Al-Qura University, Makkah' },
    { id: 5, name: 'Egyptian General Authority' },
    { id: 7, name: 'Institute of Geophysics, Tehran' },
    { id: 8, name: 'Gulf Region' },
    { id: 9, name: 'Kuwait' },
    { id: 10, name: 'Qatar' },
    { id: 11, name: 'Majlis Ugama Islam Singapura' },
    { id: 12, name: "Union des Organisations Islamiques de France" },
    { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
    { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
    { id: 15, name: 'Moonsighting Committee Worldwide' }
  ];

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Riyadh',
    'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Africa/Cairo', 'Australia/Sydney'
  ];

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setConfig(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setLoading(false);
        },
        () => {
          setLoading(false);
          alert('Could not get location. Please enter manually.');
        }
      );
    }
  };

  const fetchPrayerTimes = async () => {
    if (!config.latitude || !config.longitude) return;
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${config.latitude}&longitude=${config.longitude}&method=${config.method}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.data?.timings) setPrayerTimes(data.data.timings);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveConfig = async () => {
    if (!deviceId) { alert('Please enter your Device ID'); return; }
    setLoading(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1500));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    if (config.latitude && config.longitude) fetchPrayerTimes();
  }, [config.latitude, config.longitude, config.method]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      
      {/* Decorative Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="islamic" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="white" strokeWidth="0.5"/>
              <circle cx="10" cy="10" r="4" fill="none" stroke="white" strokeWidth="0.3"/>
              <circle cx="10" cy="10" r="2" fill="none" stroke="white" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic)"/>
        </svg>
      </div>

      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3C9.5 6 8 8.5 8 10.5C8 12.5 9 14 10.5 15C9 16 8 17 8 19C8 20.5 9 21 12 21C15 21 16 20.5 16 19C16 17 15 16 13.5 15C15 14 16 12.5 16 10.5C16 8.5 14.5 6 12 3Z"/>
              <path d="M4 21H20"/>
              <path d="M6 21V15C6 13.5 7 12 9 12"/>
              <path d="M18 21V15C18 13.5 17 12 15 12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
              Smart Adhan Clock
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">Configure your prayer reminder device</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-28">
        
        {/* Device ID Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[28px] p-6 mb-5 border border-white/[0.08] shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/60 scale-110' : 'bg-slate-600'}`} style={isConnected ? { animation: 'pulse 2s infinite' } : {}} />
            <span className="text-sm font-semibold text-slate-300">
              {isConnected ? 'Device Ready' : 'Enter Device ID'}
            </span>
            {isConnected && (
              <span className="ml-auto text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                Connected
              </span>
            )}
          </div>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '');
              setDeviceId(val);
              setIsConnected(val.length === 12);
            }}
            placeholder="e.g., 9C139EABD440"
            className="w-full px-5 py-4 bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/70 font-mono text-center text-lg tracking-[0.2em] transition-all duration-300"
            maxLength={12}
          />
          <p className="text-xs text-slate-500 mt-3 text-center">
            Found on device label or serial monitor (MAC address)
          </p>
        </div>

        {/* Location Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[28px] p-6 mb-5 border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              Location
            </h2>
            <button
              onClick={getLocation}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '...' : '📍 Detect'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Latitude</label>
              <input
                type="text"
                value={config.latitude}
                onChange={(e) => setConfig(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="29.9099"
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 text-sm font-mono transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Longitude</label>
              <input
                type="text"
                value={config.longitude}
                onChange={(e) => setConfig(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="-95.7095"
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 text-sm font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* Prayer Times Preview */}
        {prayerTimes && (
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[28px] p-6 mb-5 border border-white/[0.08] shadow-2xl overflow-hidden">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              Today's Prayer Times
            </h2>
            <div className="space-y-2">
              {[
                { name: 'Fajr', time: prayerTimes.Fajr, icon: '🌙', gradient: 'from-indigo-600 to-purple-600' },
                { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: '☀️', gradient: 'from-yellow-500 to-amber-500' },
                { name: 'Asr', time: prayerTimes.Asr, icon: '🌤️', gradient: 'from-orange-500 to-amber-600' },
                { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌅', gradient: 'from-rose-500 to-orange-500' },
                { name: 'Isha', time: prayerTimes.Isha, icon: '🌃', gradient: 'from-slate-600 to-indigo-700' }
              ].map((prayer, i) => (
                <div
                  key={prayer.name}
                  className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl hover:bg-slate-900/60 transition-all group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prayer.gradient} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {prayer.icon}
                    </div>
                    <span className="font-semibold text-white">{prayer.name}</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-emerald-400">{prayer.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[28px] p-6 mb-5 border border-white/[0.08] shadow-2xl">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            Settings
          </h2>
          
          {/* Timezone */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Timezone</label>
            <div className="relative">
              <select
                value={config.timezone}
                onChange={(e) => setConfig(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50 text-sm appearance-none cursor-pointer transition-all"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz} className="bg-slate-900">{tz}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Calculation Method</label>
            <div className="relative">
              <select
                value={config.method}
                onChange={(e) => setConfig(prev => ({ ...prev, method: parseInt(e.target.value) }))}
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50 text-sm appearance-none cursor-pointer transition-all"
              >
                {methods.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          {/* Audio URL */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Adhan Audio URL</label>
            <input
              type="url"
              value={config.audio_url}
              onChange={(e) => setConfig(prev => ({ ...prev, audio_url: e.target.value }))}
              placeholder="https://example.com/adhan.mp3"
              className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 text-sm transition-all"
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              44.1kHz, 64kbps, Mono MP3 recommended
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveConfig}
          disabled={loading || !deviceId || deviceId.length < 12}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-2xl ${
            saved
              ? 'bg-emerald-500 text-white shadow-emerald-500/40'
              : 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]'
          } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving Configuration...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Saved Successfully!
            </span>
          ) : (
            '💾 Save Configuration'
          )}
        </button>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 leading-relaxed">
            After saving, <span className="text-emerald-400 font-semibold">press the button once</span> on your device to download the new configuration.
          </p>
        </div>

        {/* Help Card */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full mt-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">📖 Quick Guide</span>
            <svg className={`w-5 h-5 text-slate-500 transition-transform ${showHelp ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          {showHelp && (
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p><span className="text-white font-semibold">1 Press:</span> Download new data & audio</p>
              <p><span className="text-white font-semibold">2 Presses:</span> Play adhan manually</p>
              <p><span className="text-white font-semibold">3 Presses:</span> Enter WiFi setup mode</p>
              <p className="pt-2 border-t border-slate-700/50">
                <span className="text-emerald-400">💡 Tip:</span> Device automatically plays adhan at each prayer time!
              </p>
            </div>
          )}
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 px-4 pb-2 pt-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'times', icon: '🕐', label: 'Times' },
            { id: 'audio', icon: '🔊', label: 'Audio' },
            { id: 'help', icon: '❓', label: 'Help' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-emerald-400 bg-emerald-500/10 scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
