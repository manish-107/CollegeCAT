"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Book, Star, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { useYearBatch } from "@/app/dashboard/context/YearBatchContext";
import type { BatchResponse } from '@/app/client/types.gen';

type Batch = BatchResponse;

const facultyOptions = [
  { label: "Priority Selection", path: "/dashboard/faculty/1-priority-selection", icon: <Star size={16} className="mr-2 text-orange-500" /> },
  { label: "View Subjects", path: "/dashboard/faculty/2-view-subjects", icon: <Book size={16} className="mr-2 text-blue-500" /> },
  { label: "View Timetable", path: "/dashboard/faculty/3-view-timetable", icon: <Calendar size={16} className="mr-2 text-green-500" /> },
];

function FacultySidebar({ 
  currentOption, 
  onOptionClick
}: { 
  currentOption: number; 
  onOptionClick: (idx: number) => void;
}) {
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>({});
  const { selectedYear, selectedBatch, batches, setSelectedBatch } = useYearBatch();

  const toggleBatch = (batchSection: string | null | undefined) => {
    if (!batchSection) return;
    setExpandedBatches(prev => ({
      ...prev,
      [batchSection]: !prev[batchSection]
    }));
  };

  const handleBatchClick = (batch: Batch) => {
    setSelectedBatch(batch);
    toggleBatch(batch.section ?? '');
  };

  // New function to handle option click and batch selection
  const handleOptionClick = (batch: Batch, optionIndex: number) => {
    // Set the selected batch for this option
    setSelectedBatch(batch);
    // Call the parent option click handler
    onOptionClick(optionIndex);
  };

  return (
    <div className="flex-shrink-0 bg-sidebar pb-6 border-[var(--sidebar-border)] border-r-[1px] w-[260px] h-full overflow-y-auto text-[var(--sidebar-foreground)]">
      <div className="p-4">
        <div className="flex items-center mb-10 px-2">
          <div className="flex justify-center items-center rounded-sm w-full h-6 font-bold text-[var(--sidebar-foreground)] text-sm">
            Faculty Panel
          </div>
        </div>

        {/* Year Display */}
        <div className="mb-4 px-2">
          <div className="font-medium text-muted-foreground text-sm">Academic Year</div>
          <div className="font-medium text-sm">{selectedYear || 'Select Year'}</div>
        </div>

        {/* Selected Batch Display */}
        {selectedBatch && (
          <div className="mb-4 px-2">
            <div className="font-medium text-muted-foreground text-sm">Selected Batch</div>
            <div className="bg-[var(--sidebar-accent)] p-2 border border-[var(--sidebar-border)] rounded font-medium text-sm">
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
                  className={`mr-1 transition-transform text-muted-foreground ${expandedBatches[batch.section ?? ''] ? "rotate-90" : ""}`}
                />
                <Users size={16} className="mr-2 text-blue-400" />
                <span className="flex-1 text-left">{batch.section}</span>
                <span className="text-muted-foreground text-xs">({batch.noOfStudent} students)</span>
              </button>

              {/* Options under each batch */}
              {expandedBatches[batch.section ?? ''] && (
                <div className="space-y-2 mt-2 ml-6">
                  {facultyOptions.map((opt, idx) => (
                    <Link href={opt.path} key={`${batch.batch_id}-${opt.path}`} passHref>
                      <div
                        onClick={() => handleOptionClick(batch, idx)}
                        className={`flex items-center mb-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group border border-[var(--sidebar-border)] cursor-pointer ${
                          currentOption === idx && selectedBatch?.batch_id === batch.batch_id 
                            ? "bg-[var(--sidebar-accent)] font-semibold" 
                            : ""
                        }`}
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
          <Button className="rounded-md w-full font-medium text-sm">Logout</Button>
        </div>
      </div>
    </div>
  );
}

const FacultyLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentOption, setCurrentOption] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleOptionClick = (idx: number) => {
    setCurrentOption(idx);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex bg-[var(--background)] h-screen">
      {sidebarOpen && (
        <FacultySidebar 
          currentOption={currentOption} 
          onOptionClick={handleOptionClick} 
        />
      )}
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default FacultyLayout;
