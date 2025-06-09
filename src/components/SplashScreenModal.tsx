import React from 'react';
import { FileText, TrendingUp, PieChart, X } from 'lucide-react';

interface SplashScreenModalProps {
  onDismiss: () => void;
}

const FeatureItem: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-4 p-1"> {/* Added small padding to item */}
    <div className="flex-shrink-0 mt-1 p-2 bg-indigo-100 dark:bg-indigo-800/60 rounded-full"> {/* Adjusted icon bg */}
      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p> {/* Darker gray for desc */}
    </div>
  </div>
);

export default function SplashScreenModal({ onDismiss }: SplashScreenModalProps) {
  // Prevent background scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ease-in-out"
      onClick={onDismiss} // Optional: dismiss on overlay click
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 transform transition-all duration-300 ease-in-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside modal
      >
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4"> {/* Adjusted positioning */}
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close splash screen"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white"> {/* Dark white for title */}
            Welcome to Your Commission Dashboard!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 px-2"> {/* Darker gray for intro */}
            Streamline your invoice and commission tracking. Here are a few key things you can do:
          </p>
        </div>

        <div className="space-y-5 pt-2"> {/* Added padding top */}
          <FeatureItem
            icon={FileText}
            title="Effortless Invoice Management"
            description="Quickly create, view, and manage all your client invoices in one place. Keep track of payment statuses with ease."
          />
          <FeatureItem
            icon={TrendingUp}
            title="Transparent Commission Tracking"
            description="Automatically calculate and monitor commissions owed to you or by you. Understand your earnings per invoice and quarter."
          />
          <FeatureItem
            icon={PieChart}
            title="Insightful Quarterly Overviews"
            description="Get a clear snapshot of your financial performance each quarter, including revenue, commissions, and payment statuses."
          />
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400/80 pt-2"> {/* Darker gray, padding top */}
          For a detailed guide, check out our{' '}
          <a href="/how-it-works" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded">
            How It Works
          </a>{' '}
          page.
        </p>

        <button
          onClick={onDismiss}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
