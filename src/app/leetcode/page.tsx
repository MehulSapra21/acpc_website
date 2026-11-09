"use client";

import { useEffect, useState } from "react";
import { Terminal, ShieldAlert, Code, ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LeetcodePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    // IMPORTANT: Change "leetcode" to whatever you named your table in Supabase
    const { data, error } = await supabase.from("leetcode").select("*").order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching questions:", error);
    }
    
    // Safely set questions, defaulting to an empty array if data is null to prevent crashes
    setQuestions(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30 pb-20">
      
      {/* UNIVERSAL NAVIGATION BAR */}
      <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0a]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 z-10">
            <Terminal className="text-blue-500" size={24} />
            <span>ACPC.</span>
          </Link>
          
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex gap-8 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#timeline" className="hover:text-white transition-colors">Timeline</Link>
            <Link href="/gallery" className="hover:text-white transition-colors">Crew & Gallery</Link>
            <Link href="/leetcode" className="text-white transition-colors">POTD</Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-red-400 transition-colors text-red-500">Admin Panel</Link>
            )}
          </div>

          <div className="hidden md:flex z-10">
            <Link href="/recruitment" className="hover:text-blue-400 transition-colors text-blue-500 font-medium">Join Us</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Code size={16} /> Problem of the Day
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Daily Grind</h1>
          <p className="text-gray-400">Consistent execution builds algorithmic dominance. Solve the daily challenge.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading questions...</div>
        ) : (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center bg-gray-900/30 border border-gray-800 rounded-xl p-12 text-gray-500">
                No challenges posted yet. Check back soon.
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="bg-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{q.title}</h3>
                    {/* Assuming you have a difficulty column. If not, you can remove this span. */}
                    {q.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        q.difficulty.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400' :
                        q.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {/* Assuming you have a url/link column for the LeetCode URL */}
                  {q.url && (
                    <a 
                      href={q.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      Solve Problem <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}