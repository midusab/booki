/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  User,
  GithubAuthProvider
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { UserProfile } from "../features/auth/types";
import { syncUserProfile } from "../features/auth/services/authApi";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state alterations
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };

        try {
          // Synchronize profile to Firestore
          await syncUserProfile(profile);
          setUser(profile);
        } catch (err) {
          console.error("Failed to sync profile to firestore", err);
          // Still allow sign-in progress even if Firestore rules are not fully provisioned yet
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Force popup sign in to prevent redirect cycle within the dev server iframe
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
      setLoading(false);
      throw err;
    }
  };

  const loginWithGitHub = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || "GitHub authentication failed");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
