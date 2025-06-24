"use client";

import Link from "next/link";
import { Star, Book, Calendar } from "lucide-react";

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

const assignedSubjectCodes = ["CS201", "MA301"]; // Example: these are assigned to the faculty

export default function FacultyHomePage() {
  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">Welcome, Faculty Member!</h1>
      <p className="text-center text-muted-foreground mb-8">
        Manage your subject preferences and view your timetable.
      </p>
      <div className="grid grid-cols-1 gap-6">
        {facultyOptions.map((opt) => (
          <Link href={opt.path} key={opt.path}>
            <div className="p-6 rounded-lg border bg-card shadow hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center mb-2">
                {opt.icon}
                <span className="text-lg font-medium">{opt.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{opt.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 