import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = containerRect.top - tooltipRect.height - 8;
          left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = containerRect.bottom + 8;
          left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
          left = containerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
          left = containerRect.right + 8;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position
      if (left < padding) {
        left = padding;
      } else if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }

      // Adjust vertical position
      if (top < padding) {
        top = padding;
      } else if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {text}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              ...(position === 'top' && { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }),
              ...(position === 'bottom' && { top: '-4px', left: '50%', transform: 'translateX(-50%)' }),
              ...(position === 'left' && { right: '-4px', top: '50%', transform: 'translateY(-50%)' }),
              ...(position === 'right' && { left: '-4px', top: '50%', transform: 'translateY(-50%)' }),
            }}
          />
        </div>
      )}
    </div>
  );
}
