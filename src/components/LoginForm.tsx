import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { FirmType } from "../types";
import { Building2, Mail, Lock, User } from "lucide-react";
import { firmBranding, getFirmBranding } from "../config/firmBranding";

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  return requiredVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'demo-api-key' && value !== 'demo-project' && !value.includes('demo-');
  });
};

export default function LoginForm() {
  const { login, register, resetPassword, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedFirm, setSelectedFirm] = useState<FirmType>("SKALLARS");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (isResettingPassword) {
      if (!email) {
        setError("Please enter your email address to reset your password");
        return;
      }
      try {
        await resetPassword(email);
        setSuccessMessage("Password reset instructions have been sent to your email. Please check your inbox and spam folder.");
        setIsResettingPassword(false);
      } catch (err: any) {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
      return;
    }

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isRegistering && !name) {
      setError("Name is required for registration");
      return;
    }

    try {
      if (isRegistering) {
        await register(email, password, name, selectedFirm);
        setSuccessMessage(
          "Account created successfully! Your account is pending approval from an administrator. " +
          "You will receive access once your account has been approved."
        );
        setError(null);
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setSelectedFirm('SKALLARS');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed. Please try again.";
      setError(errorMessage);
      setSuccessMessage(null);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setIsResettingPassword(false);
    setError(null);
    setSuccessMessage(null);
  };

  const toggleResetPassword = () => {
    setIsResettingPassword(!isResettingPassword);
    setIsRegistering(false);
    setError(null);
    setSuccessMessage(null);
  };

  const currentFirmBranding = getFirmBranding(selectedFirm);
  const FirmLogo = currentFirmBranding.logo;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isRegistering && (
            <div className="flex justify-center mb-4">
              <FirmLogo className="h-16 w-16" />
            </div>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? `Join ${currentFirmBranding.displayName}` : "Commission Tracker"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isResettingPassword
              ? "Reset your password"
              : isRegistering
              ? `Create your ${currentFirmBranding.displayName} account`
              : "Sign in to manage your commissions"}
          </p>
          
          {/* Demo Mode Indicator - Only show if Firebase is not configured */}
          {!isFirebaseConfigured() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ⚠️ Demo Mode
                  </h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    Firebase is not configured. Authentication features are disabled. 
                    See FIREBASE_SETUP.md for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-3">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-4 py-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password Field - Only show if not resetting password */}
            {!isResettingPassword && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-4 py-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    required={!isResettingPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>
            )}

            {/* Name Field - Only show during registration */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-4 py-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required={isRegistering}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm"
                    placeholder="Full name"
                  />
                </div>
              </div>
            )}

            {/* Firm Selection */}
            {isRegistering && (
              <div>
                <label htmlFor="firm" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Firm
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(firmBranding).map(([firmKey, branding]) => {
                    const FirmLogoComponent = branding.logo;
                    const isSelected = selectedFirm === firmKey;
                    return (
                      <button
                        key={firmKey}
                        type="button"
                        onClick={() => setSelectedFirm(firmKey as FirmType)}
                        className={`
                          relative flex items-center p-5 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? `${branding.theme.card} border-current` 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <FirmLogoComponent className="h-10 w-10 mr-4" />
                        <div className="flex-1 text-left">
                          <div className={`font-medium ${
                            isSelected ? `text-${branding.colors.text}` : 'text-gray-900'
                          }`}>
                            {branding.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {branding.name}
                          </div>
                        </div>
                        {isSelected && (
                          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: branding.colors.primary }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white
                ${isRegistering 
                  ? currentFirmBranding.theme.button 
                  : 'bg-indigo-600 hover:bg-indigo-700'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
              `}
            >
              {isLoading
                ? isResettingPassword
                  ? "Sending reset link..."
                  : isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isResettingPassword
                ? "Send Reset Link"
                : isRegistering
                ? `Join ${currentFirmBranding.displayName}`
                : "Sign in"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isRegistering ? "Already have an account? Sign in" : "Need an account? Register"}
            </button>
            
            {!isRegistering && (
              <button
                type="button"
                onClick={toggleResetPassword}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isResettingPassword ? "Back to sign in" : "Forgot password?"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
