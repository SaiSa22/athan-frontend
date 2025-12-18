import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Import the interface so we can use the type
import { ContinuousCalendar, CalendarEvent } from './ContinuousCalendar';
import './App.css'; 

function App() {
  // --- EXISTING STATE (For Left Column Manual Input) ---
  const [text, setText] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  // --- NEW STATE (For Calendar Events) ---
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_URL = "https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-d690139c-c62c-4535-a31f-b6895767f7aa/speech/convert"; 

  // --- HELPER: GENERIC API CALL ---
  // This allows both the "Manual Button" and the "Calendar Modal" to use the same backend logic
  const sendToBackend = async (messageText: string, startUnix: number, endUnix: number) => {
    setLoading(true);
    setAudioUrl('');
    setError('');

    try {
      if (endUnix <= startUnix) throw new Error("End time must be after Start time.");

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          alertStart: startUnix,
          alertEnd: endUnix
        })
      });

      const data = await response.json();

      if (data.url) {
        setAudioUrl(data.url);
        return true; // Success
      } else if (data.error) {
        setError(data.error);
        return false;
      } else {
        setError("Unknown error from server.");
        return false;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to the server.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER 1: MANUAL BUTTON (Left Column) ---
  const handleManualConvert = async () => {
    if (!text.trim()) {
      alert("Please enter some text first.");
      return;
    }
    
    // Convert Date objects to Unix
    const getUnix = (d: Date, t: Date) => {
      const combined = new Date(d);
      combined.setHours(t.getHours());
      combined.setMinutes(t.getMinutes());
      combined.setSeconds(0);
      return Math.floor(combined.getTime() / 1000);
    };

    const start = getUnix(date, startTime);
    const end = getUnix(date, endTime);

    await sendToBackend(text, start, end);
  };

  // --- HANDLER 2: CALENDAR MODAL (Right Column) ---
  const handleModalEvent = async (newEvent: CalendarEvent) => {
    // 1. Add visual bar to calendar immediately
    setEvents([...events, newEvent]);

    // 2. Prepare data for API
    // The modal gives us strings like "2025-12-18" and "09:00", we need Unix numbers
    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime || '09:00'}`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime || '10:00'}`);
    
    const startUnix = Math.floor(startDateTime.getTime() / 1000);
    const endUnix = Math.floor(endDateTime.getTime() / 1000);

    // 3. Send to Backend
    if (newEvent.message) {
      await sendToBackend(newEvent.message, startUnix, endUnix);
    }
  };

  const handleDateSelect = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    setDate(newDate);
  };

  return (
    <div className="App min-h-screen w-full bg-gray-50 p-4 lg:p-6">
      
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Text to Speech Alert System</h1>
          <p className="text-gray-600">Powered by Azure & DigitalOcean</p>
        </div>
        {audioUrl && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-md border border-green-200">
              <span className="text-green-700 font-bold px-2">✓ Ready!</span>
              <audio controls src={audioUrl} className="h-8 w-64" />
              <a href={audioUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">Download</a>
            </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 w-full h-full">
        
        {/* LEFT COLUMN: Manual Controls */}
        <div className="w-full xl:w-[400px] flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-grow">
            <label className="font-bold mb-3 block text-gray-700 text-lg">1. Manual Message</label>
            <textarea 
              placeholder="Type your alert message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[300px] xl:h-[500px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 text-lg"
            />
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <label className="font-bold mb-4 block text-gray-700 text-lg">Manual Time</label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase mb-1">Start Time</span>
                  <DatePicker
                    selected={startTime}
                    onChange={(d: Date | null) => d && setStartTime(d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-lg cursor-pointer hover:bg-gray-50"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase mb-1">End Time</span>
                  <DatePicker
                    selected={endTime}
                    onChange={(d: Date | null) => d && setEndTime(d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full p-3 border border-gray-300 rounded-lg text-center font-mono text-lg cursor-pointer hover:bg-gray-50"
                  />
                </div>
              </div>
          </div>

          <button 
            onClick={handleManualConvert} 
            disabled={loading}
            className={`w-full py-5 text-xl font-bold text-white rounded-2xl shadow-lg transform transition-all active:scale-95 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
            }`}
          >
            {loading ? 'Processing...' : 'Create Manual Alert'}
          </button>
          
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center border border-red-200">{error}</div>}
        </div>

        {/* RIGHT COLUMN: Calendar */}
        <div className="flex-grow flex flex-col h-full min-h-[800px]">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <label className="font-bold text-xl text-gray-800">2. Select Date</label>
                <span className="bg-blue-600 text-white py-1 px-4 rounded-full text-sm font-bold shadow-sm">
                  {date.toDateString()}
                </span>
              </div>
              
              <div className="flex-grow relative bg-white">
                <ContinuousCalendar 
                    onClick={handleDateSelect} 
                    events={events}             // 1. Pass the events list
                    onAddEvent={handleModalEvent} // 2. Pass the handler that calls the API
                    selectedDate={date}         // 3. Pass the selected date (enables the button)
                />
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
