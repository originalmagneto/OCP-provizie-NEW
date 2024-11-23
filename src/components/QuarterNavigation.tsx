import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { FirmType } from '../types';

interface QuarterNavigationProps {
  quarters: Array<{
    quarter: number;
    year: number;
    isSettled: boolean;
  }>;
  selectedQuarter: string | null;
  onQuarterSelect: (quarterKey: string) => void;
}

export function QuarterNavigation({ 
  quarters, 
  selectedQuarter,
  onQuarterSelect 
}: QuarterNavigationProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Quarters</h2>
      <nav className="flex flex-col space-y-1">
        {quarters.map(({ quarter, year, isSettled }) => {
          const quarterKey = `${year}-Q${quarter}`;
          const isSelected = quarterKey === selectedQuarter;
          
          return (
            <button
              key={quarterKey}
              onClick={() => onQuarterSelect(quarterKey)}
              className={`
                flex items-center justify-between px-4 py-2 rounded-lg
                transition-colors duration-200
                ${isSelected 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'hover:bg-gray-50 text-gray-700'}
              `}
            >
              <span className="flex items-center">
                <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                  Q{quarter} {year}
                </span>
              </span>
              {isSettled && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
