'use client';

import React, { useEffect, useRef } from 'react';
import { Bell, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    icon: <MessageCircle size={16} className="text-blue-500" />,
    text: 'New message from John',
    time: '1m ago',
  },
  {
    id: 2,
    icon: <AlertTriangle size={16} className="text-yellow-500" />,
    text: 'Assignment deadline approaching',
    time: '5m ago',
  },
  {
    id: 3,
    icon: <CheckCircle size={16} className="text-green-500" />,
    text: 'System update completed',
    time: '10m ago',
  },
];

const NotificationDropdown = ({ open, onClose }: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-16 right-4 w-80 bg-sidebar text-[var(--sidebar-foreground)] shadow-lg rounded-lg border border-gray-200 p-4 z-50"
    >
      <h3 className="text-base font-semibold mb-3 border-b pb-2">Notifications</h3>
      <ul className="space-y-2 text-sm">
        {notifications.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 p-2 rounded-md  transition-colors"
          >
            <div className="mt-1">{item.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.text}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
