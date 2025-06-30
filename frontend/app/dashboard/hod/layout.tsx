"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, CheckCircle, Calendar, FileCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { useYearBatch } from "@/app/dashboard/context/YearBatchContext";

interface Batch {
  section: string;
  noOfStudent: number;
  batch_id: number;
  created_at: string;
}

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
    label: "3. Finalized Timetable", 
    path: "/dashboard/hod/3-finalize-timetable", 
    icon: <FileCheck size={16} className="mr-2 text-orange-500" />,
    status: "Finalize and publish the timetable",
    available: true
  },
];

function HODSidebar({ 
  currentOption, 
  onOptionClick
}: { 
  currentOption: number; 
  onOptionClick: (idx: number) => void;
}) {
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>({});
  const { selectedYear, selectedBatch, batches, setSelectedBatch } = useYearBatch();

  const toggleBatch = (batchSection: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchSection]: !prev[batchSection]
    }));
  };

  const handleBatchClick = (batch: Batch) => {
    // Automatically select the batch when clicked
    setSelectedBatch(batch);
    // Also toggle the expansion
    toggleBatch(batch.section);
  };

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        <div className="flex items-center mb-10 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            HOD Panel
          </div>
        </div>
        
        {/* Year Display */}
        <div className="mb-4 px-2">
          <div className="text-sm font-medium text-muted-foreground">Academic Year</div>
          <div className="text-lg font-medium">{selectedYear || 'Select Year'}</div>
        </div>

        {/* Selected Batch Display */}
        {selectedBatch && (
          <div className="mb-4 px-2">
            <div className="text-sm font-medium text-muted-foreground">Selected Batch</div>
            <div className="text-sm font-medium bg-[var(--sidebar-accent)] p-2 rounded border border-[var(--sidebar-border)]">
              {selectedBatch.section} ({selectedBatch.noOfStudent} students)
            </div>
          </div>
        )}

        {/* Batches Section */}
        <div className="space-y-1">
          {batches.map((batch) => (
            <div key={batch.batch_id} className="mb-1">
              {/* Batch Header - Click to select and expand */}
          <button
                onClick={() => handleBatchClick(batch)}
                className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group transition-colors ${
                  selectedBatch?.batch_id === batch.batch_id ? 'bg-[var(--sidebar-accent)] border border-[var(--sidebar-border)]' : ''
                }`}
          >
                <ChevronRight
              size={16}
                  className={`mr-1 transition-transform text-muted-foreground ${expandedBatches[batch.section] ? 'rotate-90' : ''}`}
            />
                <Users size={16} className="mr-2 text-blue-400" />
                <span className="flex-1 text-left">{batch.section}</span>
                <span className="text-xs text-muted-foreground">({batch.noOfStudent} students)</span>
          </button>

              {/* Options under each batch */}
              {expandedBatches[batch.section] && (
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
          ))}
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
      {sidebarOpen && (
        <HODSidebar 
          currentOption={currentOption} 
          onOptionClick={handleOptionClick} 
        />
      )}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default HODLayout; 