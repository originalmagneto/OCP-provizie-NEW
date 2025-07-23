import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Mail, LogOut } from 'lucide-react';
import { getFirmBranding } from '../config/firmBranding';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  const firmBranding = getFirmBranding(user.firm);
  const FirmLogo = firmBranding.logo;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FirmLogo className="h-16 w-16" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your {firmBranding.displayName} account is awaiting administrator approval
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Welcome, {user.name}!
            </h3>
            
            <p className="text-sm text-gray-600">
              Your account has been created successfully, but it requires approval from an administrator 
              before you can access the system.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-800">
                    What happens next?
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    An administrator will review your account and approve access. 
                    You'll be notified via email once your account is activated.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Account: {user.email}</p>
              <p>Firm: {firmBranding.displayName}</p>
              <p>Status: Pending Approval</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}