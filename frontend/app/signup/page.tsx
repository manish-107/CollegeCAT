"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ModeToggle } from '@/components/custom/ModeToggle';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !year) {
      toast.error("Please fill in all fields");
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNumber = Number(year);
    if (isNaN(yearNumber) || yearNumber < 1947 || yearNumber > currentYear) {
      toast.error("Please enter a valid year between 1947 and current year");
      return;
    }

    toast.success("Registration details submitted successfully");

    setName('');
    setRole('');
    setYear('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black  relative">
      {/* Mode Toggle positioned at the top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-md p-6 bg-white dark:backdrop-blur-sm dark:bg-white/5 border border-white/10 rounded-xl shadow-xl text-black dark:text-white"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Fill the details
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="dark:text-gray-300">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full dark:bg-black dark:border-neutral-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="dark:text-gray-300">Select your role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full dark:bg-black dark:border-neutral-800 dark:text-white">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:border-neutral-800">
              <SelectItem value="timetable-coordinator">Timetable Coordinator</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="hod">HOD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="dark:text-gray-300">Year of Joining</Label>
          <Input
            id="year"
            type="number"
            placeholder="Enter year of joining"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1947}
            max={new Date().getFullYear()}
            className="w-full dark:bg-black dark:border-neutral-800 dark:text-white"
          />
        </div>

        <Button
          type="submit"
          className="w-full border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50 dark:hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-4 py-2 transition-colors"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
