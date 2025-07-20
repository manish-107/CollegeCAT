"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";  // Added
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
import axios from "axios";

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');
  const router = useRouter();  // Added

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const response = await axios.post("http://localhost:3000/api/auth/signup", {
        uname: name,
        role: role,
        joining_year: year,
      }, {
        withCredentials: true,
      });

      toast.success("Registration successful!");
      setName('');
      setRole('');
      setYear('');

      // ✅ Redirect after success
      const redirectUrl = response.data.redirect_to;
      if (redirectUrl) {
        router.push(redirectUrl);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Something went wrong during signup");
    }
  };

  return (
    <div className="relative flex justify-center items-center bg-gray-100 dark:bg-black min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white dark:bg-white/5 dark:backdrop-blur-sm p-8 border border-white/10 rounded-2xl w-full max-w-lg text-black dark:text-white"
      >
        <h2 className="mb-8 font-bold text-gray-900 dark:text-white text-3xl text-center">
          Fill the details
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="dark:text-gray-300 text-lg">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dark:bg-black dark:border-purple-900 w-full h-12 font-semibold dark:text-white text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="dark:text-gray-300 text-lg">Select your role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="dark:bg-black dark:border-purple-900 w-full h-12 dark:text-white text-base">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:border-neutral-800">
              <SelectItem value="TIMETABLE_COORDINATOR">Timetable Coordinator</SelectItem>
              <SelectItem value="FACULTY">Faculty</SelectItem>
              <SelectItem value="HOD">HOD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="dark:text-gray-300 text-lg">Year of Joining</Label>
          <Input
            id="year"
            type="number"
            placeholder="Enter year of joining"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1947}
            max={new Date().getFullYear()}
            className="dark:bg-black dark:border-purple-900 w-full h-12 font-semibold dark:text-white text-base"
          />
        </div>

        <Button
          type="submit"
          className="bg-purple-500 hover:bg-purple-700 dark:bg-purple-900 dark:hover:bg-purple-700 px-6 py-3 border border-purple-600 rounded-md focus:ring-2 focus:ring-blue-300 w-full text-white text-lg transition"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
