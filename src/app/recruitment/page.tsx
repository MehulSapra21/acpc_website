"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecruitmentPage() {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", why_join: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const { error } = await supabase.from("recruitment").insert([formData]);

    if (error) {
      console.error(error);
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({ full_name: "", email: "", phone: "", why_join: "" });
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

      <main className="max-w-3xl mx-auto px-6 mt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Join The Crew</h1>
          <p className="text-gray-400">Applications are currently open for all students. Prove your logic.</p>
        </div>

        {status === "success" ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/10 border border-green-500 text-green-400 p-8 rounded-xl text-center">
            <CheckCircle size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Received</h2>
            <p>Our core team will review your profile and contact you soon.</p>
            <button onClick={() => setStatus("idle")} className="mt-6 text-sm underline hover:text-green-300">Submit another application</button>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            onSubmit={handleSubmit} 
            className="bg-black border border-gray-800 p-8 rounded-xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" placeholder="john@student.amity.edu" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Phone Number</label>
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" placeholder="+91 98765 43210" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Why do you want to join ACPC?</label>
              <textarea required rows={4} value={formData.why_join} onChange={(e) => setFormData({...formData, why_join: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors" placeholder="Tell us about your tech stack, past hackathons, or learning goals..." />
            </div>

            {status === "error" && <p className="text-red-500 text-sm">An error occurred while submitting. Please try again.</p>}

            <button disabled={status === "submitting"} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
              {status === "submitting" ? "Executing..." : "Submit Application"} <Send size={18} />
            </button>
          </motion.form>
        )}
      </main>
    </div>
  );
}