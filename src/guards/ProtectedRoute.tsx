/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { LoginGate } from "../pages/login"; // we'll write this next

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center space-y-4 z-50 animate-fade-in">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F40009]" />
          <div className="absolute inset-0 border-2 border-[#FFEBEB] rounded-full scale-125 opacity-20"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#FDFBF7]"></div>
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-serif text-lg font-black tracking-widest text-[#F40009] lowercase">
            midr...
          </h1>
          <p className="text-[10px] tracking-widest font-mono text-gray-400 lowercase">
            loading your library...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Force registration before access! Redirect to the beautiful custom login/registration gate.
    return <LoginGate />;
  }

  return <>{children}</>;
};
