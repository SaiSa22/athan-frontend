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
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Server className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add Device</h2>
          <p className="text-sm text-gray-500">Register a new audio unit</p>
        </div>
      </div>

      <form onSubmit={handleAddDevice} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Device Name
          </label>
          <input 
            type="text"
            placeholder="e.g. Living Room Speaker" 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            MAC Address
          </label>
          <input 
            type="text"
            placeholder="9C:13:9E:AB:D4:BC" 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm"
            value={mac} 
            onChange={e => setMac(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-200"
        >
          {loading ? 'Saving...' : <><Plus className="w-5 h-5" /> Add Device</>}
        </button>
      </form>
    </div>
  );
}
