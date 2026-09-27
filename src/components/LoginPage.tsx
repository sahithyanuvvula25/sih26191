import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const AUTHORIZED_EMAIL = 'sahithyanuvvula25@gmail.com';
const AUTHORIZED_PASSWORD = 'nuvvula@25';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === AUTHORIZED_EMAIL.toLowerCase() && password === AUTHORIZED_PASSWORD) {
        onLoginSuccess();
      } else {
        setErrorMessage(
          'Access Denied: Invalid credentials. Only authorized disaster management authorities with approved credentials can access this portal.'
        );
        setIsLoading(false);
      }
    }, 400);
  };

  const handleAutofill = () => {
    setEmail(AUTHORIZED_EMAIL);
    setPassword(AUTHORIZED_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      {/* Background Subtle Grid Accent */}
      <div className="w-full max-w-md">
        {/* Authority Emblem & Top Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-600 via-green-700 to-emerald-900 border border-emerald-400/50 shadow-lg mb-3">
            <svg className="w-10 h-10" viewBox="0 0 36 36" fill="none">
              <path
                d="M18 3L6 7.5V17C6 25 11.2 32 18 33.8C24.8 32 30 25 30 17V7.5L18 3Z"
                fill="#065f46"
                stroke="#34d399"
                strokeWidth="1.2"
              />
              <path d="M9 16L13.5 12L18 16H9Z" fill="#fef08a" />
              <rect x="10.5" y="16" width="6" height="5" fill="#fef3c7" />
              <path d="M16 14.5L21.5 10L27 14.5H16Z" fill="#fed7aa" />
              <rect x="18" y="14.5" width="7" height="6" fill="#ffedd5" />
              <path
                d="M6 21.5C9 19.8 12.5 23 17 21C21.5 19 25.5 22.5 30 20.5V25C26.5 28 22 31.5 18 33.5C14 31.5 9.5 28 6 25V21.5Z"
                fill="#0284c7"
                opacity="0.9"
              />
              <path d="M6 22C9.5 20.5 13 23.5 17 21.5C21 19.5 25 23 30 21" stroke="#ffffff" strokeWidth="1" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Bhoosethu
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Kuttanad Wetlands Basin • KSDMA / DDMA Alappuzha
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
            Official Officer Authentication Portal
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-[#1565C0]" />
              <span>Officer Authentication</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              This system contains sensitive population vulnerability records, hazard polygons, and evacuation directives.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Authorized Officer Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@disaster.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Security Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Verifying Authority Credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Pill for Convenience */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>Authorized Officer Admin Access</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="font-bold text-[#1565C0] hover:text-[#0D47A1] hover:underline cursor-pointer"
            >
              Autofill Admin Credentials
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center mt-4 text-[11px] text-slate-500">
          Kerala State Disaster Management Authority (KSDMA) • District Collectorate, Alappuzha
        </div>
      </div>
    </div>
  );
};
