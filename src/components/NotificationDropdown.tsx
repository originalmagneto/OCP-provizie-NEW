import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface Notification {
  id: string;
  type: 'commission' | 'payment' | 'referral' | 'settlement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationChange?: (unreadCount: number) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'settlement',
    title: 'Commission Settlement Due',
    message: 'Q3 2024 commission settlement is due for review',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pending Invoice Payments',
    message: '3 invoices are pending payment from clients',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false
  },
  {
    id: '3',
    type: 'referral',
    title: 'New Referral Received',
    message: 'Partner Firm has sent a new client referral',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  },
  {
    id: '4',
    type: 'commission',
    title: 'Commission Payment Received',
    message: 'Received €2,450 commission from Q2 settlements',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'settlement':
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'payment':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'referral':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'commission':
      return <AlertCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export default function NotificationDropdown({ isOpen, onClose, onNotificationChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Notify parent component when unread count changes
  useEffect(() => {
    if (onNotificationChange) {
      onNotificationChange(unreadCount);
    }
  }, [unreadCount, onNotificationChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>



      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium leading-relaxed ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2.5">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2">
          View all notifications
        </button>
      </div>
    </div>
  );
}