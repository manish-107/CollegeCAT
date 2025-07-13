"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, Calendar, Users, ChevronRight, BookOpen, FileText, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { useYearBatch } from "@/app/dashboard/context/YearBatchContext";

const steps = [
  'Create Year and Batch',
  'Subject Management',
  'Create Subject Priority Form',
  'Lecturer Priority Selection',
  'Auto Subject Assignment & Send to HOD',
  // 'HOD Review and Approval',
  'Finalize Subject Allocation',
  'Timetable Format Creation',
  // 'Timetable Format Review and Finalization',
  'Create Timetable',
  // 'HOD Edit and Update Timetable',
  'Final Timetable Confirmation',
];

const stepPaths = [
  '1-create-year',
  '2-manage-subjects',
  '3-priority-form',
  '4-priority-selection',
  '5-auto-assignment',
  // '6-hod-review',
  '7-finalize-subjects',
  '8-create-timetable',
  // '9-format-review',
  '10-generate-timetable',
  // '11-hod-edit-timetable',
  '12-finalize-timetable',
];

function TimetableCoordinatorSidebar({ 
  currentStep, 
  onStepClick
}: { 
  currentStep: number; 
  onStepClick: (stepIndex: number) => void;
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

  const handleBatchClick = (batch: any) => {
    // Automatically select the batch when clicked
    setSelectedBatch(batch);
    // Also toggle the expansion
    toggleBatch(batch.section);
  };

  return (
    <div className="flex-shrink-0 bg-sidebar pb-6 border-[var(--sidebar-border)] border-r-[1px] w-[280px] h-full overflow-y-auto text-[var(--sidebar-foreground)]">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-10 px-2">
          <div className="flex justify-center items-center rounded-sm w-full h-6 font-bold text-[var(--sidebar-foreground)] text-sm">
            Timetable Coordinator
          </div>
        </div>

        {/* Year Display */}
        {selectedYear && (
          <div className="mb-4 px-2">
            <div className="font-medium text-muted-foreground text-sm">Academic Year</div>
            <div className="font-medium text-lg">{selectedYear}</div>
          </div>
        )}

      

        {/* Main Steps - Steps 1-4 at top level */}
        <div className="space-y-4 mb-6">
          {/* Step 1: Create Year & Batch */}
          <Link href="/dashboard/timetable-coordinators/1-create-year" passHref>
            <div className="group flex items-center bg-[var(--sidebar-accent)]/50 hover:bg-[var(--sidebar-accent)] mb-2 px-3 py-2 border border-[var(--sidebar-border)] rounded-md text-sm">
              <Calendar size={16} className="mr-2 text-green-500" />
              <span className="flex-1 font-medium">Step 1: Create Year & Batch</span>
            </div>
          </Link>

          {/* Step 2: Subject Management */}
          <Link href="/dashboard/timetable-coordinators/2-manage-subjects" passHref>
            <div 
              onClick={() => onStepClick(2)}
              className={`flex mb-2 items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group bg-[var(--sidebar-accent)]/50 border border-[var(--sidebar-border)] ${
                currentStep === 2 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
              }`}
            >
              <BookOpen size={16} className="mr-2 text-blue-500" />
              <span className="flex-1 font-medium">Step 2: Subject Management</span>
            </div>
          </Link>

          {/* Step 3: Create Subject Priority Form */}
          <Link href="/dashboard/timetable-coordinators/3-priority-form" passHref>
            <div 
              onClick={() => onStepClick(3)}
              className={`flex mb-2 items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group bg-[var(--sidebar-accent)]/50 border border-[var(--sidebar-border)] ${
                currentStep === 3 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
              }`}
            >
              <FileText size={16} className="mr-2 text-purple-500" />
              <span className="flex-1 font-medium">Step 3: Create Subject Priority Form</span>
            </div>
          </Link>

          {/* Step 4: Lecturer Priority Selection */}
          <Link href="/dashboard/timetable-coordinators/4-priority-selection" passHref>
            <div 
              onClick={() => onStepClick(4)}
              className={`flex mb-2 items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group bg-[var(--sidebar-accent)]/50 border border-[var(--sidebar-border)] ${
                currentStep === 4 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
              }`}
            >
              <UserCheck size={16} className="mr-2 text-orange-500" />
              <span className="flex-1 font-medium">Step 4: Lecturer Priority Selection</span>
            </div>
          </Link>
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

        {/* Batch-specific Steps - Steps 5+ under batches */}
        <div className="space-y-1">
          {batches && batches.length > 0 ? (
            batches.map((batch) => (
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
                    className={`mr-1 transition-transform text-muted-foreground ${expandedBatches[batch.section || ''] ? 'rotate-90' : ''}`}
                  />
                  <Users size={16} className="mr-2 text-blue-400" />
                  <span className="flex-1 text-left">{batch.section}</span>
                  <span className="text-muted-foreground text-xs">({batch.noOfStudent} students)</span>
                </button>

                {/* Steps under each batch - Starting from Step 5 */}
                {expandedBatches[batch.section || ''] && (
                  <div className="space-y-1 mt-1 ml-6">
                    {steps.slice(4).map((step, stepIndex) => (
                      <div key={`step-${stepIndex + 5}`} className="mb-1">
                        <Link href={`/dashboard/timetable-coordinators/${stepPaths[stepIndex + 4]}`} passHref>
                          <div
                            onClick={() => onStepClick(stepIndex + 5)} // +5 because steps 1-4 are at top level
                            className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                              currentStep === stepIndex + 5 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
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
            ))
          ) : (
            <div className="px-2 py-4 text-muted-foreground text-sm">
              No batches available. Please create a year and batch first.
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <Button className="rounded-md w-full font-medium text-sm">
            Logout
          </Button>
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
    <div className="flex bg-[var(--background)] h-screen">
      {sidebarOpen && (
        <TimetableCoordinatorSidebar 
          currentStep={currentStep} 
          onStepClick={handleStepClick} 
        />
      )}
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default CoordinatorLayout; 