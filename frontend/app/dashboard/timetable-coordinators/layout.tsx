"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";

const batches = [
  "Batch A",
  "Batch B",
  "Batch C",
  "Batch D",
  "Batch E",
];

const steps = [
  "Create Year and Batch",
  "Subject Management",
  "Create Subject Priority Form",
  "Lecturer Priority Selection",
  "Auto Subject Assignment & Send to HOD",
  "HOD Review and Approval",
  "Finalize Subject Allocation",
  "Timetable Format Creation",
  "Timetable Format Review and Finalization",
  "Auto-generate Timetable & Send to HOD",
  "HOD Edit and Update Timetable",
  "Final Timetable Confirmation",
];

const stepPaths = [
  "1-create-year",
  "2-manage-subjects",
  "3-priority-form",
  "4-priority-selection",
  "5-auto-assignment",
  "6-hod-review",
  "7-finalize-subjects",
  "8-create-timetable",
  "9-format-review",
  "10-autogenerate-timetable",
  "11-hod-edit-timetable",
  "12-finalize-timetable",
];

function CoordinatorSidebar({ currentStep, onStepClick }: { currentStep: number; onStepClick: (stepIndex: number) => void }) {
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>(
    batches.reduce((acc, batch) => ({ ...acc, [batch]: false }), {} as { [key: string]: boolean })
  );

  const toggleBatch = (batchName: string) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchName]: !prev[batchName],
    }));
  };

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-10 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            Timetable Coordinator
          </div>
        </div>
        {/* Create Year & Batch - Step 1 */}
        <div className="my-6">
          <Link href="/dashboard/timetable-coordinators/1-create-year" passHref>
            <div className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group bg-[var(--sidebar-accent)]/50 border border-[var(--sidebar-border)]">
              <Calendar size={16} className="mr-2 text-green-500" />
              <span className="flex-1 font-medium">Step 1: Create Year & Batch</span>
            </div>
          </Link>
        </div>
        {/* All Batches */}
        <div className="space-y-1">
          {batches.map((batch, batchIndex) => (
            <div key={`batch-${batchIndex}`} className="mb-1">
              {/* Batch Header */}
              <button
                onClick={() => toggleBatch(batch)}
                className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group"
              >
                <ChevronRight
                  size={16}
                  className={`mr-1 transition-transform text-muted-foreground ${expandedBatches[batch] ? "rotate-90" : ""}`}
                />
                <Users size={16} className="mr-2 text-blue-400" />
                <span className="flex-1 text-left">{batch}</span>
              </button>
              {/* Steps under each batch */}
              {expandedBatches[batch] && (
                <div className="ml-6 mt-1 space-y-1">
                  {steps.slice(1).map((step, stepIndex) => (
                    <div key={`step-${stepIndex}`} className="mb-1">
                      <Link href={`/dashboard/timetable-coordinators/${stepPaths[stepIndex + 1]}`} passHref>
                        <div
                          onClick={() => onStepClick(stepIndex + 2)}
                          className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                            currentStep === stepIndex + 2 ? "bg-[var(--sidebar-accent)] font-semibold" : ""
                          }`}
                        >
                          <Lock size={16} className="mr-2 text-blue-400" />
                          <span className="flex-1">{step}</span>
                        </div>
                      </Link>
                    </div>
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

const CoordinatorLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {sidebarOpen && <CoordinatorSidebar currentStep={currentStep} onStepClick={handleStepClick} />}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default CoordinatorLayout; 