import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import toast from 'react-hot-toast';
import { Upload, Settings, Music, Globe, ChevronDown, MapPin, Calculator } from 'lucide-react';

// DO SPACES CONFIG
const s3Client = new S3Client({
    endpoint: "https://sfo3.digitaloceanspaces.com", 
    region: "us-east-1", 
    credentials: {
      accessKeyId: process.env.REACT_APP_DO_ACCESS_KEY, 
      secretAccessKey: process.env.REACT_APP_DO_SECRET_KEY
    }
});

const CALCULATION_METHODS = [
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 0, name: "Jafari / Shia Ithna-Ashari" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 12, name: "Union Organization islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 16, name: "Dubai (experimental)" },
  { id: 17, name: "Jabatan Kemajuan Islam Malaysia (JAKIM)" },
  { id: 18, name: "Tunisia" },
  { id: 19, name: "Algeria" },
  { id: 20, name: "KEMENAG - Indonesia" },
  { id: 21, name: "Morocco" },
  { id: 22, name: "Comunidade Islamica de Lisboa" },
  { id: 23, name: "Ministry of Awqaf, Jordan" }
];

export default function DeviceManager() {
  const { macSuffix } = useParams();
  const [device, setDevice] = useState(null);
  
  // Settings State
  const [coords, setCoords] = useState(null); 
  const [locationStr, setLocationStr] = useState("");
  const [method, setMethod] = useState(2); 
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
      
      if (error || !data) toast.error("Device not found!");
      else setDevice(data);
    }
    getDevice();
  }, [macSuffix]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Locating...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setCoords({ lat, lng });
        setLocationStr(`${lat}, ${lng}`);
        toast.success("Location Found!", { id: "loc" });
      },
      (err) => toast.error("Location failed.", { id: "loc" })
    );
  };

  const handleUpload = async () => {
    if (!file && !device) return toast.error("Please select a file.");
    if (!coords) return toast.error("Location is required.");
    
    setLoading(true);
    const toastId = toast.loading('Configuring Device...');

    const cleanMac = device.mac_address.replace(/:/g, '').toUpperCase();
    const mp3Name = `${cleanMac}.mp3`;
    const jsonName = `${cleanMac}.json`;

    try {
      // 1. Upload MP3 (Only if selected)
      if (file) {
        const fileBuffer = await file.arrayBuffer();
        await s3Client.send(new PutObjectCommand({
          Bucket: "athansaut",
          Key: mp3Name,
          Body: fileBuffer, 
          ACL: "public-read",
          ContentType: "audio/mpeg"
        }));
      }

      // 2. Upload CONFIG (Not specific times, but the Logic)
      const configData = {
        mode: "API", // Tells ESP32 to fetch its own times
        mac: device.mac_address,
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${mp3Name}`,
        latitude: coords.lat,
        longitude: coords.lng,
        method: method,
        timezone: timezone
      };

      await s3Client.send(new PutObjectCommand({
        Bucket: "athansaut",
        Key: jsonName,
        Body: JSON.stringify(configData),
        ACL: "public-read",
        ContentType: "application/json"
      }));

      toast.success('Device Configured! It will now auto-sync daily.', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Upload Failed: ' + err.message, { id: toastId });
    }
    setLoading(false);
  };

  if (!device) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800">{device.name}</h2>
        <p className="text-sm text-gray-500 font-mono">MAC: {device.mac_address}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        
        {/* 1. Location */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MapPin className="w-4 h-4 text-indigo-500" /> 1. Device Location
          </label>
          <button 
            onClick={handleGetLocation}
            className="w-full bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium py-3 rounded-xl transition-colors"
          >
            {locationStr ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : "Detect Location"}
          </button>
        </div>

        {/* 2. Method */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calculator className="w-4 h-4 text-indigo-500" /> 2. Calculation Method
          </label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl appearance-none"
              value={method} 
              onChange={(e) => setMethod(Number(e.target.value))}
            >
              {CALCULATION_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* 3. Timezone */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Globe className="w-4 h-4 text-indigo-500" /> 3. Device Timezone
          </label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl appearance-none"
              value={timezone} 
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Dubai">Dubai</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* 4. Audio */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Music className="w-4 h-4 text-indigo-500" /> 4. Audio File (Optional)
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">{file ? file.name : "Tap to upload MP3"}</span>
            <input type="file" className="hidden" accept=".mp3" onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all"
        >
          {loading ? 'Configuring...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
