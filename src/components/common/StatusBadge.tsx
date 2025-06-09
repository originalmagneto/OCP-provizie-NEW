import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue';
  className?: string;
}

const statusConfig = {
  paid: {
    icon: CheckCircle,
    text: 'Paid',
    bgColor: 'bg-green-50 dark:bg-green-800/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-700/40',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  pending: {
    icon: Clock,
    text: 'Pending',
    bgColor: 'bg-amber-50 dark:bg-amber-800/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-700/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  overdue: {
    icon: AlertCircle,
    text: 'Overdue',
    bgColor: 'bg-red-50 dark:bg-red-800/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-700/40',
    iconColor: 'text-red-500 dark:text-red-400',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${className}
      `}
    >
      <Icon className={`w-3.5 h-3.5 mr-1 ${config.iconColor}`} />
      {config.text}
    </div>
  );
}
