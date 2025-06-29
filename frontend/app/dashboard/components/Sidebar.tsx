import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Lock, Calendar, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';

interface SidebarProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

const steps = [
  'Create Year and Batch',
  'Subject Management',
  'Create Subject Priority Form',
  'Lecturer Priority Selection',
  'Auto Subject Assignment & Send to HOD',
  'HOD Review and Approval',
  'Finalize Subject Allocation',
  'Timetable Format Creation',
  'Timetable Format Review and Finalization',
  'Auto-generate Timetable & Send to HOD',
  'HOD Edit and Update Timetable',
  'Final Timetable Confirmation',
];

const stepPaths = [
  '1-create-year',
  '2-manage-subjects',
  '3-priority-form',
  '4-priority-selection',
  '5-auto-assignment',
  '6-hod-review',
  '7-finalize-subjects',
  '8-create-timetable',
  '9-format-review',
  '10-autogenerate-timetable',
  '11-hod-edit-timetable',
  '12-finalize-timetable',
];

const Sidebar = ({ currentStep, onStepClick }: SidebarProps) => {
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>({});
  const { selectedYear, selectedBatch, batches, setSelectedBatch } = useYearBatch();

  const toggleBatch = (batchSection: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchSection]: !prev[batchSection]
    }));
  };

  const handleBatchSelect = (batch: any) => {
    setSelectedBatch(batch);
  };

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-10 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            Dashboard
          </div>
        </div>

        {/* Year Display */}
        {selectedYear && (
          <div className="mb-4 px-2">
            <div className="text-sm font-medium text-muted-foreground">Academic Year</div>
            <div className="text-lg font-bold">{selectedYear}</div>
          </div>
        )}

        {/* Selected Batch Display */}
        {selectedBatch && (
          <div className="mb-4 px-2">
            <div className="text-sm font-medium text-muted-foreground">Selected Batch</div>
            <div className="text-sm font-medium  bg-blue-50 p-2 rounded border border-blue-200">
              {selectedBatch.section} ({selectedBatch.noOfStudent} students)
            </div>
          </div>
        )}

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
          {batches && batches.length > 0 ? (
            batches.map((batch) => (
              <div key={batch.batch_id} className="mb-1">
                {/* Batch Header */}
                <button
                  onClick={() => toggleBatch(batch.section)}
                  className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                    selectedBatch?.batch_id === batch.batch_id ? 'bg-blue-100 border border-blue-300' : ''
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

                {/* Batch Selection Button */}
                <div className="ml-6 mt-1">
                  <button
                    onClick={() => handleBatchSelect(batch)}
                    className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--sidebar-accent)] ${
                      selectedBatch?.batch_id === batch.batch_id 
                        ? 'text-sm font-medium ' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {selectedBatch?.batch_id === batch.batch_id ? '✓ Selected' : 'Click to select'}
                  </button>
                </div>

                {/* Steps under each batch */}
                {expandedBatches[batch.section] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {steps.slice(1).map((step, stepIndex) => (
                      <div key={`step-${stepIndex}`} className="mb-1">
                        <Link href={`/dashboard/timetable-coordinators/${stepPaths[stepIndex + 1]}`} passHref>
                          <div
                            onClick={() => onStepClick(stepIndex + 2)} // +2 because step 1 is separate
                            className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                              currentStep === stepIndex + 2 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
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
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No batches available. Please create a year and batch first.
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <Button className="w-full rounded-md text-sm font-medium">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
