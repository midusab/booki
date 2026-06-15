/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginForm } from "../features/auth/components/LoginForm";
import { SignupForm } from "../features/auth/components/SignupForm";
import { OAuthButtons } from "../features/auth/components/OAuthButtons";

export const LoginGate: React.FC = () => {
  const [activeForm, setActiveForm] = useState<"login" | "signup">("signup"); // Default to signup for "registration before access"

  return (
    <div className="min-h-screen w-full bg-[#1B0203] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#F40009]/20 selection:text-white">
      {/* Abstract background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F40009]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-950/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm bg-white rounded-3xl border border-[#FFEBEB]/60 p-6 sm:p-8 shadow-xl relative z-10"
      >
        {/* Simple Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-serif text-2xl font-black text-[#F40009] tracking-tight">
              MidR...
            </span>
          </div>
          <p className="text-[10px] tracking-widest text-[#F40009]/80 font-mono uppercase">
            Your Personal Reading Space
          </p>
        </div>

        {/* Dynamic header title based on active view */}
        <div className="text-center space-y-1 mb-5">
          <h2 className="font-serif text-lg font-bold text-[#1B0203]">
            {activeForm === "signup" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xxs text-gray-400">
            {activeForm === "signup" 
              ? "Sign up to save your reading achievements"
              : "Sign in to view your books and analytics"}
          </p>
        </div>

        {/* SSO Integration */}
        <OAuthButtons />

        {/* Framer-motion layout transition between Login and Register */}
        <div className="relative overflow-hidden min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeForm}
              initial={{ opacity: 0, x: activeForm === "signup" ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeForm === "signup" ? 15 : -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeForm === "signup" ? (
                <SignupForm onToggleToLogin={() => setActiveForm("login")} />
              ) : (
                <LoginForm onToggleToSignup={() => setActiveForm("signup")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Micro footer */}
        <p className="text-center text-xxxxs text-gray-300 font-mono tracking-widest uppercase mt-8 pointer-events-none">
          SECURE SIGN IN GATEWAY
        </p>
      </motion.div>
    </div>
  );
};
