import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// DO SPACES CONFIG
const s3Client = new S3Client({
    endpoint: "https://sfo3.digitaloceanspaces.com", 
    region: "us-east-1", 
    credentials: {
      accessKeyId: "YOUR_DO_ACCESS_KEY", // Ideally use Env Variables
      secretAccessKey: "YOUR_DO_SECRET_KEY"
    }
});

export default function DeviceManager() {
  const { macSuffix } = useParams();
  const [device, setDevice] = useState(null);
  const [times, setTimes] = useState(['', '', '', '', '']);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDevice() {
      // Find device where generated mac_suffix matches URL
      const { data, error } = await supabase
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

    // Clean MAC for filename (remove colons)
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

      // 2. Create & Upload JSON Schedule
      // Filter out empty times
      const activeTimes = times.filter(t => t !== '');
      const scheduleData = {
        mac: device.mac_address,
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${mp3Name}`,
        times: activeTimes 
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

  if (!device) return <h2>Loading device or Invalid URL...</h2>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Configuring: {device.name}</h1>
      <p>MAC: {device.mac_address}</p>

      <h3>1. Select Alert Times (24h format HH:MM)</h3>
      {times.map((t, i) => (
        <div key={i} style={{marginBottom: '5px'}}>
          <input 
            type="time" 
            value={t} 
            onChange={(e) => {
              const newTimes = [...times];
              newTimes[i] = e.target.value;
              setTimes(newTimes);
            }} 
          />
        </div>
      ))}

      <h3>2. Select MP3 File</h3>
      <input type="file" accept=".mp3" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Save & Sync Device'}
      </button>
    </div>
  );
}
