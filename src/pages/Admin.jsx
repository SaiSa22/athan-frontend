import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Server } from 'lucide-react';

export default function Admin() {
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mac.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('devices')
      .insert([{ name, mac_address: mac }]);
    setLoading(false);
    if (error) {
      toast.error('Error adding device: ' + error.message);
    } else {
      toast.success('Device Added Successfully!');
      setName('');
      setMac('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4">
      {/* Decorative Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="islamic-admin" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="white" strokeWidth="0.5"/>
              <circle cx="10" cy="10" r="4" fill="none" stroke="white" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-admin)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Add Device</h1>
          <p className="text-slate-400 text-sm mt-1">Register a new audio unit</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[28px] p-6 border border-white/[0.08] shadow-2xl">
          <form onSubmit={handleAddDevice} className="space-y-5">
            {/* Device Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Device Name
              </label>
              <input 
                type="text"
                placeholder="e.g. Living Room Speaker" 
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>

            {/* MAC Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                MAC Address
              </label>
              <input 
                type="text"
                placeholder="9C:13:9E:AB:D4:BC" 
                className="w-full px-4 py-3.5 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 font-mono text-sm transition-all"
                value={mac} 
                onChange={e => setMac(e.target.value.toUpperCase())} 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Add Device
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Find the MAC address on the device label or in serial monitor
        </p>
      </div>
    </div>
  );
}
