import React from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue';
  className?: string;
}

interface StatusConfig {
  text: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const statusConfig: Record<StatusBadgeProps['status'], StatusConfig> = {
  paid: {
    text: 'Paid',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: <CheckCircleIcon className="h-4 w-4 mr-1.5 text-green-500" />
  },
  pending: {
    text: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: <ClockIcon className="h-4 w-4 mr-1.5 text-amber-500" />
  },
  overdue: {
    text: 'Overdue',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: <AlertCircleIcon className="h-4 w-4 mr-1.5 text-red-500" />
  }
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${className}
      `}
    >
      {config.icon}
      {config.text}
    </div>
  );
}
