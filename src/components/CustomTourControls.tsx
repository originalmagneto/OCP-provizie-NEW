import React, { useState } from 'react';
import { HelpCircle, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { TourType } from './CustomTour';

interface CustomTourControlsProps {
  onStartTour: (tourType: TourType) => void;
  onRestartTour: () => void;
  availableTours: TourType[];
  currentTour: TourType | null;
  isRunning: boolean;
  userRole?: string;
}

const tourLabels: Record<TourType, string> = {
  overview: 'Platform Overview',
  'invoice-workflow': 'Invoice Management',
  'commission-workflow': 'Commission Tracking',
  analytics: 'Analytics & Reports',
  admin: 'Administration',
  referrals: 'Referral Partners'
};

const tourDescriptions: Record<TourType, string> = {
  overview: 'Get familiar with the platform layout and main features',
  'invoice-workflow': 'Learn to create, manage, and track invoices',
  'commission-workflow': 'Master quarterly commission tracking and settlements',
  analytics: 'Explore reporting tools and performance metrics',
  admin: 'Manage users, settings, and administrative tasks',
  referrals: 'Handle referral partners and commission agreements'
};

const getAvailableToursForRole = (userRole?: string, allTours: TourType[] = []): TourType[] => {
  if (userRole === 'admin') {
    return allTours;
  }
  return allTours.filter(tour => tour !== 'admin');
};

export function CustomTourControls({ 
  onStartTour, 
  onRestartTour, 
  availableTours, 
  currentTour, 
  isRunning, 
  userRole 
}: CustomTourControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourType>('overview');
  
  const filteredTours = getAvailableToursForRole(userRole, availableTours);

  const handleStartTour = (tourType: TourType) => {
    setSelectedTour(tourType);
    setIsDropdownOpen(false);
    onStartTour(tourType);
  };

  const handleRestartTour = () => {
    onRestartTour();
  };

  return (
    <div className="relative">
      {/* Main Tour Button */}
      <div className="flex items-center space-x-2">
        {!isRunning ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              title="Get help and take interactive tours"
            >
              <HelpCircle size={20} />
              <span className="font-medium">Help & Tour</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-80 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 backdrop-blur-sm bg-white/95 max-w-[calc(100vw-2rem)] transform -translate-x-0">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-1">Interactive Tours</h3>
                  <p className="text-sm text-gray-600">Choose a guided tour to learn the platform</p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {filteredTours.map((tour) => (
                    <button
                      key={tour}
                      onClick={() => handleStartTour(tour)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <Play size={14} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {tourLabels[tour]}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {tourDescriptions[tour]}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <p className="text-xs text-gray-500">
                    💡 Tours include interactive elements and automatic scrolling for the best experience
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-800 rounded-full shadow-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {currentTour ? tourLabels[currentTour] : 'Tour Active'}
              </span>
            </div>
            
            <button
              onClick={handleRestartTour}
              className="flex items-center space-x-1 px-3 py-3 text-gray-600 hover:text-gray-800 hover:bg-white/90 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm"
              title="Restart current tour"
            >
              <RotateCcw size={16} />
              <span className="text-sm font-medium">Restart</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default CustomTourControls;