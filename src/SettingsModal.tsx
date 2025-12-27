import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, session }) => {
  const [fetchTime, setFetchTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/Chicago'); // Default to CST
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Common US Timezones
  const timezones = [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "UTC"
  ];

  // Load Settings on Open
  useEffect(() => {
    if (isOpen && session) {
      const loadSettings = async () => {
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          setFetchTime(data.fetch_time || '08:00');
          setTimezone(data.timezone || 'America/Chicago');
        }
      };
      loadSettings();
    }
  }, [isOpen, session]);

  const handleSave = async () => {
    setLoading(true);
    setMsg('');

    // Upsert (Insert or Update)
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: session.user.id,
        fetch_time: fetchTime,
        timezone: timezone
      });

    setLoading(false);
    if (error) {
      alert('Error saving settings');
    } else {
      setMsg('Settings saved successfully!');
      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-800">Device Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Fetch Time</label>
                <p className="text-xs text-gray-500 mb-2">When should your device wake up and check for today's events?</p>
                <input 
                    type="time" 
                    value={fetchTime}
                    onChange={(e) => setFetchTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center text-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Timezone</label>
                <select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>

            {msg && <div className="p-2 bg-green-100 text-green-700 rounded text-center text-sm">{msg}</div>}

            <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg transition-all active:scale-95"
            >
                {loading ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
      </div>
    </div>
  );
};
