import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import toast from 'react-hot-toast';
import { Music, Globe, ChevronDown, MapPin, Calculator, Save, Wifi, Volume2, Clock, Eye } from 'lucide-react';

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
  { id: 0, name: "Jafari / Shia Ithna-Ashari" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 3, name: "Muslim World League" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 12, name: "Union Organization Islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 23, name: "Ministry of Awqaf, Jordan" }
];

const AUDIO_OPTIONS = [
  { name: "Kazem Zadeh", filename: "Kazem-Zadeh.mp3" },
  { name: "Rezaeian", filename: "Rezaeian.mp3" },
  { name: "Abdul Basit", filename: "Abdul-Basit.mp3" },
  { name: "Minshawi", filename: "Minshawi.mp3" },
  { name: "Al-Aqsa", filename: "Adhan-Alaqsa.mp3" },
  { name: "Egypt", filename: "Adhan-Egypt.mp3" },
  { name: "Madinah", filename: "Adhan-Madinah.mp3" },
  { name: "Makkah", filename: "Adhan-Makkah.mp3" },
  { name: "Aghati", filename: "Aghati.mp3" },
  { name: "Yusuf Islam", filename: "Yusuf-Islam.mp3" }
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
  
  // Configuration State
  const [coords, setCoords] = useState(null); 
  const [method, setMethod] = useState(0); // Default to Jafari (id: 0)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedAudio, setSelectedAudio] = useState(AUDIO_OPTIONS[0].filename);
  const [prayerCount, setPrayerCount] = useState(5); // 3 or 5 prayers
  const [volume, setVolume] = useState(100); // Volume: 50, 75, or 100
  
  // Prayer Times Preview State
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(false);
  
  // Save State
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function getDevice() {
      console.log("Looking for device with macSuffix:", macSuffix);
      
      let { data, error: err1 } = await supabase
        .from('devices')
        .select('*')
        .eq('mac_suffix', macSuffix)
        .single();
      
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
        toast.success("Location detected!", { id: "loc" });
      },
      (err) => toast.error("Location detection failed.", { id: "loc" })
    );
  };

  // NEW: Fetch prayer times from Aladhan API
  const handleShowPrayerTimes = async () => {
    if (!coords) {
      toast.error("Please detect your location first.");
      return;
    }
    
    setLoadingPrayerTimes(true);
    
    try {
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      
      // API call matching firmware: midnightMode=1 (Jafari)
      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=${method}&midnightMode=1`;
      
      console.log("Fetching prayer times:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data && data.data.timings) {
        setPrayerTimes(data.data.timings);
        toast.success("Prayer times loaded!");
      } else {
        toast.error("Could not fetch prayer times.");
      }
    } catch (err) {
      console.error("Error fetching prayer times:", err);
      toast.error("Failed to fetch prayer times.");
    }
    
    setLoadingPrayerTimes(false);
  };

  const handleSaveConfig = async () => {
    if (!device) return;
    if (!coords) return toast.error("Please detect your location first.");
    
    setLoading(true);
    const toastId = toast.loading('Saving configuration...');

    const cleanMac = device.mac_address.replace(/:/g, '').toUpperCase();
    const jsonName = `${cleanMac}.json`;

    try {
      // JSON structure matching old format exactly, with new fields added
      const configData = {
        mode: "API",
        mac: device.mac_address.toLowerCase(),
        audio_url: `https://athansaut.sfo3.digitaloceanspaces.com/${selectedAudio}`,
        latitude: coords.lat,
        longitude: coords.lng,
        method: method,
        timezone: timezone,
        prayer_count: prayerCount,
        volume: volume
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 border border-[#e0dcc8] shadow-sm max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-[#3d3225] mb-2">Device Not Found</h2>
          <p className="text-[#6b5c4a] mb-4">{error}</p>
          <p className="text-[#8b7355] text-sm">Check the URL or add the device first.</p>
        </div>
      </div>
    );
  }

  // Loading State
  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e0dcc8] border-t-[#5c4d3c] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b5c4a] font-medium">Loading device...</p>
          <p className="text-[#8b7355] text-sm mt-2">Looking for: {macSuffix}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 flex justify-center">
      <div className="w-full max-w-lg bg-white border-2 border-[#d4cfc0] rounded-2xl p-6 shadow-md">
        
        {/* Device Header */}
        <div className="bg-[#faf9f5] rounded-xl p-5 mb-5 border border-[#e0dcc8]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5c4d3c] flex items-center justify-center shadow-md">
              <Wifi className="w-7 h-7 text-[#f5f5dc]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3d3225]">{device.name}</h2>
              <p className="text-sm text-[#8b7355] font-mono">{device.mac_address}</p>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-[#faf9f5] rounded-xl p-5 border border-[#e0dcc8] space-y-6">
          
          {/* 1. Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>1. Device Location</span>
            </label>
            <button 
              onClick={handleGetLocation}
              className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                coords 
                  ? 'bg-green-50 border-2 border-green-200 text-green-700' 
                  : 'bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#6b5c4a] hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <MapPin className="w-5 h-5" />
              {coords ? `${coords.lat}, ${coords.lng}` : 'Tap to Detect Location'}
            </button>
          </div>

          {/* 2. Calculation Method with Show Button */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <span>2. Calculation Method</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select 
                  className="w-full bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#3d3225] py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-[#8b7355] transition-all cursor-pointer"
                  value={method} 
                  onChange={(e) => setMethod(Number(e.target.value))}
                >
                  {CALCULATION_METHODS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b7355] pointer-events-none" />
              </div>
              <button
                onClick={handleShowPrayerTimes}
                disabled={!coords || loadingPrayerTimes}
                className="px-4 py-3.5 bg-violet-100 text-violet-600 rounded-xl font-medium hover:bg-violet-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center gap-2"
              >
                {loadingPrayerTimes ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                Show
              </button>
            </div>
          </div>

          {/* Prayer Times Display - Table Format */}
          {prayerTimes && (
            <div className="bg-[#faf9f5] rounded-xl p-4 border border-[#e0dcc8]">
              <h3 className="text-sm font-bold text-[#5c4d3c] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today's Prayer Times
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e0dcc8]">
                    <th className="text-left py-2 text-[#6b5c4a] font-semibold">Prayer</th>
                    <th className="text-right py-2 text-[#6b5c4a] font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Fajr</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Fajr}</td>
                  </tr>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Sunrise</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Sunrise}</td>
                  </tr>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Dhuhr</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Dhuhr}</td>
                  </tr>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Asr</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Asr}</td>
                  </tr>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Maghrib</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Maghrib}</td>
                  </tr>
                  <tr className="border-b border-[#e0dcc8]/50">
                    <td className="py-2 text-[#5c4d3c]">Isha</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Isha}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#5c4d3c]">Midnight</td>
                    <td className="py-2 text-right font-mono font-bold text-[#3d3225]">{prayerTimes.Midnight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Timezone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span>3. Timezone</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#3d3225] py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-[#8b7355] transition-all cursor-pointer"
                value={timezone} 
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b7355] pointer-events-none" />
            </div>
          </div>

          {/* 4. Adhan Sound */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <span>4. Adhan Sound</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#3d3225] py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-[#8b7355] transition-all cursor-pointer"
                value={selectedAudio} 
                onChange={(e) => setSelectedAudio(e.target.value)}
              >
                {AUDIO_OPTIONS.map((opt) => (
                  <option key={opt.filename} value={opt.filename}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b7355] pointer-events-none" />
            </div>
          </div>

          {/* 5. Number of Prayers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span>5. Number of Prayers Played</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#3d3225] py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-[#8b7355] transition-all cursor-pointer"
                value={prayerCount} 
                onChange={(e) => setPrayerCount(Number(e.target.value))}
              >
                <option value={5}>5 Prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)</option>
                <option value={3}>3 Prayers (Fajr, Dhuhr, Maghrib)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b7355] pointer-events-none" />
            </div>
          </div>

          {/* 6. Volume */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#5c4d3c] mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <span>6. Volume</span>
            </label>
            <div className="relative">
              <select 
                className="w-full bg-[#faf9f5] border-2 border-[#e0dcc8] text-[#3d3225] py-3.5 px-4 rounded-xl appearance-none focus:outline-none focus:border-[#8b7355] transition-all cursor-pointer"
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
              >
                <option value={100}>100%</option>
                <option value={75}>75%</option>
                <option value={50}>50%</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b7355] pointer-events-none" />
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSaveConfig} 
            disabled={loading || !coords}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98] ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#5c4d3c] text-white hover:bg-[#4a3d2f] disabled:bg-[#c4b89b] disabled:text-[#8b7355]'
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
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8b7355] leading-relaxed">
            After saving, <span className="text-[#5c4d3c] font-bold">press the button once</span> on your device to download the new configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
