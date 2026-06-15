/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
