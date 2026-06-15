/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useNotifications, NotificationItem } from "../context/NotificationContext";

export const NotificationToasts: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToastItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationToastItem: React.FC<{
  notification: NotificationItem;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const { message, type } = notification;

  // Render appropriate icons
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  // Border and background colors based on notification types
  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-white/95 border-emerald-100 shadow-emerald-500/5";
      case "error":
        return "bg-white/95 border-rose-100 shadow-rose-500/5";
      case "warning":
        return "bg-white/95 border-amber-100 shadow-amber-500/5";
      case "info":
      default:
        return "bg-white/95 border-sky-100 shadow-sky-500/5";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${getColors()} group`}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium selection:bg-rose-100">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        type="button"
        className="shrink-0 text-gray-400 hover:text-gray-600 rounded-lg p-0.5 hover:bg-gray-100/50 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
