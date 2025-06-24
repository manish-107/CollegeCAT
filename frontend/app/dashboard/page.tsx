'use client';

import React from 'react';
import { MessageSquare, Paperclip } from 'lucide-react';

const batchData = {
  'Batch A': [
    {
      title: 'Setup Year & Batch',
      description: 'Initialize academic year and batch settings.',
      comments: 3,
      attachments: 2,
    },
    {
      title: 'Add Subjects',
      description: 'List subjects for the current batch.',
      comments: 1,
      attachments: 4,
    },
  ],
  'Batch B': [
    {
      title: 'Subject Allocation',
      description: 'Distribute subjects among lecturers.',
      comments: 2,
      attachments: 1,
    },
  ],
  'Batch C': [],
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      {Object.entries(batchData).map(([batchName, tasks]) => (
        <div key={batchName} className="space-y-4">
          <h2 className="font-semibold text-lg">{batchName}</h2>
          {tasks.length > 0 ? (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-card p-3 border rounded-md text-sm"
                >
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="mb-2 text-muted-foreground text-xs">
                    {task.description}
                  </p>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {task.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip size={14} />
                      {task.attachments}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              No tasks for this batch.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
