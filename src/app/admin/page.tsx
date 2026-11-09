"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Plus, Trash2, Home, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("events").insert([{ 
      title, 
      event_date: date, 
      is_past_event: isPast,
      external_link: externalLink.trim() === "" ? null : externalLink.trim()
    }]);
    
    if (!error) {
      setTitle("");
      setDate("");
      setExternalLink("");
      setIsPast(false);
      fetchEvents(); // Refresh the list
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Verifying credentials...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-red-500 font-mono flex flex-col items-center justify-center">
        <ShieldAlert size={64} className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">ACCESS DENIED</h1>
        <p className="text-gray-400 mb-6">You must authenticate via the root terminal to access this page.</p>
        <Link href="/terminal" className="border border-red-500 px-6 py-2 hover:bg-red-500/10 transition-colors">Go to Terminal</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <nav className="border-b border-gray-800/50 p-4 flex justify-between items-center bg-red-900/10">
        <div className="font-bold flex items-center gap-2 text-red-500">
          <ShieldAlert size={20} /> ACPC Command Center
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><Home size={16}/> Return Home</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Timeline Management</h1>

        {/* Add Event Form */}
        <motion.form 
          onSubmit={handleAddEvent}
          className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl mb-12 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Operation Title</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-red-500" placeholder="e.g., Cyber Cup 6.0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">External Link (Optional)</label>
              <input type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-red-500" placeholder="https://..." />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end w-full mt-2">
            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs text-gray-400">Date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-red-500" />
            </div>

            <div className="flex items-center gap-2 mb-2 flex-1">
              <input type="checkbox" id="past" checked={isPast} onChange={(e) => setIsPast(e.target.checked)} className="accent-red-500 w-4 h-4" />
              <label htmlFor="past" className="text-sm">Past Event?</label>
            </div>

            <button type="submit" className="bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus size={18} /> Add
            </button>
          </div>
        </motion.form>

        {/* Event List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Current Operations</h2>
          {events.map((event) => (
            <div key={event.id} className="flex justify-between items-center bg-black border border-gray-800 p-4 rounded-lg">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {event.title} 
                  {event.external_link && <LinkIcon size={14} className="text-blue-500" />}
                </h3>
                <p className="text-xs text-gray-500">{event.event_date} • {event.is_past_event ? 'Past' : 'Upcoming'}</p>
              </div>
              <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}