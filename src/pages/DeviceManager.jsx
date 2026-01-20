import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import toast from 'react-hot-toast';
import { Clock, Upload, Settings, Music, Globe } from 'lucide-react';

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
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDevice() {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('mac_suffix', macSuffix)
        .single();
      
      if (error || !data) {
        toast.error("Device not found!");
      } else {
        setDevice(data);
      }
    }
    getDevice();
  }, [macSuffix]);

  const handleUpload = async () => {
    if (!file || !device) {
      toast.error("Please select a file first.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Syncing with device...');

    const cleanMac = device.mac_address.replace(/:/g, '').toUpperCase();
    const mp3Name = `${cleanMac}.mp3`;
    const jsonName = `${cleanMac}.json`;

    try {
      // *** FIX: Convert File to ArrayBuffer ***
      const fileBuffer = await file.arrayBuffer();
      // **************************************

      // 1. Upload MP3
      await s3Client.send(new PutObjectCommand({
        Bucket: "athansaut",
        Key: mp3Name,
        Body: fileBuffer, // Sending buffer instead of stream
        ACL: "public-read",
        ContentType: "audio/mpeg"
      }));

      // 2. Upload JSON
      const activeTimes = times.filter(t => t !== '');
      const scheduleData = {
        mac: device.mac_address,
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${mp3Name}`,
        times: activeTimes,
        timezone: timezone 
      };

      await s3Client.send(new PutObjectCommand({
        Bucket: "athansaut",
        Key: jsonName,
        Body: JSON.stringify(scheduleData),
        ACL: "public-read",
        ContentType: "application/json"
      }));

      toast.success('Sync Complete!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Upload Failed: ' + err.message, { id: toastId });
    }
    setLoading(false);
  };

  if (!device) return (
    <div className="flex justify-center items-center h-64 text-gray-400">
      <div className="animate-pulse">Loading Device Settings...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Device Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-green-700" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{device.name}</h2>
        </div>
        <p className="text-sm text-gray-500 font-mono ml-10">MAC: {device.mac_address}</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        
        {/* Timezone Section */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Globe className="w-4 h-4 text-indigo-500" /> Device Timezone
          </label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
              value={timezone} 
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="UTC">UTC (Universal)</option>
              <option value="America/New_York">Eastern Time (New York)</option>
              <option value="America/Chicago">Central Time (Chicago)</option>
              <option value="America/Denver">Mountain Time (Denver)</option>
              <option value="America/Los_Angeles">Pacific Time (LA)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Karachi">Karachi (PKT)</option>
              <option value="Asia/Riyadh">Riyadh (AST)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Times Section */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Clock className="w-4 h-4 text-indigo-500" /> Alert Schedule
          </label>
          <div className="grid grid-cols-2 gap-3">
            {times.map((t, i) => (
              <div key={i} className="relative">
                <input 
                  type="time" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-center rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  value={t} 
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[i] = e.target.value;
                    setTimes(newTimes);
                  }} 
                />
                <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  #{i+1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Music className="w-4 h-4 text-indigo-500" /> Audio File
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center px-4">
                {file ? <span className="text-indigo-600 font-semibold">{file.name}</span> : "Tap to upload MP3"}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".mp3" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleUpload} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
        >
          {loading ? 'Syncing...' : 'Save & Sync Device'}
        </button>
      </div>
    </div>
  );
}
