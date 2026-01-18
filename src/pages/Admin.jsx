import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [status, setStatus] = useState('');

  const  handleAddDevice = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('devices')
      .insert([{ name, mac_address: mac }]);

    if (error) setStatus('Error: ' + error.message);
    else setStatus('Device Added Successfully!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add New Device</h1>
      <form onSubmit={handleAddDevice}>
        <input 
          placeholder="Device Name (e.g. Living Room)" 
          value={name} onChange={e => setName(e.target.value)} required 
        />
        <br /><br />
        <input 
          placeholder="MAC Address (9C:13:9E...)" 
          value={mac} onChange={e => setMac(e.target.value)} required 
        />
        <br /><br />
        <button type="submit">Save Device</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
