'use client';

import { useState, useEffect } from 'react';
import { Bell, ChevronLeft, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/app/dashboard/components/NotificationDropdown';
import {
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data, isLoading, error } = useQuery(getYearsWithBatchesOptions());
  const academicYears = data?.items.map(i => i.academic_year) ?? [];
  const [selectedYear, setSelectedYear] = useState(academicYears[0] ?? '');

  // Update selected year when data loads
  useEffect(() => {
    if (academicYears.length > 0 && !selectedYear) {
      setSelectedYear(academicYears[0]);
    }
  }, [academicYears, selectedYear]);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className="relative flex flex-col justify-between bg-sidebar border-b border-border text-[var(--sidebar-foreground)]">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-[var(--sidebar-accent)] mr-2"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </Button>

          {/* Year Dropdown */}
          <div className="ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-secondary/90 border-border"
                  disabled={isLoading}
                >
                  <span className="font-medium text-sm">
                    {isLoading ? 'Loading...' : selectedYear || 'Select Year'}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {error ? (
                  <DropdownMenuItem disabled className="text-red-500">
                    Error loading years
                  </DropdownMenuItem>
                ) : academicYears.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No years available
                  </DropdownMenuItem>
                ) : (
                  academicYears.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`cursor-pointer ${selectedYear === year ? 'bg-accent' : ''}`}
                    >
                      {year}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="font-bold text-[var(--sidebar-foreground)] text-xl">CSTM SYSTEM</div>
        </div>

        <div className="flex items-center gap-6 mr-12 w-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={toggleNotifications}
            >
              <Bell size={18} />
              <span className="top-1 right-1 absolute bg-red-500 rounded-full w-2 h-2" />
            </Button>

            <div className="border border-border rounded-full w-8 h-8 overflow-hidden">
              <div className="bg-blue-300 w-full h-full" />
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
