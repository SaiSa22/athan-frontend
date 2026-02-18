import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import toast from 'react-hot-toast';
import { Music, Globe, ChevronDown, MapPin, Calculator, Save, Wifi } from 'lucide-react';

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

const AUDIO_OPTIONS = [
  { name: "Kassim Zadeh", filename: "adhan_zadeh.mp3" },
  { name: "Mansoor-Zahrani", filename: "Mansoor-Zahrani.mp3" },
  { name: "Al Jazairi", filename: "Rabeh-Ibn-Darah-Jazairi.mp3" },
  { name: "Makkah", filename: "Adhan-Makkah.mp3" },
  { name: "Madinah", filename: "Adhan-Madinah.mp3" },
  { name: "Al-Aqsa", filename: "Adhan-Alaqsa.mp3" },
  { name: "Egypt", filename: "Adhan-Egypt.mp3" },
  { name: "Abdul Basit", filename: "Abdul-Basit.mp3" },
  { name: "Minshawi", filename: "Minshawi.mp3" },
  { name: "Yusuf Islam", filename: "Yusuf-Islam.mp3" },
  { name: "Kazem Zadeh", filename: "Kazem-Zadeh.mp3" },
  { name: "Aghati", filename: "Aghati.mp3" },
  { name: "Rezaeian", filename: "Rezaeian.mp3" }
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Karachi", label: "Karachi (PKT)" },
  { value: "Asia/Riyadh", label: "Riyadh (AST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Jakarta", label: "Jakarta (WIB)" },
  { value: "Asia/Kuala_Lumpur", label: "Malaysia (MYT)" },
  { value: "Africa/Cairo", label: "Cairo (EET)" }
];

export default function DeviceManager() {
  const { macSuffix } = useParams();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  
  const [coords, setCoords] = useState(null); 
  const [locationStr, setLocationStr] = useState("");
  const [method, setMethod] = useState(2); 
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedAudio, setSelectedAudio] = useState(AUDIO_OPTIONS[0].filename);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function getDevice() {
      console.log("Looking for device with macSuffix:", macSuffix);
      
      // Try mac_suffix first
      let { data, error: err1 } = await supabase
        .from('devices')
        .select('*')
        .eq('mac_suffix', macSuffix)
        .single();
      
      // If not found, try mac_address
      if (err1 || !data) {
        console.log("Not found by mac_suffix, trying mac_address...");
        const { data: data2, error: err2 } = await supabase
          .from('devices')
          .select('*')
          .ilike('mac_address', `%${macSuffix}%`)
          .single();
        
        if (err2 || !data2) {
          console.error("Device not found:", err1, err2);
          setError(`Device not found: ${macSuffix}`);
          toast.error("Device not found!");
        } else {
          console.log("Found device:", data2);
          setDevice(data2);
        }
      } else {
        console.log("Found device:", data);
        setDevice(data);
      }
    }
    
    if (macSuffix) {
      getDevice();
    }
  }, [macSuffix]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Detecting location...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setCoords({ lat, lng });
        setLocationStr(`${lat}, ${lng}`);
        toast.success("Location detected!", { id: "loc" });
      },
      (err) => toast.error("Location detection failed.", { id: "loc" })
    );
  };

  const handleSaveConfig = async () => {
    if (!device) return;
    if (!coords) return toast.error("Please detect your location first.");
    
    setLoading(true);
    const toastId = toast.loading('Saving configuration...');

    const cleanMac = device.mac_address.replace(/:/g, '').toUpperCase();
    const jsonName = `${cleanMac}.json`;

    try {
      const configData = {
        mode: "API", 
        mac: device.mac_address,
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${selectedAudio}`,
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

      toast.success('Configuration saved!', { id: toastId });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error('Save failed: ' + err.message, { id: toastId });
    }
    setLoading(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-[24px] p-8 border border-slate-200 shadow-xl max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Device Not Found</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <p className="text-slate-400 text-sm">Check the URL or add the device first.</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading device...</p>
          <p className="text-slate-400 text-sm mt-2">Looking for: {macSuffix}</p>
        </div>
      </div>
    );
  }

  return (
    // Lighter background, no fixed elements interfering with flow
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      
      {/* Subtle top glow (Optional, but looks nice on light mode) */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        
        {/* Device Header */}
        <div className="bg-white rounded-[24px] p-5 mb-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wifi className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{device.name}</h2>
              <p className="text-sm text-slate-500 font-mono">{device.mac_address}</p>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-xl space-y-6">
          
          {/* 1. Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>1. Device Location</span>
            </label>
            <button 
              onClick={handleGetLocation}
              className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                coords 
                  ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700' 
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {coords ? (
                <>
                  <MapPin className="w-5 h-5" />
                  {coords.lat}, {coords.lng}
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Tap to Detect Location
                </>
              )}
            </button>
          </div>

          {/* 2. Calculation Method */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <span>2. Calculation Method</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer"
                value={method} 
                onChange={(e) => setMethod(Number(e.target.value))}
              >
                {CALCULATION_METHODS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 3. Timezone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span>3. Timezone</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                value={timezone} 
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 4. Adhan Sound */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <span>4. Adhan Sound</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                value={selectedAudio} 
                onChange={(e) => setSelectedAudio(e.target.value)}
              >
                {AUDIO_OPTIONS.map((opt) => (
                  <option key={opt.filename} value={opt.filename}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSaveConfig} 
            disabled={loading || !coords}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:text-slate-100'
            }`}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center px-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            After saving, <span className="text-emerald-600 font-bold">press the button once</span> on your device to download the new configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
