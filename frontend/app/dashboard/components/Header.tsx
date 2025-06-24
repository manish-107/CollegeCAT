'use client';

import { useState } from 'react';
import { Bell, ChevronLeft, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/app/dashboard/components/NotificationDropdown'; // Adjust path as needed

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  const academicYears = [
    '2025-2026',
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022'
  ];

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className="relative flex flex-col justify-between bg-sidebar text-[var(--sidebar-foreground)] border-b border-border">
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

          {/* Year Dropdown */}
          <div className="ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-secondary/90 border-border">
                  <span className="text-sm font-medium">{selectedYear}</span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {academicYears.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`cursor-pointer ${selectedYear === year ? 'bg-accent' : ''}`}
                  >
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[var(--sidebar-foreground)] font-bold text-xl">CSTM SYSTEM</div>
        </div>

        <div className="flex items-center w-auto gap-6 mr-12">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={toggleNotifications}
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </Button>

            <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
              <div className="h-full w-full bg-blue-300" />
            </div>
          </div>
        </div>
      </div>       

      {/* Notification Dropdown */}
      <NotificationDropdown open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
};

export default Header;
