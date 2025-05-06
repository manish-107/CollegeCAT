import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void; // Added callback to handle step click
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
  const [stepsOpen, setStepsOpen] = useState(true);

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-5 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            Dashboard
          </div>
        </div>

        {/* Steps toggle */}
        <div className="mb-4">
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="flex items-center w-full text-sm p-2 text-[var(--sidebar-foreground)] rounded-md hover:bg-[var(--sidebar-accent)] group"
          >
            <ChevronDown
              size={16}
              className={`mr-1 transition-transform text-muted-foreground ${stepsOpen ? '' : '-rotate-90'}`}
            />
            <span className="flex-1 text-left font-medium">All Steps</span>
          </button>

          {/* Steps List */}
          {stepsOpen && (
            <div className="mt-1 pl-2 space-y-1">
              {steps.map((step, index) => (
                <div key={`step-${index}`} className="mb-1">
                  <Link href={`/dashboard/steps/${stepPaths[index]}`} passHref>
                    <div
                      onClick={() => onStepClick(index + 1)} // Call onStepClick on click
                      className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                        currentStep === index + 1 ? 'bg-[var(--sidebar-accent)] font-semibold' : ''
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
