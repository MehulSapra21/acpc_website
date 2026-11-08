"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Code2, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type POTD = {
  id: string;
  problem_title: string;
  problem_url: string;
  difficulty: string;
  date_posted: string;
};

export default function LeetCodePage() {
  const [problem, setProblem] = useState<POTD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPOTD();
  }, []);

  const fetchPOTD = async () => {
    // Fetch the most recent problem
    const { data, error } = await supabase
      .from("leetcode_potd")
      .select("*")
      .order("date_posted", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setProblem(data);
    } else {
      // Fallback if database is empty
      setProblem({
        id: "fallback",
        problem_title: "Two Sum",
        problem_url: "https://leetcode.com/problems/two-sum/",
        difficulty: "Easy",
        date_posted: new Date().toISOString().split('T')[0],
      });
    }
    setLoading(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "hard": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30 pb-20">
      <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
            <Terminal className="text-blue-500" size={24} />
            <span>ACPC.</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-4">
            <Code2 size={40} className="text-blue-500" />
            Problem of the Day
          </h1>
          <p className="text-gray-400">Sharpen your algorithmic thinking. Solve the daily challenge.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading today's challenge...</div>
        ) : problem ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-black border border-gray-800 p-8 rounded-xl shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <CalendarIcon size={16} />
                  <span>{problem.date_posted}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>

              <h2 className="text-3xl font-bold mb-6">{problem.problem_title}</h2>
              
              <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg mb-8 text-gray-400 text-sm">
                <p>ACPC expects all core and technical members to solve the daily problem. Consistency is the key to dominating the leaderboards.</p>
              </div>

              <a 
                href={problem.problem_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                Solve on LeetCode <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}