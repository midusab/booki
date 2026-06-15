/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
}
