"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, CheckCircle, Calendar, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";

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

const batchName = "Batch A";

function HODSidebar({ currentOption, onOptionClick }: { currentOption: number; onOptionClick: (idx: number) => void }) {
  const [expandedBatch, setExpandedBatch] = useState(true);

  const toggleBatch = () => setExpandedBatch((prev) => !prev);

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        <div className="flex items-center mb-10 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            HOD Panel
          </div>
        </div>
        {/* Batch Section */}
        <div className="mb-1">
          <button
            onClick={toggleBatch}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group"
          >
            <Users
              size={16}
              className="mr-2 text-blue-400"
            />
            <span className="flex-1 text-left">{batchName}</span>
          </button>
          {expandedBatch && (
            <div className="ml-6 mt-1 space-y-2">
              {hodOptions.map((opt, idx) => (
                <Link href={opt.path} key={opt.path} passHref>
                  <div
                    onClick={() => onOptionClick(idx)}
                    className={`flex mt-4 items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group border border-[var(--sidebar-border)] cursor-pointer ${currentOption === idx ? "bg-[var(--sidebar-accent)] font-semibold" : ""}`}
                  >
                    {opt.icon}
                    <span className="flex-1">{opt.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Logout */}
        <div className="mt-auto pt-4">
          <Button className="w-full rounded-md text-sm font-medium">Logout</Button>
        </div>
      </div>
    </div>
  );
}

const HODLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentOption, setCurrentOption] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleOptionClick = (idx: number) => {
    setCurrentOption(idx);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {sidebarOpen && <HODSidebar currentOption={currentOption} onOptionClick={handleOptionClick} />}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default HODLayout; 