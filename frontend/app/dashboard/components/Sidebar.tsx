'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentStep: number;
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

const Sidebar = ({ currentStep }: SidebarProps) => {
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar text-[var(--sidebar-foreground)] overflow-y-auto pb-6 border-r-[1px] border-[var(--sidebar-border)]">
      <div className="p-4">
        <div className="flex items-center mb-5 px-2">
          <div className="h-6 w-full rounded-sm flex items-center justify-center text-[var(--sidebar-foreground)] font-bold text-sm">
            DashBoard 
          </div>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex items-center w-full text-sm p-2 text-[var(--sidebar-foreground)] rounded-md hover:bg-[var(--sidebar-accent)] group"
          >
            <ChevronDown
              size={16}
              className={`mr-1 transition-transform text-muted-foreground ${projectsOpen ? '' : '-rotate-90'}`}
            />
            <span className="flex-1 text-left font-medium">All Steps</span>
          </button>

          {projectsOpen && (
            <div className="mt-1 pl-2 space-y-1">
              {steps.map((step, index) => (
                <div key={`project-${index}`} className="mb-1">
                  <Link href={`/dashboard/steps/${index + 1}`}>
                    <div
                      className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[var(--sidebar-accent)] group ${
                        index === 0 ? 'text-[var(--sidebar-foreground)]  bg-[var(--sidebar-accent)]' : 'text-[var(--sidebar-foreground)]'
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

        <div className="mt-auto pt-4">
          <Button   className="w-full  rounded-md text-sm font-medium">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
