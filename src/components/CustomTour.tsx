import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { tourSteps } from './TourSteps';

export type TourType = 'overview' | 'invoice-workflow' | 'commission-workflow' | 'analytics' | 'admin' | 'referrals';

interface CustomTourProps {
  isRunning: boolean;
  tourType: TourType;
  onTourEnd: () => void;
  onStepChange?: (stepIndex: number) => void;
}

interface ModalPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MODAL_WIDTH = 380;
const MODAL_HEIGHT = 280;
const ARROW_SIZE = 10;
const VIEWPORT_PADDING = 16;
const HIGHLIGHT_PADDING = 8;

const CustomTour: React.FC<CustomTourProps> = ({
  isRunning,
  tourType,
  onTourEnd,
  onStepChange
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [modalPosition, setModalPosition] = useState<ModalPosition>({ top: 0, left: 0, placement: 'center' });
  const [highlightBox, setHighlightBox] = useState<HighlightBox>({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const steps = tourSteps[tourType] || [];
  const currentStep = steps[currentStepIndex];

  // Find target element with multiple fallback strategies
  const findTargetElement = useCallback((selector: string): Element | null => {
    if (selector === 'body') {
      return document.body;
    }

    // Strategy 1: Direct selector
    let element = document.querySelector(selector);
    if (element) return element;

    // Strategy 2: ID without hash
    if (selector.startsWith('#')) {
      element = document.getElementById(selector.substring(1));
      if (element) return element;
    }

    // Strategy 3: Data-testid attribute
    const cleanSelector = selector.replace(/[\[\]"']/g, '');
    element = document.querySelector(`[data-testid="${cleanSelector}"]`);
    if (element) return element;

    // Strategy 4: Partial class match
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      element = document.querySelector(`[class*="${className}"]`);
      if (element) return element;
    }

    console.warn(`Tour target not found: ${selector}`);
    return document.body;
  }, []);

  // Smooth scroll to element with better centering
  const scrollToElement = useCallback((element: Element) => {
    if (element === document.body) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementTop = rect.top + window.pageYOffset;
    const elementHeight = rect.height;
    
    // Calculate optimal scroll position
    const targetScrollTop = elementTop - (viewportHeight / 2) + (elementHeight / 2);
    const maxScrollTop = document.documentElement.scrollHeight - viewportHeight;
    const scrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }, []);

  // Update highlight box with padding
  const updateHighlight = useCallback((element: Element) => {
    if (element === document.body) {
      setHighlightBox({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const rect = element.getBoundingClientRect();
    setHighlightBox({
      top: rect.top + window.pageYOffset - HIGHLIGHT_PADDING,
      left: rect.left + window.pageXOffset - HIGHLIGHT_PADDING,
      width: rect.width + (HIGHLIGHT_PADDING * 2),
      height: rect.height + (HIGHLIGHT_PADDING * 2)
    });
  }, []);

  // Calculate optimal modal position with improved logic
  const calculateOptimalPosition = useCallback((element: Element, preferredPlacement: string = 'bottom'): ModalPosition => {
    if (element === document.body) {
      return {
        top: (window.innerHeight - MODAL_HEIGHT) / 2,
        left: (window.innerWidth - MODAL_WIDTH) / 2,
        placement: 'center'
      };
    }

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Available space calculations
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    
    const requiredWidth = MODAL_WIDTH + VIEWPORT_PADDING * 2;
    const requiredHeight = MODAL_HEIGHT + VIEWPORT_PADDING * 2;
    
    let placement: 'top' | 'bottom' | 'left' | 'right' | 'center' = preferredPlacement as any;
    let top = 0;
    let left = 0;
    
    // Determine best placement based on available space
    const placements = [
      { name: 'bottom', space: spaceBelow, required: requiredHeight },
      { name: 'top', space: spaceAbove, required: requiredHeight },
      { name: 'right', space: spaceRight, required: requiredWidth },
      { name: 'left', space: spaceLeft, required: requiredWidth }
    ];
    
    // Try preferred placement first
    const preferredSpace = placements.find(p => p.name === preferredPlacement);
    if (preferredSpace && preferredSpace.space >= preferredSpace.required) {
      placement = preferredPlacement as any;
    } else {
      // Find best alternative
      const bestPlacement = placements
        .filter(p => p.space >= p.required)
        .sort((a, b) => b.space - a.space)[0];
      
      if (bestPlacement) {
        placement = bestPlacement.name as any;
      } else {
        // Fallback to center if no good placement
        placement = 'center';
      }
    }
    
    // Calculate position based on final placement
    switch (placement) {
      case 'bottom':
        top = rect.bottom + ARROW_SIZE + window.pageYOffset;
        left = rect.left + (rect.width - MODAL_WIDTH) / 2 + window.pageXOffset;
        break;
        
      case 'top':
        top = rect.top - MODAL_HEIGHT - ARROW_SIZE + window.pageYOffset;
        left = rect.left + (rect.width - MODAL_WIDTH) / 2 + window.pageXOffset;
        break;
        
      case 'right':
        top = rect.top + (rect.height - MODAL_HEIGHT) / 2 + window.pageYOffset;
        left = rect.right + ARROW_SIZE + window.pageXOffset;
        break;
        
      case 'left':
        top = rect.top + (rect.height - MODAL_HEIGHT) / 2 + window.pageYOffset;
        left = rect.left - MODAL_WIDTH - ARROW_SIZE + window.pageXOffset;
        break;
        
      case 'center':
        top = (viewportHeight - MODAL_HEIGHT) / 2 + window.pageYOffset;
        left = (viewportWidth - MODAL_WIDTH) / 2 + window.pageXOffset;
        break;
    }
    
    // Ensure modal stays within viewport bounds
    const minTop = window.pageYOffset + VIEWPORT_PADDING;
    const maxTop = window.pageYOffset + viewportHeight - MODAL_HEIGHT - VIEWPORT_PADDING;
    const minLeft = window.pageXOffset + VIEWPORT_PADDING;
    const maxLeft = window.pageXOffset + viewportWidth - MODAL_WIDTH - VIEWPORT_PADDING;
    
    top = Math.max(minTop, Math.min(top, maxTop));
    left = Math.max(minLeft, Math.min(left, maxLeft));
    
    return { top, left, placement };
  }, []);

  // Position modal and highlight
  const positionModal = useCallback(async () => {
    if (!currentStep || !isRunning) return;

    const element = findTargetElement(currentStep.target);
    if (!element) return;

    setTargetElement(element);
    
    // Scroll to element first
    scrollToElement(element);
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Update highlight and modal position
    updateHighlight(element);
    const position = calculateOptimalPosition(element, currentStep.placement || 'bottom');
    setModalPosition(position);
    setIsVisible(true);
  }, [currentStep, isRunning, findTargetElement, scrollToElement, updateHighlight, calculateOptimalPosition]);

  // Handle step changes
  useEffect(() => {
    if (isRunning && currentStep) {
      setIsVisible(false);
      setTimeout(() => {
        positionModal();
      }, 100);
    }
  }, [currentStepIndex, isRunning, positionModal]);

  // Handle window events
  useEffect(() => {
    if (!isRunning) {
      setIsVisible(false);
      return;
    }

    const handleResize = () => {
      if (isVisible && targetElement) {
        updateHighlight(targetElement);
        const position = calculateOptimalPosition(targetElement, currentStep?.placement || 'bottom');
        setModalPosition(position);
      }
    };

    const handleScroll = () => {
      if (isVisible && targetElement && targetElement !== document.body) {
        updateHighlight(targetElement);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isRunning, isVisible, targetElement, currentStep, updateHighlight, calculateOptimalPosition]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      onTourEnd();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onStepChange?.(prevIndex);
    }
  };

  const handleClose = () => {
    onTourEnd();
  };

  const handleSkip = () => {
    onTourEnd();
  };

  if (!isRunning || !currentStep || steps.length === 0) {
    return null;
  }

  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isBodyTarget = currentStep.target === 'body';

  return createPortal(
    <>
      {/* Overlay with cutout for highlighted element */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9998]"
        style={{
          background: isBodyTarget 
            ? 'rgba(0, 0, 0, 0.6)' 
            : `radial-gradient(circle at ${highlightBox.left + highlightBox.width/2}px ${highlightBox.top + highlightBox.height/2}px, transparent ${Math.max(highlightBox.width, highlightBox.height)/2 + 20}px, rgba(0, 0, 0, 0.6) ${Math.max(highlightBox.width, highlightBox.height)/2 + 21}px)`,
          pointerEvents: 'none'
        }}
      />
      
      {/* Highlight Border */}
      {!isBodyTarget && highlightBox.width > 0 && (
        <div
          className="fixed pointer-events-none z-[9999] transition-all duration-300 ease-out"
          style={{
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)'
          }}
        />
      )}
      
      {/* Tour Modal */}
      <div
        ref={modalRef}
        className={`fixed z-[10000] bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          width: `${MODAL_WIDTH}px`,
          maxHeight: `${MODAL_HEIGHT}px`,
          pointerEvents: 'auto',
          transform: isVisible ? 'translateY(0)' : 'translateY(-10px)'
        }}
      >
        {/* Arrow */}
        {modalPosition.placement !== 'center' && (
          <div 
            className={`absolute w-0 h-0 border-solid`}
            style={{
              ...(modalPosition.placement === 'top' && {
                bottom: `-${ARROW_SIZE}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: `${ARROW_SIZE}px solid transparent`,
                borderRight: `${ARROW_SIZE}px solid transparent`,
                borderTop: `${ARROW_SIZE}px solid white`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }),
              ...(modalPosition.placement === 'bottom' && {
                top: `-${ARROW_SIZE}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: `${ARROW_SIZE}px solid transparent`,
                borderRight: `${ARROW_SIZE}px solid transparent`,
                borderBottom: `${ARROW_SIZE}px solid white`,
                filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.1))'
              }),
              ...(modalPosition.placement === 'left' && {
                right: `-${ARROW_SIZE}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: `${ARROW_SIZE}px solid transparent`,
                borderBottom: `${ARROW_SIZE}px solid transparent`,
                borderLeft: `${ARROW_SIZE}px solid white`,
                filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))'
              }),
              ...(modalPosition.placement === 'right' && {
                left: `-${ARROW_SIZE}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: `${ARROW_SIZE}px solid transparent`,
                borderBottom: `${ARROW_SIZE}px solid transparent`,
                borderRight: `${ARROW_SIZE}px solid white`,
                filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.1))'
              })
            }}
          />
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">
            {currentStep.title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-gray-700 leading-relaxed text-sm">
            {currentStep.content}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleSkip}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-white"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 font-medium">
              {currentStepIndex + 1} of {steps.length}
            </span>
            
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStepIndex < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>,
    document.body
  );
};

export default CustomTour;