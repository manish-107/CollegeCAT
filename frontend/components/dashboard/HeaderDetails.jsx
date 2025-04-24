'use client';

import { Calendar } from 'lucide-react';

export default function ProjectDetails() {
  return (
    <div className="p-4 border-b border-border">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold mb-2">Mobile App for iOS</h2>
        <p className="text-muted-foreground text-sm">
          Over9k: Gamers app is a social network for gamers. Designed for streaming various games,
          communication, finding friends for joint games.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">28d, 2h, 28min</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24.02.2024 - 12.07.2024</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs"
              >
                {i}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs">
              +10
            </div>
          </div>

          <button className="ml-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-sm">
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
