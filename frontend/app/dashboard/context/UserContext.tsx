'use client';

import { getCurrentUserOptions } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  user_id: number | null;
  role: string | null;
  email: string;
  uname: string;
  authenticated: boolean;
  loading: boolean;
  setUser: (userData: { user_id: number; role: string; email: string; uname: string }) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user_id, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [uname, setUname] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { data, isLoading, refetch } = useQuery({
    ...getCurrentUserOptions(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    const user = data?.data;
    if (user?.user_id) {
      setUserId(user.user_id);
      setRole(user.role);
      setEmail(user.email);
      setUname(user.name || user.uname);
      setAuthenticated(true);
    } else {
      // Properly clear user if not authenticated / not found.
      setUserId(null);
      setRole(null);
      setEmail('');
      setUname('');
      setAuthenticated(false);
    }
    setLoading(false);
  }, [data, isLoading]);

  const setUser = (userData: { user_id: number; role: string; email: string; uname: string }) => {
    setUserId(userData.user_id);
    setRole(userData.role);
    setEmail(userData.email);
    setUname(userData.uname);
    setAuthenticated(true);
  };

  const clearUser = () => {
    setUserId(null);
    setRole(null);
    setEmail('');
    setUname('');
    setAuthenticated(false);
  };

  const refreshUser = async () => {
    setLoading(true);
    await refetch();
  };

  const value: UserContextType = {
    user_id,
    role,
    email,
    uname,
    authenticated,
    loading,
    setUser,
    clearUser,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
