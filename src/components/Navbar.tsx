"use client";

import { useState, useEffect } from "react";
import { Terminal, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
    }
  }, []);

  // Close mobile menu automatically when clicking a link
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getLinkStyle = (path: string) => 
    pathname === path ? "text-white font-medium" : "text-gray-400 hover:text-white transition-colors";

  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50 bg-[#0a0a0a]/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
        <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 z-10">
          <Terminal className="text-blue-500" size={24} />
          <span>ACPC.</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex gap-8 text-sm">
          <Link href="/" className={getLinkStyle("/")}>Home</Link>
          <Link href="/#timeline" className="text-gray-400 hover:text-white transition-colors">Timeline</Link>
          <Link href="/gallery" className={getLinkStyle("/gallery")}>Crew & Gallery</Link>
          <Link href="/leetcode" className={getLinkStyle("/leetcode")}>POTD</Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-red-400 transition-colors text-red-500">Admin Panel</Link>
          )}
        </div>

        <div className="hidden md:flex z-10">
          <Link href="/recruitment" className={`transition-colors font-medium ${pathname === '/recruitment' ? 'text-white' : 'text-blue-500 hover:text-blue-400'}`}>
            Join Us
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden z-20 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-gray-800 flex flex-col items-center py-6 gap-6 shadow-2xl">
          <Link href="/" className={`text-lg ${pathname === '/' ? 'text-white font-medium' : 'text-gray-300'}`}>Home</Link>
          <Link href="/#timeline" className="text-lg text-gray-300 hover:text-white">Timeline</Link>
          <Link href="/gallery" className={`text-lg ${pathname === '/gallery' ? 'text-white font-medium' : 'text-gray-300'}`}>Crew & Gallery</Link>
          <Link href="/leetcode" className={`text-lg ${pathname === '/leetcode' ? 'text-white font-medium' : 'text-gray-300'}`}>POTD</Link>
          <Link href="/recruitment" className={`text-lg font-medium ${pathname === '/recruitment' ? 'text-white' : 'text-blue-400'}`}>Join Us</Link>
          {isAdmin && (
            <Link href="/admin" className="text-lg text-red-500 font-medium">Admin Panel</Link>
          )}
        </div>
      )}
    </nav>
  );
}