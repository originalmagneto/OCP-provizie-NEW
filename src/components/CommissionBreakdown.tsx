import React from 'react';
import QuarterlyCommissions from './QuarterlyCommissions';

export default function CommissionBreakdown() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <QuarterlyCommissions />
      </div>
    </div>
  );
}