'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

interface Notification {
  notification: string;
  date: string;
  role: string;
}

const roleIconMap = {
  FACULTY: <MessageCircle size={18} className="text-blue-600" />,
  ADMIN: <AlertTriangle size={18} className="text-yellow-600" />,
  SYSTEM: <CheckCircle size={18} className="text-green-600" />,
};

const NotificationDropdown = ({ open, onClose }: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotification();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notification');
      const data = await res.json();
      setNotification(data);
    } catch (error) {
      console.error('Notification fetch error:', error);
      setNotification(null);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="top-16 right-4 z-50 absolute bg-popover shadow-lg p-4 border-2 border-gray-500 rounded-xl ring-1 ring-black/5 w-96 max-w-sm text-popover-foreground"
    >
      <h3 className="mb-3 pb-2 border-b font-semibold text-foreground text-lg">
        Notifications
      </h3>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : !notification ? (
        <p className="text-muted-foreground text-sm">No notifications available.</p>
      ) : (
        <ul className="space-y-2">
          <li className="flex gap-3 bg-accent/40 hover:bg-accent/60 p-3 rounded-md transition-colors">
            <div className="mt-1 shrink-0">
              {roleIconMap[notification.role as keyof typeof roleIconMap] ?? (
                <Bell size={18} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col text-sm">
              <p className="font-medium text-foreground">
                {notification.notification}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date(notification.date).toLocaleString()}
              </p>
              <span className="bg-muted mt-1 px-2 py-0.5 rounded-md w-max font-medium text-muted-foreground text-xs uppercase tracking-wide">
                {notification.role}
              </span>
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};

export default NotificationDropdown;
