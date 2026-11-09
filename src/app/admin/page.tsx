"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Plus, Trash2, Home, Link as LinkIcon, Pencil, X, Crop } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Cropper from 'react-easy-crop';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Timeline State
  const [events, setEvents] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isPast, setIsPast] = useState(false);

  // Cropper State
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("acpc_role") === "admin") {
      setIsAdmin(true);
      fetchEvents();
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase.from("members").select("*");
    if (data) setMembers(data);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title, 
      event_date: date, 
      is_past_event: isPast,
      external_link: externalLink.trim() === "" ? null : externalLink.trim()
    };

    if (editingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingId);
      if (!error) resetForm();
    } else {
      const { error } = await supabase.from("events").insert([payload]);
      if (!error) resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setExternalLink("");
    setIsPast(false);
    fetchEvents();
  };

  const handleEditClick = (event: any) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDate(event.event_date);
    setExternalLink(event.external_link || "");
    setIsPast(event.is_past_event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this operation?");
    if (confirmDelete) {
      await supabase.from("events").delete().eq("id", id);
      if (editingId === id) resetForm();
      else fetchEvents();
    }
  };

  const getFormattedImageName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  const handleSelectMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setImageSrc(`/crew/${getFormattedImageName(member.name)}.jpeg`);
      
      setCrop({ 
        x: member.crop_x ? (50 - member.crop_x) * zoom * -1 : 0, 
        y: member.crop_y ? (50 - member.crop_y) * zoom * -1 : 0 
      });
      setZoom(member.crop_zoom || 1);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {}, []);

  const handleSaveCrop = async () => {
    if (!selectedMember) return;

    // Fixed math for accurate object-position mapping
    const percentageX = 50 - (crop.x / zoom);
    const percentageY = 50 - (crop.y / zoom);

    const { error } = await supabase
      .from("members")
      .update({ 
        crop_x: percentageX, 
        crop_y: percentageY, 
        crop_zoom: zoom 
      })
      .eq("id", selectedMember.id);

    if (!error) {
      alert("Crop settings saved! Go to the Gallery tab to see the update.");
      fetchMembers();
    } else {
      alert("Error saving crop settings.");
    }
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans pb-24">
      <nav className="border-b border-gray-800/50 p-4 flex justify-between items-center bg-red-900/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="font-bold flex items-center gap-2 text-red-500">
          <ShieldAlert size={20} /> ACPC Command Center
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><Home size={16}/> Return Home</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-24">
        
        {/* Timeline Management Section */}
        <section>
          <h1 className="text-3xl font-bold mb-8">Timeline Management</h1>

          <motion.form 
            onSubmit={handleFormSubmit}
            className={`bg-gray-900/50 border ${editingId ? 'border-blue-500' : 'border-gray-800'} p-6 rounded-xl mb-12 flex flex-col gap-4 transition-colors`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className={`font-bold ${editingId ? 'text-blue-400' : 'text-gray-300'}`}>
                {editingId ? 'Edit Operation' : 'Create New Operation'}
              </h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                  <X size={16} /> Cancel Edit
                </button>
              )}
            </div>

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

              <button type="submit" className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors`}>
                {editingId ? <Pencil size={18} /> : <Plus size={18} />} 
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.form>

          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Current Operations</h2>
            {events.map((event) => (
              <div key={event.id} className={`flex justify-between items-center bg-black border ${editingId === event.id ? 'border-blue-500/50' : 'border-gray-800'} p-4 rounded-lg`}>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {event.title} 
                    {event.external_link && <LinkIcon size={14} className="text-blue-500" />}
                  </h3>
                  <p className="text-xs text-gray-500">{event.event_date} • {event.is_past_event ? 'Past' : 'Upcoming'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleEditClick(event)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Edit Event">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete Event">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile Image Alignment Section */}
        <section>
          <h1 className="text-3xl font-bold mb-8 border-t border-gray-800 pt-12">Profile Image Alignment</h1>

          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
            <label className="text-sm text-gray-400 block mb-2">Select a Member to Align Photo</label>
            <select 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-red-500 mb-6"
              onChange={(e) => handleSelectMember(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Select Member...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>

            {selectedMember && imageSrc && (
              <div className="space-y-6">
                <p className="text-sm text-gray-400 mb-2">Drag the image to adjust position. Use the slider to zoom.</p>
                
                <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden border border-gray-700">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Zoom Level ({zoom.toFixed(2)}x)</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <button 
                  onClick={handleSaveCrop}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Crop size={18} /> Save Alignment
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}