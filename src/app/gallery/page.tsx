"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
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

  const knownExecIds = [president?.id, vpMale?.id, vpFemale?.id, secretary?.id, treasurer?.id].filter(Boolean);
  const otherExecutives = executives.filter((m) => !knownExecIds.includes(m.id));

  const otherTeams = ["Technical", "Designing", "Marketing", "Contests & Management", "Stats & Treasury", "Social Media"];

  // --- Reusable Universal Member Card Component ---
  const renderMemberCard = (member: Member | undefined, isHead: boolean = false) => {
    if (!member) return null;
    
    const isHighlighted = isHead || member.team === "Core";
    
    return (
      <div key={member.id} className={`bg-black border ${isHighlighted ? 'border-blue-500/40' : 'border-gray-800'} rounded-xl overflow-hidden text-center hover:border-blue-500/60 transition-colors flex flex-col w-[45%] sm:w-48 md:w-52 lg:w-56`}>
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
          <p className={`text-xs mt-1 ${isHighlighted ? 'text-blue-400' : 'text-gray-500'}`}>
            {member.role.replace("Executive ", "")}
          </p>
        </div>
      </div>
    );
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
            <Link href="/gallery" className="text-white transition-colors">Crew & Gallery</Link>
            <Link href="/leetcode" className="hover:text-white transition-colors">POTD</Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-red-400 transition-colors text-red-500">Admin Panel</Link>
            )}
          </div>

          <div className="hidden md:flex z-10">
            <Link href="/recruitment" className="hover:text-blue-400 transition-colors text-blue-500 font-medium">Join Us</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">The Crew</h1>
          <p className="text-gray-400">The minds executing brilliance behind ACPC.</p>
        </div>

        {/* Board of Executives Layout */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-2">Board of Executives</h2>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center w-full">
              {renderMemberCard(president, true)}
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
              {renderMemberCard(vpMale, true)}
              {renderMemberCard(vpFemale, true)}
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
              {renderMemberCard(secretary, true)}
              {renderMemberCard(treasurer, true)}
            </div>

            {otherExecutives.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full mt-2">
                {otherExecutives.map(exec => renderMemberCard(exec, true))}
              </div>
            )}
          </div>
        </div>

        {/* Teams Layout */}
        {otherTeams.map((teamName) => {
          const teamMembers = members.filter((m) => m.team === teamName);
          if (teamMembers.length === 0) return null;
          
          const head = teamMembers.find(m => m.role.toLowerCase().includes('head'));
          const restOfTeam = teamMembers.filter(m => m.id !== head?.id);
          
          return (
            <div key={teamName} className="mb-16">
              <h2 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-2 text-gray-300">{teamName} Team</h2>
              
              <div className="flex flex-col items-center gap-6">
                {/* Team Head (Centered) */}
                {head && (
                  <div className="flex justify-center w-full">
                    {renderMemberCard(head, true)}
                  </div>
                )}
                
                {/* Team Members (Flex Wrap, centers leftover cards on last row automatically) */}
                {restOfTeam.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
                    {restOfTeam.map((member) => renderMemberCard(member))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}