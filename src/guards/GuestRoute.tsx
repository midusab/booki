/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

interface GuestRouteProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FDFBF7] flex items-center justify-center">
        <span className="font-mono text-xxxxs uppercase tracking-widest text-gray-400">
          Loading passports...
        </span>
      </div>
    );
  }

  if (user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
