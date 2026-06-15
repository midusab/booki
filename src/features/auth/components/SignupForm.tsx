/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";

interface SignupFormProps {
  onToggleToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleToLogin }) => {
  const { registerWithEmail, error, clearError } = useAuth();
  const { addNotification } = useNotifications();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!displayName.trim() || !email.trim() || !password) {
      addNotification("please fill in all details.", "warning");
      return;
    }

    if (password.length < 6) {
      addNotification("password must be at least 6 characters.", "warning");
      return;
    }

    setLocalLoading(true);
    try {
      await registerWithEmail(email.trim(), password, displayName.trim());
      addNotification("registration successful! welcome.", "success");
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.code === "auth/configuration-not-found" || err.message?.includes("configuration-not-found")) {
        addNotification(
          "email signup is not enabled in this firebase project yet. please enable it or use OAuth buttons.",
          "error"
        );
      } else {
        addNotification(err.message || "failed to register.", "error");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name representation */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500 font-sans font-normal block pl-1 uppercase tracking-wider">
          Display Name
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-400">
            <User className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex"
            disabled={localLoading}
            className="w-full bg-[#FFEBEB]/10 border border-[#FFEBEB] focus:border-[#F40009] rounded-xl pl-11 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Email input field */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500 font-sans font-normal block pl-1 uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-400">
            <Mail className="w-4 h-4" />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Name@email.com"
            disabled={localLoading}
            className="w-full bg-[#FFEBEB]/10 border border-[#FFEBEB] focus:border-[#F40009] rounded-xl pl-11 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Password input field */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500 font-sans font-normal block pl-1 uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-400">
            <Lock className="w-4 h-4" />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            disabled={localLoading}
            className="w-full bg-[#FFEBEB]/10 border border-[#FFEBEB] focus:border-[#F40009] rounded-xl pl-11 pr-11 py-2.5 text-xs text-gray-800 focus:outline-none transition-all placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={localLoading}
        className="w-full py-3 bg-[#F40009] hover:bg-[#B80006] text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2 uppercase tracking-widest"
      >
        {localLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Sign Up</span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-xxs text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onToggleToLogin}
            className="text-[#F40009] font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};
