/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useContext, useCallback } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
