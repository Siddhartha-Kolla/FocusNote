"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { verifyEmail, verifyOTP } from "@/lib/actions/auth";

type LoginStep = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    const result = await verifyEmail(email);
    
    setIsLoading(false);
    
    if (result.success) {
      setMessage(result.message);
      setIsError(false);
      setStep("otp");
    } else {
      setMessage(result.message);
      setIsError(true);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    const result = await verifyOTP(email, otp);
    
    setIsLoading(false);
    
    if (result.success) {
      setMessage(result.message);
      setIsError(false);
      // Redirect to user page after successful login
      setTimeout(() => {
        window.location.href = "/user";
      }, 1500);
    } else {
      setMessage(result.message);
      setIsError(true);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setMessage("");
    setIsError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to FocusNote
          </h1>
          <p className="text-gray-600">
            {step === "email" ? "Enter your email to get started" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {step === "email" ? (
            /* Email Step */
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {message && (
                <div className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Email...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          ) : (
            /* OTP Step */
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4">
                  We sent a 6-digit code to
                  <br />
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  disabled={isLoading}
                />
              </div>

              {message && (
                <div className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying OTP...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Email
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleEmailSubmit(new Event('submit') as any)}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center space-y-2">
          <div>
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <a
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Create one here
            </a>
          </div>
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to FocusNote
          </a>
        </div>
      </div>
    </div>
  );
}