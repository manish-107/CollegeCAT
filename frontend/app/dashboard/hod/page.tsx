"use client";

import Link from "next/link";
import { Users, CheckCircle, Calendar, FileCheck } from "lucide-react";

const hodOptions = [
  { 
    label: "1. Approve or Modify Assignments", 
    path: "/dashboard/hod/1-approve-modify", 
    icon: <CheckCircle size={16} className="mr-2 text-green-500" />,
    status: "Approve or modify pending assignments",
    available: true
  },
  { 
    label: "2. Review and Edit Timetable", 
    path: "/dashboard/hod/2-review-edit-timetable", 
    icon: <Calendar size={16} className="mr-2 text-purple-500" />,
    status: "Review and edit the timetable",
    available: true
  },
  { 
    label: "3. Finalize Timetable", 
    path: "/dashboard/hod/3-finalize-timetable", 
    icon: <FileCheck size={16} className="mr-2 text-orange-500" />,
    status: "Finalize and publish the timetable",
    available: true
  },
];

export default function HODHomePage() {
  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">Welcome, HOD!</h1>
      <p className="text-center text-muted-foreground mb-8">
        Manage subject assignments and finalize the timetable.
      </p>
      <div className="grid grid-cols-1 gap-6">
        {hodOptions.map((opt) => (
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