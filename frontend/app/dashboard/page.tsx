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
    <div className="p-6 space-y-8">
      {Object.entries(batchData).map(([batchName, tasks]) => (
        <div key={batchName} className="space-y-4">
          <h2 className="text-lg font-semibold">{batchName}</h2>
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-card rounded-md p-3 border text-sm"
                >
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
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
            <p className="text-sm text-muted-foreground italic">
              No tasks for this batch.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
