import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionClasses = {
  top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
  bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
  left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2',
  right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2',
};

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-10 px-2 py-1 text-xs font-medium text-white
            bg-gray-900 rounded shadow-sm whitespace-nowrap
            ${positionClasses[position]}
          `}
        >
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
                position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' :
                'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'}
            `}
          />
          {text}
        </div>
      )}
    </div>
  );
}
