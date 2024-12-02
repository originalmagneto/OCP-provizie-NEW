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
            fixed z-50 px-3 py-2 text-sm font-medium text-white
            bg-gray-900 rounded-md shadow-lg
            transform -translate-y-full -translate-x-1/2
            whitespace-nowrap pointer-events-none
            ${position === 'top' ? 'mb-2' : ''}
            ${position === 'bottom' ? 'mt-2' : ''}
            ${position === 'left' ? 'mr-2' : ''}
            ${position === 'right' ? 'ml-2' : ''}
          `}
          style={{
            left: position === 'left' ? 'auto' : '50%',
            top: position === 'bottom' ? 'auto' : '-10px',
            right: position === 'right' ? '-10px' : 'auto',
            bottom: position === 'top' ? 'auto' : '-10px',
          }}
        >
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                'left-[-4px] top-1/2 -translate-y-1/2'}
            `}
          />
          {text}
        </div>
      )}
    </div>
  );
}
