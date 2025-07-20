'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronLeft, Menu, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/dashboard/context/UserContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import NotificationDropdown from '@/app/dashboard/components/NotificationDropdown';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import {
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import type { AcademicYearWithBatchesResponse } from '@/app/client/types.gen';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { selectedYear, setSelectedYear, setBatches } = useYearBatch();
  const { user_id, uname, email, authenticated, role, loading } = useUser();
  const router = useRouter();

  // Authenticated guard (redirect to login if not authenticated)
  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace('/');
    }
  }, [authenticated, loading, router]);

  const { data, isLoading } = useQuery(getYearsWithBatchesOptions());
  const academicYearData = data?.items ?? [];
  const academicYears = academicYearData.map((item: AcademicYearWithBatchesResponse) => item.academic_year);

  // Update selected year when data loads
  useEffect(() => {
    if (academicYearData.length > 0 && !selectedYear) {
      setSelectedYear(academicYearData[0].academic_year);
      setBatches(academicYearData[0].batches);
    }
  }, [academicYearData, selectedYear, setSelectedYear, setBatches]);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const yearData = academicYearData.find(item => item.academic_year === year);
    if (yearData) {
      setBatches(yearData.batches);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color
  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'HOD':
        return 'bg-purple-500';
      case 'FACULTY':
        return 'bg-blue-500';
      case 'TIMETABLE_COORDINATOR':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Early return: blank until user context is loaded (no header flash)
  if (loading) return null;

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
                <Button variant="outline" className="flex items-center gap-2 bg-secondary/90 border-border">
                  <span className="font-medium text-sm">
                    {isLoading ? 'Loading...' : selectedYear || 'Select Year'}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {academicYears.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onClick={() => handleYearChange(year)}
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
            {/* Profile Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="hover:bg-[var(--sidebar-accent)] p-0 rounded-full w-8 h-8">
                  <div className="border border-border rounded-full w-8 h-8 overflow-hidden cursor-pointer">
                    <div className={`w-full h-full flex items-center justify-center text-white text-xs font-semibold ${getRoleColor(role)}`}>
                      {getInitials(uname)}
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64" align="end">
                <Card className="shadow-none border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-medium text-sm">User Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRoleColor(role)}`}>
                        {getInitials(uname)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{uname}</div>
                        <div className="text-muted-foreground text-xs truncate">{email}</div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono">{user_id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Role:</span>
                        <span className={`px-2 py-0.5 rounded text-white text-xs font-medium ${getRoleColor(role)}`}>
                          {role}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      {/* Notification Dropdown */}
      <NotificationDropdown open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
};

export default Header;
