import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ContinuousCalendar, CalendarEvent } from './ContinuousCalendar';
import { supabase } from './supabaseClient';
import { SettingsModal } from './SettingsModal';

// --------------------------------------------------------------------------
// REPLACE WITH YOUR ACTUAL DIGITALOCEAN FUNCTION URL
// --------------------------------------------------------------------------
const SCHEDULER_URL = "https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-d690139c-c62c-4535-a31f-b6895767f7aa/speech/scheduler-generator";

// --- ICONS ---
const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={spinning ? "animate-spin" : ""}
  >
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

interface DashboardProps {
  session: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [text, setText] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- STYLES ---
  const buttonBaseClass = "w-full py-3 text-base font-bold text-white rounded-lg shadow-sm transition-all active:scale-95";
  const buttonLoadingClass = "bg-gray-400 cursor-not-allowed";
  const buttonActiveClass = "bg-blue-600 hover:bg-blue-700";
  const finalButtonClass = `${buttonBaseClass} ${loading ? buttonLoadingClass : buttonActiveClass}`;

  const textAreaClass = "w-full h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 text-sm";
  const datePickerClass = "w-full p-2 border border-gray-300 rounded-lg text-center font-mono cursor-pointer hover:bg-gray-50 text-sm";

  // --- FETCH EVENTS ---
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (data) {
        const loadedEvents: CalendarEvent[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          title: item.title,
          message: item.message,
          startTime: item.start_time,
          endTime: item.end_time
        }));
        setEvents(loadedEvents);
      } else if (error) {
        console.error('Error loading events:', error);
      }
    };

    if (session) fetchEvents();
  }, [session]);

  // --- HELPER: CHECK EVENT LIMIT ---
  const checkLimit = async (checkDate: Date, excludeEventId?: string) => {
    const dateStr = checkDate.toLocaleDateString('en-CA');
    
    // We get the raw events to count them ourselves so we can exclude the one being edited
    const { data: dayEvents } = await supabase
        .from('events')
        .select('id')
        .eq('date', dateStr);
    
    if (dayEvents) {
        // If we are editing, we don't count the current event towards the limit
        const count = excludeEventId 
            ? dayEvents.filter(e => e.id !== excludeEventId).length 
            : dayEvents.length;

        if (count >= 3) {
            alert("Daily Limit Reached: You can only have 3 events per day.");
            return false;
        }
    }
    return true;
  };

  // --- HELPER: CHECK TIME OVERLAP ---
  const checkOverlap = (checkDate: string, newStart: string, newEnd: string, excludeEventId?: string) => {
    // Convert "HH:MM" to minutes for comparison
    const toMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const newStartMin = toMinutes(newStart);
    const newEndMin = toMinutes(newEnd);

    // Filter events for the same day
    const dayEvents = events.filter(e => 
        e.date === checkDate && 
        e.id !== excludeEventId // Don't compare against self if editing
    );

    for (const existing of dayEvents) {
        if (!existing.startTime || !existing.endTime) continue;
        
        const existStart = toMinutes(existing.startTime);
        const existEnd = toMinutes(existing.endTime);

        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        if (newStartMin < existEnd && newEndMin > existStart) {
            return true; // Overlap detected
        }
    }
    return false;
  };

  // --- FORCE REFRESH (Call Backend) ---
  const handleForceRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    
    try {
        const response = await fetch(SCHEDULER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: session.user.id }) 
        });

        if (response.ok) {
            setMsg("System refreshed! Audio updated.");
        } else {
            setError("Refresh failed. Server error.");
        }
    } catch (err) {
        console.error(err);
        setError("Network error connecting to scheduler.");
    } finally {
        setRefreshing(false);
        setTimeout(() => { setMsg(''); setError(''); }, 4000);
    }
  };

  const handleManualConvert = async () => {
    if (!text.trim()) { alert("Please enter text."); return; }
    
    const dateStr = date.toLocaleDateString('en-CA');
    const startStr = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    const endStr = endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

    // 1. Check Limit
    const canAdd = await checkLimit(date);
    if (!canAdd) return;

    // 2. Check Overlap
    const hasOverlap = checkOverlap(dateStr, startStr, endStr);
    if (hasOverlap) {
        setError("Time Conflict! This event overlaps with an existing one.");
        setTimeout(() => setError(''), 4000);
        return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await supabase.from('events').insert([{
        title: "Manual Alert",
        message: text,
        date: dateStr,
        start_time: startStr,
        end_time: endStr,
        processed: false,
        user_id: session.user.id
    }]).select();

    setLoading(false);

    if (data) {
        const manualEvent: CalendarEvent = {
            id: data[0].id,
            date: dateStr,
            title: "Manual Alert",
            message: text,
            startTime: startStr,
            endTime: endStr
        };
        setEvents([...events, manualEvent]);
        setMsg("Event saved! Audio queued.");
        setText(''); // Clear text on success
        setTimeout(() => setMsg(''), 4000);
    } else if (error) {
        setError("Failed to save event: " + error.message);
    }
  };

  const handleModalEvent = async (newEvent: CalendarEvent) => {
    const eventDate = new Date(newEvent.date + 'T00:00:00'); 
    
    // 1. Check Limit (pass ID if editing to exclude self)
    const canAdd = await checkLimit(eventDate, newEvent.id);
    if (!canAdd) return;

    // 2. Check Overlap (pass ID if editing)
    // Note: newEvent.startTime is already formatted by the modal usually, assume HH:mm
    // If not, ensure formatting inside ContinuousCalendar before passing up
    const hasOverlap = checkOverlap(newEvent.date, newEvent.startTime!, newEvent.endTime!, newEvent.id);
    
    if (hasOverlap) {
        // We use alert here because this is called from the modal context
        alert("Time Conflict: This event overlaps with an existing one.");
        return; // Stop save
    }

    let result;
    
    // IF ID exists and is not temp timestamp, it's an UPDATE
    // (We use a simple check: if the ID provided exists in our list, it's an edit)
    const isEdit = events.some(e => e.id === newEvent.id);

    if (isEdit) {
        // UPDATE
        const { data, error } = await supabase.from('events')
            .update({
                title: newEvent.title,
                message: newEvent.message,
                start_time: newEvent.startTime,
                end_time: newEvent.endTime,
                processed: false // Reset processed so audio regenerates!
            })
            .eq('id', newEvent.id)
            .select();
        result = { data, error };
    } else {
        // INSERT
        const { data, error } = await supabase.from('events').insert([{
            title: newEvent.title,
            message: newEvent.message,
            date: newEvent.date,
            start_time: newEvent.startTime,
            end_time: newEvent.endTime,
            processed: false,
            user_id: session.user.id
        }]).select();
        result = { data, error };
    }

    if (result.data) {
        const savedData = result.data[0];
        const savedEvent = { 
            ...newEvent, 
            id: savedData.id,
            startTime: savedData.start_time, // Ensure we use DB returned format
            endTime: savedData.end_time
        };
        
        if (isEdit) {
            setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
            setMsg("Event updated successfully.");
        } else {
            setEvents([...events, savedEvent]);
            setMsg("Event created successfully.");
        }
        setTimeout(() => setMsg(''), 3000);
    } else if (result.error) {
        alert("Error saving event: " + result.error.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) console.error("Failed to delete", error);
  };

  const handleDateSelect = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    setDate(newDate);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 flex-none w-full flex justify-between items-center px-4 md:px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">MagRemind</h1>
          <p className="text-gray-500 text-xs md:text-sm">Audio Scheduler</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
            {/* REFRESH BUTTON */}
            <button 
                onClick={handleForceRefresh}
                disabled={refreshing}
                className={`p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors ${refreshing ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                title="Force System Refresh"
            >
                <RefreshIcon spinning={refreshing} />
            </button>

            {/* SETTINGS BUTTON */}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
                title="Settings"
            >
                <GearIcon />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            <button 
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors px-2"
            >
                Log Out
            </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-hidden">
        
        {/* SIDEBAR: Manual Inputs */}
        <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-4">
          
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <label className="font-bold block text-gray-700 text-sm uppercase tracking-wide">1. Message</label>
                {/* NEW: Character Counter */}
                <span className={`text-xs font-medium ${text.length > 180 ? 'text-red-600' : 'text-gray-400'}`}>
                    {text.length}/180
                </span>
            </div>
            <textarea 
              placeholder="Type your alert message here..."
              value={text}
              maxLength={180} // NEW: Max Limit Enforced
              onChange={(e) => setText(e.target.value)}
              className={textAreaClass}
            />
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200">
              <label className="font-bold mb-4 block text-gray-700 text-sm uppercase tracking-wide">2. Time</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 mb-1">START</span>
                  <DatePicker
                    selected={startTime}
                    onChange={(d: Date | null) => d && setStartTime(d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    className={datePickerClass}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 mb-1">END</span>
                  <DatePicker
                    selected={endTime}
                    onChange={(d: Date | null) => d && setEndTime(d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    className={datePickerClass}
                  />
                </div>
              </div>
          </div>

          <button 
            onClick={handleManualConvert} 
            disabled={loading}
            className={finalButtonClass}
          >
            {loading ? 'Processing...' : 'Schedule Alert'}
          </button>
          
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-center border border-red-100 text-xs font-medium">{error}</div>}
          {msg && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-center border border-green-100 text-xs font-medium">{msg}</div>}
        </div>

        {/* CALENDAR AREA */}
        <div className="flex-grow flex flex-col min-w-0 h-[600px] lg:h-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="flex-none px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <label className="font-bold text-lg text-gray-800">Calendar</label>
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wider">
                  {date.toDateString()}
                </span>
              </div>
              
              <div className="flex-grow relative h-full bg-white">
                <ContinuousCalendar 
                    onClick={handleDateSelect} 
                    events={events}             
                    onAddEvent={handleModalEvent} // Now handles both Add and Edit
                    onDeleteEvent={handleDeleteEvent}
                    selectedDate={date}         
                />
              </div>
          </div>
        </div>

      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        session={session} 
      />

    </div>
  );
};
