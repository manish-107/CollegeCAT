import React from 'react';
import { Plus, MessageSquare, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar';

const columns = [
  {
    id: 'todo',
    title: 'To do',
    count: 4,
    tasks: [
      {
        id: 1,
        title: 'Rewrite cards titles',
        description: "We've gotten some updates by client with cards titles and description in.",
        tag: 'ui-design',
        assignees: [{ id: 1, image: 'https://github.com/shadcn.png' }, { id: 2 }, { id: 3 }],
        comments: 2,
        attachments: 118,
      },
      {
        id: 2,
        title: 'Rewrite cards titles',
        tag: 'copywriting',
        assignees: [{ id: 4, image: 'https://github.com/shadcn.png' }, { id: 5 }],
        comments: 1,
        attachments: 19,
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In progress',
    count: 2,
    tasks: [
      {
        id: 3,
        title: 'Cart sorting [2nd try]',
        tag: 'ux-research',
        assignees: [{ id: 6, image: 'https://github.com/shadcn.png' }, { id: 7, image: 'https://github.com/shadcn.png' }],
        comments: 1,
        attachments: 97,
      },
      {
        id: 4,
        title: 'Landing page about future IRL event + Mobile app ad',
        tag: 'web-design',
        assignees: [{ id: 8 }, { id: 9 }],
        comments: 21,
        attachments: 140,
      },
    ],
  },
  {
    id: 'review',
    title: 'Review / QA',
    count: 5,
    tasks: [
      {
        id: 5,
        title: 'Motion Ads for Tiktok, Facebook & Instagram stories',
        tag: 'marketing',
        assignees: [{ id: 10 }],
        comments: 2,
        attachments: 215,
      },
      {
        id: 6,
        title: '3D animation of 9k mascot',
        tag: '3d-design',
        assignees: [{ id: 11, image: 'https://github.com/shadcn.png' }, { id: 12, image: 'https://github.com/shadcn.png' }],
        comments: 12,
        attachments: 85,
      },
      {
        id: 7,
        title: 'Youtube video announce',
        tag: 'marketing',
        description: 'Make an impressive video, to attract new audiences',
        assignees: [{ id: 13, image: 'https://github.com/shadcn.png' }, { id: 14 }, { id: 15 }],
        comments: 4,
        attachments: 118,
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    count: 3,
    tasks: [
      {
        id: 8,
        title: 'Dribbble shot',
        description: 'Shot on Dribbble in a minimalistic style',
        tag: 'ui-design',
        assignees: [{ id: 16 }, { id: 17, image: 'https://github.com/shadcn.png' }],
        comments: 24,
        attachments: 347,
      },
      {
        id: 9,
        title: 'Logotype integration',
        tag: 'graphic-design',
        assignees: [{ id: 18, image: 'https://github.com/shadcn.png' }, { id: 19 }, { id: 20 }],
        comments: 1,
        attachments: 23,
      },
      {
        id: 10,
        title: 'Check 2-4 screens concept to present',
        tag: 'testing',
        assignees: [{ id: 21 }, { id: 22 }, { id: 23 }],
        comments: 4,
        attachments: 118,
      },
    ],
  },
];

function TaskCard({ task }) {
  return (
    <div className="bg-card rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2">
        <span className={`tag-${task.tag}`}>
          {task.tag.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
      {task.description && <p className="text-xs text-muted-foreground mb-3">{task.description}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, i) => (
            <Avatar key={i} className="w-6 h-6 border-2 border-background">
              {assignee.image && <AvatarImage src={assignee.image} />}
              <AvatarFallback className="text-[10px] bg-secondary">{assignee.id % 10}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {task.comments !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare size={14} />
              <span className="text-xs">{task.comments}</span>
            </div>
          )}
          {task.attachments !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Paperclip size={14} />
              <span className="text-xs">{task.attachments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 bg-secondary/50 text-sm rounded-md">Kanban</button>
          <button className="px-3 py-1 hover:bg-secondary/50 text-sm rounded-md">List view</button>
          <button className="px-3 py-1 hover:bg-secondary/50 text-sm rounded-md">Table view</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 text-sm rounded-md">
            <span>Filter</span>
            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">6</span>
          </button>
          <div className="h-8 w-px bg-border mx-1"></div>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs">
                {i}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs">
              +10
            </div>
          </div>
          <button className="ml-1 px-2 py-1 border border-primary text-primary hover:bg-primary/10 rounded-md text-sm">
            Invite
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto px-2">
        <div className="flex gap-4 h-[calc(100vh-180px)] pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <h3 className="font-medium text-sm">{column.title}</h3>
                  <span className="ml-2 px-1.5 py-0.5 bg-secondary/50 rounded text-xs">{column.count}</span>
                </div>
                <button className="w-6 h-6 rounded-md hover:bg-secondary/50 flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3 h-full overflow-y-auto pb-6">
                {column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}