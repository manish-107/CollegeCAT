"use client";

import { ModeToggle } from '@/components/custom/ModeToggle';
import Head from 'next/head'
import { useState } from 'react'

export default function Details() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { name, role, year });
    setName('');
    setRole('');
    setYear('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br px-4">
      <Head>
        <title>Fill the Details</title>
      </Head>
        <div className="absolute top-4 right-4 z-10" >
        
            <ModeToggle />
            </div>
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-xl p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-semibold text-white mb-8 text-center">Fill the details</h1>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block text-white font-medium mb-2">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Role Selection */}
        <div className="mb-5">
          <label className="block text-white font-medium mb-2">Select a Role</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="appearance-none w-full bg-white/10 text-white placeholder-white/60 border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
            >
             <option value="" style={{ color: "black", backgroundColor: "rgba(255, 255, 255, 0.1)" }}>Select role</option>
<option value="student" style={{ color: "black", backgroundColor: "rgba(255, 255, 255, 0.1)" }}>Time table coordinator</option>
<option value="teacher" style={{ color: "black", backgroundColor: "rgba(255, 255, 255, 0.1)" }}>Teacher</option>
<option value="admin" style={{ color: "black ", backgroundColor: "rgba(255, 255, 255, 0.1)" }}>Hod</option>

            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none">
              ▼
            </div>
          </div>
        </div>

        {/* Year of Joining */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Year of Joining</label>
          <input
            type="number"
            placeholder="e.g., 2022"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1947}
            max={new Date().getFullYear()}
            required
            className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-2 rounded-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
