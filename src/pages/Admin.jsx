import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function Admin() {
  // Add Device State
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    // Remove spaces from device name
    const valueWithoutSpaces = e.target.value.replace(/\s/g, '');
    setName(valueWithoutSpaces);
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mac.trim()) return;
    
    // Validate no spaces in name
    if (name.includes(' ')) {
      toast.error('Device name cannot contain spaces');
      return;
    }
    
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
    <div className="min-h-screen pb-24 px-4 pt-8 flex justify-center">
      <div className="w-full max-w-md bg-white border-2 border-[#d4cfc0] rounded-2xl p-6 shadow-md">
        
        {/* Header - No Icon */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3d3225]">Add New Device</h1>
          <p className="text-[#6b5c4a] text-sm mt-1">Register a new audio unit</p>
        </div>

        {/* Add Device Form */}
        <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8]">
          <form onSubmit={handleAddDevice} className="space-y-4">
            {/* Device Name */}
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                Device Name
              </label>
              <input 
                type="text"
                placeholder="e.g. LivingRoomSpeaker" 
                className="w-full px-4 py-3 bg-white border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] transition-all"
                value={name} 
                onChange={handleNameChange} 
              />
              <p className="text-xs text-[#8b7355] mt-1">No spaces allowed</p>
            </div>

            {/* MAC Address */}
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                MAC Address
              </label>
              <input 
                type="text"
                placeholder="9C:13:9E:AB:D4:BC" 
                className="w-full px-4 py-3 bg-white border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] font-mono text-sm transition-all"
                value={mac} 
                onChange={e => setMac(e.target.value.toUpperCase())} 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !name.trim() || !mac.trim()}
              className="w-full bg-[#5c4d3c] hover:bg-[#4a3d2f] disabled:bg-[#a89a7d] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
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
