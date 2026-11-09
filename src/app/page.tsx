"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Event = {
  id: string;
  title: string;
  event_date: string;
  is_past_event: boolean;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    
    if (data && !error) {
      setEvents(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30">
      
      {/* Centered Navigation Bar */}
      <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
            <Terminal className="text-blue-500" size={24} />
            <span>ACPC.</span>
          </Link>
          
          {/* Centered Links */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex gap-8 text-sm text-gray-400">
            <Link href="#timeline" className="hover:text-white transition-colors">Timeline</Link>
            <Link href="/gallery" className="hover:text-white transition-colors">Crew & Gallery</Link>
            <Link href="/leetcode" className="hover:text-white transition-colors">POTD</Link>
            <Link href="/admin" className="hover:text-red-400 transition-colors text-red-500">Admin Panel</Link>
          </div>

          <div className="hidden md:flex">
            <Link href="/recruitment" className="hover:text-blue-400 transition-colors text-blue-500 font-medium">Join Us</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Online. Welcome to Amity Competitive Programming Club.
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Compile your future. <br/> Execute brilliance.
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
            We are a highly specialized group of developers, designers, and algorithmic thinkers at Amity University building cutting-edge projects and dominating hackathons.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/recruitment" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group">
              Apply Now 
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#timeline" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <Calendar size={18} /> View Schedule
            </Link>
          </div>
        </motion.div>

        {/* Dynamic Timeline Section */}
        <div id="timeline" className="mt-40 pt-20 border-t border-gray-800/50">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
              <span className="w-8 h-1 bg-blue-500 rounded-full"></span> 
              Operations Timeline
            </h2>
            
            <div className="relative border-l border-gray-800 ml-3 space-y-12">
              {events.length === 0 ? (
                <p className="pl-8 text-gray-500">No operations scheduled.</p>
              ) : (
                events.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="relative pl-8"
                  >
                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0a0a0a] ${!event.is_past_event ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-md ${!event.is_past_event ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                          {!event.is_past_event ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Calendar size={14} /> {event.event_date}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}