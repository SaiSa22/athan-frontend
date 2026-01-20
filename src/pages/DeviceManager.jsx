import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure correct path
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// DO SPACES CONFIG
const s3Client = new S3Client({
    endpoint: "https://sfo3.digitaloceanspaces.com", 
    region: "us-east-1", 
    credentials: {
      accessKeyId: process.env.REACT_APP_DO_ACCESS_KEY, 
      secretAccessKey: process.env.REACT_APP_DO_SECRET_KEY
    }
});

export default function DeviceManager() {
  const { macSuffix } = useParams();
  const [device, setDevice] = useState(null);
  const [times, setTimes] = useState(['', '', '', '', '']);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone); // Default to user's browser TZ
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDevice() {
      const { data } = await supabase
        .from('devices')
        .select('*')
        .eq('mac_suffix', macSuffix)
        .single();
      if (data) setDevice(data);
    }
    getDevice();
  }, [macSuffix]);

  const handleUpload = async () => {
    if (!file || !device) return;
    setLoading(true);

    const cleanMac = device.mac_address.replace(/:/g, '').toUpperCase();
    const mp3Name = `${cleanMac}.mp3`;
    const jsonName = `${cleanMac}.json`;

    try {
      // 1. Upload MP3
      await s3Client.send(new PutObjectCommand({
        Bucket: "athansaut",
        Key: mp3Name,
        Body: file,
        ACL: "public-read",
        ContentType: "audio/mpeg"
      }));

      // 2. Upload JSON with Timezone
      const activeTimes = times.filter(t => t !== '');
      const scheduleData = {
        mac: device.mac_address,
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${mp3Name}`,
        times: activeTimes,
        timezone: timezone // <--- NEW: Saving the Timezone
      };

      await s3Client.send(new PutObjectCommand({
        Bucket: "athansaut",
        Key: jsonName,
        Body: JSON.stringify(scheduleData),
        ACL: "public-read",
        ContentType: "application/json"
      }));

      alert('Upload Successful! Device will sync shortly.');
    } catch (err) {
      console.error(err);
      alert('Upload Failed.');
    }
    setLoading(false);
  };

  if (!device) return <h2>Loading...</h2>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Configuring: {device.name}</h1>
      
      <div className="mb-6">
        <label className="block font-medium mb-2">Device Timezone</label>
        <select 
          className="w-full p-2 border rounded"
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)}
        >
           <option value="UTC">UTC</option>
           <option value="America/New_York">Eastern Time (US)</option>
           <option value="America/Chicago">Central Time (US)</option>
           <option value="America/Denver">Mountain Time (US)</option>
           <option value="America/Los_Angeles">Pacific Time (US)</option>
           <option value="Europe/London">London (GMT)</option>
           <option value="Asia/Dubai">Dubai (GST)</option>
           {/* Add more as needed */}
        </select>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Alert Times (24h)</label>
        {times.map((t, i) => (
          <input 
            key={i}
            type="time" 
            className="block w-full mb-2 p-2 border rounded"
            value={t} 
            onChange={(e) => {
              const newTimes = [...times];
              newTimes[i] = e.target.value;
              setTimes(newTimes);
            }} 
          />
        ))}
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Select Audio File (.mp3)</label>
        <input type="file" accept=".mp3" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Uploading...' : 'Save & Sync Device'}
      </button>
    </div>
  );
}
