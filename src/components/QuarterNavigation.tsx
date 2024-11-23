import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { FirmType } from '../types';

interface QuarterNavigationProps {
  quarters: Array<{
    quarter: number;
    year: number;
    key: string;
    settlements: {
      firm: FirmType;
      isSettled: boolean;
      amount: number;
    }[];
  }>;
  selectedQuarter: string | null;
  onQuarterSelect: (quarterKey: string) => void;
  userFirm: FirmType;
}

export function QuarterNavigation({ 
  quarters, 
  selectedQuarter,
  onQuarterSelect,
  userFirm
}: QuarterNavigationProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Quarters</h2>
      <nav className="flex flex-col space-y-1">
        {quarters.map(({ quarter, year, key, settlements }) => {
          const isSelected = key === selectedQuarter;
          const hasUnsettledCommissions = settlements.some(
            s => !s.isSettled && s.amount > 0
          );
          const hasSettledCommissions = settlements.some(
            s => s.isSettled && s.amount > 0
          );
          
          return (
            <button
              key={key}
              onClick={() => onQuarterSelect(key)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isSelected 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'hover:bg-gray-50 text-gray-700'}
              `}
            >
              <div className="flex items-center space-x-3">
                <span className={`f