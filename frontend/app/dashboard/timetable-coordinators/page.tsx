'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/dashboard/context/UserContext';
import { Loader2, User, Shield, Users, GraduationCap } from 'lucide-react';

// 1. Mapping for role → dashboard route
const DASHBOARD_URLS: Record<string, string> = {
  HOD: '/dashboard/hod',
  TIMETABLE_COORDINATOR: '/dashboard/timetable-coordinators',
  FACULTY: '/dashboard/faculty',
  // ADMIN: '/dashboard/admin',  // removed!
};

const getRoleInfo = (role: string) => {
  switch (role) {
    case 'HOD':
      return {
        icon: <Shield className="w-6 h-6" />,
        title: 'Head of Department',
        description: 'Access administrative tools and oversight features',
        color: 'text-purple-600'
      };
    case 'TIMETABLE_COORDINATOR':
      return {
        icon: <Users className="w-6 h-6" />,
        title: 'Timetable Coordinator',
        description: 'Manage timetables and academic scheduling',
        color: 'text-blue-600'
      };
    case 'FACULTY':
      return {
        icon: <GraduationCap className="w-6 h-6" />,
        title: 'Faculty Member',
        description: 'Access teaching tools and student resources',
        color: 'text-green-600'
      };
    default:
      return {
        icon: <User className="w-6 h-6" />,
        title: 'User',
        description: 'Setting up your dashboard',
        color: 'text-gray-600'
      };
  }
};

export default function TimetableCoordinatorHome() {
  const { role, loading, authenticated, uname } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      router.push('/');
      return;
    }

    // Show welcome message before redirect (1.5 seconds)
    setRedirecting(true);
    const redirectTimer = setTimeout(() => {
      const target = DASHBOARD_URLS[role] || '/dashboard/faculty';
      router.push(target);
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [role, loading, authenticated, router]);

  const roleInfo = getRoleInfo(role);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Loading Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              Authenticating and setting up your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authenticated && redirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-6 mx-auto p-6 max-w-md text-center">
          <div className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center ${roleInfo.color}`}>
            {roleInfo.icon}
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-2xl">Welcome, {uname}!</h1>
            <h2 className={`text-lg font-semibold ${roleInfo.color}`}>
              {roleInfo.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {roleInfo.description}
            </p>
          </div>
          
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
