"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/dashboard/context/UserContext";
import { Loader2, Star, Book, Calendar } from "lucide-react";

// Role to dashboard path mapping
const DASHBOARD_URLS: Record<string, string> = {
  HOD: "/dashboard/hod",
  TIMETABLE_COORDINATOR: "/dashboard/timetable-coordinators",
  FACULTY: "/dashboard/faculty"
};

const facultyOptions = [
  { 
    label: "Subject Priority Selection", 
    path: "/dashboard/faculty/1-priority-selection", 
    icon: <Star size={16} className="mr-2 text-yellow-500" />,
    status: "Preferences can be submitted for this batch",
    available: true
  },
  { 
    label: "View Subjects", 
    path: "/dashboard/faculty/2-view-subjects", 
    icon: <Book size={16} className="mr-2 text-blue-500" />,
    status: "View your assigned subjects",
    available: true
  },
  { 
    label: "View Timetable", 
    path: "/dashboard/faculty/3-view-timetable", 
    icon: <Calendar size={16} className="mr-2 text-green-500" />,
    status: "Your timetable is ready",
    available: true
  },
];

// Optional: for personalization
// const assignedSubjectCodes = ["CS201", "MA301"];

export default function FacultyHomePage() {
  const { role, loading, authenticated, uname } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      router.push("/");
      return;
    }

    if (role !== "FACULTY") {
      const target = DASHBOARD_URLS[role] || "/";
      setRedirecting(true);
      setTimeout(() => {
        router.push(target);
      }, 1500); // brief visual feedback
      return;
    }
  }, [role, loading, authenticated, router]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Loading Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              Authenticating and setting up your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirecting state (when not faculty)
  if (redirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto w-8 h-8 text-primary animate-spin" />
          <h2 className="font-semibold text-lg">Redirecting...</h2>
          <p className="text-muted-foreground text-sm">
            Redirecting you to your appropriate dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated faculty: show the home options
  return (
    <div className="space-y-8 mx-auto p-8 max-w-xl">
      <h1 className="mb-6 font-bold text-3xl text-center">
        Welcome, Faculty Member{uname ? ` (${uname})` : ""}!
      </h1>
      <p className="mb-8 text-muted-foreground text-center">
        Manage your subject preferences and view your timetable.
      </p>
      <div className="gap-6 grid grid-cols-1">
        {facultyOptions.map((opt) => (
          <Link href={opt.path} key={opt.path}>
            <div className="bg-card shadow hover:shadow-lg p-6 border rounded-lg transition cursor-pointer">
              <div className="flex items-center mb-2">
                {opt.icon}
                <span className="font-medium text-lg">{opt.label}</span>
              </div>
              <p className="text-muted-foreground text-sm">{opt.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
