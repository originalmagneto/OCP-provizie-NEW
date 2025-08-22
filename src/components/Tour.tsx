import React, { useState, useEffect } from "react";
import CustomTour, { TourType } from "./CustomTour";
import CustomTourControls from "./CustomTourControls";
import { tourSteps } from "./TourSteps";

// Tour persistence utilities
const TOUR_STORAGE_KEY = 'commission-app-tours';

interface TourProgress {
  hasSeenTour: Record<TourType, boolean>;
  completedSteps: Record<TourType, number>;
  lastTourDate: Record<TourType, string>;
}

interface TourState {
  isRunning: boolean;
  currentTour: TourType | null;
  stepIndex: number;
  hasSeenTour: Record<TourType, boolean>;
}

interface TourProps {
  isRunning: boolean;
  tourType: TourType;
  onTourEnd: () => void;
  onTourChange?: (tourType: TourType) => void;
  userRole?: string;
}

interface TourControlsProps {
  onStartTour: (tourType: TourType) => void;
  onRestartTour: () => void;
  availableTours: TourType[];
  currentTour: TourType | null;
  isRunning: boolean;
  userRole?: string;
}

const loadTourProgress = (): TourProgress => {
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load tour progress:', error);
  }
  
  return {
    hasSeenTour: {
      overview: false,
      'invoice-workflow': false,
      'commission-workflow': false,
      analytics: false,
      admin: false,
      referrals: false,
    },
    completedSteps: {
      overview: 0,
      'invoice-workflow': 0,
      'commission-workflow': 0,
      analytics: 0,
      admin: 0,
      referrals: 0,
    },
    lastTourDate: {
      overview: '',
      'invoice-workflow': '',
      'commission-workflow': '',
      analytics: '',
      admin: '',
      referrals: '',
    },
  };
};

const saveTourProgress = (progress: TourProgress): void => {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save tour progress:', error);
  }
};

const getAvailableToursForRole = (userRole?: string, allTours: TourType[] = []): TourType[] => {
  if (userRole === 'admin') {
    return allTours;
  }
  return allTours.filter(tour => tour !== 'admin');
};

export function TourControls({ onStartTour, onRestartTour, availableTours, currentTour, isRunning, userRole }: TourControlsProps) {
  return (
    <CustomTourControls
      onStartTour={onStartTour}
      onRestartTour={onRestartTour}
      availableTours={availableTours}
      currentTour={currentTour}
      isRunning={isRunning}
      userRole={userRole}
    />
  );
}

export default function Tour({ isRunning, tourType, onTourEnd, onTourChange, userRole }: TourProps) {
  const [tourProgress, setTourProgress] = useState<TourProgress>(loadTourProgress);
  const [tourState, setTourState] = useState<TourState>({
    isRunning: false,
    currentTour: null,
    stepIndex: 0,
    hasSeenTour: {
      overview: false,
      'invoice-workflow': false,
      'commission-workflow': false,
      analytics: false,
      admin: false,
      referrals: false,
    },
  });

  useEffect(() => {
    setTourState(prev => ({
      ...prev,
      isRunning,
      currentTour: isRunning ? tourType : null,
    }));
  }, [isRunning, tourType]);

  const handleTourEnd = () => {
    // Mark tour as completed
    const updatedProgress = {
      ...tourProgress,
      hasSeenTour: {
        ...tourProgress.hasSeenTour,
        [tourType]: true,
      },
      completedSteps: {
        ...tourProgress.completedSteps,
        [tourType]: tourSteps[tourType]?.length || 0,
      },
      lastTourDate: {
        ...tourProgress.lastTourDate,
        [tourType]: new Date().toISOString(),
      },
    };
    
    setTourProgress(updatedProgress);
    saveTourProgress(updatedProgress);
    
    setTourState(prev => ({
      ...prev,
      isRunning: false,
      currentTour: null,
      stepIndex: 0,
    }));
    
    onTourEnd();
  };

  const handleStepChange = (stepIndex: number) => {
    setTourState(prev => ({
      ...prev,
      stepIndex,
    }));
  };

  if (!isRunning || !tourSteps[tourType]) {
    return null;
  }

  return (
    <CustomTour
      isRunning={isRunning}
      tourType={tourType}
      onTourEnd={handleTourEnd}
      onStepChange={handleStepChange}
    />
  );
}

// Export types for use in other components
export type { TourType, TourProps, TourControlsProps };
