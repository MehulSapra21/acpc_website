"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";

export default function TerminalPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>(["ACPC Secure Terminal initialized.", "Type 'help' for available commands."]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus the hidden input on load and when clicking anywhere
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const command = input.trim().toLowerCase();
      let newOutput = [...output, `> ${input}`];

      if (command === "help") {
        newOutput.push("Commands: help, clear, sudo acpc_admin");
      } else if (command === "clear") {
        newOutput = [];
      } else if (command === "sudo acpc_admin") {
        newOutput.push("Authenticating...");
        newOutput.push("Access Granted. Elevating privileges to Admin.");
        sessionStorage.setItem("acpc_role", "admin");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else if (command !== "") {
        newOutput.push(`Command not found: ${command}`);
      }

      setOutput(newOutput);
      setInput("");
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono p-6 flex flex-col items-center justify-center cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-black border border-gray-800 rounded-lg p-4 shadow-2xl shadow-green-900/20"
      >
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 mb-4">
          <TerminalIcon size={18} className="text-gray-400" />
          <span className="text-gray-400 text-sm tracking-widest uppercase">ACPC Root Access</span>
        </div>
        
        <div className="space-y-1 mb-2 max-h-[60vh] overflow-y-auto">
          {output.map((line, index) => (
            <div key={index} className={line.startsWith(">") ? "text-gray-300" : "text-green-500"}>
              {line}
            </div>
          ))}
        </div>

        <div className="flex items-center">
          <span className="text-blue-500 mr-2">guest@acpc:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 bg-transparent outline-none text-gray-100 caret-green-500"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
      </motion.div>
    </div>
  );
}