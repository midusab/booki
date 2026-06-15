/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { UserProfile } from "../types";

// Setup Firestore error logger wrapper as required by Phase 3 of the system skill
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error("Firestore Auth Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Creates or synchronizes a user profile document in Firestore
 */
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const userDocRef = doc(db, "users", profile.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName || profile.email?.split("@")[0] || "Bibliophile",
        photoURL: profile.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Test the Firestore Connection on initial boot as required by the Firebase integration guide
 */
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}
