import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  
  // Add Device State
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Search Device State
  const [searchName, setSearchName] = useState('');
  const [searching, setSearching] = useState(false);

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

  const handleSearchDevice = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    
    setSearching(true);
    
    // Search by device name
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .ilike('name', `%${searchName.trim()}%`)
      .limit(1)
      .single();
    
    setSearching(false);
    
    if (error || !data) {
      toast.error('Device not found. Check the name and try again.');
    } else {
      // Navigate to device page using mac_suffix
      const macSuffix = data.mac_suffix || data.mac_address.replace(/:/g, '').slice(-6).toLowerCase();
      toast.success(`Found: ${data.name}`);
      navigate(`/device/${macSuffix}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto">
        
        {/* Header - No Icon */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3d3225]">Device Manager</h1>
          <p className="text-[#6b5c4a] text-sm mt-1">Add or find your devices</p>
        </div>

        {/* Search Device Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0dcc8] shadow-sm mb-5">
          <h2 className="text-lg font-bold text-[#3d3225] mb-4">Find Device</h2>
          <form onSubmit={handleSearchDevice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6b5c4a] mb-2 uppercase tracking-wider">
                Device Name
              </label>
              <input 
                type="text"
                placeholder="Enter device name..." 
                className="w-full px-4 py-3 bg-[#faf9f5] border-2 border-[#e0dcc8] rounded-xl text-[#3d3225] placeholder-[#a89a7d] focus:outline-none focus:border-[#8b7355] transition-all"
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

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#e0dcc8]"></div>
          <span className="text-[#8b7355] text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-[#e0dcc8]"></div>
        </div>

        {/* Add Device Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0dcc8] shadow-sm">
          <h2 className="text-lg font-bold text-[#3d3225] mb-4">Add New Device</h2>
          <form onSubmit={handleAddDevice} className="space-y-4">
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
