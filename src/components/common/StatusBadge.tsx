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
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
  },
  pending: {
    icon: Clock,
    text: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  overdue: {
    icon: AlertCircle,
    text: 'Overdue',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
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
