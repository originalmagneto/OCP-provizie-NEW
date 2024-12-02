import React from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue';
  className?: string;
}

const statusConfig = {
  paid: {
    text: 'Paid',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  pending: {
    text: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  overdue: {
    text: 'Overdue',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
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
      {status === 'paid' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
      {status === 'pending' && <ClockIcon className="h-5 w-5 text-yellow-500" />}
      {status === 'overdue' && <AlertCircleIcon className="h-5 w-5 text-red-500" />}
      {config.text}
    </div>
  );
}
