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
    <div className="min-h-screen pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-[#5c4d3c] shadow-lg">
            <Server className="w-8 h-8 text-[#f5f5dc]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3d3225]">Add Device</h1>
          <p className="text-[#6b5c4a] text-sm mt-1">Register a new audio unit</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0dcc8] shadow-sm">
          <form onSubmit={handleAddDevice} className="space-y-5">
            {/* Device Name */}
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                Device Name
              </label>
              <input 
                type="text"
                placeholder="e.g. Living Room Speaker" 
                className="w-full px-4 py-3 bg-[#faf9f5] border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] transition-all"
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>

            {/* MAC Address */}
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                MAC Address
              </label>
              <input 
                type="text"
                placeholder="9C:13:9E:AB:D4:BC" 
                className="w-full px-4 py-3 bg-[#faf9f5] border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] font-mono text-sm transition-all"
                value={mac} 
                onChange={e => setMac(e.target.value.toUpperCase())} 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#5c4d3c] hover:bg-[#4a3d2f] disabled:bg-[#a89a7d] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-md active:scale-[0.98]"
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
        <p className="text-center text-[#8b7355] text-sm mt-6">
          Find the MAC address on the device label or in serial monitor
        </p>
      </div>
    </div>
  );
}
