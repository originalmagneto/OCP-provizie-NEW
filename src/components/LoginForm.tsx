import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { FirmType } from "../types";
import { Building2, Mail, Lock, User } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginForm() {
  const { login, register, isLoading } = useAuth();
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
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      
      // Handle specific Firebase auth error codes
      if (err.code) {
        switch (err.code) {
          case "auth/invalid-credential":
            setError("Invalid email or password. Please check your credentials and try again.");
            break;
          case "auth/user-not-found":
            setError("No account found with this email. Please check your email or register.");
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/email-already-in-use":
            setError("This email is already registered. Please use a different email or sign in.");
            break;
          case "auth/weak-password":
            setError("Password is too weak. Please use a stronger password.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your internet connection and try again.");
            break;
          case "auth/too-many-requests":
            setError("Too many unsuccessful login attempts. Please try again later or reset your password.");
            break;
          default:
            setError(err.message || "Authentication failed. Please try again.");
        }
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setIsResettingPassword(false);
    setError(null);
    setSuccessMessage(null);
  };

  const togglePasswordReset = () => {
    setIsResettingPassword(!isResettingPassword);
    setIsRegistering(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("No account found with this email. Please check your email or register.");
            break;
          case "auth/invalid-email":
            setError("Invalid email address. Please enter a valid email.");
            break;
          case "auth/too-many-requests":
            setError("Too many requests. Please try again later.");
            break;
          default:
            setError(err.message || "Failed to send password reset email. Please try again.");
        }
      } else {
        setError(err.message || "Failed to send password reset email. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Commission Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering 
              ? "Create an account" 
              : isResettingPassword 
                ? "Reset your password" 
                : "Sign in to manage your commissions"}
          </p>
        </div>

        <form 
          className="mt-8 space-y-6" 
          onSubmit={isResettingPassword ? handlePasswordReset : handleSubmit}
        >
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
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
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
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>
            )}

            {/* Name Field (Registration only) */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            {/* Firm Selection */}
            {isRegistering && (
              <div>
                <label htmlFor="firm" className="sr-only">
                  Firm
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <select
                    id="firm"
                    name="firm"
                    value={selectedFirm}
                    onChange={(e) => setSelectedFirm(e.target.value as FirmType)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  >
                    <option value="SKALLARS">SKALLARS</option>
                    <option value="MKMs">MKMs</option>
                    <option value="Contax">Contax</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isResettingPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {isRegistering
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Register"}
                </button>
              )}
            </div>
            {!isRegistering && !isResettingPassword && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={togglePasswordReset}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                isRegistering ? (
                  "Creating account..."
                ) : isResettingPassword ? (
                  "Sending reset email..."
                ) : (
                  "Signing in..."
                )
              ) : isRegistering ? (
                "Create account"
              ) : isResettingPassword ? (
                "Send password reset email"
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
