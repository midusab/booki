/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useAuth } from "./useAuth";

export function useOAuth() {
  const { loginWithGoogle, loginWithGitHub } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGitHub();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with GitHub");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleSignIn,
    handleGitHubSignIn,
    loading,
    error,
  };
}
