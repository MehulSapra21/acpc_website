"use client";

import { useState, useEffect } from "react";
import { Terminal, Menu, X, Instagram } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Custom SVG for X (Twitter)
const XLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Custom SVG for WhatsApp
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <path d="M16.5 16c-1.5 1-3-1-4-2s-3-2.5-2-4 1-3-1-4-2-.5-3-1-2-2-1.5-3 3-1.5 4 0 1 3-1 4 2 3 4 2 3-1 4-1 3 1.5 3 2.5-1.5 3-3 3z"/>
  </svg>
);

// Custom SVG for LinkedIn
const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getLinkStyle = (path: string) => 
    pathname === path ? "text-white font-medium" : "text-gray-400 hover:text-white transition-colors";

  const socialLinks = [
    { name: "WhatsApp", url: "https://chat.whatsapp.com/Bl5ImRHTyPR945bWfizvEL", icon: <WhatsAppIcon size={20} />, hover: "hover:text-green-500" },
    { name: "Instagram", url: "https://www.instagram.com/acpc_amity", icon: <Instagram size={20} />, hover: "hover:text-pink-500" },
    { name: "X", url: "https://x.com/AcpcMail31881", icon: <XLogo size={18} />, hover: "hover:text-white" },
    { name: "LinkedIn", url: "http://linkedin.com/company/amity-competitive-programming-club/", icon: <LinkedInIcon size={20} />, hover: "hover:text-blue-500" }
  ];

  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0a]/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
        <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 z-10">
          <Terminal className="text-blue-500" size={24} />
          <span>ACPC.</span>
        </Link>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex gap-8 text-sm">
          <Link href="/" className={getLinkStyle("/")}>Home</Link>
          <Link href="/#timeline" className="text-gray-400 hover:text-white transition-colors">Timeline</Link>
          <Link href="/gallery" className={getLinkStyle("/gallery")}>Crew & Gallery</Link>
          <Link href="/leetcode" className={getLinkStyle("/leetcode")}>POTD</Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-red-400 transition-colors text-red-500">Admin Panel</Link>
          )}
        </div>

        <div className="hidden md:flex items-center z-10">
          <div className="flex items-center gap-5 border-r border-gray-700 pr-6 mr-6">
            {socialLinks.map((social) => (
              <a 
                key={social.name} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-gray-400 transition-colors ${social.hover}`}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
          <Link href="/recruitment" className={`transition-colors font-medium ${pathname === '/recruitment' ? 'text-white' : 'text-blue-500 hover:text-blue-400'}`}>
            Join Us
          </Link>
        </div>

        <button 
          className="md:hidden z-20 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-gray-800 flex flex-col items-center py-6 shadow-2xl">
          <div className="flex flex-col items-center gap-6 w-full">
            <Link href="/" className={`text-lg ${pathname === '/' ? 'text-white font-medium' : 'text-gray-300'}`}>Home</Link>
            <Link href="/#timeline" className="text-lg text-gray-300 hover:text-white">Timeline</Link>
            <Link href="/gallery" className={`text-lg ${pathname === '/gallery' ? 'text-white font-medium' : 'text-gray-300'}`}>Crew & Gallery</Link>
            <Link href="/leetcode" className={`text-lg ${pathname === '/leetcode' ? 'text-white font-medium' : 'text-gray-300'}`}>POTD</Link>
            <Link href="/recruitment" className={`text-lg font-medium ${pathname === '/recruitment' ? 'text-white' : 'text-blue-400'}`}>Join Us</Link>
            {isAdmin && (
              <Link href="/admin" className="text-lg text-red-500 font-medium">Admin Panel</Link>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-800 w-[80%]">
            {socialLinks.map((social) => (
              <a 
                key={social.name} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-gray-400 transition-colors ${social.hover}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}