/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";

interface LoginFormProps {
  onToggleToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleToSignup }) => {
  const { loginWithEmail, error, clearError } = useAuth();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password) {
      addNotification("please fill in all credentials.", "warning");
      return;
    }

    setLocalLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      addNotification("welcome back!", "success");
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === "auth/configuration-not-found" || err.message?.includes("configuration-not-found")) {
        addNotification(
          "email sign-in is not enabled in this firebase project yet. please enable it or use Google login.",
          "error"
        );
      } else {
        addNotification(err.message || "failed to sign in.", "error");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="flex items-center justify-between pl-1">
          <label className="text-xs text-gray-500 font-sans font-normal block uppercase tracking-wider">
            Password
          </label>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-400">
            <Lock className="w-4 h-4" />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
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
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-xxs text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onToggleToSignup}
            className="text-[#F40009] font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
};
