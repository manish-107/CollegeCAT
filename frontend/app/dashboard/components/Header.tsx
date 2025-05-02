'use client';

import { useState } from 'react';
import { Search, Bell, ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  return (
    <div className="flex flex-col justify-between bg-sidebar text-[var(--sidebar-foreground)] border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="mr-2 hover:bg-[var(--sidebar-accent)]"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </Button>

          <div className="relative w-[240px]">
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-secondary/90 border-0 rounded-md pl-8 h-9 text-sm focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[var(--sidebar-foreground)] font-bold text-xl">CSTM SYSTEM</div>
        </div>

        <div className="flex items-center w-auto gap-6 mr-12">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </Button>

            <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
              <div className="h-full w-full bg-blue-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
