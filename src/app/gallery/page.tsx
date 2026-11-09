"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, ShieldAlert, Plus, Award } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name: string;
  role: string;
  team: string;
  points: number;
  crop_x?: number;
  crop_y?: number;
  crop_zoom?: number;
  crop_area_x?: number;
  crop_area_y?: number;
  crop_area_width?: number;
  crop_area_height?: number;
};

export default function GalleryPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
    }
    
    fetchMembers();
    
    const refreshData = () => fetchMembers();
    window.addEventListener("focus", refreshData);
    
    return () => {
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("members").select("*");
    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const addPoint = async (id: string, currentPoints: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, points: currentPoints + 10 } : m))
    );
    await supabase.from("members").update({ points: currentPoints + 10 }).eq("id", id);
  };

  const getFormattedImageName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading Crew Data...</div>;
  }

  // --- Filter Core Executives ---
  const executives = members.filter((m) => m.team === "Core");
  
  const president = executives.find((m) => m.role.includes("President") && !m.role.includes("Vice"));
  const vpMale = executives.find((m) => m.role.includes("Vice President (Male)"));
  const vpFemale = executives.find((m) => m.role.includes("Vice President (Female)"));
  const secretary = executives.find((m) => m.role.includes("Secretary"));
  const treasurer = executives.find((m) => m.role.includes("Treasurer"));

  // Catch any other Core members that don't match the specific 5 titles above
  const knownExecIds = [president?.id, vpMale?.id, vpFemale?.id, secretary?.id, treasurer?.id].filter(Boolean);
  const otherExecutives = executives.filter((m) => !knownExecIds.includes(m.id));

  const otherTeams = ["Technical", "Designing", "Marketing", "Contests & Management", "Stats & Treasury", "Social Media"];

  // --- Reusable Executive Card Component ---
  const renderExecutiveCard = (exec: Member | undefined) => {
    if (!exec) return null;
    return (
      <div key={exec.id} className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden text-center hover:border-blue-500/50 transition-colors flex flex-col w-full sm:w-56">
        <div className="w-full aspect-square bg-gray-800 relative overflow-hidden">
          {exec.crop_area_width ? (
            <img 
              src={`/crew/${getFormattedImageName(exec.name)}.jpeg`} 
              alt={exec.name} 
              className="absolute max-w-none"
              style={{
                width: `${(100 / exec.crop_area_width) * 100}%`,
                height: `${(100 / (exec.crop_area_height || 100)) * 100}%`,
                left: `-${((exec.crop_area_x || 0) / exec.crop_area_width) * 100}%`,
                top: `-${((exec.crop_area_y || 0) / (exec.crop_area_height || 100)) * 100}%`
              }}
              onError={(e) => { e.currentTarget.style.opacity = '0'; }} 
            />
          ) : (
            <img 
              src={`/crew/${getFormattedImageName(exec.name)}.jpeg`} 
              alt={exec.name} 
              className="w-full h-full absolute inset-0 object-cover"
              onError={(e) => { e.currentTarget.style.opacity = '0'; }} 
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm">{exec.name}</h3>
          <p className="text-xs text-blue-400 mt-1">{exec.role.replace("Executive ", "")}</p>
        </div>
      </div>
    );
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

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 bg-gray-900/50 border border-green-500/30 rounded-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-green-500">Admin Leaderboard Control</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...members].sort((a, b) => b.points - a.points).map((member) => (
                <div key={member.id} className="flex justify-between items-center bg-black border border-gray-800 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.team} | <Award size={12} className="inline text-yellow-500"/> {member.points} pts</p>
                  </div>
                  <button 
                    onClick={() => addPoint(member.id, member.points)}
                    className="bg-gray-800 hover:bg-gray-700 text-green-400 p-2 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">The Crew</h1>
          <p className="text-gray-400">The minds executing brilliance behind ACPC.</p>
        </div>

        {/* Board of Executives Layout */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-2">Board of Executives</h2>
          
          <div className="flex flex-col items-center gap-6">
            {/* Row 1: President */}
            <div className="flex justify-center w-full">
              {renderExecutiveCard(president)}
            </div>

            {/* Row 2: Vice Presidents */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
              {renderExecutiveCard(vpMale)}
              {renderExecutiveCard(vpFemale)}
            </div>

            {/* Row 3: Secretary & Treasurer */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
              {renderExecutiveCard(secretary)}
              {renderExecutiveCard(treasurer)}
            </div>

            {/* Fallback for any other Core members */}
            {otherExecutives.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 w-full mt-6">
                {otherExecutives.map(exec => renderExecutiveCard(exec))}
              </div>
            )}
          </div>
        </div>

        {/* Teams Layout */}
        {otherTeams.map((teamName) => {
          const teamMembers = members.filter((m) => m.team === teamName);
          if (teamMembers.length === 0) return null;
          
          return (
            <div key={teamName} className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-gray-300">{teamName} Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className={`bg-black border ${member.role === 'Head' ? 'border-blue-500/30' : 'border-gray-800'} rounded-xl overflow-hidden text-center flex flex-col`}>
                    <div className="w-full aspect-square bg-gray-900 relative border-b border-gray-800 overflow-hidden">
                      {member.crop_area_width ? (
                        <img 
                          src={`/crew/${getFormattedImageName(member.name)}.jpeg`} 
                          alt={member.name} 
                          className="absolute max-w-none"
                          style={{
                            width: `${(100 / member.crop_area_width) * 100}%`,
                            height: `${(100 / (member.crop_area_height || 100)) * 100}%`,
                            left: `-${((member.crop_area_x || 0) / member.crop_area_width) * 100}%`,
                            top: `-${((member.crop_area_y || 0) / (member.crop_area_height || 100)) * 100}%`
                          }}
                          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                        />
                      ) : (
                        <img 
                          src={`/crew/${getFormattedImageName(member.name)}.jpeg`} 
                          alt={member.name} 
                          className="w-full h-full absolute inset-0 object-cover"
                          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm">{member.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}