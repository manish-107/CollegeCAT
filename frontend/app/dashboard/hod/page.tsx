"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/dashboard/context/UserContext";
import { Loader2, Users, CheckCircle, Calendar, FileCheck } from "lucide-react";

// Dashboard route mapping
const DASHBOARD_URLS: Record<string, string> = {
  HOD: "/dashboard/hod",
  TIMETABLE_COORDINATOR: "/dashboard/timetable-coordinators",
  FACULTY: "/dashboard/faculty"
};

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
  }
];

export default function HODHomePage() {
  const { role, loading, authenticated, uname } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      router.push("/");
      return;
    }

    if (role !== "HOD") {
      // Redirect to the correct dashboard for their role.
      const target = DASHBOARD_URLS[role] || "/dashboard/faculty";
      setRedirecting(true);
      setTimeout(() => {
        router.push(target);
      }, 1500); // 1.5s for "redirecting..." UI, optional
      return;
    }
    // Otherwise, authenticated HOD will see the dashboard
  }, [role, loading, authenticated, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto w-8 h-8 text-primary animate-spin" />
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

  // Redirecting UI (non-HOD role, briefly shows)
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

  // Actual HOD dashboard for authenticated HOD
  return (
    <div className="space-y-8 mx-auto p-8 max-w-xl">
      <h1 className="mb-6 font-bold text-3xl text-center">
        Welcome, HOD{uname ? ` (${uname})` : ""}!
      </h1>
      <p className="mb-8 text-muted-foreground text-center">
        Manage subject assignments and finalize the timetable.
      </p>
      <div className="gap-6 grid grid-cols-1">
        {hodOptions.map((opt) => (
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
